# PHT Webshop — Operations Runbook (Produktiv-Härtung)

Dieses Runbook begleitet die Demo bis zum Go-Live mit Business Central.
Es ersetzt **kein** externes Monitoring/Pentest, liefert aber die Basis im Repo.

## 1. Health & Readiness

| Endpoint | Zweck | Erwartung |
|----------|--------|-----------|
| `GET /api/health` | Liveness (Prozess lebt) | `200 { ok: true }` |
| `GET /api/ready` | Readiness (DB + Env) | `200` wenn bereit, sonst `503` |
| `GET /api/admin/ops-health` | Admin-Ops (Auth nötig) | Queues, ERP-Health, Env-Report |

Smoke lokal:

```bash
npm run ops:smoke
# oder
BASE_URL=https://your-host npm run ops:smoke
```

Load-Balancer / Uptime-Monitor: `/api/health` alle 30–60s, Alert bei Nicht-200.
Deploy-Gate: `/api/ready` muss 200 sein, bevor Traffic geschaltet wird.

## 2. Environment (Produktion)

Pflicht:

- `DEMO_MODE=false`
- `SESSION_SECRET` ≥ 32 Zeichen, kein Placeholder
- `ADMIN_PASSWORD` stark (≥ 12, kein Placeholder)
- `DATABASE_URL` (Postgres empfohlen für Produktion; SQLite nur Demo/Staging)

Empfohlen:

- `ERP_PROVIDER=business-central` + BC-Credentials
- `ERP_WEBHOOK_SECRET` für Lager-Webhooks
- HTTPS only (HSTS wird in Production gesetzt)

Prüfung:

```bash
NODE_ENV=production DEMO_MODE=false npm run ops:check-env
```

Boot (`src/instrumentation.ts`):

- `DEMO_MODE=true` (Demo/Preview): unsichere Secrets → **Warnung**, App startet weiter
- `DEMO_MODE=false` + `NODE_ENV=production` (Go-Live): unsichere Env → **Hard-Fail**

## 3. Backup

SQLite (Demo/Staging):

```bash
npm run ops:backup
# schreibt nach ./backups/pht-webshop-<timestamp>.db
```

Postgres (Produktion): `pg_dump` nach Schedule (z. B. täglich), Offsite-Retention ≥ 14 Tage.
Restore-Test mindestens monatlich.

Nach Backup: Dateigröße prüfen, optional Checksum speichern.

## 4. Security-Baseline (im Code)

- Security-Header + CSP via `src/proxy.ts` (HSTS nur Production)
- Rate-Limits auf Login/Register/Checkout/Quotes/Service/Admin-Login
- Session-Cookies: httpOnly, SameSite=lax, secure in Production
- Webhook-Signaturprüfung (ERP Stock)
- Strukturierte Logs mit Redaction sensibler Felder + `x-request-id`
- Preise/Admin-APIs nur mit Auth

## 5. Vor Go-Live (extern, nicht im Repo)

- Lasttest (Checkout + Katalog) mit erwarteter Peak-Last
- Pentest / Vulnerability-Scan (Auth, IDOR, Upload/Download, Admin)
- Log-Drain (Vercel/CloudWatch) + Alert auf 5xx und `/api/ready` ≠ 200
- Juristische Freigabe Impressum/AGB/Datenschutz
- BC Sandbox-Schreibtests mit `BC_ALLOW_WRITE=true`, dann Production mit Write-Gate

## 6. Incident Schnellcheck

1. `/api/health` und `/api/ready`
2. Admin → Ops-Health (ERP, offene Freigaben, pending ERP-Sync)
3. Letzte Deploy-/Env-Änderung
4. Backup-Stand + ggf. Rollback
