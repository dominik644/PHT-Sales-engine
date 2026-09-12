import type { ErpAdapter, ErpOrderPayload, ErpOrderResult, ErpProduct } from "./types";

/** Local demo ERP — mirrors pht.group pillars until real credentials are configured. */
export class MockErpAdapter implements ErpAdapter {
  readonly name = "mock";

  private stock = new Map<string, number>([
    ["PHT-SCHLEUSE-ENTRY", 6],
    ["PHT-HYGIENETECHNIK", 18],
    ["PHT-SOZIALRAUM", 22],
    ["PHT-HAND-1L", 800],
    ["PHT-NORMWAGEN", 14],
    ["PHT-SCHAUM-ND", 9],
    ["PHT-BEHAELTER", 4],
    ["PHT-FARBSYSTEM", 120],
    ["PHT-PORTION", 3],
    ["PHT-HEBE-KIPP", 5],
    ["PHT-FOERDER", 7],
    ["PHT-WARTUNG-12", 999],
    ["PHT-KUNDENDIENST", 999],
  ]);

  async fetchProducts(): Promise<ErpProduct[]> {
    return [
      {
        erpId: "ERP-PHT-PH-01",
        sku: "PHT-SCHLEUSE-ENTRY",
        name: "Hygieneschleuse Entry",
        category: "Personalhygiene",
        tagline: "Hygieneschleusen — Zutritt mit Hygiene-Freigabe.",
        description: "Personalschleuse mit Hygiene-Freigabe.",
        priceCents: 649000,
        currency: "EUR",
        imageUrl: "/shop/einlasskontrolle.webp",
        stock: this.stock.get("PHT-SCHLEUSE-ENTRY") ?? 0,
        active: true,
      },
      {
        erpId: "ERP-PHT-BH-01",
        sku: "PHT-NORMWAGEN",
        name: "Normwagen Edelstahl",
        category: "Betriebshygiene",
        tagline: "Betriebseinrichtung — robust für den Nassbereich.",
        description: "Edelstahl-Normwagen für die Lebensmittelproduktion.",
        priceCents: 245000,
        currency: "EUR",
        imageUrl: "/shop/normwagen.webp",
        stock: this.stock.get("PHT-NORMWAGEN") ?? 0,
        active: true,
      },
      {
        erpId: "ERP-PHT-PT-01",
        sku: "PHT-PORTION",
        name: "Portioniersystem",
        category: "Prozesstechnik",
        tagline: "Portioniersysteme — präzise, hygienisch, produktiv.",
        description: "Portioniereinheit für hygienesensible Linien.",
        priceCents: 1250000,
        currency: "EUR",
        imageUrl: "/shop/hero-prozesstechnik.webp",
        stock: this.stock.get("PHT-PORTION") ?? 0,
        active: true,
      },
    ];
  }

  async pushOrder(order: ErpOrderPayload): Promise<ErpOrderResult> {
    for (const item of order.items) {
      const current = this.stock.get(item.sku) ?? 0;
      this.stock.set(item.sku, Math.max(0, current - item.quantity));
    }
    return {
      erpOrderId: `MOCK-ORD-${order.orderNumber}`,
      erpInvoiceId: `MOCK-INV-${order.orderNumber}`,
      invoiceNumber: `RE-${order.orderNumber.replace("PHT-", "")}`,
    };
  }

  async fetchStock(sku: string): Promise<number | null> {
    return this.stock.has(sku) ? (this.stock.get(sku) ?? 0) : null;
  }

  async healthCheck(): Promise<{ ok: boolean; detail: string }> {
    return { ok: true, detail: `Mock ERP ready (${this.stock.size} SKUs)` };
  }
}
