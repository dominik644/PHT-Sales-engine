import { MockErpAdapter } from "./mock";
import { RestErpAdapter } from "./rest";
import type { ErpAdapter } from "./types";

export function getErpAdapter(): ErpAdapter {
  const provider = (process.env.ERP_PROVIDER ?? "mock").toLowerCase();

  if (provider === "rest") {
    return new RestErpAdapter(
      process.env.ERP_BASE_URL ?? "",
      process.env.ERP_API_KEY ?? "",
    );
  }

  return new MockErpAdapter();
}

export type { ErpAdapter, ErpProduct, ErpOrderPayload } from "./types";
