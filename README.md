# PHT Hygiene Webshop — DEMO

**Status: Demo-Version.** Erst Struktur und Abläufe absichern, danach Live.

Eigenständig — **kein** Mastertool. Eigene App, DB, Admin, Deploy.
ERP aktuell: **Mock** (kein echtes Business Central nötig).

## Feste Demo-URL (wie Mastertool)

Ziel wie `https://pht-mastertool.vercel.app`:

**`https://pht-webshop.vercel.app`**

Einmalig in Vercel (gleiches Konto/Team wie Mastertool):

1. [vercel.com/new](https://vercel.com/new) → Repo `dominik644/PHT-Sales-engine` importieren
2. Project Name: `pht-webshop`
3. Environment Variables setzen:

| Name | Wert |
|------|------|
| `DEMO_MODE` | `true` |
| `DATABASE_URL` | `file:/tmp/pht-webshop-demo.db` |
| `ADMIN_PASSWORD` | (Demo-Admin-Passwort) |
| `SESSION_SECRET` | (≥32 Zeichen) |
| `ERP_PROVIDER` | `mock` |

4. Production Branch: `main` oder diese Demo-Branch — danach bleibt die URL gleich, jeder Push aktualisiert sie.


## Shop-Struktur (Demo)

```
Start (/)
├── Sortiment (/shop)          Suche · Kategorien · Sortierung
├── Artikel (/product/[slug])  Menge · Warenkorb · Datenblatt
├── Warenkorb (/warenkorb)     Positionen prüfen
├── Kasse (/checkout)          Adresse · Zahlungsbedingung · Rabatt
└── Mein Konto (/account)      Freigaben · Aufträge

Admin (/admin)                 nur intern (nicht in Kunden-Navigation)
ERP                            mock | rest | business-central
```

## Demo starten

```bash
cp .env.example .env
npm install
npx prisma db push
npm run db:seed
npm run dev
```

Shop: http://localhost:3000

### Demo-Logins (nach Seed)

| Rolle | E-Mail | Passwort |
|-------|--------|----------|
| Produktionsleiter | produktion@mueller-fertigung.example | demo-b2b-1234 |
| Einkauf | einkauf@mueller-fertigung.example | demo-b2b-1234 |
| Firmen-Admin | admin@mueller-fertigung.example | demo-b2b-1234 |

- Rabatt: `PHT-B2B-10`
- Admin: `/admin` · Passwort aus `ADMIN_PASSWORD`

## Demo-Walkthrough (Struktur prüfen)

1. Startseite → Kategorie wählen oder Suche
2. Artikel öffnen → Menge → **In den Warenkorb**
3. Warenkorb → **Zur Kasse**
4. Als B2B anmelden → Adresse + Zahlungsbedingung → absenden
5. Als Produktionsleiter freigeben (`/account`)
6. Als Einkauf freigeben → Mock-ERP legt Auftrag + Rechnung an
7. Auftrag in Mein Konto prüfen

## Was Demo bewusst noch nicht ist

- Kein produktiver BC-Write
- Demo-Artikel/Bilder (Platzhalter bis echter Katalog)
- Vercel-Demo nutzt SQLite in `/tmp` (Seed aus `data/demo.db`) — Daten können nach Cold-Start zurückgesetzt werden

## Live später (erst wenn Demo passt)

1. Echte Produkt-/Preisdaten
2. Persistente DB (Postgres/Turso) statt `/tmp`-SQLite
3. `ERP_PROVIDER=business-central` + Sandbox-Test
4. `DEMO_MODE=false`
