# In pht-mastertool übernehmen (lokal, 1 Minute)

Im Terminal auf deinem Rechner (dort hast du Schreibrechte):

```bash
cd ~/Pfad/zu/pht-mastertool   # dein lokaler Clone
git fetch origin
git checkout -b cursor/mastertool-features-089f origin/main
git apply /Pfad/zu/PHT-Sales-engine/pht-mastertool/mastertool-features.patch
# alternativ Patch aus dem PR-Download:
# curl -L -o mastertool-features.patch \
#   https://raw.githubusercontent.com/dominik644/PHT-Sales-engine/cursor/besuchsberichte-stammdaten-089f/pht-mastertool/mastertool-features.patch
# git apply mastertool-features.patch

git add -A
git commit -m "feat: Besuchsberichte + Plaud Note"
git push -u origin cursor/mastertool-features-089f
gh pr create --base main --title "Besuchsberichte + Plaud Note" --body "Übernahme aus Cloud-Agent: Besuchsberichte in Stammdaten und Plaud-Inbox."
```

Danach in Vercel: Secret \`PLAUD_WEBHOOK_SECRET\` setzen.

Enthalten:
- Besuchsberichte (+ Tag, einklappbar, Keywords)
- Plaud Note (Webhook /api/plaud, Inbox, Nav, Settings)
