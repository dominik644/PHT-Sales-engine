# Besuchsberichte (Kundenstammdaten) – Patch für pht-mastertool

Änderungen für [pht-mastertool](https://github.com/dominik644/pht-mastertool):

- Abschnitt **Besuchsberichte** in den Kundenstammdaten
- **+ Tag** legt einen neuen Besuchstag an
- Tage sind **aus-/einklappbar**
- **Keywords** bleiben in der eingeklappten Zeile sichtbar
- Speichern über „Stammdaten speichern“ (localStorage)

## Dateien

- `src/types/customerDetails.ts` – Typ `VisitReport`, `createEmptyVisitReport`
- `src/services/customerDetailsStorage.ts` – Laden von `visitReports`
- `src/components/customerPriorities/CustomerStammdatenForm.tsx` – UI

## Anwenden

Im Clone von `pht-mastertool`:

```bash
git apply /pfad/zu/besuchsberichte.patch
# oder die drei Dateien unter src/ manuell übernehmen
```
