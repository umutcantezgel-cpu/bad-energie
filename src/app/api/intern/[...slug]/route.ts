import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { getDb } from '@/db/client';
import { anfrage as anfrageTabelle, anhang as anhangTabelle } from '@/db/schema';
import { anmelden as authAnmelden, verifySessionApi } from '@/lib/services/auth';
import { getStorage, speichereFoto } from '@/lib/services/storage';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> },
): Promise<NextResponse> {
  const { slug } = await params;

  // Pfad 0: /api/intern/anmelden (ohne vorherige Sitzung)
  if (slug.length === 1 && slug[0] === 'anmelden') {
    try {
      const body = await request.json();
      const ergebnis = await authAnmelden({
        email: String(body.email ?? ''),
        pin: String(body.pin ?? ''),
      });
      return NextResponse.json(ergebnis);
    } catch {
      return NextResponse.json({ ok: false, fehler: 'Ungültige Anfrage.' }, { status: 400 });
    }
  }

  const session = await verifySessionApi();
  if (!session) {
    return NextResponse.json({ ok: false, fehler: 'Nicht autorisiert.' }, { status: 401 });
  }

  // Pfad 1: /api/intern/uploads/token
  if (slug.length === 2 && slug[0] === 'uploads' && slug[1] === 'token') {
    const body = (await request.json()) as HandleUploadBody;
    try {
      const jsonResponse = await handleUpload({
        body,
        request,
        onBeforeGenerateToken: async (pathname) => {
          return {
            allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'application/pdf'],
            maximumSizeInBytes: 15 * 1024 * 1024,
            tokenPayload: JSON.stringify({ benutzerId: session.benutzerId, pathname }),
          };
        },
        onUploadCompleted: async () => {},
      });
      return NextResponse.json(jsonResponse);
    } catch (error) {
      return NextResponse.json(
        { fehler: (error as Error).message },
        { status: 400 },
      );
    }
  }

  // Pfad 2: /api/intern/anhaenge
  if (slug.length === 1 && slug[0] === 'anhaenge') {
    try {
      const formData = await request.formData();
      const anfrageId = formData.get('anfrageId');
      const datei = formData.get('datei');
      const beschreibung = (formData.get('beschreibung') as string) || '';
      const art = (formData.get('art') as 'foto' | 'foto_annotiert') || 'foto';

      if (!anfrageId || typeof anfrageId !== 'string') {
        return NextResponse.json({ ok: false, fehler: 'anfrageId fehlt.' }, { status: 400 });
      }

      if (!datei || !(datei instanceof File)) {
        return NextResponse.json({ ok: false, fehler: 'Datei fehlt oder ist ungültig.' }, { status: 400 });
      }

      if (datei.size > 4 * 1024 * 1024) {
        return NextResponse.json({ ok: false, fehler: 'Datei überschreitet das Limit von 4 MB.' }, { status: 400 });
      }

      const arrayBuffer = await datei.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const ergebnis = await speichereFoto(anfrageId, buffer, datei.name, beschreibung, art);
      return NextResponse.json({ ok: true, anhang: ergebnis });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Fehler beim Hochladen.';
      return NextResponse.json({ ok: false, fehler: msg }, { status: 500 });
    }
  }

  return NextResponse.json({ fehler: 'Endpunkt nicht gefunden.' }, { status: 404 });
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> },
): Promise<NextResponse> {
  const { slug } = await params;
  const session = await verifySessionApi();
  if (!session) {
    return new NextResponse('Nicht autorisiert.', { status: 401 });
  }

  // Pfad: /api/intern/anfragen/[id]/anhaenge/[anhangId]
  if (slug.length === 4 && slug[0] === 'anfragen' && slug[2] === 'anhaenge') {
    const anfrageId = slug[1];
    const anhangId = slug[3];
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

  return new NextResponse('Endpunkt nicht gefunden.', { status: 404 });
}
