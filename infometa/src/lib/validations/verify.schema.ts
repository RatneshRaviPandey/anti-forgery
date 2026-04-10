import { z } from 'zod';

export const verifyQuerySchema = z.object({
  token: z.string().min(8).max(128),
});

export type VerifyQuery = z.infer<typeof verifyQuerySchema>;
