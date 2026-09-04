'use server';

import { eq } from 'drizzle-orm';
import { getDb } from '@/db/client';
import { anfrage as anfrageTabelle } from '@/db/schema';
import { verifySession } from '@/lib/services/auth';
import { freigeben, speichereInternAnfrage } from '@/lib/services/estimates';
import { schreibeEreignis } from '@/lib/services/statusmaschine';
import type { DispatchBefehl } from '@/lib/services/dispatch-parser';
import { ladeKalkulationsdaten } from '@/lib/services/kalkulationsdaten';
import { ladeVorgang, fehlendeAngaben } from '@/lib/services/dokument-eingabe';
import { euro } from '@/lib/services/calculation';

export type DispatchErgebnis = {
  ok: boolean;
  ksNummer?: string;
  anfrageId?: string;
  rueckmeldung: string;
  fehler?: string;
};

export async function fuehreDispatchAus(befehl: DispatchBefehl): Promise<DispatchErgebnis> {
  const session = await verifySession();
  const db = await getDb();

  // 1. Freigeben (Versand 18:00)
  if (befehl.art === 'freigeben') {
    const anfragen = await db.select().from(anfrageTabelle).where(eq(anfrageTabelle.ksNummer, befehl.ksNummer)).limit(1);
    const a = anfragen[0];
    if (!a) return { ok: false, rueckmeldung: '', fehler: `Vorgang ${befehl.ksNummer} wurde nicht gefunden.` };

    const res = await freigeben(a.id, session, { art: 'erstkontakt', sofort: false });
    if (!res.ok) return { ok: false, rueckmeldung: '', fehler: res.fehler };

    return {
      ok: true,
      ksNummer: a.ksNummer,
      anfrageId: a.id,
      rueckmeldung: res.rueckmeldung || `${a.ksNummer} ist freigegeben. Versand ab 18:00.`,
    };
  }

  // 2. Freigeben und sofort senden
  if (befehl.art === 'freigeben_sofort') {
    const anfragen = await db.select().from(anfrageTabelle).where(eq(anfrageTabelle.ksNummer, befehl.ksNummer)).limit(1);
    const a = anfragen[0];
    if (!a) return { ok: false, rueckmeldung: '', fehler: `Vorgang ${befehl.ksNummer} wurde nicht gefunden.` };

    const res = await freigeben(a.id, session, { art: 'erstkontakt', sofort: true });
    if (!res.ok) return { ok: false, rueckmeldung: '', fehler: res.fehler };

    return {
      ok: true,
      ksNummer: a.ksNummer,
      anfrageId: a.id,
      rueckmeldung: `${a.ksNummer} wurde freigegeben und sofort an ${a.objektAdresse || 'den Kunden'} versendet.`,
    };
  }

  // 3. Notizanpassung
  if (befehl.art === 'anpassung') {
    const anfragen = await db.select().from(anfrageTabelle).where(eq(anfrageTabelle.ksNummer, befehl.ksNummer)).limit(1);
    const a = anfragen[0];
    if (!a) return { ok: false, rueckmeldung: '', fehler: `Vorgang ${befehl.ksNummer} wurde nicht gefunden.` };

    const aktuelleNotiz = a.interneNotizen ? `${a.interneNotizen}\n${befehl.text}` : befehl.text;
    await db.update(anfrageTabelle).set({
      interneNotizen: aktuelleNotiz,
      bemerkung: 'Anpassung via Dispatch',
    }).where(eq(anfrageTabelle.id, a.id));

    await schreibeEreignis({
      anfrageId: a.id,
      typ: 'dispatch:anpassung',
      benutzerId: session.benutzerId,
      payload: { notiz: befehl.text },
    });

    return {
      ok: true,
      ksNummer: a.ksNummer,
      anfrageId: a.id,
      rueckmeldung: `${a.ksNummer}: Notiz hinzugefügt.`,
    };
  }

  // 4. Neuanlage
  if (befehl.art === 'neuanlage') {
    const { vorlagen } = await ladeKalkulationsdaten();
    // Positionen aus den erkannten Vorlagen zusammenstellen
    const positionen = befehl.vorlageIds.flatMap((vId) => {
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

    const text = `${res.ksNummer} ${befehl.nachname}, ${befehl.vorhabenKurz}, ${spanneBrutto}, liegt in ${res.status}.${fehltText}`;

    return {
      ok: true,
      ksNummer: res.ksNummer,
      anfrageId: res.anfrageId,
      rueckmeldung: text,
    };
  }

  return { ok: false, rueckmeldung: '', fehler: 'Unbekannter Befehl.' };
}
