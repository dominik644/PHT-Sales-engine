"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminActions({ retryOrderId }: { retryOrderId?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function syncProducts() {
    setBusy(true);
    setMessage(null);
    const res = await fetch("/api/admin/sync-products", { method: "POST" });
    const data = (await res.json()) as { error?: string; upserted?: number };
    setBusy(false);
    if (!res.ok) {
      setMessage(data.error ?? "Sync failed");
      return;
    }
    setMessage(`Synced ${data.upserted ?? 0} products`);
    router.refresh();
  }

  async function logout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.push("/admin/login");
    router.refresh();
  }

  async function retryErp() {
    if (!retryOrderId) return;
    setBusy(true);
    const res = await fetch(`/api/admin/orders/${retryOrderId}/retry-erp`, {
      method: "POST",
    });
    setBusy(false);
    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      setMessage(data?.error ?? "Retry failed");
      return;
    }
    setMessage("ERP push succeeded");
    router.refresh();
  }

  if (retryOrderId) {
    return (
      <button
        type="button"
        className="text-btn"
        disabled={busy}
        onClick={retryErp}
      >
        Retry ERP
      </button>
    );
  }

  return (
    <div className="admin-actions">
      <button
        type="button"
        className="btn btn--primary"
        disabled={busy}
        onClick={syncProducts}
      >
        Sync products from ERP
      </button>
      <button type="button" className="btn btn--ink" onClick={logout}>
        Log out
      </button>
      {message ? <p className="muted">{message}</p> : null}
    </div>
  );
}
