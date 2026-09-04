import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { getDb } from '@/db/client';
import { anfrage as anfrageTabelle, anhang as anhangTabelle } from '@/db/schema';
import { verifySessionApi } from '@/lib/services/auth';
import { getStorage } from '@/lib/services/storage';

export const runtime = 'nodejs';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; anhangId: string }> },
) {
  const session = await verifySessionApi();
  if (!session) {
    return new NextResponse('Nicht autorisiert.', { status: 401 });
  }

  const { id: anfrageId, anhangId } = await params;
  const db = await getDb();

  const anfragen = await db.select().from(anfrageTabelle).where(eq(anfrageTabelle.id, anfrageId)).limit(1);
  const v = anfragen[0];
  if (!v) {
    return new NextResponse('Anfrage nicht gefunden.', { status: 404 });
  }

  if (session.rolle === 'bauleiter' && v.bearbeiterId && v.bearbeiterId !== session.benutzerId) {
    return new NextResponse('Keine Berechtigung.', { status: 403 });
  }

  const anhaenge = await db.select().from(anhangTabelle)
    .where(and(eq(anhangTabelle.id, anhangId), eq(anhangTabelle.anfrageId, anfrageId)))
    .limit(1);
  const a = anhaenge[0];
  if (!a) {
    return new NextResponse('Anhang nicht gefunden.', { status: 404 });
  }

  const storage = getStorage();
  const datei = await storage.get(a.blobPfad);
  if (!datei) {
    return new NextResponse('Datei in der Ablage nicht gefunden.', { status: 404 });
  }

  const encodedFilename = encodeURIComponent(a.dateiname).replace(/['()]/g, escape);
  const istPdf = a.mime === 'application/pdf';
  const disposition = istPdf
    ? `attachment; filename="${a.dateiname.replace(/"/g, '')}"; filename*=UTF-8''${encodedFilename}`
    : `inline; filename="${a.dateiname.replace(/"/g, '')}"; filename*=UTF-8''${encodedFilename}`;

  return new NextResponse(datei.daten as unknown as BodyInit, {
    status: 200,
    headers: {
      'Content-Type': a.mime || 'application/octet-stream',
      'Content-Disposition': disposition,
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
