import { z } from "zod";

export const checkoutSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  address: z.string().trim().min(3).max(200),
  city: z.string().trim().min(2).max(100),
  postal: z.string().trim().min(3).max(20),
  country: z.string().trim().length(2).default("DE"),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().min(1).max(20),
      }),
    )
    .min(1)
    .max(50),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const adminLoginSchema = z.object({
  password: z.string().min(1).max(200),
});
