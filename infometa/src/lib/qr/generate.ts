import QRCode from 'qrcode';
import { generateToken, signToken } from '@/lib/utils/crypto';

const BASE_URL = process.env.QR_VERIFY_BASE_URL || 'https://infometa.in/verify';

export interface GeneratedQR {
  token: string;
  signature: string;
  verifyUrl: string;
  dataUrl: string; // base64 PNG
}

export async function generateQRCode(batchId: string, productId: string, brandId: string): Promise<GeneratedQR> {
  const token = generateToken();
  const signature = signToken(token);
  const verifyUrl = `${BASE_URL}?code=${token}`;

  const dataUrl = await QRCode.toDataURL(verifyUrl, {
    errorCorrectionLevel: 'H',
    type: 'image/png',
    width: 400,
    margin: 2,
    color: { dark: '#0F172A', light: '#FFFFFF' },
  });

  return { token, signature, verifyUrl, dataUrl };
}

export async function generateQRBuffer(verifyUrl: string): Promise<Buffer> {
  return QRCode.toBuffer(verifyUrl, {
    errorCorrectionLevel: 'H',
    type: 'png',
    width: 800,
    margin: 2,
    color: { dark: '#0F172A', light: '#FFFFFF' },
  });
}
