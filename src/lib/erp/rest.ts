import type { ErpAdapter, ErpOrderPayload, ErpOrderResult, ErpProduct } from "./types";

/**
 * Generic REST ERP adapter.
 * Expects endpoints (paths overridable via env):
 *   GET  {ERP_BASE_URL}{ERP_PRODUCTS_PATH|/products}  -> ErpProduct[]
 *   POST {ERP_BASE_URL}{ERP_ORDERS_PATH|/orders}      -> { id, invoiceId, invoiceNumber }
 *   GET  {ERP_BASE_URL}{ERP_STOCK_PATH|/stock}/{sku}  -> { stock: number }
 *   GET  {ERP_BASE_URL}{ERP_HEALTH_PATH|/health}      -> { ok?: boolean } (optional)
 *
 * Auth: Authorization: Bearer {ERP_API_KEY}
 * Compatible with middleware in front of Xentral, weclapp, SAP B1, etc.
 */
export class RestErpAdapter implements ErpAdapter {
  readonly name = "rest";

  private readonly productsPath: string;
  private readonly ordersPath: string;
  private readonly stockPath: string;
  private readonly healthPath: string;
  private readonly timeoutMs: number;

  constructor(
    private readonly baseUrl: string,
    private readonly apiKey: string,
  ) {
    if (!baseUrl) throw new Error("ERP_BASE_URL is required for rest adapter");
    if (!apiKey) throw new Error("ERP_API_KEY is required for rest adapter");
    this.productsPath = process.env.ERP_PRODUCTS_PATH || "/products";
    this.ordersPath = process.env.ERP_ORDERS_PATH || "/orders";
    this.stockPath = process.env.ERP_STOCK_PATH || "/stock";
    this.healthPath = process.env.ERP_HEALTH_PATH || "/health";
    this.timeoutMs = Number(process.env.ERP_TIMEOUT_MS || 30_000);
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
      signal: AbortSignal.timeout(this.timeoutMs),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`ERP ${res.status}: ${body.slice(0, 300)}`);
    }

    return (await res.json()) as T;
  }

  async healthCheck(): Promise<{ ok: boolean; detail: string }> {
    try {
      const result = await this.request<{ ok?: boolean; provider?: string }>(
        this.healthPath,
      );
      return {
        ok: result.ok !== false,
        detail: result.provider
          ? `REST OK (${result.provider})`
          : `REST OK @ ${this.baseUrl}`,
      };
    } catch (error) {
      // Health endpoint is optional — fall back to products list.
      try {
        const products = await this.fetchProducts();
        return {
          ok: true,
          detail: `REST reachable (${products.length} products)`,
        };
      } catch (inner) {
        return {
          ok: false,
          detail: inner instanceof Error ? inner.message : "REST health failed",
        };
      }
    }
  }

  fetchProducts(): Promise<ErpProduct[]> {
    return this.request<ErpProduct[]>(this.productsPath);
  }

  async pushOrder(order: ErpOrderPayload): Promise<ErpOrderResult> {
    const result = await this.request<{
      id: string;
      invoiceId: string;
      invoiceNumber: string;
    }>(this.ordersPath, {
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
      `${this.stockPath}/${encodeURIComponent(sku)}`,
    );
    return result.stock;
  }
}
