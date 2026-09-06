import { NextResponse, after } from 'next/server';
import type { NextRequest } from 'next/server';
import { createHash, randomUUID, timingSafeEqual } from 'node:crypto';
import { and, eq, gte, inArray, isNull } from 'drizzle-orm';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { Webhook } from 'svix';
import { getDb } from '@/db/client';
import {
  anfrage as anfrageTabelle,
  anhang as anhangTabelle,
  benutzer,
  dokument,
  einstellung,
  foerderRegel,
  kunde as kundeTabelle,
  loeschprotokoll,
  richtpreis,
  terminfenster,
  terminfensterReservierung,
  versandauftrag,
  vorbehalt,
} from '@/db/schema';
import {
  abmelden as authAbmelden,
  aktuelleSession,
  anmelden as authAnmelden,
  darfSehen,
  deaktiviereBenutzer,
  verifySessionApi,
} from '@/lib/services/auth';
import {
  csvKopfzeile,
  csvZeile,
  fehlendeAngaben,
  ladeVorgang,
  loeseReservierungen,
  rechneVorgang,
  tokenHash,
} from '@/lib/services/dokument-eingabe';
import {
  freigeben as freigebenService,
  ladeEntwuerfe as ladeEntwuerfeService,
  ladeInternAnfrage,
  ladeTerminfenster as ladeTerminfensterService,
  legeAusKundenAnfrage,
  speichereInternAnfrage,
  stornieren as stornierenService,
  triageFuerAnfrage,
  dokumentDateiname,
  ZugriffFehler,
} from '@/lib/services/estimates';
import {
  ladeFoerderRegeln,
  ladeKalkulationsdaten as ladeKalkulationsdatenService,
  ladeMatrix,
} from '@/lib/services/kalkulationsdaten';
import { pinGueltig, pinHashen } from '@/lib/services/pin';
import { clientIp, ipHash, pruefeLimit } from '@/lib/services/ratelimit';
import { schreibeEreignis } from '@/lib/services/statusmaschine';
import { ausDataUrl, getStorage, speichereFoto, speichereSkizze } from '@/lib/services/storage';
import { euro, positionAusBaustein } from '@/lib/services/calculation';
import {
  sendeBueroHinweis,
  sendeEingangsbestaetigung,
  sendeTerminMeldung,
  stelleAuftragBereit,
} from '@/lib/services/versand';
import { bereinigungJob } from '@/lib/jobs/bereinigung';
import { eingangJob } from '@/lib/jobs/eingang';
import { speicherfristJob } from '@/lib/jobs/speicherfrist';
import { versandJob } from '@/lib/jobs/versand';
import { wiedervorlageJob } from '@/lib/jobs/wiedervorlage';
import { istJobName, mitJobSperre, type JobErgebnis, type JobName } from '@/lib/jobs/runner';
import {
  estimateRequestSchema,
  internAnfrageSchema,
  type AnfrageStatus,
  type FoerderRegeln,
  type Rolle,
  type SessionInfo,
} from '@/lib/types';
import { geraeteVorschlag,
  geraetAusBaureihe, heizlastSchaetzen, leeresGebaeude, speicherVorschlag } from '@/lib/services/heizlast';
import { pruefeHerkunft } from '@/lib/services/herkunft';
import {
  benutzerNeuSchema, benutzerPinSchema, benutzerToggleSchema, dispatchBefehlSchema, einstellungenSchema, foerderRegelnSchema, freigebenSchema,
  matrixDemoSchema, matrixZeileSchema, statusWechselSchema, stornierenSchema, terminfensterLoeschenSchema, terminfensterNeuSchema,
  vorbehaltNeuSchema,
} from '@/lib/types';
import { demoPreiseSetzen } from '@/db/seed';
import type { VersandArt } from '@/lib/types';
import { z } from 'zod';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 120;

// ---------------------------------------------------------------------------
// Jobs Hilfsfunktionen
// ---------------------------------------------------------------------------

const JOB_ARBEIT: Record<JobName, (jetzt: Date) => Promise<JobErgebnis>> = {
  versand: versandJob,
  wiedervorlage: wiedervorlageJob,
  eingang: eingangJob,
  speicherfrist: speicherfristJob,
  bereinigung: bereinigungJob,
};

function timingGleich(a: string, b: string): boolean {
  const links = createHash('sha256').update(a).digest();
  const rechts = createHash('sha256').update(b).digest();
  return timingSafeEqual(links, rechts);
}

async function darfJobLaufen(request: NextRequest): Promise<'cron' | 'manuell' | null> {
  const geheim = process.env.CRON_SECRET;
  const kopf = request.headers.get('authorization') ?? '';
  if (geheim && kopf.startsWith('Bearer ') && timingGleich(kopf.slice(7), geheim)) return 'cron';
  const session = await aktuelleSession();
  if (session?.rolle === 'chef') return 'manuell';
  return null;
}

async function starteJob(request: NextRequest, job: string): Promise<Response> {
  if (!istJobName(job)) return Response.json({ ok: false, fehler: 'Unbekannter Job.' }, { status: 404 });
  const ausloeser = await darfJobLaufen(request);
  if (!ausloeser) return Response.json({ ok: false, fehler: 'Nicht berechtigt.' }, { status: 401 });

  const ergebnis = await mitJobSperre(job, ausloeser, new Date(), () => JOB_ARBEIT[job](new Date()));
  if (!ergebnis.ok && ergebnis.grund === 'gesperrt') {
    return Response.json({ ok: false, job, slot: ergebnis.slot, fehler: 'Der Lauf für diesen Slot läuft bereits.' }, { status: 409 });
  }
  if (!ergebnis.ok) {
    return Response.json({ ok: false, job, slot: ergebnis.slot, fehler: ergebnis.fehler ?? 'Fehler im Lauf.' }, { status: 500 });
  }
  return Response.json(ergebnis, { status: 200, headers: { 'Cache-Control': 'no-store' } });
}

// ---------------------------------------------------------------------------
// Gemeinsame Helfer: Herkunft und Body-Validierung
// ---------------------------------------------------------------------------

/** 403, wenn die Anfrage nicht aus dem eigenen Kontext stammt (Origin / Sec-Fetch-Site). */
function herkunftAntwort(request: NextRequest): Response | null {
  const h = pruefeHerkunft(request);
  if (h.ok) return null;
  return NextResponse.json({ ok: false, fehler: h.grund }, { status: 403 });
}

/** Body gegen ein Zod-Schema prüfen; 400 mit Feldliste bei Fehlern. */
async function leseBody<S extends z.ZodType>(request: NextRequest, schema: S): Promise<{ ok: true; daten: z.infer<S> } | { ok: false; antwort: Response }> {
  let roh: unknown;
  try {
    roh = await request.json();
  } catch {
    return { ok: false, antwort: NextResponse.json({ ok: false, fehler: 'Ungültiges JSON-Format.' }, { status: 400 }) };
  }
  const parse = schema.safeParse(roh);
  if (!parse.success) {
    const details = parse.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ');
    return { ok: false, antwort: NextResponse.json({ ok: false, fehler: `Validierungsfehler: ${details}` }, { status: 400 }) };
  }
  return { ok: true, daten: parse.data as z.infer<S> };
}

/**
 * Lädt die Anfragezeile und prüft die Leseberechtigung der Sitzung (Rollenregel 3.3).
 * Verglichen wird über `bearbeiterId`, nie über den Anzeigenamen: Namen sind nicht eindeutig
 * und lassen sich in der Benutzerverwaltung ändern.
 */
async function anfrageFuerSession(
  anfrageId: string,
  session: SessionInfo,
): Promise<{ ok: true; anfrage: typeof anfrageTabelle.$inferSelect } | { ok: false; antwort: Response }> {
  const db = await getDb();
  const zeilen = await db.select().from(anfrageTabelle).where(eq(anfrageTabelle.id, anfrageId)).limit(1);
  const a = zeilen[0];
  if (!a) return { ok: false, antwort: NextResponse.json({ ok: false, fehler: 'Anfrage nicht gefunden.' }, { status: 404 }) };
  if (!darfSehen(session, { bearbeiterId: a.bearbeiterId })) {
    return { ok: false, antwort: NextResponse.json({ ok: false, fehler: 'Keine Berechtigung für diesen Vorgang.' }, { status: 403 }) };
  }
  return { ok: true, anfrage: a };
}

/** Wie `anfrageFuerSession`, aber mit Klartext-Antwort für die Datei-Endpunkte. */
async function anfrageFuerDownload(
  anfrageId: string,
  session: SessionInfo,
): Promise<{ ok: true; anfrage: typeof anfrageTabelle.$inferSelect } | { ok: false; antwort: Response }> {
  const treffer = await anfrageFuerSession(anfrageId, session);
  if (treffer.ok) return treffer;
  const status = treffer.antwort.status;
  return { ok: false, antwort: new NextResponse(status === 404 ? 'Anfrage nicht gefunden.' : 'Keine Berechtigung.', { status }) };
}

/** Kurzlabel des Triage-Vorschlags für die Rückmeldung im Dispatch. */
const TRIAGE_KURZ: Record<'kostenschaetzung' | 'terminmail' | 'verwerfen', string> = {
  kostenschaetzung: 'Kostenschätzung erstellen',
  terminmail: 'Nur Terminmail',
  verwerfen: 'Verwerfen',
};

// Unter der Laufzeitgrenze von 120 s bleibt Luft für Antwort und Nachlauf; 90 s ließen keine.
const VERSAND_BUDGET_MS = 55_000;
/** Zeitfenster für das Rennen mit dem Versand; `abbrechen` räumt den Timer, sonst hält er die Funktion offen. */
function warte(ms: number): { zeit: Promise<'zeit'>; abbrechen: () => void } {
  let kennung: ReturnType<typeof setTimeout> | undefined;
  const zeit = new Promise<'zeit'>((resolve) => { kennung = setTimeout(() => resolve('zeit'), ms); });
  return { zeit, abbrechen: () => { if (kennung) clearTimeout(kennung); } };
}

// ---------------------------------------------------------------------------
// POST Handler
// ---------------------------------------------------------------------------

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> },
): Promise<Response> {
  const { slug } = await params;

  // -------------------------------------------------------------------------
  // 1. Estimate Endpoint: /api/intern/estimate (rewritten from /api/estimate)
  // -------------------------------------------------------------------------
  if (slug.length === 1 && slug[0] === 'estimate') {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ ok: false, fehler: 'Ungültiges JSON-Format.' }, { status: 400 });
    }

    const parse = estimateRequestSchema.safeParse(body);
    if (!parse.success) {
      const details = parse.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ');
      return NextResponse.json({ ok: false, fehler: `Validierungsfehler: ${details}` }, { status: 400 });
    }

    const payload = parse.data;

    // Kunden-Modus (Öffentlicher Funnel)
    if (payload.modus === 'kunde') {
      if (payload.honig) {
        return NextResponse.json({ ok: false, fehler: 'Anfrage konnte nicht verarbeitet werden.' }, { status: 400 });
      }

      if (payload.gestartetUm && Date.now() - payload.gestartetUm < 2000) {
        return NextResponse.json({ ok: false, fehler: 'Bitte nehmen Sie sich einen Moment Zeit zum Ausfüllen.' }, { status: 400 });
      }

      // Nur der gesalzene Hash wird gespeichert: die Zählertabelle darf kein Besucherverzeichnis werden.
      const ip = ipHash(clientIp(request.headers), new Date());
      let limit: Awaited<ReturnType<typeof pruefeLimit>>;
      try {
        limit = await pruefeLimit(`estimate:kunde:ip:${ip}`, 20, 10 * 60 * 1000);
      } catch (err) {
        console.error('[estimate] Rate-Limit nicht prüfbar:', err instanceof Error ? err.message : err);
        return NextResponse.json({ ok: false, fehler: 'Die Anfrage konnte gerade nicht gespeichert werden. Bitte rufen Sie uns an.' }, { status: 500 });
      }
      if (!limit.erlaubt) {
        return NextResponse.json(
          { ok: false, fehler: 'Zu viele Anfragen. Bitte probieren Sie es in einigen Minuten erneut.' },
          { status: 429 },
        );
      }

      try {
        const anlage = await legeAusKundenAnfrage(payload);

        // Der Versand läuft im Nachlauf: ein schwebendes Promise überlebt die Antwort
        // in einer serverlosen Umgebung nicht, `after()` schon.
        if (payload.kontakt.eingangsbestaetigung) {
          await stelleAuftragBereit(anlage.anfrageId, 'eingangsbestaetigung', {
            empfaenger: payload.kontakt.email,
          });
          const email = payload.kontakt.email;
          after(sendeEingangsbestaetigung(anlage.anfrageId, email).then(() => undefined, (err) => {
            console.error('[Mail] Eingangsbestätigung fehlgeschlagen:', err);
          }));
        }

        after(sendeBueroHinweis(anlage.anfrageId).then(() => undefined, (err) => {
          console.error('[Mail] Büro-Hinweis fehlgeschlagen:', err);
        }));

        return NextResponse.json({
          ok: true,
          modus: 'kunde',
          ksNummer: anlage.ksNummer,
          ergebnis: anlage.ergebnis,
        });
      } catch (err) {
        console.error('[estimate] Kundenanfrage fehlgeschlagen:', err instanceof Error ? err.message : err);
        const msg = err instanceof Error ? err.message : 'Interner Fehler bei der Speicherung.';
        return NextResponse.json({ ok: false, fehler: msg }, { status: 500 });
      }
    }

    // Meister-Modus (Intern)
    const session = await verifySessionApi();
    if (!session) {
      return NextResponse.json({ ok: false, fehler: 'Nicht autorisiert. Bitte anmelden.' }, { status: 401 });
    }
    const herkunft = herkunftAntwort(request);
    if (herkunft) return herkunft;

    try {
      const anlage = await speichereInternAnfrage(payload, session);

      if (payload.skizzen && payload.skizzen.length > 0) {
        for (const skizze of payload.skizzen) {
          try {
            const { daten } = ausDataUrl(skizze.dataUrl);
            await speichereSkizze(anlage.anfrageId, daten, skizze.name, {
              breite: skizze.breite,
              hoehe: skizze.hoehe,
            });
          } catch {
            // Skizzen-Fehler blockiert nicht die Speicherung
          }
        }
      }

      if (payload.fotos && payload.fotos.length > 0) {
        for (const foto of payload.fotos) {
          try {
            const { daten } = ausDataUrl(foto.dataUrl);
            await speichereFoto(anlage.anfrageId, daten, foto.name, foto.beschreibung);
          } catch {
            // Foto-Fehler blockiert nicht die Speicherung
          }
        }
      }

      // „Sofort senden“ und „Nur Terminmail“: Freigabe mit synchronem Versand (Fachregel 1), Zeitbudget mit Nachlauf.
      if (payload.aktion !== 'entwurf') {
        const art: VersandArt = payload.aktion === 'terminmail' ? 'terminmail' : 'erstkontakt';
        const versand = freigebenService(anlage.anfrageId, session, { art, sofort: true });
        after(versand.then(() => undefined, () => undefined));
        const fenster = warte(VERSAND_BUDGET_MS);
        const ergebnis = await Promise.race([versand, fenster.zeit]);
        fenster.abbrechen();
        if (ergebnis === 'zeit') {
          return NextResponse.json({
            ok: true, modus: 'intern', anfrageId: anlage.anfrageId, ksNummer: anlage.ksNummer, status: anlage.status,
            aktion: payload.aktion, versand: { kunde: 'freigegeben', dossier: 'entwurf' }, hinweise: anlage.hinweise,
            rueckmeldung: `${anlage.ksNummer}: Der Versand läuft noch im Hintergrund. Stand unter Entwürfe prüfen.`,
          }, { status: 202 });
        }
        if (!ergebnis.ok) {
          return NextResponse.json({
            ok: false, fehler: ergebnis.fehler, hinweise: ergebnis.hinweise ?? anlage.hinweise,
            anfrageId: anlage.anfrageId, ksNummer: anlage.ksNummer, status: anlage.status,
          }, { status: ergebnis.grund === 'berechtigung' ? 403 : 422 });
        }
        return NextResponse.json({
          ok: true, modus: 'intern', anfrageId: anlage.anfrageId, ksNummer: anlage.ksNummer, status: anlage.status,
          aktion: payload.aktion, versand: ergebnis.versand, hinweise: [], rueckmeldung: ergebnis.rueckmeldung,
        });
      }

      return NextResponse.json({
        ok: true,
        modus: 'intern',
        anfrageId: anlage.anfrageId,
        ksNummer: anlage.ksNummer,
        status: anlage.status,
        aktion: payload.aktion,
        hinweise: anlage.hinweise,
        rueckmeldung: anlage.rueckmeldung,
      });
    } catch (err) {
      if (err instanceof ZugriffFehler) {
        return NextResponse.json({ ok: false, fehler: err.message, grund: err.grund }, { status: 403 });
      }
      if (err instanceof Error && err.message === 'Anfrage nicht gefunden.') {
        // Verwaiste Kennung (Storno, Speicherfrist): der Client verwirft sie und legt beim nächsten Speichern neu an.
        return NextResponse.json(
          { ok: false, fehler: 'Der Vorgang existiert nicht mehr. Beim nächsten Speichern wird ein neuer Vorgang angelegt.', grund: 'nicht_gefunden' },
          { status: 409 },
        );
      }
      const msg = err instanceof Error ? err.message : 'Interner Fehler bei der Speicherung.';
      return NextResponse.json({ ok: false, fehler: msg }, { status: 500 });
    }
  }

  // -------------------------------------------------------------------------
  // 2. Jobs Endpoint: /api/intern/jobs/[job] (rewritten from /api/jobs/:job)
  // -------------------------------------------------------------------------
  if (slug.length === 2 && slug[0] === 'jobs') {
    return starteJob(request, slug[1]);
  }

  // -------------------------------------------------------------------------
  // 3. Resend Webhook: /api/intern/webhooks/resend (rewritten from /api/webhooks/resend)
  // -------------------------------------------------------------------------
  if (slug.length === 2 && slug[0] === 'webhooks' && slug[1] === 'resend') {
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
      // Ohne Signaturgeheimnis wird kein Ereignis angenommen: sonst könnte jeder Zustellstatus fälschen.
      return NextResponse.json({ fehler: 'Webhook nicht konfiguriert (RESEND_WEBHOOK_SECRET fehlt).' }, { status: 401 });
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

  // -------------------------------------------------------------------------
  // 4. PIN-Login: /api/intern/anmelden
  // -------------------------------------------------------------------------
  if (slug.length === 1 && slug[0] === 'anmelden') {
    try {
      const body = await request.json();
      // Ohne diese beiden Angaben zählt das IP-Limit in auth.ts nie und die Sitzung
      // trägt keinen Hinweis auf ihr Gerät.
      const ergebnis = await authAnmelden({
        email: String(body.email ?? ''),
        pin: String(body.pin ?? ''),
        ipHash: ipHash(clientIp(request.headers), new Date()),
        userAgent: request.headers.get('user-agent'),
      });
      return NextResponse.json(ergebnis);
    } catch (err) {
      // Ursache ins Protokoll (ohne PIN), nach außen bleibt die Meldung allgemein.
      console.error('[anmelden] fehlgeschlagen:', err instanceof Error ? err.message : err);
      return NextResponse.json({ ok: false, fehler: 'Ungültige Anfrage.' }, { status: 400 });
    }
  }

  // -------------------------------------------------------------------------
  // 5. Termin-Bestätigung: /api/intern/termin-bestaetigen
  // -------------------------------------------------------------------------
  if (slug.length === 1 && slug[0] === 'termin-bestaetigen') {
    try {
      const body = await request.json();
      const token = String(body.token ?? '');
      const fensterId = String(body.fensterId ?? '');
      const alternativ = String(body.alternativ ?? '');

      const hash = tokenHash(token);
      const limit = await pruefeLimit(`termin:token:${hash}`, 5, 10 * 60 * 1000);
      if (!limit.erlaubt) {
        return NextResponse.json({ ok: false, fehler: 'Zu viele Versuche. Bitte probieren Sie es später erneut.' }, { status: 429 });
      }

      const db = await getDb();
      const jetzt = new Date();

      const anfragen = await db
        .select()
        .from(anfrageTabelle)
        .where(
          and(
            eq(anfrageTabelle.bestaetigungsTokenHash, hash),
            gte(anfrageTabelle.tokenGueltigBis, jetzt),
          ),
        )
        .limit(1);

      const a = anfragen[0];
      if (!a) {
        return NextResponse.json({ ok: false, fehler: 'Der Bestätigungslink ist ungültig oder abgelaufen.' }, { status: 400 });
      }

      if (a.tokenEingeloestAm) {
        return NextResponse.json({ ok: false, fehler: 'Dieser Termin wurde bereits bestätigt.' });
      }

      const update = await db
        .update(anfrageTabelle)
        .set({
          status: 'antwort',
          antwortAm: jetzt,
          tokenEingeloestAm: jetzt,
          bemerkung: alternativ ? `Kundenwunsch: ${alternativ.slice(0, 300)}` : a.bemerkung,
        })
        .where(
          and(
            eq(anfrageTabelle.id, a.id),
            isNull(anfrageTabelle.tokenEingeloestAm),
          ),
        )
        .returning();

      if (!update.length) {
        return NextResponse.json({ ok: false, fehler: 'Der Termin wurde bereits bestätigt.' });
      }

      // Das gewählte Fenster bleibt reserviert, damit es nicht in der nächsten
      // Kostenschätzung ein zweites Mal vorgeschlagen wird (Fachregel 6).
      const reserviert = await db.select().from(terminfensterReservierung)
        .where(eq(terminfensterReservierung.anfrageId, a.id));
      const gewaehlt = fensterId && reserviert.some((r) => r.terminfensterId === fensterId) ? fensterId : '';
      await loeseReservierungen(a.id, gewaehlt ? [gewaehlt] : []);

      let beschriftung = '';
      if (gewaehlt) {
        const fenster = await db.select().from(terminfenster).where(eq(terminfenster.id, gewaehlt)).limit(1);
        beschriftung = fenster[0]?.beschriftung ?? '';
      }
      await schreibeEreignis({
        anfrageId: a.id,
        typ: 'termin:bestaetigt',
        payload: { fensterId: gewaehlt, alternativ: alternativ.slice(0, 300) },
      });

      // Das Büro erfährt von der Zusage; ein Fehler im Mailweg darf die Bestätigung des Kunden nicht kippen.
      after(sendeTerminMeldung(a.id, beschriftung || alternativ.slice(0, 300) || 'ohne Angabe').then(
        () => undefined,
        (err) => { console.error('[Mail] Terminmeldung fehlgeschlagen:', err); },
      ));

      return NextResponse.json({ ok: true });
    } catch (err) {
      return NextResponse.json({ ok: false, fehler: (err as Error).message }, { status: 500 });
    }
  }

  // -------------------------------------------------------------------------
  // Ab hier: Authentifizierung zwingend erforderlich
  // -------------------------------------------------------------------------
  const session = await verifySessionApi();
  if (!session) {
    return NextResponse.json({ ok: false, fehler: 'Nicht autorisiert.' }, { status: 401 });
  }
  {
    const herkunft = herkunftAntwort(request);
    if (herkunft) return herkunft;
  }

  // Abmelden
  if (slug.length === 1 && slug[0] === 'abmelden') {
    await authAbmelden();
    return NextResponse.json({ ok: true });
  }

  // Vercel Blob Token
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
      return NextResponse.json({ fehler: (error as Error).message }, { status: 400 });
    }
  }

  // Anhänge hochladen
  if (slug.length === 1 && slug[0] === 'anhaenge') {
    try {
      const formData = await request.formData();
      const anfrageId = formData.get('anfrageId');
      const datei = formData.get('datei');
      const beschreibung = (formData.get('beschreibung') as string) || '';
      const rohArt = String(formData.get('art') ?? 'foto');

      if (!anfrageId || typeof anfrageId !== 'string') {
        return NextResponse.json({ ok: false, fehler: 'anfrageId fehlt.' }, { status: 400 });
      }
      // Die Art kommt aus dem Formular und bestimmt, wie der Anhang später erscheint;
      // ein freier Wert würde ungeprüft in der Datenbank landen.
      if (rohArt !== 'foto' && rohArt !== 'foto_annotiert') {
        return NextResponse.json({ ok: false, fehler: 'Unbekannte Anhangsart.' }, { status: 400 });
      }
      const art: 'foto' | 'foto_annotiert' = rohArt;
      if (!datei || !(datei instanceof File)) {
        return NextResponse.json({ ok: false, fehler: 'Datei fehlt oder ist ungültig.' }, { status: 400 });
      }
      if (datei.size > 4 * 1024 * 1024) {
        return NextResponse.json({ ok: false, fehler: 'Datei überschreitet das Limit von 4 MB.' }, { status: 400 });
      }
      // Ein Foto gehört an einen bestehenden Vorgang, für den diese Sitzung zuständig ist.
      const zugang = await anfrageFuerSession(anfrageId, session);
      if (!zugang.ok) return zugang.antwort;

      const arrayBuffer = await datei.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const ergebnis = await speichereFoto(anfrageId, buffer, datei.name, beschreibung, art);
      return NextResponse.json({ ok: true, anhang: ergebnis });
    } catch (err) {
      return NextResponse.json({ ok: false, fehler: (err as Error).message }, { status: 500 });
    }
  }

  // Entwurf speichern
  if (slug.length === 1 && slug[0] === 'entwurf') {
    // Derselbe Prüfweg wie im Estimate-Zweig: ohne Schema landet ein beliebiger Body
    // ungeprüft in der Datenbank. Die Aktion ist hier serverseitig immer „entwurf“.
    const body = await leseBody(request, internAnfrageSchema.extend({ auftragAnlegen: z.boolean().optional() }));
    if (!body.ok) return body.antwort;
    const input = { ...body.daten, aktion: 'entwurf' as const };
    try {
      const anlage = await speichereInternAnfrage(input, session);
      // Nur das bewusste „Als Entwurf speichern“ stellt den Erstkontakt-Auftrag bereit (Status entwurf),
      // damit der Vorgang in der Freigabeliste erscheint. Der Autosave legt keinen Auftrag an.
      if (input.auftragAnlegen === true) {
        await stelleAuftragBereit(anlage.anfrageId, 'erstkontakt', { empfaenger: input.kontakt?.email ?? '' });
      }
      return NextResponse.json({
        ok: true,
        modus: 'intern',
        anfrageId: anlage.anfrageId,
        ksNummer: anlage.ksNummer,
        status: anlage.status,
        aktion: 'entwurf',
        hinweise: anlage.hinweise,
        rueckmeldung: anlage.rueckmeldung,
      });
    } catch (err) {
      if (err instanceof ZugriffFehler) {
        return NextResponse.json({ ok: false, fehler: err.message, grund: err.grund }, { status: 403 });
      }
      if (err instanceof Error && err.message === 'Anfrage nicht gefunden.') {
        // Verwaiste Kennung (Storno, Speicherfrist): der Client verwirft sie und legt beim nächsten Speichern neu an.
        return NextResponse.json(
          { ok: false, fehler: 'Der Vorgang existiert nicht mehr. Beim nächsten Speichern wird ein neuer Vorgang angelegt.', grund: 'nicht_gefunden' },
          { status: 409 },
        );
      }
      return NextResponse.json({ ok: false, fehler: (err as Error).message }, { status: 500 });
    }
  }

  // Freigabe
  if (slug.length === 1 && slug[0] === 'freigeben') {
    const body = await leseBody(request, freigebenSchema);
    if (!body.ok) return body.antwort;
    const zugang = await anfrageFuerSession(body.daten.anfrageId, session);
    if (!zugang.ok) return zugang.antwort;
    try {
      const ergebnis = await freigebenService(body.daten.anfrageId, session, { sofort: body.daten.sofort, art: body.daten.art });
      return NextResponse.json(ergebnis, { status: ergebnis.ok ? 200 : ergebnis.grund === 'berechtigung' ? 403 : ergebnis.grund === 'nicht_gefunden' ? 404 : 422 });
    } catch (err) {
      return NextResponse.json({ ok: false, fehler: (err as Error).message }, { status: 500 });
    }
  }

  // Stornieren
  if (slug.length === 1 && slug[0] === 'stornieren') {
    const body = await leseBody(request, stornierenSchema);
    if (!body.ok) return body.antwort;
    const zugang = await anfrageFuerSession(body.daten.anfrageId, session);
    if (!zugang.ok) return zugang.antwort;
    try {
      const ergebnis = await stornierenService(body.daten.anfrageId, session);
      return NextResponse.json(ergebnis);
    } catch (err) {
      return NextResponse.json({ ok: false, fehler: (err as Error).message }, { status: 500 });
    }
  }

  // Richtpreis-Matrix Zeile
  if (slug.length === 2 && slug[0] === 'matrix' && slug[1] === 'zeile') {
    if (session.rolle !== 'chef') {
      return NextResponse.json({ ok: false, fehler: 'Nur der Chef darf Richtpreise ändern.' }, { status: 403 });
    }
    const body = await leseBody(request, matrixZeileSchema);
    if (!body.ok) return body.antwort;
    try {
      const { nr, von, bis, einheit, hinweis } = body.daten;
      const db = await getDb();
      await db.update(richtpreis).set({
        von,
        bis,
        einheit,
        hinweis: hinweis.replace(/ \| Demo \([RD]\)$/, ''),
        geaendertAm: new Date(),
        // Fremdschlüssel auf benutzer.id, nicht der Anzeigename.
        geaendertVon: session.benutzerId,
      }).where(eq(richtpreis.nr, nr));
      return NextResponse.json({ ok: true });
    } catch (err) {
      return NextResponse.json({ ok: false, fehler: (err as Error).message }, { status: 500 });
    }
  }

  // Förderregeln
  if (slug.length === 2 && slug[0] === 'matrix' && slug[1] === 'foerderregeln') {
    if (session.rolle !== 'chef') {
      return NextResponse.json({ ok: false, fehler: 'Nur der Chef darf Förderregeln ändern.' }, { status: 403 });
    }
    const body = await leseBody(request, foerderRegelnSchema);
    if (!body.ok) return body.antwort;
    try {
      const regeln: FoerderRegeln = body.daten;
      const db = await getDb();
      await db.update(foerderRegel).set({
        grund: regeln.grund,
        einkommenGrenze: regeln.einkommenGrenze,
        effizienz: regeln.effizienz,
        klimageschwindigkeit: regeln.klimageschwindigkeit,
        einkommen: regeln.einkommen,
        deckel: regeln.deckel,
        kostenWe1: regeln.kostenWe1,
        kostenJeWeitere: regeln.kostenJeWeitere,
        maxWe: regeln.maxWe,
        standardsatz: regeln.standardsatz,
        eigenanteilRundung: regeln.eigenanteilRundung,
      }).where(eq(foerderRegel.id, 1));
      return NextResponse.json({ ok: true });
    } catch (err) {
      return NextResponse.json({ ok: false, fehler: (err as Error).message }, { status: 500 });
    }
  }

  // Vorbehalt neu
  if (slug.length === 2 && slug[0] === 'matrix' && slug[1] === 'vorbehalt-neu') {
    if (session.rolle !== 'chef') return NextResponse.json({ ok: false, fehler: 'Nur der Chef darf den Vorbehaltskatalog ändern.' }, { status: 403 });
    const body = await leseBody(request, vorbehaltNeuSchema);
    if (!body.ok) return body.antwort;
    try {
      const db = await getDb();
      await db.insert(vorbehalt).values({ text: body.daten.text, gewerk: body.daten.gewerk, aktiv: true });
      return NextResponse.json({ ok: true });
    } catch (err) {
      return NextResponse.json({ ok: false, fehler: (err as Error).message }, { status: 500 });
    }
  }

  // Demo-Preise laden oder entfernen (Vorführung)
  if (slug.length === 2 && slug[0] === 'matrix' && slug[1] === 'demo') {
    if (session.rolle !== 'chef') return NextResponse.json({ ok: false, fehler: 'Nur der Chef darf Demo-Preise setzen.' }, { status: 403 });
    const body = await leseBody(request, matrixDemoSchema);
    if (!body.ok) return body.antwort;
    try {
      await demoPreiseSetzen(body.daten.an);
      return NextResponse.json({ ok: true, demoPreise: body.daten.an });
    } catch (err) {
      return NextResponse.json({ ok: false, fehler: (err as Error).message }, { status: 500 });
    }
  }

  // Mobile Dispatch
  if (slug.length === 1 && slug[0] === 'dispatch') {
    const dispatchBody = await leseBody(request, dispatchBefehlSchema);
    if (!dispatchBody.ok) return dispatchBody.antwort;
    const befehl = dispatchBody.daten;
    try {
      const db = await getDb();

      if (befehl.art === 'freigeben' || befehl.art === 'freigeben_sofort') {
        const sofort = befehl.art === 'freigeben_sofort';
        const anfragen = await db.select().from(anfrageTabelle).where(eq(anfrageTabelle.ksNummer, befehl.ksNummer)).limit(1);
        const a = anfragen[0];
        if (!a) return NextResponse.json({ ok: false, rueckmeldung: '', fehler: `Vorgang ${befehl.ksNummer} wurde nicht gefunden.` });
        // Auch über die KS-Nummer gilt die Zuständigkeit (Bauleiter nur eigene und unzugewiesene Vorgänge).
        const zugriff = await anfrageFuerSession(a.id, session);
        if (!zugriff.ok) return zugriff.antwort;

        const res = await freigebenService(a.id, session, { art: 'erstkontakt', sofort });
        if (!res.ok) return NextResponse.json({ ok: false, rueckmeldung: '', fehler: res.fehler });

        const meldung = sofort
          ? `${a.ksNummer} wurde freigegeben und sofort an ${a.objektAdresse || 'den Kunden'} versendet.`
          : (res.rueckmeldung || `${a.ksNummer} ist freigegeben. Versand ab 18:00.`);

        return NextResponse.json({ ok: true, ksNummer: a.ksNummer, anfrageId: a.id, rueckmeldung: meldung });
      }

      if (befehl.art === 'anpassung') {
        const anfragen = await db.select().from(anfrageTabelle).where(eq(anfrageTabelle.ksNummer, befehl.ksNummer)).limit(1);
        const a = anfragen[0];
        if (!a) return NextResponse.json({ ok: false, rueckmeldung: '', fehler: `Vorgang ${befehl.ksNummer} wurde nicht gefunden.` });
        // Auch über die KS-Nummer gilt die Zuständigkeit (Bauleiter nur eigene und unzugewiesene Vorgänge).
        const zugriff = await anfrageFuerSession(a.id, session);
        if (!zugriff.ok) return zugriff.antwort;

        const aktuelleNotiz = a.interneNotizen ? `${a.interneNotizen}\n${befehl.text}` : befehl.text;
        // Die Bemerkung bleibt unangetastet: dort steht etwa der Terminwunsch des Kunden.
        await db.update(anfrageTabelle).set({ interneNotizen: aktuelleNotiz }).where(eq(anfrageTabelle.id, a.id));
        await schreibeEreignis({ anfrageId: a.id, typ: 'dispatch:anpassung', benutzerId: session.benutzerId, payload: { notiz: befehl.text } });
        return NextResponse.json({ ok: true, ksNummer: a.ksNummer, anfrageId: a.id, rueckmeldung: `${a.ksNummer}: Notiz hinzugefügt.` });
      }

      if (befehl.art === 'neuanlage') {
        const { vorlagen } = await ladeKalkulationsdatenService();
        const positionen = befehl.vorlageIds.flatMap((vId: string) => {
          const v = vorlagen.find((x) => x.id === vId);
          if (!v) return [];
          return v.bausteine.map((b) => ({
            id: b.id,
            titel: b.titel,
            gewerk: b.gewerk,
            text: b.text,
            menge: b.mengeDefault,
            einheit: b.einheit,
            von: b.spanne ? b.spanne.von : null,
            bis: b.spanne ? b.spanne.bis : null,
            matrixNr: b.matrixNr,
            vorlageZeileId: b.id,
            varianteMatrixNr: null,
            zuschlag: b.zuschlag,
            aktiv: !b.zuschlag,
            quelle: 'vorlage' as const,
            notizIntern: '',
            intern: {},
          }));
        });

        const res = await speichereInternAnfrage({
          modus: 'intern',
          aktion: 'entwurf',
          quelle: 'dispatch',
          vorlageIds: befehl.vorlageIds,
          kontakt: {
            anrede: (befehl.anrede as 'Frau' | 'Herr' | '') || '',
            vorname: befehl.vorname || '',
            nachname: befehl.nachname || '',
            email: befehl.email || '',
            telefon: befehl.telefon || '',
            strasse: befehl.strasse || '',
            plzOrt: befehl.plzOrt || '',
            kenntnisnahme: true,
          },
          objekt: {
            adresse: befehl.strasse || '',
            plz: befehl.plzOrt.match(/\d{5}/)?.[0] || '',
            eigentum: 'unklar',
            wohneinheiten: 1,
          },
          gebaeude: leeresGebaeude(),
          dringlichkeit: 'unklar',
          vorhabenKurz: befehl.vorhabenKurz,
          positionen,
          kalkulation: {},
          foerderung: { aktiv: false, wohneinheiten: 1, selbstBewohnt: true, altOelOderGas: true, einkommenUnterGrenze: false, natuerlichesKaeltemittel: true },
          persoenlicherSatz: '',
          annahmen: [],
          vorbehalte: [],
          ausfuehrungSatz: '',
          terminfensterIds: [],
          notizen: { etage: null, aufzug: null, montagehindernisse: '', leitungswege: '', intern: `Erfasst über Dispatch:\n${befehl.rohtext}` },
          skizzen: [],
          fotos: [],
        }, session);

        const daten = await ladeVorgang(res.anfrageId);
        const fehlt = daten ? fehlendeAngaben(daten, res.ergebnis) : [];
        // Eine blockierte Basisposition (etwa Wärmepumpe ohne Größe) darf keine Teilsumme als Spanne ausgeben.
        const spanneBrutto = res.status === 'blockiert'
          ? 'blockiert, Spanne folgt nach Größenwahl'
          : res.ergebnis.bruttoBis > 0
            ? `${euro(res.ergebnis.bruttoVon)} bis ${euro(res.ergebnis.bruttoBis)} € brutto`
            : 'noch ohne Spanne';
        const fehltText = fehlt.length > 0 ? ` Fehlt: ${fehlt.join(', ')}.` : '';

        return NextResponse.json({
          ok: true,
          ksNummer: res.ksNummer,
          anfrageId: res.anfrageId,
          rueckmeldung: `${res.ksNummer} ${befehl.nachname || 'ohne Namen'}, ${befehl.vorhabenKurz}, ${spanneBrutto}, liegt in ${res.status}.${fehltText}`,
        });
      }

      if (befehl.art === 'portal_lead') {
        const { vorlagen, matrix } = await ladeKalkulationsdatenService();
        const gebaeude = befehl.gebaeude;
        const schaetzung = heizlastSchaetzen(gebaeude);
        const hersteller = gebaeude.geraet.hersteller;

        // Positionen wie im Meister-Modus: Größenvariante aus der Heizlast, Speicher nach Personen.
        const positionen = befehl.vorlageIds.flatMap((vId) => {
          const v = vorlagen.find((x) => x.id === vId);
          if (!v) return [];
          return v.bausteine.map((b) => {
            const vorschlag = schaetzung ? geraeteVorschlag(schaetzung.kwEmpfohlen, b.groessenVarianten, hersteller) : null;
            // Eine Größe nur aus einer belastbaren Heizlast (Verbrauch oder Dämmungsangabe) und nur
            // innerhalb der Baureihe; sonst bleibt die Zeile blockiert und der Ortstermin entscheidet.
            const groesseBelastbar = Boolean(schaetzung?.belastbar && vorschlag && !vorschlag.ueberBaureihe);
            const varianteNr = groesseBelastbar && vorschlag ? vorschlag.matrixNr : null;
            const variante = b.groessenVarianten?.find((x) => x.matrixNr === varianteNr) ?? null;
            const speicher = varianteNr !== null ? speicherVorschlag(gebaeude.personen, variante?.speicherLiterOptionen) : null;
            return positionAusBaustein(b, matrix, {
              varianteMatrixNr: varianteNr,
              kW: groesseBelastbar ? vorschlag?.geraetKw : undefined,
              liter: speicher?.liter,
              hersteller,
            });
          });
        });
        // Dieselben Annahmen wie im Web-Trichter, wenn die Größe nicht aus den Daten folgt.
        const portalAnnahmen: string[] = [];
        if (schaetzung && !schaetzung.belastbar) {
          portalAnnahmen.push('Für die Größe der Wärmepumpe brauchen wir Ihren Jahresverbrauch; die genaue Auslegung folgt beim Termin vor Ort.');
        }
        // Der Baureihen-Hinweis gilt nur für eine belastbare Heizlast; der reine Flächenweg überschätzt.
        if (schaetzung && schaetzung.belastbar && geraetAusBaureihe(schaetzung.kwEmpfohlen, hersteller).ueberBaureihe) {
          portalAnnahmen.push('Die berechnete Größe liegt über der größten Baureihe, die Auslegung klären wir vor Ort.');
        }

        const vorlage = vorlagen.find((v) => v.id === befehl.vorlageIds[0]) ?? null;
        const portalLabel = befehl.portal === 'wattfox' ? 'WattFox' : 'unbekanntes Portal';

        const res = await speichereInternAnfrage({
          modus: 'intern',
          aktion: 'entwurf',
          quelle: 'dispatch',
          vorlageIds: befehl.vorlageIds,
          kontakt: { ...befehl.kontakt, kenntnisnahme: true },
          objekt: befehl.objekt,
          gebaeude,
          dringlichkeit: 'unklar',
          vorhabenKurz: befehl.vorhabenKurz,
          positionen,
          kalkulation: {},
          foerderung: {
            aktiv: vorlage?.foerderungStandard ?? false,
            wohneinheiten: befehl.objekt.wohneinheiten,
            selbstBewohnt: befehl.foerderung.selbstBewohnt,
            altOelOderGas: befehl.foerderung.altOelOderGas,
            einkommenUnterGrenze: false,
            natuerlichesKaeltemittel: true,
          },
          // Der Portal-Text ist eine interne Notiz, nie der persönliche Satz des Kundendokuments.
          persoenlicherSatz: '',
          annahmen: portalAnnahmen,
          vorbehalte: [],
          ausfuehrungSatz: '',
          terminfensterIds: [],
          notizen: {
            etage: null, aufzug: null, montagehindernisse: '', leitungswege: '',
            intern: `Portal-Lead (${portalLabel}):\n${befehl.rohtext}`.slice(0, 3000),
          },
          skizzen: [],
          fotos: [],
        }, session);

        const triageErgebnis = await triageFuerAnfrage(res.anfrageId, { eigentum: befehl.objekt.eigentum });
        const daten = await ladeVorgang(res.anfrageId);
        const fehlt = daten ? fehlendeAngaben(daten, res.ergebnis) : [];
        // Eine blockierte Basisposition (etwa Wärmepumpe ohne Größe) darf keine Teilsumme als Spanne ausgeben.
        const spanneBrutto = res.status === 'blockiert'
          ? 'blockiert, Spanne folgt nach Größenwahl'
          : res.ergebnis.bruttoBis > 0
            ? `${euro(res.ergebnis.bruttoVon)} bis ${euro(res.ergebnis.bruttoBis)} € brutto`
            : 'noch ohne Spanne';
        const fehltAlle = [...befehl.hinweise, ...fehlt];
        const fehltText = fehltAlle.length > 0 ? ` Fehlt: ${fehltAlle.slice(0, 4).join('; ')}.` : '';
        const triageText = triageErgebnis ? TRIAGE_KURZ[triageErgebnis.vorschlag] : 'offen';

        return NextResponse.json({
          ok: true,
          ksNummer: res.ksNummer,
          anfrageId: res.anfrageId,
          rueckmeldung: `${res.ksNummer} ${befehl.kontakt.nachname || 'ohne Namen'}, ${befehl.vorhabenKurz}, ${spanneBrutto}, Triage: ${triageText}.${fehltText}`,
        });
      }

      return NextResponse.json({ ok: false, rueckmeldung: '', fehler: 'Unbekannter Befehl.' }, { status: 400 });
    } catch (err) {
      return NextResponse.json({ ok: false, rueckmeldung: '', fehler: (err as Error).message }, { status: 500 });
    }
  }

  // Benutzer anlegen
  if (slug.length === 2 && slug[0] === 'benutzer' && slug[1] === 'neu') {
    if (session.rolle !== 'chef') {
      return NextResponse.json({ ok: false, fehler: 'Nur der Chef darf Benutzer anlegen.' }, { status: 403 });
    }
    const body = await leseBody(request, benutzerNeuSchema);
    if (!body.ok) return body.antwort;
    try {
      const { name, email, pin, rolle, funktion } = body.daten;
      if (!pinGueltig(pin)) return NextResponse.json({ ok: false, fehler: 'Die PIN muss aus 6 bis 8 Ziffern bestehen.' }, { status: 400 });

      const db = await getDb();
      const bereinigteEmail = String(email).trim().toLowerCase();
      const vorhanden = await db.select().from(benutzer).where(eq(benutzer.email, bereinigteEmail)).limit(1);
      if (vorhanden[0]) return NextResponse.json({ ok: false, fehler: 'Ein Benutzer mit dieser E-Mail existiert bereits.' });

      const pHash = pinHashen(pin);
      await db.insert(benutzer).values({
        id: randomUUID(),
        name: String(name).trim(),
        email: bereinigteEmail,
        pinHash: pHash,
        rolle: rolle as Rolle,
        funktion: String(funktion).trim(),
        signaturMail: bereinigteEmail,
        aktiv: true,
      });
      return NextResponse.json({ ok: true });
    } catch (err) {
      return NextResponse.json({ ok: false, fehler: (err as Error).message }, { status: 500 });
    }
  }

  // PIN zurücksetzen
  if (slug.length === 2 && slug[0] === 'benutzer' && slug[1] === 'pin') {
    if (session.rolle !== 'chef') {
      return NextResponse.json({ ok: false, fehler: 'Nur der Chef darf PINs zurücksetzen.' }, { status: 403 });
    }
    const body = await leseBody(request, benutzerPinSchema);
    if (!body.ok) return body.antwort;
    try {
      const { benutzerId, neuePin } = body.daten;
      if (!pinGueltig(neuePin)) return NextResponse.json({ ok: false, fehler: 'Die PIN muss aus 6 bis 8 Ziffern bestehen.' }, { status: 400 });

      const db = await getDb();
      const pHash = pinHashen(neuePin);
      await db.update(benutzer).set({ pinHash: pHash, fehlversuche: 0, gesperrtBis: null }).where(eq(benutzer.id, benutzerId));
      return NextResponse.json({ ok: true });
    } catch (err) {
      return NextResponse.json({ ok: false, fehler: (err as Error).message }, { status: 500 });
    }
  }

  // Benutzer aktiv/inaktiv schalten
  if (slug.length === 2 && slug[0] === 'benutzer' && slug[1] === 'toggle') {
    if (session.rolle !== 'chef') {
      return NextResponse.json({ ok: false, fehler: 'Nur der Chef darf Benutzer aktivieren/deaktivieren.' }, { status: 403 });
    }
    const body = await leseBody(request, benutzerToggleSchema);
    if (!body.ok) return body.antwort;
    try {
      const { benutzerId, aktiv } = body.daten;
      if (benutzerId === session.benutzerId && !aktiv) {
        return NextResponse.json({ ok: false, fehler: 'Sie können Ihren eigenen Account nicht deaktivieren.' });
      }
      if (aktiv) {
        const db = await getDb();
        await db.update(benutzer).set({ aktiv: true, fehlversuche: 0, gesperrtBis: null }).where(eq(benutzer.id, benutzerId));
      } else {
        await deaktiviereBenutzer(benutzerId);
      }
      return NextResponse.json({ ok: true });
    } catch (err) {
      return NextResponse.json({ ok: false, fehler: (err as Error).message }, { status: 500 });
    }
  }

  // Terminfenster neu
  if (slug.length === 2 && slug[0] === 'termine' && slug[1] === 'neu') {
    if (session.rolle !== 'chef' && session.rolle !== 'buero') {
      return NextResponse.json({ ok: false, fehler: 'Terminfenster legen Chef und Büro an.' }, { status: 403 });
    }
    const body = await leseBody(request, terminfensterNeuSchema);
    if (!body.ok) return body.antwort;
    try {
      const { beschriftung, beginnIso, endeIso } = body.daten;
      const db = await getDb();
      await db.insert(terminfenster).values({
        id: randomUUID(),
        beschriftung,
        beginn: beginnIso ? new Date(beginnIso) : null,
        ende: endeIso ? new Date(endeIso) : null,
      });
      return NextResponse.json({ ok: true });
    } catch (err) {
      return NextResponse.json({ ok: false, fehler: (err as Error).message }, { status: 500 });
    }
  }

  // Terminfenster löschen
  if (slug.length === 2 && slug[0] === 'termine' && slug[1] === 'loeschen') {
    if (session.rolle !== 'chef') {
      return NextResponse.json({ ok: false, fehler: 'Terminfenster löscht nur der Chef.' }, { status: 403 });
    }
    const body = await leseBody(request, terminfensterLoeschenSchema);
    if (!body.ok) return body.antwort;
    try {
      const { id } = body.daten;
      const db = await getDb();
      // Ein reserviertes Fenster gehört zu einem Vorgang (Regel 6) und wird nicht still gelöscht.
      const belegt = await db.select({ anfrageId: terminfensterReservierung.anfrageId })
        .from(terminfensterReservierung).where(eq(terminfensterReservierung.terminfensterId, id)).limit(1);
      if (belegt[0]) {
        return NextResponse.json({ ok: false, fehler: 'Das Fenster ist für einen Vorgang reserviert. Erst den Vorgang umbuchen oder verwerfen.' }, { status: 409 });
      }
      await db.delete(terminfenster).where(eq(terminfenster.id, id));
      return NextResponse.json({ ok: true });
    } catch (err) {
      return NextResponse.json({ ok: false, fehler: (err as Error).message }, { status: 500 });
    }
  }

  // Einstellungen speichern
  if (slug.length === 1 && slug[0] === 'einstellungen') {
    if (session.rolle !== 'chef') {
      return NextResponse.json({ ok: false, fehler: 'Nur der Chef darf Betriebseinstellungen ändern.' }, { status: 403 });
    }
    const body = await leseBody(request, einstellungenSchema);
    if (!body.ok) return body.antwort;
    try {
      const werte = body.daten;
      const db = await getDb();
      const eintraege: { key: string; wert: unknown }[] = [
        { key: 'versandzeit', wert: werte.versandzeit },
        { key: 'wiedervorlage_tage', wert: werte.wiedervorlageTage },
        { key: 'erinnerung_tage', wert: werte.erinnerungTage },
        { key: 'radius_km', wert: werte.radiusKm },
        { key: 'min_qm', wert: werte.minQm },
        { key: 'speicherfrist_monate', wert: werte.speicherfristMonate },
        { key: 'eingangsbestaetigung', wert: werte.eingangsbestaetigung },
        { key: 'buero_email', wert: werte.bueroEmail },
        { key: 'absender', wert: werte.absender },
        { key: 'briefbogen', wert: werte.briefbogen },
        ...(werte.betriebskosten ? [{ key: 'betriebskosten', wert: werte.betriebskosten }] : []),
      ];

      for (const e of eintraege) {
        await db
          .insert(einstellung)
          .values({ key: e.key, wert: e.wert })
          .onConflictDoUpdate({ target: einstellung.key, set: { wert: e.wert } });
      }
      return NextResponse.json({ ok: true });
    } catch (err) {
      return NextResponse.json({ ok: false, fehler: (err as Error).message }, { status: 500 });
    }
  }

  // Anfrage löschen
  if (slug.length === 3 && slug[0] === 'anfragen' && slug[2] === 'loeschen') {
    try {
      const anfrageId = slug[1];
      const db = await getDb();
      const zugang = await anfrageFuerSession(anfrageId, session);
      if (!zugang.ok) return zugang.antwort;
      const a = zugang.anfrage;

      const [anhaenge, dokumente] = await Promise.all([
        db.select().from(anhangTabelle).where(eq(anhangTabelle.anfrageId, anfrageId)),
        db.select().from(dokument).where(eq(dokument.anfrageId, anfrageId)),
      ]);

      const storage = getStorage();
      for (const h of anhaenge) {
        await storage.del(h.blobPfad).catch(() => undefined);
        if (h.thumbBlobPfad) await storage.del(h.thumbBlobPfad).catch(() => undefined);
      }
      for (const d of dokumente) {
        await storage.del(d.blobPfad).catch(() => undefined);
      }

      const kundeId = a.kundeId;
      await db.delete(anfrageTabelle).where(eq(anfrageTabelle.id, anfrageId));

      if (kundeId) {
        const weitere = await db.select({ id: anfrageTabelle.id }).from(anfrageTabelle).where(eq(anfrageTabelle.kundeId, kundeId));
        if (weitere.length === 0) {
          await db.delete(kundeTabelle).where(inArray(kundeTabelle.id, [kundeId]));
        }
      }

      await db.insert(loeschprotokoll).values({
        ksNummer: a.ksNummer,
        geloeschtAm: new Date(),
        grund: `Manuelle Löschung durch ${session.name} (${session.rolle}) nach Art. 17 DSGVO.`,
      });

      return NextResponse.json({ ok: true });
    } catch (err) {
      return NextResponse.json({ ok: false, fehler: (err as Error).message }, { status: 500 });
    }
  }

  // Anfrage Status ändern
  if (slug.length === 3 && slug[0] === 'anfragen' && slug[2] === 'status') {
    try {
      const anfrageId = slug[1];
      const body = await leseBody(request, statusWechselSchema);
      if (!body.ok) return body.antwort;
      const { status: neuerStatus, grund } = body.daten;
      const zugang = await anfrageFuerSession(anfrageId, session);
      if (!zugang.ok) return zugang.antwort;
      const daten = await ladeVorgang(anfrageId);
      if (!daten) return NextResponse.json({ ok: false, fehler: 'Anfrage nicht gefunden.' }, { status: 404 });

      const db = await getDb();
      await db.update(anfrageTabelle).set({
        status: neuerStatus as AnfrageStatus,
        verworfenAm: neuerStatus === 'verworfen' ? new Date() : daten.anfrage.verworfenAm,
        grundVerworfen: neuerStatus === 'verworfen' ? grund || 'Manuell verworfen.' : daten.anfrage.grundVerworfen,
      }).where(eq(anfrageTabelle.id, anfrageId));

      await schreibeEreignis({
        anfrageId,
        typ: `status:${neuerStatus}`,
        benutzerId: session.benutzerId,
        payload: { grund, alterStatus: daten.anfrage.status },
      });

      return NextResponse.json({ ok: true });
    } catch (err) {
      return NextResponse.json({ ok: false, fehler: (err as Error).message }, { status: 500 });
    }
  }

  return NextResponse.json({ fehler: 'Endpunkt nicht gefunden.' }, { status: 404 });
}

// ---------------------------------------------------------------------------
// GET Handler
// ---------------------------------------------------------------------------

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> },
): Promise<Response> {
  const { slug } = await params;

  // Jobs GET: /api/intern/jobs/[job]
  if (slug.length === 2 && slug[0] === 'jobs') {
    return starteJob(request, slug[1]);
  }

  // Ab hier: Authentifizierung zwingend erforderlich
  const session = await verifySessionApi();
  if (!session) {
    return new NextResponse('Nicht autorisiert.', { status: 401 });
  }

  // Kalkulationsdaten
  if (slug.length === 1 && slug[0] === 'kalkulationsdaten') {
    const daten = await ladeKalkulationsdatenService();
    return NextResponse.json(daten);
  }

  // Terminfenster
  if (slug.length === 1 && slug[0] === 'terminfenster') {
    const fenster = await ladeTerminfensterService();
    return NextResponse.json(fenster);
  }

  // Entwürfe
  if (slug.length === 1 && slug[0] === 'entwuerfe') {
    const karten = await ladeEntwuerfeService(session);
    return NextResponse.json(karten);
  }

  // Einzelne Anfrage
  if (slug.length === 2 && slug[0] === 'anfragen') {
    const zugang = await anfrageFuerSession(slug[1], session);
    if (!zugang.ok) return zugang.antwort;
    const dto = await ladeInternAnfrage(slug[1]);
    if (!dto) return NextResponse.json({ fehler: 'Anfrage nicht gefunden.' }, { status: 404 });
    return NextResponse.json(dto);
  }

  // DSGVO Auskunft JSON
  if (slug.length === 3 && slug[0] === 'anfragen' && slug[2] === 'auskunft') {
    const anfrageId = slug[1];
    const zugang = await anfrageFuerDownload(anfrageId, session);
    if (!zugang.ok) return zugang.antwort;
    const dto = await ladeInternAnfrage(anfrageId);
    if (!dto) return new NextResponse('Anfrage nicht gefunden.', { status: 404 });
    return NextResponse.json(dto);
  }

  // CSV-Export
  if (slug.length === 3 && slug[0] === 'anfragen' && slug[2] === 'csv') {
    const anfrageId = slug[1];
    const zugang = await anfrageFuerDownload(anfrageId, session);
    if (!zugang.ok) return zugang.antwort;
    const daten = await ladeVorgang(anfrageId);
    if (!daten) return new NextResponse('Anfrage nicht gefunden.', { status: 404 });
    const [matrix, regeln] = await Promise.all([ladeMatrix(), ladeFoerderRegeln()]);
    const ergebnis = rechneVorgang(daten, matrix, regeln);
    const csv = `${csvKopfzeile()}\n${csvZeile(daten, ergebnis)}`;
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${daten.anfrage.ksNummer}.csv"`,
      },
    });
  }

  // Datei-Download Anhang
  // Erzeugte Dokumente (PDF, HTML, Text, Markdown) eines Vorgangs; PDF und HTML mit ?inline=1 in der Vorschau.
  if (slug.length === 4 && slug[0] === 'anfragen' && slug[2] === 'dokumente') {
    const anfrageId = slug[1];
    const dokumentId = slug[3];
    const db = await getDb();
    const zugang = await anfrageFuerDownload(anfrageId, session);
    if (!zugang.ok) return zugang.antwort;
    const v = zugang.anfrage;
    const dokumente = await db.select().from(dokument)
      .where(and(eq(dokument.id, dokumentId), eq(dokument.anfrageId, anfrageId)))
      .limit(1);
    const d = dokumente[0];
    if (!d) return new NextResponse('Dokument nicht gefunden.', { status: 404 });
    const storage = getStorage();
    const datei = await storage.get(d.blobPfad);
    if (!datei) return new NextResponse('Datei in der Ablage nicht gefunden.', { status: 404 });
    const dateiname = dokumentDateiname(d.art, v.ksNummer, d.version);
    const mime = d.art.endsWith('_pdf') ? 'application/pdf'
      : d.art.endsWith('_html') ? 'text/html; charset=utf-8'
        : d.art.endsWith('_txt') ? 'text/plain; charset=utf-8'
          : 'text/markdown; charset=utf-8';
    const inlineGewuenscht = request.nextUrl.searchParams.get('inline') === '1';
    const encodedFilename = encodeURIComponent(dateiname).replace(/['()]/g, escape);
    const disposition = `${inlineGewuenscht ? 'inline' : 'attachment'}; filename="${dateiname.replace(/"/g, '')}"; filename*=UTF-8''${encodedFilename}`;
    return new NextResponse(datei.daten as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': mime,
        'Content-Disposition': disposition,
        'Cache-Control': 'private, no-store',
        'X-Content-Type-Options': 'nosniff',
        // HTML-Dokumente nur passiv anzeigen: keine Skripte, keine Nachlade-Quellen.
        ...(mime.startsWith('text/html') ? { 'Content-Security-Policy': "default-src 'none'; img-src data:; style-src 'unsafe-inline'; font-src data:" } : {}),
      },
    });
  }

  if (slug.length === 4 && slug[0] === 'anfragen' && slug[2] === 'anhaenge') {
    const anfrageId = slug[1];
    const anhangId = slug[3];
    const db = await getDb();

    const zugang = await anfrageFuerDownload(anfrageId, session);
    if (!zugang.ok) return zugang.antwort;

    const anhaenge = await db.select().from(anhangTabelle)
      .where(and(eq(anhangTabelle.id, anhangId), eq(anhangTabelle.anfrageId, anfrageId)))
      .limit(1);
    const a = anhaenge[0];
    if (!a) {
      return new NextResponse('Anhang nicht gefunden.', { status: 404 });
    }

    const storage = getStorage();
    // Die Anhangsliste verweist mit ?vorschau=1 auf das Vorschaubild; ohne diesen Zweig
    // lieferte der Handler dort das große Bild.
    const vorschauGewuenscht = request.nextUrl.searchParams.get('vorschau') === '1';
    const vorschau = vorschauGewuenscht && a.thumbBlobPfad ? await storage.get(a.thumbBlobPfad) : null;
    const datei = vorschau ?? await storage.get(a.blobPfad);
    if (!datei) {
      return new NextResponse('Datei in der Ablage nicht gefunden.', { status: 404 });
    }

    // Nur bekannte, im Browser harmlose Typen dürfen inline erscheinen; alles andere
    // geht als undeutbarer Bytestrom in den Download, damit kein fremdes Dokument im
    // Kontext von /intern ausgeführt wird.
    const ANZEIGBAR = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    const mime = vorschau ? 'image/webp' : (a.mime || 'application/octet-stream');
    const anzeigbar = ANZEIGBAR.includes(mime);
    // Bilder gehören inline: die Anfrage-Detailansicht zeigt sie im Rahmen an.
    // PDFs nur mit ?inline=1, sonst als Download.
    const inlineGewuenscht = request.nextUrl.searchParams.get('inline') === '1';
    const inline = anzeigbar && (mime !== 'application/pdf' || inlineGewuenscht);
    const dateiname = vorschau ? `vorschau-${a.dateiname.replace(/\.[^.]+$/, '')}.webp` : a.dateiname;
    const encodedFilename = encodeURIComponent(dateiname).replace(/['()]/g, escape);
    const disposition = inline
      ? `inline; filename="${dateiname.replace(/"/g, '')}"; filename*=UTF-8''${encodedFilename}`
      : `attachment; filename="${dateiname.replace(/"/g, '')}"; filename*=UTF-8''${encodedFilename}`;

    return new NextResponse(datei.daten as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': anzeigbar ? mime : 'application/octet-stream',
        'Content-Disposition': disposition,
        'Cache-Control': 'private, no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  }

  return new NextResponse('Endpunkt nicht gefunden.', { status: 404 });
}
