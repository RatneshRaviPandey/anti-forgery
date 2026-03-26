import { db } from '@/lib/db';
import { brandUsers } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export function getTenantBrandId(userId: string): Promise<string | null> {
  return db.query.brandUsers.findFirst({
    where: eq(brandUsers.id, userId),
    columns: { brandId: true },
  }).then(u => u?.brandId ?? null);
}

// Ensure a resource belongs to the requesting brand
export function assertBrandOwnership(resourceBrandId: string | null, requestBrandId: string): void {
  if (resourceBrandId !== requestBrandId) {
    throw new Error('Access denied: resource does not belong to your brand');
  }
}
