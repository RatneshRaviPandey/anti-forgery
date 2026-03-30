import { z } from 'zod';

const industryValues = [
  'dairy', 'pharma', 'cosmetics', 'fmcg', 'agro_products',
  'electronics', 'auto_parts', 'lubricants', 'supplements',
  'beverages', 'luxury', 'industrial_chemicals',
] as const;

export const productCreateSchema = z.object({
  name:        z.string().min(1).max(200),
  sku:         z.string().min(1).max(50),
  industry:    z.enum(industryValues),
  description: z.string().max(2000).optional(),
  imageUrl:    z.string().url().optional(),
  category:    z.string().max(100).optional(),
  metadata:    z.record(z.string(), z.unknown()).optional(),
});

export const productUpdateSchema = productCreateSchema.partial();

export type ProductCreate = z.infer<typeof productCreateSchema>;
export type ProductUpdate = z.infer<typeof productUpdateSchema>;
