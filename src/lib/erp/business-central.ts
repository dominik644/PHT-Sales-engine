import type { ErpAdapter, ErpOrderPayload, ErpOrderResult, ErpProduct } from "./types";

/**
 * Standalone Microsoft Dynamics 365 Business Central adapter (OData API v2.0).
 * Independent of PHT Mastertool — own OAuth client, own env vars, own code.
 *
 * Env:
 *   BC_TENANT_ID, BC_CLIENT_ID, BC_CLIENT_SECRET, BC_ENVIRONMENT, BC_COMPANY_ID
 *   BC_ALLOW_WRITE=true  → enables order/invoice POST (default: read-only)
 *
 * Optional:
 *   BC_DEFAULT_CUSTOMER_NUMBER — fallback Sell-to Customer if company has no erpCustomerId
 *   BC_CURRENCY_CODE — default EUR
 */

const BC_SCOPE = "https://api.businesscentral.dynamics.com/.default";

type TokenCache = { accessToken: string; expiresAt: number };

let tokenCache: TokenCache | null = null;

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required for Business Central adapter`);
  return value;
}

function writesAllowed(): boolean {
  return (process.env.BC_ALLOW_WRITE ?? "").toLowerCase() === "true";
}

function apiRoot(): string {
  return `https://api.businesscentral.dynamics.com/v2.0/${requireEnv("BC_TENANT_ID")}/${requireEnv("BC_ENVIRONMENT")}`;
}

function companyBase(): string {
  return `${apiRoot()}/api/v2.0/companies(${requireEnv("BC_COMPANY_ID")})`;
}

async function getAccessToken(): Promise<string> {
  if (tokenCache && tokenCache.expiresAt > Date.now() + 60_000) {
    return tokenCache.accessToken;
  }

  const tenantId = requireEnv("BC_TENANT_ID");
  const body = new URLSearchParams({
    client_id: requireEnv("BC_CLIENT_ID"),
    client_secret: requireEnv("BC_CLIENT_SECRET"),
    scope: BC_SCOPE,
    grant_type: "client_credentials",
  });

  const res = await fetch(
    `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      signal: AbortSignal.timeout(20_000),
      cache: "no-store",
    },
  );

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`BC token error (${res.status}): ${text.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    access_token?: string;
    expires_in?: number;
  };
  if (!data.access_token) throw new Error("BC token response missing access_token");

  tokenCache = {
    accessToken: data.access_token,
    expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000,
  };
  return data.access_token;
}

async function bcFetch<T>(
  path: string,
  init?: { method?: string; body?: unknown },
): Promise<T> {
  const method = init?.method ?? "GET";
  if (method !== "GET" && !writesAllowed()) {
    throw new Error(
      "BC write blocked: set BC_ALLOW_WRITE=true to create orders/invoices (use a sandbox).",
    );
  }

  const token = await getAccessToken();
  const res = await fetch(`${companyBase()}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
    },
    body: init?.body ? JSON.stringify(init.body) : undefined,
    signal: AbortSignal.timeout(45_000),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`BC ${method} ${path} (${res.status}): ${text.slice(0, 400)}`);
  }

  if (res.status === 204) return null as T;
  return (await res.json()) as T;
}

async function fetchAllPages<T>(path: string): Promise<T[]> {
  const items: T[] = [];
  let next: string | null = path;
  const base = companyBase();

  while (next) {
    const page: { value?: T[]; "@odata.nextLink"?: string } = await bcFetch(next);
    if (Array.isArray(page.value)) items.push(...page.value);
    const link: string | undefined = page["@odata.nextLink"];
    next = link ? link.replace(base, "") : null;
  }

  return items;
}

type BcItem = {
  id: string;
  number: string;
  displayName?: string;
  type?: string;
  itemCategoryCode?: string;
  unitPrice?: number;
  inventory?: number;
  blocked?: string | boolean;
  gtin?: string;
};

type BcSalesDoc = {
  id: string;
  number: string;
};

function mapItem(item: BcItem): ErpProduct {
  const blocked =
    item.blocked === true ||
    (typeof item.blocked === "string" &&
      item.blocked.toLowerCase() !== "" &&
      item.blocked.toLowerCase() !== " ");

  return {
    erpId: item.id,
    sku: item.number,
    name: item.displayName || item.number,
    category: item.itemCategoryCode || "BC",
    tagline: item.type || "Item",
    description: item.displayName || item.number,
    priceCents: Math.round((item.unitPrice ?? 0) * 100),
    currency: process.env.BC_CURRENCY_CODE || "EUR",
    imageUrl:
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80",
    stock: Math.max(0, Math.floor(item.inventory ?? 0)),
    active: !blocked,
  };
}

export function isBusinessCentralConfigured(): boolean {
  return Boolean(
    process.env.BC_TENANT_ID &&
      process.env.BC_CLIENT_ID &&
      process.env.BC_CLIENT_SECRET &&
      process.env.BC_ENVIRONMENT &&
      process.env.BC_COMPANY_ID,
  );
}

export function getBusinessCentralStatus() {
  return {
    provider: "business-central" as const,
    configured: isBusinessCentralConfigured(),
    allowWrite: writesAllowed(),
    tenantId: Boolean(process.env.BC_TENANT_ID),
    clientId: Boolean(process.env.BC_CLIENT_ID),
    clientSecret: Boolean(process.env.BC_CLIENT_SECRET),
    environment: process.env.BC_ENVIRONMENT || null,
    companyId: Boolean(process.env.BC_COMPANY_ID),
  };
}

export class BusinessCentralErpAdapter implements ErpAdapter {
  readonly name = "business-central";

  async healthCheck(): Promise<{ ok: boolean; detail: string }> {
    try {
      if (!isBusinessCentralConfigured()) {
        return { ok: false, detail: "BC_* env vars incomplete" };
      }
      const token = await getAccessToken();
      const companyId = requireEnv("BC_COMPANY_ID");
      const company = await fetch(
        `${apiRoot()}/api/v2.0/companies(${companyId})?$select=id,name,displayName`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          signal: AbortSignal.timeout(20_000),
          cache: "no-store",
        },
      );
      if (!company.ok) {
        return { ok: false, detail: `Company lookup failed (${company.status})` };
      }
      const data = (await company.json()) as { displayName?: string; name?: string };
      return {
        ok: true,
        detail: `Connected to ${data.displayName || data.name || companyId}${writesAllowed() ? " (write enabled)" : " (read-only)"}`,
      };
    } catch (error) {
      return {
        ok: false,
        detail: error instanceof Error ? error.message : "BC health check failed",
      };
    }
  }

  async fetchProducts(): Promise<ErpProduct[]> {
    const items = await fetchAllPages<BcItem>(
      "/items?$select=id,number,displayName,type,itemCategoryCode,unitPrice,inventory,blocked&$top=200",
    );
    return items.map(mapItem);
  }

  async fetchStock(sku: string): Promise<number | null> {
    const escaped = sku.replace(/'/g, "''");
    const data = await bcFetch<{ value?: BcItem[] }>(
      `/items?$filter=number eq '${escaped}'&$select=number,inventory&$top=1`,
    );
    const item = data.value?.[0];
    if (!item) return null;
    return Math.max(0, Math.floor(item.inventory ?? 0));
  }

  async pushOrder(order: ErpOrderPayload): Promise<ErpOrderResult> {
    const customerNumber =
      order.erpCustomerId?.trim() ||
      process.env.BC_DEFAULT_CUSTOMER_NUMBER?.trim();

    if (!customerNumber) {
      throw new Error(
        "BC customer missing: set company.erpCustomerId or BC_DEFAULT_CUSTOMER_NUMBER",
      );
    }

    const salesOrder = await bcFetch<BcSalesDoc>("/salesOrders", {
      method: "POST",
      body: {
        customerNumber,
        externalDocumentNumber: order.orderNumber.slice(0, 35),
        email: order.email,
        currencyCode: order.currency || process.env.BC_CURRENCY_CODE || "EUR",
      },
    });

    for (const item of order.items) {
      await bcFetch(`/salesOrders(${salesOrder.id})/salesOrderLines`, {
        method: "POST",
        body: {
          lineType: "Item",
          lineObjectNumber: item.sku,
          quantity: item.quantity,
          unitPrice: item.unitCents / 100,
          description: item.name.slice(0, 100),
        },
      });
    }

    // Prefer dedicated sales invoice so payment terms / B2B docs stay explicit.
    const invoice = await bcFetch<BcSalesDoc>("/salesInvoices", {
      method: "POST",
      body: {
        customerNumber,
        externalDocumentNumber: order.orderNumber.slice(0, 35),
        email: order.email,
        currencyCode: order.currency || process.env.BC_CURRENCY_CODE || "EUR",
      },
    });

    for (const item of order.items) {
      await bcFetch(`/salesInvoices(${invoice.id})/salesInvoiceLines`, {
        method: "POST",
        body: {
          lineType: "Item",
          lineObjectNumber: item.sku,
          quantity: item.quantity,
          unitPrice: item.unitCents / 100,
          description: item.name.slice(0, 100),
        },
      });
    }

    // Post invoice if BC exposes the action (sandbox/company settings may vary).
    try {
      await bcFetch(`/salesInvoices(${invoice.id})/Microsoft.NAV.post`, {
        method: "POST",
        body: {},
      });
    } catch {
      // Draft invoice is still created; admin can post in BC UI.
    }

    return {
      erpOrderId: salesOrder.number || salesOrder.id,
      erpInvoiceId: invoice.id,
      invoiceNumber: invoice.number || `BC-${order.orderNumber}`,
    };
  }
}
