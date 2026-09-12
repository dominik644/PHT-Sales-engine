export function roleLabel(role: string): string {
  switch (role) {
    case "PRODUCTION_MANAGER":
      return "Produktionsleiter";
    case "PURCHASING":
      return "Einkauf";
    case "COMPANY_ADMIN":
      return "Firmen-Admin";
    case "REQUESTER":
      return "Anforderer";
    default:
      return role;
  }
}
