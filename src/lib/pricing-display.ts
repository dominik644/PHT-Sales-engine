import { formatMoney } from "@/lib/money";

/** Netto/Brutto-Helfer für B2B-Anzeige (Standard = Netto). */
export function netCents(unitCents: number): number {
  return unitCents;
}

export function vatCents(netUnitCents: number, vatRateBps = 1900): number {
  return Math.round((netUnitCents * vatRateBps) / 10000);
}

export function grossCents(netUnitCents: number, vatRateBps = 1900): number {
  return netUnitCents + vatCents(netUnitCents, vatRateBps);
}

export function formatNet(cents: number, currency = "EUR"): string {
  return `${formatMoney(cents, currency)} netto`;
}

export function formatGrossHint(cents: number, vatRateBps = 1900, currency = "EUR"): string {
  return `${formatMoney(grossCents(cents, vatRateBps), currency)} brutto inkl. MwSt.`;
}

export function formatDelivery(daysIn: number, daysOut: number, stock: number): string {
  if (stock > 0) {
    return `Lieferzeit ca. ${daysIn} Werktage (auf Lager)`;
  }
  return `Lieferzeit ca. ${daysOut} Werktage (Nachlieferung)`;
}
