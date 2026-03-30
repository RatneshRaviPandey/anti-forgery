import { createDecipheriv } from 'crypto';
import { db } from '@/lib/db';
import { brandKeys } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';

const TOKEN_PREFIX = 'IMT3';
const NONCE_SIZE = 12;
const TAG_SIZE = 16;

// ── Types ───────────────────────────────────────────────────

export interface V3TokenPayload {
  v: number;    // version (3)
  kid: string;  // key ID
  kv: number;   // key version
  bn: string;   // brand name
  bc: string;   // brand code
  pn: string;   // product name
  ps: string;   // product SKU
  pi: string;   // product industry
  pc?: string;  // product category
  btc: string;  // batch code
  md?: string;  // manufacture date
  ed?: string;  // expiry date
  sq: number;   // sequence
  ia: number;   // issued at (unix)
  rnd: string;  // entropy
}

export type V3VerifyStatus = 'authentic' | 'invalid' | 'expired_key' | 'revoked_key' | 'tampered';

export interface V3VerifyResult {
  status: V3VerifyStatus;
  payload?: V3TokenPayload;
  brand?: {
    name: string;
    code: string;
  };
  product?: {
    name: string;
    sku: string;
    industry: string;
    category?: string;
    batchCode: string;
    manufactureDate?: string;
    expiryDate?: string;
  };
  sequence?: number;
  issuedAt?: string;
  keyVersion?: number;
  message?: string;
}

// ── Public API ──────────────────────────────────────────────

/**
 * Detect whether a token is IMT3 format.
 */
export function isV3Token(token: string): boolean {
  return token.startsWith(TOKEN_PREFIX + '.');
}

/**
 * Verify and decrypt an IMT3 token.
 * Looks up the brand key from the database, decrypts with AES-256-GCM,
 * and returns the embedded product information.
 */
export async function verifyTokenV3(token: string): Promise<V3VerifyResult> {
  // Parse token: IMT3.{keyId}.{base64url(nonce+ciphertext+tag)}
  const parts = token.split('.', 3);
  if (parts.length !== 3 || parts[0] !== TOKEN_PREFIX) {
    return { status: 'invalid', message: 'Invalid V3 token format' };
  }

  const [, keyId, encoded] = parts;

  // Look up brand key in database
  const [key] = await db
    .select()
    .from(brandKeys)
    .where(eq(brandKeys.keyId, keyId))
    .limit(1);

  if (!key) {
    return { status: 'invalid', message: 'Unknown key ID' };
  }

  // Check if key is revoked
  if (key.revokedAt) {
    return { status: 'revoked_key', message: 'This brand key has been revoked' };
  }

  // Check if key is active
  if (!key.isActive) {
    return { status: 'revoked_key', message: 'This brand key is no longer active' };
  }

  // Check if key is expired
  if (key.expiresAt && new Date(key.expiresAt) < new Date()) {
    return { status: 'expired_key', message: 'Brand subscription key has expired' };
  }

  // Decrypt token
  let payload: V3TokenPayload;
  try {
    payload = decryptPayload(encoded, key.encryptionKey);
  } catch (err) {
    if (err instanceof AuthTagError) {
      return { status: 'tampered', message: 'Token has been tampered with' };
    }
    return { status: 'invalid', message: 'Failed to decrypt token' };
  }

  // Validate payload structure
  if (payload.v !== 3 || !payload.bn || !payload.pn || !payload.ps) {
    return { status: 'invalid', message: 'Invalid token payload' };
  }

  // Update verify count and last used timestamp (fire-and-forget)
  db.update(brandKeys)
    .set({
      verifyCount: sql`${brandKeys.verifyCount} + 1`,
      lastUsedAt: new Date(),
    })
    .where(eq(brandKeys.keyId, keyId))
    .catch(() => {});

  return {
    status: 'authentic',
    payload,
    brand: {
      name: payload.bn,
      code: payload.bc,
    },
    product: {
      name: payload.pn,
      sku: payload.ps,
      industry: payload.pi,
      category: payload.pc,
      batchCode: payload.btc,
      manufactureDate: payload.md,
      expiryDate: payload.ed,
    },
    sequence: payload.sq,
    issuedAt: new Date(payload.ia * 1000).toISOString(),
    keyVersion: payload.kv,
  };
}

// ── Crypto Internals ────────────────────────────────────────

class AuthTagError extends Error {
  constructor() {
    super('Authentication tag mismatch');
    this.name = 'AuthTagError';
  }
}

function decryptPayload(encoded: string, hexKey: string): V3TokenPayload {
  const combined = base64UrlDecode(encoded);

  if (combined.length < NONCE_SIZE + TAG_SIZE + 1) {
    throw new Error('Payload too short');
  }

  const nonce = combined.subarray(0, NONCE_SIZE);
  const tag = combined.subarray(combined.length - TAG_SIZE);
  const ciphertext = combined.subarray(NONCE_SIZE, combined.length - TAG_SIZE);

  const key = Buffer.from(hexKey, 'hex');

  try {
    const decipher = createDecipheriv('aes-256-gcm', key, nonce);
    decipher.setAuthTag(tag);
    const decrypted = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(),
    ]);
    return JSON.parse(decrypted.toString('utf-8'));
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes('auth')) {
      throw new AuthTagError();
    }
    throw err;
  }
}

// ── Base64url (RFC 4648 §5, no padding) ─────────────────────

function base64UrlDecode(input: string): Buffer {
  let s = input.replace(/-/g, '+').replace(/_/g, '/');
  const pad = s.length % 4;
  if (pad === 2) s += '==';
  else if (pad === 3) s += '=';
  return Buffer.from(s, 'base64');
}
