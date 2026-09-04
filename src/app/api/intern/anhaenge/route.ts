import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySessionApi } from '@/lib/services/auth';
import { speichereFoto } from '@/lib/services/storage';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const session = await verifySessionApi();
  if (!session) {
    return NextResponse.json({ ok: false, fehler: 'Nicht autorisiert.' }, { status: 401 });
  }

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
