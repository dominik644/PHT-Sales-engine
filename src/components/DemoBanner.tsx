import Link from "next/link";

/** Visible only while DEMO_MODE is enabled (default in .env.example). */
export function DemoBanner() {
  const enabled = (process.env.DEMO_MODE ?? "true").toLowerCase() !== "false";
  if (!enabled) return null;

  return (
    <div className="demo-banner" role="status">
      <div className="demo-banner__inner">
        <strong>Demo-Version</strong>
        <span>Struktur & Abläufe testen — noch nicht Live.</span>
        <Link href="/demo">Demo-Leitfaden</Link>
      </div>
    </div>
  );
}
