#!/usr/bin/env node
/**
 * Local demo ERP HTTP API for the PHT Webshop REST adapter.
 * Run: npm run erp:demo
 * Then set ERP_PROVIDER=rest, ERP_BASE_URL=http://127.0.0.1:4010, ERP_API_KEY=demo-erp-key
 */
import http from "node:http";

const PORT = Number(process.env.DEMO_ERP_PORT || 4010);
const API_KEY = process.env.DEMO_ERP_API_KEY || "demo-erp-key";

const products = [
  {
    erpId: "DEMO-01",
    sku: "PHT-ARC-LAMP",
    name: "Arc Desk Lamp",
    category: "Lighting",
    tagline: "Focused task light",
    description: "Demo ERP product",
    priceCents: 18900,
    currency: "EUR",
    imageUrl:
      "https://images.unsplash.com/photo-1507473885765-e6ed557fccc6?auto=format&fit=crop&w=1200&q=80",
    stock: 42,
    active: true,
  },
  {
    erpId: "DEMO-02",
    sku: "PHT-PULSE-HP",
    name: "Pulse Headphones",
    category: "Audio",
    tagline: "Studio clarity",
    description: "Demo ERP product",
    priceCents: 24900,
    currency: "EUR",
    imageUrl:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80",
    stock: 28,
    active: true,
  },
];

const orders = [];

function json(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(payload),
  });
  res.end(payload);
}

function auth(req) {
  const header = req.headers.authorization || "";
  return header === `Bearer ${API_KEY}`;
}

const server = http.createServer(async (req, res) => {
  if (!auth(req)) {
    json(res, 401, { error: "Unauthorized" });
    return;
  }

  const url = new URL(req.url || "/", `http://127.0.0.1:${PORT}`);
  const path = url.pathname.replace(/\/$/, "") || "/";

  if (req.method === "GET" && path === "/health") {
    json(res, 200, { ok: true, provider: "demo-erp", orders: orders.length });
    return;
  }

  if (req.method === "GET" && path === "/products") {
    json(res, 200, products);
    return;
  }

  if (req.method === "GET" && path.startsWith("/stock/")) {
    const sku = decodeURIComponent(path.slice("/stock/".length));
    const product = products.find((p) => p.sku === sku);
    if (!product) {
      json(res, 404, { error: "Unknown SKU" });
      return;
    }
    json(res, 200, { stock: product.stock });
    return;
  }

  if (req.method === "POST" && path === "/orders") {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const body = JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
    const id = `ERP-ORD-${orders.length + 1}`;
    const invoiceId = `ERP-INV-${orders.length + 1}`;
    const invoiceNumber = `RE-${1000 + orders.length + 1}`;
    const record = { id, invoiceId, invoiceNumber, receivedAt: new Date().toISOString(), body };
    orders.push(record);
    console.log(`[demo-erp] order ${body.orderNumber} → ${id} / ${invoiceNumber}`);
    json(res, 201, { id, invoiceId, invoiceNumber });
    return;
  }

  json(res, 404, { error: "Not found" });
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Demo ERP listening on http://127.0.0.1:${PORT}`);
  console.log(`Auth: Bearer ${API_KEY}`);
  console.log("Endpoints: GET /health /products /stock/:sku  POST /orders");
});
