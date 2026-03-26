import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

function getMfaEncryptionKey(): Buffer {
  const key = process.env.MFA_ENCRYPTION_KEY;
  if (!key || key.length < 64) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('MFA_ENCRYPTION_KEY must be 64 hex chars (256-bit)');
    }
    return Buffer.from('0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef', 'hex');
  }
  return Buffer.from(key, 'hex');
}

// otplib-free TOTP implementation using only Node.js crypto
const TOTP_DIGITS = 6;
const TOTP_STEP   = 30;
const TOTP_WINDOW = 1;

function generateHOTP(secret: Buffer, counter: bigint): string {
  const { createHmac } = require('crypto');
  const buf = Buffer.alloc(8);
  buf.writeBigUInt64BE(counter);

  const hmac = createHmac('sha256', secret).update(buf).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const code =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  return (code % 10 ** TOTP_DIGITS).toString().padStart(TOTP_DIGITS, '0');
}

function generateTOTPCode(secret: Buffer, timeOffset = 0): string {
  const counter = BigInt(Math.floor((Math.floor(Date.now() / 1000) + timeOffset) / TOTP_STEP));
  return generateHOTP(secret, counter);
}

export async function generateMFASecret(
  userEmail: string,
  brandName: string,
): Promise<{
  secret:          string;
  encryptedSecret: string;
  otpauthUrl:      string;
  backupCodes:     string[];
}> {
  const secretBytes = randomBytes(20);
  const secret = base32Encode(secretBytes);

  const otpauthUrl = `otpauth://totp/Infometa%20(${encodeURIComponent(brandName)}):${encodeURIComponent(userEmail)}?secret=${secret}&issuer=Infometa&algorithm=SHA256&digits=${TOTP_DIGITS}&period=${TOTP_STEP}`;

  const encryptedSecret = encryptMFASecret(secret);
  const backupCodes     = generateBackupCodes(10);

  return { secret, encryptedSecret, otpauthUrl, backupCodes };
}

export async function verifyTOTP(
  encryptedSecret: string,
  token: string,
): Promise<boolean> {
  try {
    if (!token || !/^\d{6}$/.test(token)) return false;
    const secret = decryptMFASecret(encryptedSecret);
    const secretBytes = base32Decode(secret);

    // Check current window ± 1 step
    for (let i = -TOTP_WINDOW; i <= TOTP_WINDOW; i++) {
      const expected = generateTOTPCode(secretBytes, i * TOTP_STEP);
      if (expected === token) return true;
    }
    return false;
  } catch {
    return false;
  }
}

// AES-256-GCM encryption
function encryptMFASecret(secret: string): string {
  const iv        = randomBytes(12);
  const cipher    = createCipheriv('aes-256-gcm', getMfaEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(secret, 'utf8'), cipher.final()]);
  const authTag   = cipher.getAuthTag();
  return [iv.toString('hex'), authTag.toString('hex'), encrypted.toString('hex')].join(':');
}

function decryptMFASecret(encryptedSecret: string): string {
  const [ivHex, authTagHex, encryptedHex] = encryptedSecret.split(':');
  const iv        = Buffer.from(ivHex, 'hex');
  const authTag   = Buffer.from(authTagHex, 'hex');
  const encrypted = Buffer.from(encryptedHex, 'hex');
  const decipher  = createDecipheriv('aes-256-gcm', getMfaEncryptionKey(), iv);
  decipher.setAuthTag(authTag);
  return decipher.update(encrypted).toString('utf8') + decipher.final('utf8');
}

function generateBackupCodes(count: number): string[] {
  return Array.from({ length: count }, () => {
    const code = randomBytes(5).toString('hex').toUpperCase();
    return `${code.slice(0, 5)}-${code.slice(5)}`;
  });
}

// Base32 encode/decode (RFC 4648)
const BASE32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function base32Encode(buffer: Buffer): string {
  let bits = 0;
  let value = 0;
  let output = '';
  for (const byte of buffer) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      output += BASE32_CHARS[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) {
    output += BASE32_CHARS[(value << (5 - bits)) & 31];
  }
  return output;
}

function base32Decode(encoded: string): Buffer {
  const cleanInput = encoded.replace(/=+$/, '').toUpperCase();
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];
  for (const char of cleanInput) {
    const idx = BASE32_CHARS.indexOf(char);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return Buffer.from(bytes);
}
