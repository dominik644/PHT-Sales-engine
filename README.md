# PHT Sales Engine

Secure webshop / sales engine with ERP sync — Shopify-style checkout flow, server-side stock locks, admin ops, and a pluggable ERP adapter.

## Features

- Storefront (catalog, product, cart, checkout)
- SQLite/Prisma persistence for products, customers, orders
- Secure checkout API (Zod validation, rate limits, stock transactions)
- ERP adapters: `mock` (local demo) and `rest` (generic Bearer API)
- Product pull + order push + signed stock webhooks
- Admin dashboard (`/admin`) with sync + ERP retry
- Security headers / CSP via middleware

## Quick start

```bash
cp .env.example .env
npm install
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

- Shop: http://localhost:3000
- Admin: http://localhost:3000/admin (password from `ADMIN_PASSWORD`)

## Connect your ERP

Set in `.env`:

```env
ERP_PROVIDER=rest
ERP_BASE_URL=https://your-erp-or-middleware.example.com/api
ERP_API_KEY=your-api-key
ERP_WEBHOOK_SECRET=long-random-secret
```

Expected REST endpoints:

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/products` | Product master + stock |
| POST | `/orders` | Create sales order |
| GET | `/stock/:sku` | Stock lookup |

Inbound stock webhook:

`POST /api/erp/webhook/stock`  
Header `x-pht-signature: sha256(secret + "." + rawBody)`  
Body `{ "sku": "PHT-ARC-LAMP", "stock": 40 }`

Supported via thin middleware for systems like Xentral, weclapp, SAP B1, Business Central, etc.

## Security notes

- Admin session: signed httpOnly JWT cookie
- Checkout rate-limited per IP
- Passwords compared via SHA-256 + timing-safe equal
- Orders store hashed IP, never raw card data (payment PSP can be added next)
- Use strong `SESSION_SECRET` / `ADMIN_PASSWORD` in production
- Prefer Postgres (`DATABASE_URL`) for production instead of SQLite

## Scripts

```bash
npm run dev
npm run build && npm start
npm run db:seed
npm run db:migrate
```
