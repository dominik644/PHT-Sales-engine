import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * Forces a file download for a product datasheet (PDF).
 * GET /api/datasheets/[id]/download
 */
export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const sheet = await prisma.productDatasheet.findUnique({
    where: { id },
    include: { product: { select: { active: true, name: true, sku: true } } },
  });

  if (!sheet || !sheet.product.active) {
    return NextResponse.json({ error: "Datenblatt nicht gefunden" }, { status: 404 });
  }

  const relative = sheet.filePath.replace(/^\/+/, "");
  const absolute = path.join(process.cwd(), "public", relative);

  let bytes: Buffer;
  try {
    bytes = await readFile(absolute);
  } catch {
    return NextResponse.json(
      { error: "Datei fehlt auf dem Server" },
      { status: 404 },
    );
  }

  const safeName = sheet.fileName.replace(/[^\w.\-]+/g, "_");
  return new NextResponse(new Uint8Array(bytes), {
    status: 200,
    headers: {
      "Content-Type": sheet.mimeType || "application/pdf",
      "Content-Disposition": `attachment; filename="${safeName}"`,
      "Cache-Control": "private, max-age=3600",
      "Content-Length": String(bytes.byteLength),
    },
  });
}
