import { z } from "zod";

export const checkoutSchema = z.object({
  address: z.string().trim().min(3).max(200),
  city: z.string().trim().min(2).max(100),
  postal: z.string().trim().min(3).max(20),
  country: z.string().trim().length(2).default("DE"),
  discountCode: z.string().trim().max(40).optional().nullable(),
  paymentTermId: z.string().min(1),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().min(1).max(100),
      }),
    )
    .min(1)
    .max(50),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const adminLoginSchema = z.object({
  password: z.string().min(1).max(200),
});

export const registerCompanySchema = z.object({
  companyName: z.string().trim().min(2).max(160),
  vatId: z.string().trim().max(40).optional().nullable(),
  billingEmail: z.string().trim().email().max(200),
  address: z.string().trim().min(3).max(200),
  city: z.string().trim().min(2).max(100),
  postal: z.string().trim().min(3).max(20),
  country: z.string().trim().length(2).default("DE"),
  adminName: z.string().trim().min(2).max(120),
  adminEmail: z.string().trim().email().max(200),
  password: z.string().min(8).max(200),
  role: z
    .enum(["COMPANY_ADMIN", "PURCHASING", "PRODUCTION_MANAGER"])
    .default("COMPANY_ADMIN"),
});

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1).max(200),
});

export const inviteUserSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email(),
  password: z.string().min(8).max(200),
  role: z.enum(["COMPANY_ADMIN", "PURCHASING", "PRODUCTION_MANAGER"]),
});

export const discountSchema = z.object({
  code: z.string().trim().min(2).max(40),
  name: z.string().trim().min(2).max(120),
  type: z.enum(["percent", "fixed"]),
  percentOff: z.number().min(0).max(100).optional().nullable(),
  amountOffCents: z.number().int().min(0).optional().nullable(),
  minSubtotalCents: z.number().int().min(0).default(0),
  validFrom: z.string().datetime(),
  validTo: z.string().datetime(),
  companyId: z.string().optional().nullable(),
  active: z.boolean().default(true),
});

export const approvalSchema = z.object({
  decision: z.enum(["approved", "rejected"]),
  note: z.string().trim().max(500).optional().nullable(),
});

export const paymentTermSchema = z.object({
  code: z.string().trim().min(2).max(40),
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().min(2).max(400),
  depositPercent: z.number().int().min(0).max(100),
  balancePercent: z.number().int().min(0).max(100),
  balanceDueDays: z.number().int().min(0).max(365),
  active: z.boolean().default(true),
  sortOrder: z.number().int().min(0).default(0),
});

export const datasheetSchema = z.object({
  productId: z.string().min(1),
  title: z.string().trim().min(2).max(160),
  fileName: z.string().trim().min(3).max(160),
  filePath: z.string().trim().min(3).max(240),
  mimeType: z.string().trim().min(3).max(120).default("application/pdf"),
  sortOrder: z.number().int().min(0).default(0),
});
