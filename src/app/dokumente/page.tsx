import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/b2b-auth";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "Dokumente",
};

export const dynamic = "force-dynamic";

export default async function DokumentePage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login?next=/dokumente");
  }

  const documents = await prisma.customerDocument.findMany({
    where: { companyId: user.companyId },
    orderBy: { createdAt: "desc" },
  });

  const typeLabel: Record<string, string> = {
    invoice: "Rechnung",
    delivery: "Lieferschein",
    service: "Service",
    drawing: "Zeichnung",
    ce: "CE / Konformität",
    other: "Sonstiges",
  };

  return (
    <div className="section">
      <div className="section__head">
        <div>
          <p className="eyebrow">Mein Konto</p>
          <h1>Dokumente</h1>
          <p className="muted">
            Kundendokumente für {user.companyName} — Rechnungen, Verträge und
            weitere Unterlagen.
          </p>
        </div>
        <Link href="/account" className="btn btn--ink">
          Zum Konto
        </Link>
      </div>

      {documents.length === 0 ? (
        <div className="empty-state">
          <p>Noch keine Dokumente hinterlegt.</p>
        </div>
      ) : (
        <div className="panel store-panel store-surface">
          <div className="admin-table">
            {documents.map((doc) => (
              <div key={doc.id} className="admin-row">
                <div>
                  <strong>{doc.title}</strong>
                  <p className="muted">
                    {typeLabel[doc.type] ?? doc.type} ·{" "}
                    {new Date(doc.createdAt).toLocaleDateString("de-DE")}
                  </p>
                </div>
                <a
                  href={`/${doc.filePath}`}
                  className="btn btn--primary btn--sm"
                  target="_blank"
                  rel="noreferrer"
                >
                  Öffnen
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
