import type { ErpAdapter, ErpOrderPayload, ErpOrderResult, ErpProduct } from "./types";

/** Local demo ERP — PHT Hygiene assortment until real credentials are configured. */
export class MockErpAdapter implements ErpAdapter {
  readonly name = "mock";

  private stock = new Map<string, number>([
    ["PHT-WASHX-PRO", 24],
    ["PHT-ENTRYX", 8],
    ["PHT-HELIX", 12],
    ["PHT-DES-5L", 320],
    ["PHT-HAND-1L", 800],
    ["PHT-PAPER-TOWEL", 450],
    ["PHT-FOAM-CLEAN", 160],
    ["PHT-SERVICE-HYG", 999],
  ]);

  async fetchProducts(): Promise<ErpProduct[]> {
    return [
      {
        erpId: "ERP-PHT-01",
        sku: "PHT-WASHX-PRO",
        name: "Handwaschbecken WashX Pro",
        category: "Personalhygiene",
        tagline: "Sensor-Handwaschbecken für hygienesensible Bereiche.",
        description: "Edelstahl-Handwaschbecken mit berührungsloser Armatur.",
        priceCents: 189000,
        currency: "EUR",
        imageUrl: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1400&q=80",
        stock: this.stock.get("PHT-WASHX-PRO") ?? 0,
        active: true,
      },
      {
        erpId: "ERP-PHT-02",
        sku: "PHT-ENTRYX",
        name: "Zutrittskontrolle EntryX",
        category: "Zutritt",
        tagline: "Personalschleuse mit Hygiene-Freigabe.",
        description: "Zutrittssystem mit Hand- und Sohlendesinfektionsprüfung.",
        priceCents: 649000,
        currency: "EUR",
        imageUrl: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=1400&q=80",
        stock: this.stock.get("PHT-ENTRYX") ?? 0,
        active: true,
      },
      {
        erpId: "ERP-PHT-04",
        sku: "PHT-DES-5L",
        name: "Flächendesinfektion 5 l",
        category: "Desinfektion",
        tagline: "Gebrauchsfertig für Produktionsflächen.",
        description: "Alkoholbasierte Flächendesinfektion, 5-Liter-Gebinde.",
        priceCents: 4890,
        currency: "EUR",
        imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=1400&q=80",
        stock: this.stock.get("PHT-DES-5L") ?? 0,
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
