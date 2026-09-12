import { ROLES, type UserRole } from "@/lib/b2b-auth";

/** Verbindliche Bestellungen: nicht für reine Anforderer. */
export function canPlaceOrders(role: string): boolean {
  return role !== ROLES.REQUESTER;
}

export function canManageCompanyUsers(role: string): boolean {
  return role === ROLES.COMPANY_ADMIN;
}

export function isPurchasingRole(role: string): boolean {
  return role === ROLES.PURCHASING || role === ROLES.COMPANY_ADMIN;
}

export function assertOrderRole(role: UserRole | string): void {
  if (!canPlaceOrders(role)) {
    throw new Error("REQUESTER_CANNOT_ORDER");
  }
}
