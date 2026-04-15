import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { qrCodes } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { generateQRBuffer } from '@/lib/qr/generate';
import { apiResponse } from '@/lib/utils/response';

const BASE_URL = process.env.QR_VERIFY_BASE_URL || 'https://infometa.in/verify';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const code = await db.query.qrCodes.findFirst({
    where: eq(qrCodes.token, token),
  });

  if (!code) return apiResponse.notFound('Code not found');

  const verifyUrl = `${BASE_URL}?code=${token}`;
  const buffer = await generateQRBuffer(verifyUrl);

  return new Response(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'image/png',
      'Content-Disposition': `inline; filename="qr-${token}.png"`,
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
