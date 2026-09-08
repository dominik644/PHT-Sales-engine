import type { ErpAdapter, ErpOrderPayload, ErpOrderResult, ErpProduct } from "./types";

/**
 * Generic REST ERP adapter.
 * Expects endpoints:
 *   GET  {ERP_BASE_URL}/products  -> ErpProduct[]
 *   POST {ERP_BASE_URL}/orders    -> { id: string }
 *   GET  {ERP_BASE_URL}/stock/{sku} -> { stock: number }
 *
 * Auth: Authorization: Bearer {ERP_API_KEY}
 * Compatible with middleware in front of Xentral, weclapp, SAP B1, etc.
 */
export class RestErpAdapter implements ErpAdapter {
  readonly name = "rest";

  constructor(
    private readonly baseUrl: string,
    private readonly apiKey: string,
  ) {
    if (!baseUrl) throw new Error("ERP_BASE_URL is required for rest adapter");
    if (!apiKey) throw new Error("ERP_API_KEY is required for rest adapter");
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${this.baseUrl.replace(/\/$/, "")}${path}`, {
      ...init,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
        ...(init?.headers ?? {}),
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`ERP ${res.status}: ${body.slice(0, 300)}`);
    }

    return (await res.json()) as T;
  }

  fetchProducts(): Promise<ErpProduct[]> {
    return this.request<ErpProduct[]>("/products");
  }

  async pushOrder(order: ErpOrderPayload): Promise<ErpOrderResult> {
    const result = await this.request<{
      id: string;
      invoiceId: string;
      invoiceNumber: string;
    }>("/orders", {
      method: "POST",
      body: JSON.stringify(order),
    });
    return {
      erpOrderId: result.id,
      erpInvoiceId: result.invoiceId,
      invoiceNumber: result.invoiceNumber,
    };
  }

  async fetchStock(sku: string): Promise<number | null> {
    const result = await this.request<{ stock: number }>(
      `/stock/${encodeURIComponent(sku)}`,
    );
    return result.stock;
  }
}
