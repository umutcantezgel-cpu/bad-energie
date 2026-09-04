import { createHash, timingSafeEqual } from 'node:crypto';
import type { NextRequest } from 'next/server';
import { aktuelleSession } from '@/lib/services/auth';
import { bereinigungJob } from '@/lib/jobs/bereinigung';
import { eingangJob } from '@/lib/jobs/eingang';
import { speicherfristJob } from '@/lib/jobs/speicherfrist';
import { versandJob } from '@/lib/jobs/versand';
import { wiedervorlageJob } from '@/lib/jobs/wiedervorlage';
import { istJobName, mitJobSperre, type JobErgebnis, type JobName } from '@/lib/jobs/runner';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const ARBEIT: Record<JobName, (jetzt: Date) => Promise<JobErgebnis>> = {
  versand: versandJob,
  wiedervorlage: wiedervorlageJob,
  eingang: eingangJob,
  speicherfrist: speicherfristJob,
  bereinigung: bereinigungJob,
};

function gleich(a: string, b: string): boolean {
  const links = createHash('sha256').update(a).digest();
  const rechts = createHash('sha256').update(b).digest();
  return timingSafeEqual(links, rechts);
}

/** Cron-Aufruf über Bearer-Token oder manueller Lauf durch die Rolle chef. */
async function darfLaufen(request: NextRequest): Promise<'cron' | 'manuell' | null> {
  const geheim = process.env.CRON_SECRET;
  const kopf = request.headers.get('authorization') ?? '';
  if (geheim && kopf.startsWith('Bearer ') && gleich(kopf.slice(7), geheim)) return 'cron';
  const session = await aktuelleSession();
  if (session?.rolle === 'chef') return 'manuell';
  return null;
}

async function starten(request: NextRequest, ctx: { params: Promise<{ job: string }> }): Promise<Response> {
  const { job } = await ctx.params;
  if (!istJobName(job)) return Response.json({ ok: false, fehler: 'Unbekannter Job.' }, { status: 404 });
  const ausloeser = await darfLaufen(request);
  if (!ausloeser) return Response.json({ ok: false, fehler: 'Nicht berechtigt.' }, { status: 401 });

  const ergebnis = await mitJobSperre(job, ausloeser, new Date(), () => ARBEIT[job](new Date()));
  if (!ergebnis.ok && ergebnis.grund === 'gesperrt') {
    return Response.json({ ok: false, job, slot: ergebnis.slot, fehler: 'Der Lauf für diesen Slot läuft bereits.' }, { status: 409 });
  }
  if (!ergebnis.ok) {
    return Response.json({ ok: false, job, slot: ergebnis.slot, fehler: ergebnis.fehler ?? 'Fehler im Lauf.' }, { status: 500 });
  }
  return Response.json(ergebnis, { status: 200, headers: { 'Cache-Control': 'no-store' } });
}

export async function GET(request: NextRequest, ctx: { params: Promise<{ job: string }> }): Promise<Response> {
  return starten(request, ctx);
}

export async function POST(request: NextRequest, ctx: { params: Promise<{ job: string }> }): Promise<Response> {
  return starten(request, ctx);
}
