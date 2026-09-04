import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { estimateRequestSchema } from '@/lib/types';
import { verifySessionApi } from '@/lib/services/auth';
import {
  freigeben,
  legeAusKundenAnfrage,
  speichereInternAnfrage,
} from '@/lib/services/estimates';
import {
  sendeBueroHinweis,
  sendeEingangsbestaetigung,
  stelleAuftragBereit,
} from '@/lib/services/versand';
import { ausDataUrl, speichereFoto, speichereSkizze } from '@/lib/services/storage';
import { pruefeLimit } from '@/lib/services/ratelimit';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
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

  // ---------------------------------------------------------------------------
  // 1. Kunden-Modus (Öffentlicher Trichter)
  // ---------------------------------------------------------------------------
  if (payload.modus === 'kunde') {
    // Honeypot-Schutz gegen einfache Spambots
    if (payload.honig) {
      return NextResponse.json({ ok: false, fehler: 'Anfrage konnte nicht verarbeitet werden.' }, { status: 400 });
    }

    // Zeitfalle (mindestens 2 Sekunden Ausfülldauer)
    if (payload.gestartetUm && Date.now() - payload.gestartetUm < 2000) {
      return NextResponse.json({ ok: false, fehler: 'Bitte nehmen Sie sich einen Moment Zeit zum Ausfüllen.' }, { status: 400 });
    }

    // IP-Rate-Limiting
    const ip = request.headers.get('x-real-ip') ?? request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? '127.0.0.1';
    const limit = await pruefeLimit(`estimate:kunde:ip:${ip}`, 20, 10 * 60 * 1000);
    if (!limit.erlaubt) {
      return NextResponse.json(
        {
          ok: false,
          fehler: 'Zu viele Anfragen. Bitte probieren Sie es in einigen Minuten erneut oder rufen Sie uns direkt an: 06441 2039053.',
        },
        { status: 429 },
      );
    }

    try {
      const anlage = await legeAusKundenAnfrage(payload);

      // Falls der Kunde eine Eingangsbestätigung gewünscht hat, Auftrag anlegen und sofort absenden
      if (payload.kontakt.eingangsbestaetigung) {
        await stelleAuftragBereit(anlage.anfrageId, 'eingangsbestaetigung', {
          empfaenger: payload.kontakt.email,
        });
        sendeEingangsbestaetigung(anlage.anfrageId, payload.kontakt.email).catch((err) => {
          console.error('[Mail] Eingangsbestätigung fehlgeschlagen:', err);
        });
      }

      // Büro über neuen Web-Lead benachrichtigen
      sendeBueroHinweis(anlage.anfrageId).catch((err) => {
        console.error('[Mail] Büro-Hinweis fehlgeschlagen:', err);
      });

      return NextResponse.json({
        ok: true,
        modus: 'kunde',
        ksNummer: anlage.ksNummer,
        ergebnis: anlage.ergebnis,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Interner Fehler bei der Speicherung.';
      return NextResponse.json({ ok: false, fehler: msg }, { status: 500 });
    }
  }

  // ---------------------------------------------------------------------------
  // 2. Meister-Modus (Intern)
  // ---------------------------------------------------------------------------
  const session = await verifySessionApi();
  if (!session) {
    return NextResponse.json({ ok: false, fehler: 'Nicht autorisiert. Bitte anmelden.' }, { status: 401 });
  }

  try {
    const anlage = await speichereInternAnfrage(payload, session);

    // Anhänge (Skizzen & Fotos) speichern
    if (payload.skizzen && payload.skizzen.length > 0) {
      for (const skizze of payload.skizzen) {
        try {
          const { daten } = ausDataUrl(skizze.dataUrl);
          await speichereSkizze(anlage.anfrageId, daten, skizze.name, {
            breite: skizze.breite,
            hoehe: skizze.hoehe,
          });
        } catch {
          // Einzelfehler bei Skizze bricht den Vorgang nicht ab
        }
      }
    }

    if (payload.fotos && payload.fotos.length > 0) {
      for (const foto of payload.fotos) {
        try {
          const { daten } = ausDataUrl(foto.dataUrl);
          await speichereFoto(anlage.anfrageId, daten, foto.name, foto.beschreibung);
        } catch {
          // Einzelfehler bei Foto bricht den Vorgang nicht ab
        }
      }
    }

    // Aktion verarbeiten
    if (payload.aktion === 'entwurf') {
      await stelleAuftragBereit(anlage.anfrageId, 'erstkontakt', {
        empfaenger: payload.kontakt.email,
      });

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
    }

    if (payload.aktion === 'sofort') {
      const ergebnis = await freigeben(anlage.anfrageId, session, { art: 'erstkontakt', sofort: true });
      if (!ergebnis.ok) {
        return NextResponse.json({
          ok: false,
          fehler: ergebnis.fehler ?? 'Fehler beim sofortigen Versand.',
        }, { status: 422 });
      }

      return NextResponse.json({
        ok: true,
        modus: 'intern',
        anfrageId: anlage.anfrageId,
        ksNummer: anlage.ksNummer,
        status: anlage.status,
        aktion: 'sofort',
        hinweise: anlage.hinweise,
        rueckmeldung: ergebnis.rueckmeldung ?? anlage.rueckmeldung,
      });
    }

    if (payload.aktion === 'terminmail') {
      const ergebnis = await freigeben(anlage.anfrageId, session, { art: 'terminmail', sofort: true });
      if (!ergebnis.ok) {
        return NextResponse.json({
          ok: false,
          fehler: ergebnis.fehler ?? 'Fehler beim Senden der Terminmail.',
        }, { status: 422 });
      }

      return NextResponse.json({
        ok: true,
        modus: 'intern',
        anfrageId: anlage.anfrageId,
        ksNummer: anlage.ksNummer,
        status: anlage.status,
        aktion: 'terminmail',
        hinweise: anlage.hinweise,
        rueckmeldung: ergebnis.rueckmeldung ?? anlage.rueckmeldung,
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
    const msg = err instanceof Error ? err.message : 'Interner Fehler bei der Verarbeitung.';
    return NextResponse.json({ ok: false, fehler: msg }, { status: 500 });
  }
}
