import {
  createHmac, createHash, randomBytes, timingSafeEqual, hkdfSync,
} from 'crypto';

// ── Constants ────────────────────────────────────────────────
const TOKEN_VERSION    = 2;
const TOKEN_PREFIX     = 'IMT2';
const HMAC_ALGORITHM   = 'sha512';
const HKDF_ALGORITHM   = 'sha512';
const HKDF_INFO        = Buffer.from('infometa-qr-v2');
const DERIVED_KEY_LEN  = 64;
const RANDOM_BYTES     = 16;
const PAYLOAD_ENCODING: BufferEncoding = 'base64url';
const DIGEST_ENCODING: 'base64url' = 'base64url';

function getMasterKey(): Buffer {
  const key = process.env.TOKEN_MASTER_KEY;
  if (!key || key.length < 64) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('TOKEN_MASTER_KEY must be at least 64 hex characters');
    }
    // Dev fallback — 64 hex chars = 32 bytes
    return Buffer.from(
      'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2',
      'hex'
    );
  }
  return Buffer.from(key, 'hex');
}

// ── Types ─────────────────────────────────────────────────────
export interface TokenPayload {
  ver: number;
  bid: string;
  pid: string;
  bat: string;
  seq: number;
  iat: number;
  exp: number;
  rnd: string;
  env: string;
}

export interface GenerateTokenInput {
  brandId:    string;
  productId:  string;
  batchId:    string;
  sequence:   number;
  expiryDays: number;
}

export interface VerifyTokenResult {
  valid:          boolean;
  payload?:       TokenPayload;
  brandId?:       string;
  productId?:     string;
  batchId?:       string;
  failureReason?: string;
  tampered?:      boolean;
}

// ── Key Derivation (HKDF RFC 5869) ───────────────────────────
function deriveSigningKey(brandId: string, productId: string): Buffer {
  const salt = createHash('sha256')
    .update(brandId + productId)
    .digest();

  return Buffer.from(hkdfSync(
    HKDF_ALGORITHM,
    getMasterKey(),
    salt,
    HKDF_INFO,
    DERIVED_KEY_LEN,
  ));
}

// ── Fingerprint (non-reversible short ID) ─────────────────────
function fingerprint(id: string, secret: Buffer): string {
  return createHmac('sha256', secret)
    .update(id)
    .digest('hex')
    .slice(0, 8);
}

// ── Token Generation ──────────────────────────────────────────
export function generateTokenV2(input: GenerateTokenInput): string {
  const { brandId, productId, batchId, sequence, expiryDays } = input;
  const signingKey = deriveSigningKey(brandId, productId);

  const now = Math.floor(Date.now() / 1000);
  const payload: TokenPayload = {
    ver: TOKEN_VERSION,
    bid: fingerprint(brandId, signingKey),
    pid: fingerprint(productId, signingKey),
    bat: fingerprint(batchId, signingKey),
    seq: sequence,
    iat: now,
    exp: now + expiryDays * 86400,
    rnd: randomBytes(RANDOM_BYTES).toString('hex'),
    env: process.env.NODE_ENV === 'production' ? 'prod' : 'test',
  };

  const payloadJson    = JSON.stringify(payload);
  const payloadEncoded = Buffer.from(payloadJson).toString(PAYLOAD_ENCODING);

  const signature = createHmac(HMAC_ALGORITHM, signingKey)
    .update(payloadEncoded)
    .digest(DIGEST_ENCODING);

  const checksum = createHash('sha256')
    .update(payloadEncoded + signature)
    .digest('hex')
    .slice(0, 8);

  return `${TOKEN_PREFIX}_${payloadEncoded}_${signature}_${checksum}`;
}

// ── Token Verification ────────────────────────────────────────
export function verifyTokenV2(
  token: string,
  brandId: string,
  productId: string,
): VerifyTokenResult {
  if (!token || typeof token !== 'string') {
    return { valid: false, failureReason: 'invalid_type' };
  }
  if (token.length < 50 || token.length > 1000) {
    return { valid: false, failureReason: 'invalid_length' };
  }

  const parts = token.split('_');
  if (parts.length !== 4) {
    return { valid: false, failureReason: 'invalid_structure' };
  }

  const [prefix, payloadEncoded, providedSig, providedChecksum] = parts;

  if (prefix !== TOKEN_PREFIX) {
    return { valid: false, failureReason: 'invalid_prefix' };
  }

  // Checksum verification (fast, non-secret)
  const expectedChecksum = createHash('sha256')
    .update(payloadEncoded + providedSig)
    .digest('hex')
    .slice(0, 8);

  if (expectedChecksum !== providedChecksum) {
    return { valid: false, failureReason: 'checksum_failed', tampered: true };
  }

  // Decode payload
  let payload: TokenPayload;
  try {
    const payloadJson = Buffer.from(payloadEncoded, PAYLOAD_ENCODING).toString('utf8');
    payload = JSON.parse(payloadJson);
  } catch {
    return { valid: false, failureReason: 'payload_decode_failed', tampered: true };
  }

  if (payload.ver !== TOKEN_VERSION) {
    return { valid: false, failureReason: 'version_mismatch' };
  }

  const now = Math.floor(Date.now() / 1000);
  if (payload.exp < now) {
    return { valid: false, failureReason: 'token_expired' };
  }
  if (payload.iat > now + 300) {
    return { valid: false, failureReason: 'token_from_future', tampered: true };
  }

  const expectedEnv = process.env.NODE_ENV === 'production' ? 'prod' : 'test';
  if (payload.env !== expectedEnv) {
    return { valid: false, failureReason: 'environment_mismatch' };
  }

  // Derive signing key for this brand+product
  const signingKey = deriveSigningKey(brandId, productId);

  // Fingerprint cross-validation
  const expectedBidFp = fingerprint(brandId, signingKey);
  const expectedPidFp = fingerprint(productId, signingKey);

  try {
    const bidMatch = timingSafeEqual(
      Buffer.from(payload.bid, 'utf8'),
      Buffer.from(expectedBidFp, 'utf8'),
    );
    const pidMatch = timingSafeEqual(
      Buffer.from(payload.pid, 'utf8'),
      Buffer.from(expectedPidFp, 'utf8'),
    );
    if (!bidMatch) return { valid: false, failureReason: 'brand_mismatch', tampered: true };
    if (!pidMatch) return { valid: false, failureReason: 'product_mismatch', tampered: true };
  } catch {
    return { valid: false, failureReason: 'fingerprint_comparison_error', tampered: true };
  }

  // HMAC-SHA512 signature verification (timing-safe)
  const expectedSig = createHmac(HMAC_ALGORITHM, signingKey)
    .update(payloadEncoded)
    .digest(DIGEST_ENCODING);

  try {
    const expectedBuf = Buffer.from(expectedSig, 'utf8');
    const providedBuf = Buffer.from(providedSig, 'utf8');

    if (expectedBuf.length !== providedBuf.length) {
      return { valid: false, failureReason: 'signature_length_mismatch', tampered: true };
    }
    if (!timingSafeEqual(expectedBuf, providedBuf)) {
      return { valid: false, failureReason: 'signature_invalid', tampered: true };
    }
  } catch {
    return { valid: false, failureReason: 'signature_verification_error', tampered: true };
  }

  return {
    valid:     true,
    payload,
    brandId,
    productId,
  };
}
