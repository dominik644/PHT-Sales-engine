export type ErpProduct = {
  erpId: string;
  sku: string;
  name: string;
  category: string;
  tagline: string;
  description: string;
  priceCents: number;
  currency: string;
  imageUrl: string;
  stock: number;
  active: boolean;
};

export type ErpOrderPayload = {
  orderNumber: string;
  companyName?: string;
  erpCustomerId?: string | null;
  email: string;
  name: string;
  addressLine1: string;
  city: string;
  postalCode: string;
  country: string;
  currency: string;
  subtotalCents: number;
  discountCents: number;
  totalCents: number;
  discountCode?: string | null;
  paymentTermLabel?: string | null;
  paymentTermSnapshot?: string | null;
  items: Array<{
    sku: string;
    name: string;
    quantity: number;
    unitCents: number;
  }>;
};

export type ErpOrderResult = {
  erpOrderId: string;
  erpInvoiceId: string;
  invoiceNumber: string;
};

export interface ErpAdapter {
  readonly name: string;
  fetchProducts(): Promise<ErpProduct[]>;
  /** ERP legt Auftrag UND Rechnung an */
  pushOrder(order: ErpOrderPayload): Promise<ErpOrderResult>;
  fetchStock(sku: string): Promise<number | null>;
  healthCheck?(): Promise<{ ok: boolean; detail: string }>;
}
