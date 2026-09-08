# PHT Webshop (B2B)

Eigenständiger B2B-Webshop — **kein Modul und keine Abhängigkeit vom PHT Mastertool**.

Eigene App, eigene Datenbank, eigener Admin, eigener Deploy. Es gibt keine gemeinsame
Auth, keine geteilten Packages und keine Runtime-Kopplung zum Mastertool
(`pht-mastertool`). Anbindung nach außen nur über den konfigurierbaren ERP-Adapter
(Auftrag + Rechnung).

## Features

- B2B-Registrierung & Login (Rollen: Produktionsleiter, Einkauf, Firmen-Admin)
- Freigabe-Kette vor ERP-Übergabe
- Rabatte mit `validFrom` / `validTo` (PHT Admin)
- Zahlungsbedingungen (Vorauskasse, 50/50, Netto 30, …)
- Datenblatt-Downloads pro Produkt
- Einheitliches Storefront-Design (Home = Shop Hero)
- Prisma-Persistenz, Stock-Locks, Rate-Limits
- ERP-Adapter `mock` | `rest` | `business-central` (Auftrag **und** Rechnung)
- Admin: Firmen freischalten, Rabatte, ERP-Status, Sync

## Quick start

```bash
cp .env.example .env
npm install
npx prisma migrate reset --force
npm run db:seed
npm run dev
```

- Shop: http://localhost:3000
- Registrierung: `/register` · Login: `/login` · Konto/Freigaben: `/account`
- Admin: `/admin` (Passwort aus `ADMIN_PASSWORD`)

### Demo-Zugänge (nach Seed)

| Rolle | E-Mail | Passwort |
|-------|--------|----------|
| Produktionsleiter | produktion@mueller-fertigung.example | demo-b2b-1234 |
| Einkauf | einkauf@mueller-fertigung.example | demo-b2b-1234 |
| Firmen-Admin | admin@mueller-fertigung.example | demo-b2b-1234 |

Rabattcode: `PHT-B2B-10` (10 %, 90 Tage Laufzeit)

## Ablauf

1. Firma registriert sich → Status `pending`
2. PHT schaltet Firma im Admin auf `active`
3. Nutzer bestellt im Shop → Status `awaiting_production_approval`
4. Produktionsleiter gibt frei → `awaiting_purchasing_approval`
5. Einkauf gibt frei → ERP erstellt **Auftrag + Rechnung**

## ERP-Adapter

Der Webshop spricht ERP nur über Adapter — ohne Mastertool.

| `ERP_PROVIDER` | Zweck |
|----------------|--------|
| `mock` | Eingebauter Demo-ERP (Default, sofort nutzbar) |
| `rest` | Generische REST-API / Middleware / Demo-Server |
| `business-central` / `bc` | Microsoft Dynamics 365 Business Central (OData v2) |

### Demo REST-ERP lokal

```bash
npm run erp:demo
# in .env:
# ERP_PROVIDER=rest
# ERP_BASE_URL=http://127.0.0.1:4010
# ERP_API_KEY=demo-erp-key
```

`POST /orders` muss zurückgeben:

```json
{ "id": "ERP-ORD-1", "invoiceId": "ERP-INV-1", "invoiceNumber": "RE-1001" }
```

### Business Central

In `.env` die `BC_*` Werte setzen und `ERP_PROVIDER=business-central`.
Schreiben (Auftrag/Rechnung) nur mit `BC_ALLOW_WRITE=true` — idealerweise gegen eine **Sandbox**.
Firmen brauchen `erpCustomerId` (= BC Customer Number) oder `BC_DEFAULT_CUSTOMER_NUMBER`.
