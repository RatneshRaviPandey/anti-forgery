import { z } from 'zod';

export const batchCreateSchema = z.object({
  productId:       z.string().uuid(),
  batchCode:       z.string().min(1).max(50),
  manufactureDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  expiryDate:      z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  totalUnits:      z.number().int().min(1).max(10_000_000),
  notes:           z.string().max(500).optional(),
});

export const batchUpdateSchema = batchCreateSchema.partial().omit({ productId: true });

export type BatchCreate = z.infer<typeof batchCreateSchema>;
export type BatchUpdate = z.infer<typeof batchUpdateSchema>;
