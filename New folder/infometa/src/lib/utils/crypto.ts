import { createHmac, randomUUID } from 'crypto';

const SECRET_KEY = process.env.QR_SECRET_KEY || 'infometa-default-dev-key';

export function generateToken(): string {
  return randomUUID();
}

export function signToken(token: string): string {
  return createHmac('sha256', SECRET_KEY).update(token).digest('hex');
}

export function verifyTokenSignature(token: string, signature: string): boolean {
  const expected = signToken(token);
  // Constant-time comparison
  if (expected.length !== signature.length) return false;
  let result = 0;
  for (let i = 0; i < expected.length; i++) {
    result |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return result === 0;
}
