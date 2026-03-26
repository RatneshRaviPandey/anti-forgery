import { db } from '@/lib/db';
import { qrCodes, products, batches, brands } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export type VerifyResult =
  | { status: 'authentic'; data: AuthenticResult }
  | { status: 'suspicious'; data: SuspiciousResult }
  | { status: 'invalid'; data: InvalidResult };

interface AuthenticResult {
  token: string;
  message: string;
  productName: string;
  productSku: string;
  productImage: string | null;
  industry: string;
  brandName: string;
  brandLogo: string | null;
  brandWebsite: string | null;
  batchCode: string;
  manufactureDate: string | null;
  expiryDate: string | null;
  scanCount: number;
  verifiedAt: string;
}

interface SuspiciousResult {
  token: string;
  message: string;
  productName: string;
  brandName: string;
  scanCount: number;
  uniqueLocations: number;
  warningMessage: string;
}

interface InvalidResult {
  token: string;
  message: string;
  reason?: string;
}

export async function verifyToken(token: string): Promise<VerifyResult> {
  const result = await db
    .select({
      token:           qrCodes.token,
      status:          qrCodes.status,
      scanCount:       qrCodes.scanCount,
      uniqueLocations: qrCodes.uniqueLocations,
      productId:       products.id,
      productName:     products.name,
      productSku:      products.sku,
      productImage:    products.imageUrl,
      industry:        products.industry,
      batchCode:       batches.batchCode,
      manufactureDate: batches.manufactureDate,
      expiryDate:      batches.expiryDate,
      brandName:       brands.name,
      brandLogo:       brands.logoUrl,
      brandWebsite:    brands.website,
    })
    .from(qrCodes)
    .innerJoin(products, eq(qrCodes.productId, products.id))
    .innerJoin(batches, eq(qrCodes.batchId, batches.id))
    .innerJoin(brands, eq(qrCodes.brandId, brands.id))
    .where(eq(qrCodes.token, token))
    .limit(1);

  if (result.length === 0) {
    return {
      status: 'invalid',
      data: {
        token,
        message: 'This QR code is not registered in the Infometa verification registry.',
      },
    };
  }

  const code = result[0];
  const isDeactivated = code.status === 'deactivated';
  const isDuplicate = (code.scanCount ?? 0) >= 3 && (code.uniqueLocations ?? 0) >= 2;
  const isSuspicious = code.status === 'suspicious' || isDuplicate;

  if (isDeactivated) {
    return {
      status: 'invalid',
      data: {
        token,
        message: 'This product has been recalled or deactivated.',
        reason: 'deactivated',
      },
    };
  }

  if (isSuspicious) {
    return {
      status: 'suspicious',
      data: {
        token,
        message: 'This QR code has been scanned multiple times from different locations.',
        productName: code.productName,
        brandName: code.brandName,
        scanCount: code.scanCount ?? 0,
        uniqueLocations: code.uniqueLocations ?? 0,
        warningMessage: 'This may be a counterfeit product. Please report it.',
      },
    };
  }

  return {
    status: 'authentic',
    data: {
      token,
      message: 'This product is genuine and verified.',
      productName: code.productName,
      productSku: code.productSku,
      productImage: code.productImage,
      industry: code.industry,
      brandName: code.brandName,
      brandLogo: code.brandLogo,
      brandWebsite: code.brandWebsite,
      batchCode: code.batchCode,
      manufactureDate: code.manufactureDate,
      expiryDate: code.expiryDate,
      scanCount: (code.scanCount ?? 0) + 1,
      verifiedAt: new Date().toISOString(),
    },
  };
}
