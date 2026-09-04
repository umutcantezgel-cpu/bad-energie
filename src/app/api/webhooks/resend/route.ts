import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Webhook } from 'svix';
import { eq } from 'drizzle-orm';
import { getDb } from '@/db/client';
import { versandauftrag } from '@/db/schema';
import { schreibeEreignis } from '@/lib/services/statusmaschine';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  const rawBody = await request.text();

  let event: { type: string; data: { email_id?: string; id?: string; from?: string; to?: string[]; subject?: string } };

  if (secret) {
    const svixId = request.headers.get('svix-id');
    const svixTimestamp = request.headers.get('svix-timestamp');
    const svixSignature = request.headers.get('svix-signature');

    if (!svixId || !svixTimestamp || !svixSignature) {
      return NextResponse.json({ fehler: 'Svix-Header fehlen.' }, { status: 400 });
    }

    try {
      const wh = new Webhook(secret);
      event = wh.verify(rawBody, {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': svixSignature,
      }) as unknown as typeof event;
    } catch {
      return NextResponse.json({ fehler: 'Ungültige Signatur.' }, { status: 400 });
    }
  } else {
    // Falls in der lokalen Entwicklung noch kein Webhook-Secret hinterlegt ist
    try {
      event = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ fehler: 'Ungültiges JSON.' }, { status: 400 });
    }
  }

  const resendId = event.data?.email_id || event.data?.id;
  if (!resendId) {
    return NextResponse.json({ received: true });
  }

  const db = await getDb();
  const auftraege = await db.select().from(versandauftrag).where(eq(versandauftrag.resendId, resendId)).limit(1);
  const auftrag = auftraege[0];

  if (!auftrag) {
    return NextResponse.json({ received: true });
  }

  const jetzt = new Date();

  if (event.type === 'email.delivered') {
    await db.update(versandauftrag).set({ zugestelltAm: jetzt }).where(eq(versandauftrag.id, auftrag.id));
    await schreibeEreignis({
      anfrageId: auftrag.anfrageId,
      typ: 'mail:zugestellt',
      payload: { auftragId: auftrag.id, art: auftrag.art, resendId },
    });
  } else if (event.type === 'email.bounced' || event.type === 'email.complained') {
    await db.update(versandauftrag).set({
      status: 'fehlgeschlagen',
      fehler: `Zustellung fehlgeschlagen (${event.type}).`,
    }).where(eq(versandauftrag.id, auftrag.id));
    await schreibeEreignis({
      anfrageId: auftrag.anfrageId,
      typ: 'mail:fehlgeschlagen',
      payload: { auftragId: auftrag.id, art: auftrag.art, resendId, typ: event.type },
    });
  }

  return NextResponse.json({ received: true });
}
