-- Live gaps: SupportTicket + Quote offer/accept fields
CREATE TABLE IF NOT EXISTS "SupportTicket" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "number" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "requesterId" TEXT,
    "orderId" TEXT,
    "type" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "adminNote" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SupportTicket_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SupportTicket_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "SupportTicket_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "SupportTicket_number_key" ON "SupportTicket"("number");
CREATE INDEX IF NOT EXISTS "SupportTicket_companyId_idx" ON "SupportTicket"("companyId");
CREATE INDEX IF NOT EXISTS "SupportTicket_status_idx" ON "SupportTicket"("status");

-- Quote offer/accept columns (SQLite: add if missing handled by db push; documented here)
-- ALTER TABLE "QuoteRequest" ADD COLUMN "offeredTotalCents" INTEGER;
-- ALTER TABLE "QuoteRequest" ADD COLUMN "offeredNote" TEXT NOT NULL DEFAULT '';
-- ALTER TABLE "QuoteRequest" ADD COLUMN "offeredAt" DATETIME;
-- ALTER TABLE "QuoteRequest" ADD COLUMN "acceptedAt" DATETIME;
-- ALTER TABLE "QuoteRequest" ADD COLUMN "acceptedOrderId" TEXT;
-- ALTER TABLE "QuoteRequestItem" ADD COLUMN "unitCents" INTEGER;
