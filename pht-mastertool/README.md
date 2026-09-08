# PHT Mastertool – fertige Features (zum Übernehmen)

Branch lokal: `cursor/mastertool-features-089f` (Commits: Besuchsberichte + Plaud Note)

## 1. Besuchsberichte (Kundenstammdaten)

- Abschnitt **Besuchsberichte** in den Stammdaten
- **+ Tag** → neuer Besuchstag
- Aus-/einklappbar; **Keywords** bleiben eingeklappt sichtbar
- Speichern mit Stammdaten (localStorage)

## 2. Plaud Note

- Webhook `POST /api/plaud` (Zapier → Bearer `PLAUD_WEBHOOK_SECRET`)
- Inbox unter `/plaud`, Nav-Eintrag, Settings-Hinweis
- Action Items → Todos

### Vercel

Secret setzen: `PLAUD_WEBHOOK_SECRET`

### Anwenden im Repo `pht-mastertool`

```bash
git checkout -b cursor/mastertool-features-089f
git apply /pfad/zu/mastertool-features.patch
# oder Dateien unter diesem Ordner 1:1 nach pht-mastertool kopieren
```

> Cloud Agent hat aktuell keinen Write-Zugriff auf `dominik644/pht-mastertool`.
> Bitte Cursor GitHub App + Environment um dieses Repo ergänzen.
