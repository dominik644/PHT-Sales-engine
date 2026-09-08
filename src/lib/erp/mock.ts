import type { ErpAdapter, ErpOrderPayload, ErpOrderResult, ErpProduct } from "./types";

/** Local demo ERP — stands in until real credentials are configured. */
export class MockErpAdapter implements ErpAdapter {
  readonly name = "mock";

  private stock = new Map<string, number>([
    ["PHT-ARC-LAMP", 42],
    ["PHT-PULSE-HP", 28],
    ["PHT-NORD-CHAIR", 12],
    ["PHT-TERRA-SET", 64],
    ["PHT-FLUX-THERM", 35],
    ["PHT-LOOM-THROW", 50],
    ["PHT-ORBIT-CLOCK", 73],
    ["PHT-RIDGE-BOTTLE", 120],
  ]);

  async fetchProducts(): Promise<ErpProduct[]> {
    return [
      {
        erpId: "ERP-PHT-01",
        sku: "PHT-ARC-LAMP",
        name: "Arc Desk Lamp",
        category: "Lighting",
        tagline: "Focused light, quiet presence.",
        description:
          "A balanced steel arc with a warm dimmable LED. Built for long work sessions without glare or clutter.",
        priceCents: 18900,
        currency: "EUR",
        imageUrl:
          "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1200&q=80",
        stock: this.stock.get("PHT-ARC-LAMP") ?? 0,
        active: true,
      },
      {
        erpId: "ERP-PHT-02",
        sku: "PHT-PULSE-HP",
        name: "Pulse Headphones",
        category: "Audio",
        tagline: "Studio clarity for everyday listening.",
        description:
          "Closed-back wireless cans with adaptive noise control and a 36-hour charge.",
        priceCents: 24900,
        currency: "EUR",
        imageUrl:
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80",
        stock: this.stock.get("PHT-PULSE-HP") ?? 0,
        active: true,
      },
      {
        erpId: "ERP-PHT-03",
        sku: "PHT-NORD-CHAIR",
        name: "Nord Lounge Chair",
        category: "Furniture",
        tagline: "Sit lower. Stay longer.",
        description:
          "Oak frame, wool upholstery, and a seat angle made for reading.",
        priceCents: 62000,
        currency: "EUR",
        imageUrl:
          "https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&w=1200&q=80",
        stock: this.stock.get("PHT-NORD-CHAIR") ?? 0,
        active: true,
      },
      {
        erpId: "ERP-PHT-04",
        sku: "PHT-TERRA-SET",
        name: "Terra Ceramic Set",
        category: "Kitchen",
        tagline: "Four cups, one kiln.",
        description: "Hand-thrown stoneware with a matte ash glaze.",
        priceCents: 9600,
        currency: "EUR",
        imageUrl:
          "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=1200&q=80",
        stock: this.stock.get("PHT-TERRA-SET") ?? 0,
        active: true,
      },
      {
        erpId: "ERP-PHT-05",
        sku: "PHT-FLUX-THERM",
        name: "Flux Thermostat",
        category: "Home Tech",
        tagline: "Climate control without the noise.",
        description: "A wall unit that learns your schedule and keeps rooms steady.",
        priceCents: 17900,
        currency: "EUR",
        imageUrl:
          "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=1200&q=80",
        stock: this.stock.get("PHT-FLUX-THERM") ?? 0,
        active: true,
      },
      {
        erpId: "ERP-PHT-06",
        sku: "PHT-LOOM-THROW",
        name: "Loom Merino Throw",
        category: "Textiles",
        tagline: "Soft weight for cooler evenings.",
        description: "100% merino, loom-finished edges.",
        priceCents: 14800,
        currency: "EUR",
        imageUrl:
          "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=1200&q=80",
        stock: this.stock.get("PHT-LOOM-THROW") ?? 0,
        active: true,
      },
      {
        erpId: "ERP-PHT-07",
        sku: "PHT-ORBIT-CLOCK",
        name: "Orbit Desk Clock",
        category: "Objects",
        tagline: "Time, distilled.",
        description: "Brushed aluminum case, silent quartz movement.",
        priceCents: 8400,
        currency: "EUR",
        imageUrl:
          "https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?auto=format&fit=crop&w=1200&q=80",
        stock: this.stock.get("PHT-ORBIT-CLOCK") ?? 0,
        active: true,
      },
      {
        erpId: "ERP-PHT-08",
        sku: "PHT-RIDGE-BOTTLE",
        name: "Ridge Bottle",
        category: "Everyday",
        tagline: "Carry cold farther.",
        description: "Double-wall steel, 750 ml, powder-coated shell.",
        priceCents: 4200,
        currency: "EUR",
        imageUrl:
          "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=1200&q=80",
        stock: this.stock.get("PHT-RIDGE-BOTTLE") ?? 0,
        active: true,
      },
    ];
  }

  async pushOrder(order: ErpOrderPayload): Promise<ErpOrderResult> {
    for (const item of order.items) {
      const current = this.stock.get(item.sku) ?? 0;
      this.stock.set(item.sku, Math.max(0, current - item.quantity));
    }
    return { erpOrderId: `MOCK-${order.orderNumber}` };
  }

  async fetchStock(sku: string): Promise<number | null> {
    return this.stock.has(sku) ? (this.stock.get(sku) ?? 0) : null;
  }
}
