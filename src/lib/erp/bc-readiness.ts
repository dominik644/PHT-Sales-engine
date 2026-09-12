/**
 * ERP/BC readiness — contracts for live Business Central later.
 * Until credentials exist: ERP_PROVIDER=mock|rest.
 */
export type BcConnectionStatus = {
  configured: boolean;
  allowWrite: boolean;
  missingEnv: string[];
  mode: string;
};

const BC_ENV = [
  "BC_TENANT_ID",
  "BC_CLIENT_ID",
  "BC_CLIENT_SECRET",
  "BC_ENVIRONMENT",
  "BC_COMPANY_ID",
] as const;

export function getBcConnectionStatus(): BcConnectionStatus {
  const missing = BC_ENV.filter((k) => !process.env[k]?.trim());
  return {
    configured: missing.length === 0,
    allowWrite: (process.env.BC_ALLOW_WRITE ?? "false").toLowerCase() === "true",
    missingEnv: missing,
    mode: process.env.ERP_PROVIDER ?? "mock",
  };
}

/** Fields we will map from BC Items when sync goes live */
export const BC_PRODUCT_FIELD_MAP = {
  number: "sku",
  displayName: "name",
  unitPrice: "priceCents",
  inventory: "stock",
  itemCategoryCode: "category",
  gtín: "manufacturerSku",
} as const;

export const BC_CUSTOMER_FIELD_MAP = {
  number: "erpCustomerId",
  displayName: "name",
  taxRegistrationNumber: "vatId",
  customerPriceGroupId: "priceGroup",
  paymentTermsId: "defaultPaymentTerm",
} as const;
