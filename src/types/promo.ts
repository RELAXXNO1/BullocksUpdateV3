import { z } from 'zod';

export const PromoSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Promo name must be at least 2 characters"),
  description: z.string().optional(),
  product: z.string(),
  discount: z.number().min(0).max(100),
  startDate: z.date(),
  endDate: z.date(),
  textPromo: z.string().optional(),
  isActive: z.boolean().default(true),
  type: z.enum(['percentage', 'fixed', 'bogo']),
  code: z.string().optional(),
  maxUses: z.number().optional(),
  currentUses: z.number().default(0),
  minPurchaseAmount: z.number().optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date())
});

export type Promo = z.infer<typeof PromoSchema>;

export const PROMO_TYPES = [
  { value: 'percentage', label: 'Percentage Discount' },
  { value: 'fixed', label: 'Fixed Amount Off' },
  { value: 'bogo', label: 'Buy One Get One' }
] as const;