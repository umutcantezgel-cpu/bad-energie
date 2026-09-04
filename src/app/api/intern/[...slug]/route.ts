import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { randomUUID } from 'node:crypto';
import { and, eq, gte, inArray, isNull, sql } from 'drizzle-orm';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
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
  vorbehalt,
} from '@/db/schema';
import {
  abmelden as authAbmelden,
  anmelden as authAnmelden,
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
  speichereInternAnfrage,
  stornieren as stornierenService,
} from '@/lib/services/estimates';
import {
  ladeEinstellungen,
  ladeFoerderRegeln,
  ladeKalkulationsdaten as ladeKalkulationsdatenService,
  ladeMatrix,
  type Einstellungen,
} from '@/lib/services/kalkulationsdaten';
import { pinGueltig, pinHashen } from '@/lib/services/pin';
import { pruefeLimit } from '@/lib/services/ratelimit';
import { schreibeEreignis } from '@/lib/services/statusmaschine';
import { getStorage, speichereFoto } from '@/lib/services/storage';
import { euro } from '@/lib/services/calculation';
import type { DispatchBefehl } from '@/lib/services/dispatch-parser';
import type { AnfrageStatus, FoerderRegeln, Gewerk, InternAnfrage, Rolle } from '@/lib/types';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> },
): Promise<NextResponse> {
  const { slug } = await params;

  // -------------------------------------------------------------------------
  // Öffentliche Endpunkte (ohne vorherige Sitzung)
  // -------------------------------------------------------------------------

  // 1. PIN-Login: /api/intern/anmelden
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

  // 2. Termin-Bestätigung Kunde: /api/intern/termin-bestaetigen
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

      await loeseReservierungen(a.id);
      await schreibeEreignis({
        anfrageId: a.id,
        typ: 'termin:bestaetigt',
        payload: { fensterId, alternativ: alternativ.slice(0, 300) },
      });

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

  // 3. Abmelden: /api/intern/abmelden
  if (slug.length === 1 && slug[0] === 'abmelden') {
    await authAbmelden();
    return NextResponse.json({ ok: true });
  }

  // 4. Vercel Blob Token: /api/intern/uploads/token
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

  // 5. Anhänge: /api/intern/anhaenge
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
      return NextResponse.json({ ok: false, fehler: (err as Error).message }, { status: 500 });
    }
  }

  // 6. Entwurf speichern: /api/intern/entwurf
  if (slug.length === 1 && slug[0] === 'entwurf') {
    try {
      const input = (await request.json()) as InternAnfrage;
      const anlage = await speichereInternAnfrage(input, session);
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
      return NextResponse.json({ ok: false, fehler: (err as Error).message }, { status: 500 });
    }
  }

  // 7. Freigabe: /api/intern/freigeben
  if (slug.length === 1 && slug[0] === 'freigeben') {
    try {
      const { anfrageId, sofort } = await request.json();
      const ergebnis = await freigebenService(anfrageId, session, { sofort: Boolean(sofort) });
      return NextResponse.json(ergebnis);
    } catch (err) {
      return NextResponse.json({ ok: false, fehler: (err as Error).message }, { status: 500 });
    }
  }

  // 8. Stornieren: /api/intern/stornieren
  if (slug.length === 1 && slug[0] === 'stornieren') {
    try {
      const { anfrageId } = await request.json();
      const ergebnis = await stornierenService(anfrageId, session);
      return NextResponse.json(ergebnis);
    } catch (err) {
      return NextResponse.json({ ok: false, fehler: (err as Error).message }, { status: 500 });
    }
  }

  // 9. Richtpreis-Matrix Zeile: /api/intern/matrix/zeile
  if (slug.length === 2 && slug[0] === 'matrix' && slug[1] === 'zeile') {
    if (session.rolle !== 'chef') {
      return NextResponse.json({ ok: false, fehler: 'Nur der Chef darf Richtpreise ändern.' }, { status: 403 });
    }
    try {
      const { nr, von, bis, einheit, hinweis } = await request.json();
      const db = await getDb();
      await db.update(richtpreis).set({
        von: von !== null && !isNaN(von) ? Math.round(von) : null,
        bis: bis !== null && !isNaN(bis) ? Math.round(bis) : null,
        einheit,
        hinweis: (hinweis || '').trim(),
        geaendertAm: new Date(),
        geaendertVon: session.name,
      }).where(eq(richtpreis.nr, nr));
      return NextResponse.json({ ok: true });
    } catch (err) {
      return NextResponse.json({ ok: false, fehler: (err as Error).message }, { status: 500 });
    }
  }

  // 10. Förderregeln: /api/intern/matrix/foerderregeln
  if (slug.length === 2 && slug[0] === 'matrix' && slug[1] === 'foerderregeln') {
    if (session.rolle !== 'chef') {
      return NextResponse.json({ ok: false, fehler: 'Nur der Chef darf Förderregeln ändern.' }, { status: 403 });
    }
    try {
      const regeln = (await request.json()) as FoerderRegeln;
      const db = await getDb();
      await db.update(foerderRegel).set({
        grund: regeln.grund,
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

  // 11. Vorbehalt toggle: /api/intern/matrix/vorbehalt-toggle
  if (slug.length === 2 && slug[0] === 'matrix' && slug[1] === 'vorbehalt-toggle') {
    try {
      const { id, aktiv } = await request.json();
      const db = await getDb();
      await db.update(vorbehalt).set({ aktiv }).where(eq(vorbehalt.id, id));
      return NextResponse.json({ ok: true });
    } catch (err) {
      return NextResponse.json({ ok: false, fehler: (err as Error).message }, { status: 500 });
    }
  }

  // 12. Vorbehalt neu: /api/intern/matrix/vorbehalt-neu
  if (slug.length === 2 && slug[0] === 'matrix' && slug[1] === 'vorbehalt-neu') {
    try {
      const { text, gewerk } = await request.json();
      const db = await getDb();
      await db.insert(vorbehalt).values({
        text: String(text || '').trim(),
        gewerk: (gewerk as Gewerk) || null,
        aktiv: true,
      });
      return NextResponse.json({ ok: true });
    } catch (err) {
      return NextResponse.json({ ok: false, fehler: (err as Error).message }, { status: 500 });
    }
  }

  // 13. Mobile Dispatch: /api/intern/dispatch
  if (slug.length === 1 && slug[0] === 'dispatch') {
    try {
      const befehl = (await request.json()) as DispatchBefehl;
      const db = await getDb();

      if (befehl.art === 'freigeben' || befehl.art === 'freigeben_sofort') {
        const sofort = befehl.art === 'freigeben_sofort';
        const anfragen = await db.select().from(anfrageTabelle).where(eq(anfrageTabelle.ksNummer, befehl.ksNummer)).limit(1);
        const a = anfragen[0];
        if (!a) return NextResponse.json({ ok: false, rueckmeldung: '', fehler: `Vorgang ${befehl.ksNummer} wurde nicht gefunden.` });

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

        const aktuelleNotiz = a.interneNotizen ? `${a.interneNotizen}\n${befehl.text}` : befehl.text;
        await db.update(anfrageTabelle).set({ interneNotizen: aktuelleNotiz, bemerkung: 'Anpassung via Dispatch' }).where(eq(anfrageTabelle.id, a.id));
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
            nachname: befehl.nachname || 'Interessent',
            email: befehl.email || 'dispatch@bad-energie.de',
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
          dringlichkeit: 'unklar',
          vorhabenKurz: befehl.vorhabenKurz,
          positionen,
          kalkulation: {},
          foerderung: { aktiv: false, wohneinheiten: 1, selbstBewohnt: true, altOelOderGas: true, einkommenUnterGrenze: false, natuerlichesKaeltemittel: true },
          persoenlicherSatz: befehl.persoenlicherSatz,
          annahmen: [],
          vorbehalte: [],
          ausfuehrungSatz: '',
          terminfensterIds: [],
          notizen: { etage: null, aufzug: null, montagehindernisse: '', leitungswege: '', intern: 'Erfasst über Dispatch' },
          skizzen: [],
          fotos: [],
        }, session);

        const daten = await ladeVorgang(res.anfrageId);
        const fehlt = daten ? fehlendeAngaben(daten, res.ergebnis) : [];
        const spanneBrutto = res.ergebnis.bruttoBis > 0
          ? `${euro(res.ergebnis.bruttoVon)} bis ${euro(res.ergebnis.bruttoBis)} € brutto`
          : 'noch ohne Spanne';
        const fehltText = fehlt.length > 0 ? ` Fehlt: ${fehlt.join(', ')}.` : '';

        return NextResponse.json({
          ok: true,
          ksNummer: res.ksNummer,
          anfrageId: res.anfrageId,
          rueckmeldung: `${res.ksNummer} ${befehl.nachname}, ${befehl.vorhabenKurz}, ${spanneBrutto}, liegt in ${res.status}.${fehltText}`,
        });
      }

      return NextResponse.json({ ok: false, rueckmeldung: '', fehler: 'Unbekannter Befehl.' }, { status: 400 });
    } catch (err) {
      return NextResponse.json({ ok: false, rueckmeldung: '', fehler: (err as Error).message }, { status: 500 });
    }
  }

  // 14. Benutzer anlegen: /api/intern/benutzer/neu
  if (slug.length === 2 && slug[0] === 'benutzer' && slug[1] === 'neu') {
    if (session.rolle !== 'chef') {
      return NextResponse.json({ ok: false, fehler: 'Nur der Chef darf Benutzer anlegen.' }, { status: 403 });
    }
    try {
      const { name, email, pin, rolle, funktion = 'Mitarbeiter' } = await request.json();
      if (!pinGueltig(pin)) return NextResponse.json({ ok: false, fehler: 'Die PIN muss aus 6 bis 8 Ziffern bestehen.' });

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

  // 15. PIN zurücksetzen: /api/intern/benutzer/pin
  if (slug.length === 2 && slug[0] === 'benutzer' && slug[1] === 'pin') {
    if (session.rolle !== 'chef') {
      return NextResponse.json({ ok: false, fehler: 'Nur der Chef darf PINs zurücksetzen.' }, { status: 403 });
    }
    try {
      const { benutzerId, neuePin } = await request.json();
      if (!pinGueltig(neuePin)) return NextResponse.json({ ok: false, fehler: 'Die PIN muss aus 6 bis 8 Ziffern bestehen.' });

      const db = await getDb();
      const pHash = pinHashen(neuePin);
      await db.update(benutzer).set({ pinHash: pHash, fehlversuche: 0, gesperrtBis: null }).where(eq(benutzer.id, benutzerId));
      return NextResponse.json({ ok: true });
    } catch (err) {
      return NextResponse.json({ ok: false, fehler: (err as Error).message }, { status: 500 });
    }
  }

  // 16. Benutzer aktiv/inaktiv schalten: /api/intern/benutzer/toggle
  if (slug.length === 2 && slug[0] === 'benutzer' && slug[1] === 'toggle') {
    if (session.rolle !== 'chef') {
      return NextResponse.json({ ok: false, fehler: 'Nur der Chef darf Benutzer aktivieren/deaktivieren.' }, { status: 403 });
    }
    try {
      const { benutzerId, aktiv } = await request.json();
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

  // 17. Terminfenster neu: /api/intern/termine/neu
  if (slug.length === 2 && slug[0] === 'termine' && slug[1] === 'neu') {
    try {
      const { beschriftung, beginnIso, endeIso } = await request.json();
      if (!beschriftung || !String(beschriftung).trim()) {
        return NextResponse.json({ ok: false, fehler: 'Beschriftung darf nicht leer sein.' });
      }
      const db = await getDb();
      await db.insert(terminfenster).values({
        id: randomUUID(),
        beschriftung: String(beschriftung).trim(),
        beginn: new Date(beginnIso),
        ende: new Date(endeIso),
      });
      return NextResponse.json({ ok: true });
    } catch (err) {
      return NextResponse.json({ ok: false, fehler: (err as Error).message }, { status: 500 });
    }
  }

  // 18. Terminfenster löschen: /api/intern/termine/loeschen
  if (slug.length === 2 && slug[0] === 'termine' && slug[1] === 'loeschen') {
    try {
      const { id } = await request.json();
      const db = await getDb();
      await db.delete(terminfensterReservierung).where(eq(terminfensterReservierung.terminfensterId, id));
      await db.delete(terminfenster).where(eq(terminfenster.id, id));
      return NextResponse.json({ ok: true });
    } catch (err) {
      return NextResponse.json({ ok: false, fehler: (err as Error).message }, { status: 500 });
    }
  }

  // 19. Einstellungen speichern: /api/intern/einstellungen
  if (slug.length === 1 && slug[0] === 'einstellungen') {
    if (session.rolle !== 'chef') {
      return NextResponse.json({ ok: false, fehler: 'Nur der Chef darf Betriebseinstellungen ändern.' }, { status: 403 });
    }
    try {
      const werte = (await request.json()) as Einstellungen;
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

  // 20. Anfrage löschen: /api/intern/anfragen/[id]/loeschen
  if (slug.length === 3 && slug[0] === 'anfragen' && slug[2] === 'loeschen') {
    try {
      const anfrageId = slug[1];
      const db = await getDb();
      const anfragen = await db.select().from(anfrageTabelle).where(eq(anfrageTabelle.id, anfrageId)).limit(1);
      const a = anfragen[0];
      if (!a) return NextResponse.json({ ok: false, fehler: 'Anfrage nicht gefunden.' }, { status: 404 });

      if (session.rolle === 'bauleiter' && a.bearbeiterId && a.bearbeiterId !== session.benutzerId) {
        return NextResponse.json({ ok: false, fehler: 'Keine Berechtigung zum Löschen dieser Anfrage.' }, { status: 403 });
      }

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

  // 21. Anfrage Status ändern: /api/intern/anfragen/[id]/status
  if (slug.length === 3 && slug[0] === 'anfragen' && slug[2] === 'status') {
    try {
      const anfrageId = slug[1];
      const { status: neuerStatus, grund = '' } = await request.json();
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

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> },
): Promise<NextResponse> {
  const { slug } = await params;
  const session = await verifySessionApi();
  if (!session) {
    return new NextResponse('Nicht autorisiert.', { status: 401 });
  }

  // 1. Kalkulationsdaten: /api/intern/kalkulationsdaten
  if (slug.length === 1 && slug[0] === 'kalkulationsdaten') {
    const daten = await ladeKalkulationsdatenService();
    return NextResponse.json(daten);
  }

  // 2. Terminfenster: /api/intern/terminfenster
  if (slug.length === 1 && slug[0] === 'terminfenster') {
    const fenster = await ladeTerminfensterService();
    return NextResponse.json(fenster);
  }

  // 3. Entwürfe: /api/intern/entwuerfe
  if (slug.length === 1 && slug[0] === 'entwuerfe') {
    const karten = await ladeEntwuerfeService(session);
    return NextResponse.json(karten);
  }

  // 4. Einzelne Anfrage: /api/intern/anfragen/[id]
  if (slug.length === 2 && slug[0] === 'anfragen') {
    const dto = await ladeInternAnfrage(slug[1]);
    if (!dto) return NextResponse.json({ fehler: 'Anfrage nicht gefunden.' }, { status: 404 });
    return NextResponse.json(dto);
  }

  // 5. DSGVO Auskunft JSON: /api/intern/anfragen/[id]/auskunft
  if (slug.length === 3 && slug[0] === 'anfragen' && slug[2] === 'auskunft') {
    const anfrageId = slug[1];
    const dto = await ladeInternAnfrage(anfrageId);
    if (!dto) return new NextResponse('Anfrage nicht gefunden.', { status: 404 });
    if (session.rolle === 'bauleiter' && dto.bearbeiter && dto.bearbeiter !== session.name) {
      return new NextResponse('Keine Berechtigung.', { status: 403 });
    }
    return NextResponse.json(dto);
  }

  // 6. CSV-Export: /api/intern/anfragen/[id]/csv
  if (slug.length === 3 && slug[0] === 'anfragen' && slug[2] === 'csv') {
    const anfrageId = slug[1];
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

  // 7. Datei-Download Anhang: /api/intern/anfragen/[id]/anhaenge/[anhangId]
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
