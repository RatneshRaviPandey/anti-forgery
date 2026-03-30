import { z } from 'zod';

export const brandCreateSchema = z.object({
  name:    z.string().min(1).max(200),
  email:   z.string().email(),
  phone:   z.string().max(20).optional(),
  logoUrl: z.string().url().optional(),
  website: z.string().url().optional(),
  plan:    z.enum(['starter', 'growth', 'enterprise']).optional(),
});

export const brandUpdateSchema = brandCreateSchema.partial();

export type BrandCreate = z.infer<typeof brandCreateSchema>;
export type BrandUpdate = z.infer<typeof brandUpdateSchema>;
