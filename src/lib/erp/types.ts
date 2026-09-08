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
  email: string;
  name: string;
  addressLine1: string;
  city: string;
  postalCode: string;
  country: string;
  currency: string;
  subtotalCents: number;
  items: Array<{
    sku: string;
    name: string;
    quantity: number;
    unitCents: number;
  }>;
};

export type ErpOrderResult = {
  erpOrderId: string;
};

export interface ErpAdapter {
  readonly name: string;
  fetchProducts(): Promise<ErpProduct[]>;
  pushOrder(order: ErpOrderPayload): Promise<ErpOrderResult>;
  fetchStock(sku: string): Promise<number | null>;
}
