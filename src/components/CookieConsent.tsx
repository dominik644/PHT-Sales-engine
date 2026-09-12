"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const STORAGE_KEY = "pht-cookie-consent-v1";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (!stored) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  function accept() {
    try {
      window.localStorage.setItem(STORAGE_KEY, "accepted");
    } catch {
      // ignore
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      className="store-surface"
      role="dialog"
      aria-live="polite"
      aria-label="Cookie-Hinweis"
      style={{
        position: "fixed",
        left: "1rem",
        right: "1rem",
        bottom: "1rem",
        zIndex: 80,
        maxWidth: 560,
        margin: "0 auto",
        padding: "1.1rem 1.25rem",
        boxShadow: "0 12px 40px rgba(4, 4, 4, 0.18)",
        background: "var(--paper, #F1F3F5)",
        border: "1px solid rgba(4,4,4,0.08)",
      }}
    >
      <p className="eyebrow">Cookies</p>
      <p style={{ margin: "0.35rem 0 0.85rem" }}>
        Wir nutzen technisch notwendige Cookies für Login und Warenkorb. Details
        in der{" "}
        <Link href="/datenschutz" className="text-btn">
          Datenschutzerklärung
        </Link>
        . Vor dem Live-Betrieb rechtlich prüfen lassen.
      </p>
      <button type="button" className="btn btn--primary btn--sm" onClick={accept}>
        Verstanden
      </button>
    </div>
  );
}
