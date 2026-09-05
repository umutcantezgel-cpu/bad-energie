'use client';
/**
 * Hauptkomponente des Konfigurators.
 *
 * Kunden-Modus: datengetriebene Journey mit Kacheln, Reglern, Kontaktschritt und
 * Ergebniskarte. Betraege erscheinen ausschliesslich als gerundete Bruttospanne
 * aus der Serverantwort; interne Faktoren, Zeilenpreise und Notizen erreichen
 * diese Oberflaeche nie.
 *
 * Intern-Modus: die Komponente reicht an den Meister-Modus weiter.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { COMPANY_DATA } from '@/config/company';
import {
  JOURNEYS,
  eignung as berechneEignung,
  leererZustand,
  leseWert,
  pruefeAlle,
  pruefeSchritt,
  schreibeWert,
  sichtbareFragen,
  type Eignung,
  type Frage,
  type JourneyId,
  type JourneyZustand,
  type OptionWert,
} from '@/lib/journeys';
import { kontaktSchema, type EstimateResponse, type InternAnfrageDTO, type OeffentlicheErgebnisDTO, type Quelle } from '@/lib/types';
import ErgebnisKarte, { type AntwortChip } from './ErgebnisKarte';
import JourneyStep from './JourneyStep';
import KontaktSchritt, { LEERER_KONTAKT, type KontaktFelder } from './KontaktSchritt';
import PinSheet from './PinSheet';
import Stepper from './Stepper';
import {
  AUSSTELLUNGSPREIS_LABEL,
  ausstellungsbad,
  gewerkStil,
  ladeStand,
  loescheStand,
  speichereStand,
  wischRichtung,
  zahl,
  type Ausstellungsbad,
} from './konfigurator-utils';
import { euro } from '@/lib/services/calculation';

export type TouchConfiguratorProps = {
  modus?: 'kunde' | 'intern';
  journey?: JourneyId;
  quelle?: Quelle;
  /** Kompakter Einstieg: nur Ueberschrift und erster Schritt, klappt bei Interaktion auf. */
  kompakt?: boolean;
  anfrageId?: string;
  initial?: InternAnfrageDTO | null;
};

type Absendezustand =
  | { art: 'ruhe' }
  | { art: 'laeuft' }
  | { art: 'fehler'; text: string; telefon: boolean }
  | { art: 'erfolg'; ksNummer: string; ergebnis: OeffentlicheErgebnisDTO };

const LANGER_DRUCK_MS = 1500;

function Skeleton() {
  return (
    <div className="space-y-6" aria-hidden="true">
      <div className="h-2 w-full rounded-full bg-slate-200" />
      <div className="h-9 w-2/3 rounded-2xl bg-slate-200" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-28 rounded-3xl bg-slate-200/70" />
        ))}
      </div>
    </div>
  );
}

export default function TouchConfigurator({
  journey: journeyId = 'bad',
  quelle,
  kompakt = false,
}: TouchConfiguratorProps) {
  return <KundenModus journeyId={journeyId} quelle={quelle} kompakt={kompakt} />;
}

function KundenModus({
  journeyId,
  quelle,
  kompakt,
}: {
  journeyId: JourneyId;
  quelle?: Quelle;
  kompakt: boolean;
}) {
  const journey = JOURNEYS[journeyId];
  const anzahl = journey.schritte.length;
  const wenigerBewegung = useReducedMotion();

  const [bereit, setBereit] = useState(false);
  const [ausgeklappt, setAusgeklappt] = useState(!kompakt);
  const [wiederaufnahme, setWiederaufnahme] = useState(false);
  const [schritt, setSchritt] = useState(0);
  const [zustand, setZustand] = useState<JourneyZustand>(() => leererZustand(journey));
  const [fehler, setFehler] = useState<Record<string, string>>({});
  const [kontakt, setKontakt] = useState<KontaktFelder>(LEERER_KONTAKT);
  const [wunschtermine, setWunschtermine] = useState<[string, string]>(['', '']);
  const [absenden, setAbsenden] = useState<Absendezustand>({ art: 'ruhe' });
  const [pinOffen, setPinOffen] = useState(false);

  const honig = useRef('');
  const gestartetUm = useRef<number>(0);
  const bereich = useRef<HTMLDivElement>(null);
  const druckTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wischStart = useRef<{ x: number; y: number } | null>(null);

  // Erststart: gespeicherten Stand aufnehmen, Zeitfalle setzen.
  useEffect(() => {
    gestartetUm.current = Date.now();
    queueMicrotask(() => {
      const stand = ladeStand(journeyId);
      if (stand) {
        // Aeltere Staende kennen neue Fragen nicht: Standardantworten untermischen,
        // damit der Zustand gegen das aktuelle Schema gueltig bleibt.
        setZustand({
          ...stand.zustand,
          antworten: { ...journey.standardAntworten, ...stand.zustand.antworten },
        });
        setSchritt(Math.min(stand.schritt, anzahl - 2));
        setWiederaufnahme(true);
        setAusgeklappt(true);
      }
      setBereit(true);
    });
  }, [journey, journeyId, anzahl]);

  // Nur anonyme Antworten werden gespeichert, nie der Kontaktschritt.
  useEffect(() => {
    if (!bereit || absenden.art === 'erfolg') return;
    speichereStand(journeyId, schritt, zustand);
  }, [bereit, journeyId, schritt, zustand, absenden.art]);

  const aktuellerSchritt = journey.schritte[schritt];
  const istKontakt = aktuellerSchritt.art === 'kontakt';

  const bad: Ausstellungsbad | null = useMemo(() => {
    if (journeyId !== 'bad') return null;
    return ausstellungsbad(String(zustand.antworten.ausstattung ?? ''), Number(zustand.antworten.qm ?? 7));
  }, [journeyId, zustand.antworten.ausstattung, zustand.antworten.qm]);

  const eignungsErgebnis: Eignung | null = useMemo(
    () => (journeyId === 'waermepumpe' ? berechneEignung(zustand.antworten) : null),
    [journeyId, zustand.antworten],
  );

  const chips: AntwortChip[] = useMemo(() => baueChips(journeyId, zustand), [journeyId, zustand]);

  const aendere = useCallback((frage: Frage, wert: unknown) => {
    setAusgeklappt(true);
    setZustand((alt) => schreibeWert(alt, frage, wert));
    setFehler((alt) => {
      if (!alt[frage.id]) return alt;
      const neu = { ...alt };
      delete neu[frage.id];
      return neu;
    });
  }, []);

  const gehe = useCallback(
    (richtung: 1 | -1) => {
      if (richtung === -1) {
        setFehler({});
        setSchritt((s) => Math.max(0, s - 1));
        return;
      }
      const meldungen = pruefeSchritt(journey, schritt, zustand);
      if (Object.keys(meldungen).length > 0) {
        setFehler(meldungen);
        bereich.current?.scrollIntoView({ behavior: wenigerBewegung ? 'auto' : 'smooth', block: 'start' });
        return;
      }
      setFehler({});
      setSchritt((s) => Math.min(anzahl - 1, s + 1));
      bereich.current?.scrollIntoView({ behavior: wenigerBewegung ? 'auto' : 'smooth', block: 'start' });
    },
    [anzahl, journey, schritt, wenigerBewegung, zustand],
  );

  const vonVorn = useCallback(() => {
    loescheStand(journeyId);
    setZustand(leererZustand(journey));
    setKontakt(LEERER_KONTAKT);
    setWunschtermine(['', '']);
    setSchritt(0);
    setFehler({});
    setWiederaufnahme(false);
    setAbsenden({ art: 'ruhe' });
    gestartetUm.current = Date.now();
  }, [journey, journeyId]);

  const senden = useCallback(async () => {
    const offen = pruefeAlle(journey, zustand);
    if (offen) {
      setSchritt(offen.schrittIndex);
      setFehler(offen.fehler);
      return;
    }

    const geprueft = kontaktSchema.safeParse({ ...kontakt, strasse: '', plzOrt: '' });
    if (!geprueft.success) {
      const meldungen: Record<string, string> = {};
      for (const issue of geprueft.error.issues) {
        const feld = String(issue.path[0] ?? '');
        if (feld === 'nachname') meldungen.nachname = 'Bitte nennen Sie Ihren Nachnamen.';
        else if (feld === 'email') meldungen.email = 'Bitte prüfen Sie Ihre E-Mail-Adresse.';
        else if (feld === 'telefon') meldungen.telefon = 'Bitte prüfen Sie Ihre Telefonnummer.';
        else if (feld === 'kenntnisnahme') meldungen.kenntnisnahme = 'Bitte bestätigen Sie die Kenntnisnahme.';
      }
      setFehler(meldungen);
      return;
    }

    setAbsenden({ art: 'laeuft' });
    try {
      const antwort = await fetch('/api/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modus: 'kunde',
          quelle: quelle ?? journey.quelle,
          antworten: zustand.antworten,
          freitext: '',
          objekt: zustand.objekt,
          dringlichkeit: zustand.dringlichkeit,
          wunschtermine: wunschtermine.filter((t) => t.trim() !== ''),
          kontakt: geprueft.data,
          honig: honig.current,
          gestartetUm: gestartetUm.current,
        }),
      });

      if (antwort.status === 429) {
        setAbsenden({
          art: 'fehler',
          text: `Es sind gerade sehr viele Anfragen unterwegs. Bitte versuchen Sie es in einigen Minuten noch einmal oder rufen Sie uns an unter ${COMPANY_DATA.contact.phone}.`,
          telefon: true,
        });
        return;
      }

      const daten = (await antwort.json()) as EstimateResponse;
      if (!antwort.ok || !daten.ok || daten.modus !== 'kunde') {
        const text = !daten.ok && daten.fehler ? daten.fehler : 'Das Absenden hat nicht geklappt.';
        setAbsenden({ art: 'fehler', text, telefon: true });
        return;
      }

      loescheStand(journeyId);
      setAbsenden({ art: 'erfolg', ksNummer: daten.ksNummer, ergebnis: daten.ergebnis });
    } catch {
      setAbsenden({
        art: 'fehler',
        text: 'Die Verbindung ist abgebrochen. Ihre Angaben sind erhalten geblieben.',
        telefon: true,
      });
    }
  }, [journey, journeyId, kontakt, quelle, wunschtermine, zustand]);

  // Langer Druck auf das Signet oeffnet die Anmeldung fuer Mitarbeitende.
  const druckStart = () => {
    druckTimer.current = setTimeout(() => setPinOffen(true), LANGER_DRUCK_MS);
  };
  const druckEnde = () => {
    if (druckTimer.current) clearTimeout(druckTimer.current);
    druckTimer.current = null;
  };
  useEffect(() => () => druckEnde(), []);

  if (!bereit) {
    return (
      <div className="modul" style={gewerkStil(journey.gewerk)}>
        <Skeleton />
      </div>
    );
  }

  if (absenden.art === 'erfolg') {
    return (
      <div className="modul" style={gewerkStil(journey.gewerk)}>
        <ErgebnisKarte
          ksNummer={absenden.ksNummer}
          ergebnis={absenden.ergebnis}
          zusage={journey.zusage}
          chips={chips}
          bad={bad}
          eignung={eignungsErgebnis}
          onSpringeZuSchritt={(index) => {
            setAbsenden({ art: 'ruhe' });
            setSchritt(index);
          }}
        />
        <div className="mt-8 text-center">
          <button type="button" onClick={vonVorn} className="fokus-ring font-bold underline" style={{ color: 'var(--modul-blau)' }}>
            Von vorn beginnen
          </button>
        </div>
      </div>
    );
  }

  const nurErsterSchritt = kompakt && !ausgeklappt;

  return (
    <div
      ref={bereich}
      className="modul relative"
      style={gewerkStil(journey.gewerk)}
      onPointerDown={(e) => {
        wischStart.current = { x: e.clientX, y: e.clientY };
      }}
      onPointerUp={(e) => {
        const start = wischStart.current;
        wischStart.current = null;
        if (!start || nurErsterSchritt) return;
        const richtung = wischRichtung(e.clientX - start.x, e.clientY - start.y);
        if (richtung === 'vor') gehe(1);
        if (richtung === 'zurueck') gehe(-1);
      }}
    >
      {/* Kopf mit Signet (langer Druck fuehrt zur Anmeldung fuer Mitarbeitende) */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="font-black tracking-tight text-slate-900" style={{ fontSize: 'var(--font-size-2xl)' }}>
            {journey.ueberschrift}
          </h2>
          <p className="mt-1 max-w-2xl text-slate-600" style={{ fontSize: 'var(--font-size-base)' }}>
            {journey.unterzeile}
          </p>
        </div>
        <span
          role="img"
          aria-label="Signet Bad und Energie"
          onPointerDown={druckStart}
          onPointerUp={druckEnde}
          onPointerLeave={druckEnde}
          onPointerCancel={druckEnde}
          onContextMenu={(e) => e.preventDefault()}
          className="mt-1 flex h-9 w-9 shrink-0 select-none items-center justify-center rounded-xl font-black text-white"
          style={{ background: 'var(--modul-blau)', touchAction: 'manipulation', fontSize: 'var(--font-size-sm)' }}
        >
          BE
        </span>
      </div>

      {wiederaufnahme ? (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl p-4" style={{ background: 'var(--gewerk-tint)' }}>
          <p className="font-semibold text-slate-800" style={{ fontSize: 'var(--font-size-base)' }}>
            Wir haben Ihre Angaben behalten.
          </p>
          <button type="button" onClick={vonVorn} className="fokus-ring font-bold underline" style={{ color: 'var(--modul-blau)' }}>
            Von vorn beginnen
          </button>
        </div>
      ) : null}

      {!nurErsterSchritt ? (
        <div className="mb-8">
          <Stepper schritt={schritt} anzahl={anzahl} titel={aktuellerSchritt.titel} />
        </div>
      ) : null}

      {/*
        Bewusst ohne AnimatePresence: Der neue Schritt darf nie darauf warten, dass eine
        Ausblend-Animation endet. Pausiert der Browser die Animationsschleife (verdeckter
        Tab, Energiesparmodus), bliebe der Konfigurator sonst auf dem alten Schritt stehen.
      */}
      <div>
        <motion.div
          key={schritt}
          initial={wenigerBewegung ? false : { opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: wenigerBewegung ? 0 : 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {istKontakt ? (
            <div className="space-y-8">
              <ErgebnisVorschau journey={journeyId} bad={bad} eignung={eignungsErgebnis} />
              <KontaktSchritt
                kontakt={kontakt}
                wunschtermine={wunschtermine}
                fehler={fehler}
                onKontakt={setKontakt}
                onWunschtermine={setWunschtermine}
              />
            </div>
          ) : (
            <JourneyStep
              journey={journey}
              schritt={aktuellerSchritt}
              zustand={zustand}
              fehler={fehler}
              gewerk={journey.gewerk}
              zusatzFuerOption={(frage, wert) => zusatzAusstellungspreis(journeyId, frage, wert, Number(zustand.antworten.qm ?? 7))}
              onAendern={aendere}
            />
          )}
        </motion.div>
      </div>

      {/* Honigtopf gegen Automaten: sichtbar leer, fuer Hilfsmittel unsichtbar. */}
      <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, overflow: 'hidden' }}>
        <label htmlFor="honig">Bitte nicht ausfüllen</label>
        <input id="honig" name="honig" type="text" tabIndex={-1} autoComplete="off" onChange={(e) => { honig.current = e.target.value; }} />
      </div>

      {absenden.art === 'fehler' ? (
        <div role="alert" className="mt-8 rounded-2xl p-4" style={{ background: 'var(--color-error-tint)', border: '1px solid var(--color-error)' }}>
          <p className="font-bold" style={{ color: 'var(--color-error)', fontSize: 'var(--font-size-base)' }}>
            {absenden.text}
          </p>
          {absenden.telefon ? (
            <a href={`tel:${COMPANY_DATA.contact.phoneLink}`} className="fokus-ring mt-2 inline-block font-bold underline" style={{ color: 'var(--modul-blau)' }}>
              {COMPANY_DATA.contact.phone}
            </a>
          ) : null}
        </div>
      ) : null}

      {nurErsterSchritt ? (
        <div className="mt-8">
          <button
            type="button"
            onClick={() => setAusgeklappt(true)}
            className="fokus-ring w-full rounded-full px-6 py-4 font-bold text-white sm:w-auto"
            style={{ background: 'var(--color-button-primary)', minHeight: '52px', fontSize: 'var(--font-size-base)' }}
          >
            Weiter zu den nächsten Fragen
          </button>
        </div>
      ) : (
        <div className="glass-bar-dark sticky bottom-0 z-20 mt-10 flex flex-wrap items-center justify-between gap-3 rounded-t-3xl px-4 py-3 sm:px-6">
          <p className="font-semibold" style={{ fontSize: 'var(--font-size-sm)' }}>
            Schritt {schritt + 1} von {anzahl}
          </p>
          <div className="flex flex-1 justify-end gap-3">
            <button
              type="button"
              onClick={() => gehe(-1)}
              disabled={schritt === 0}
              className="fokus-ring rounded-full border border-white/40 px-5 py-3 font-bold text-white disabled:opacity-40"
              style={{ minHeight: '48px', fontSize: 'var(--font-size-base)' }}
            >
              Zurück
            </button>
            {istKontakt ? (
              <button
                type="button"
                onClick={senden}
                disabled={absenden.art === 'laeuft'}
                className="fokus-ring rounded-full px-6 py-3 font-bold text-white disabled:opacity-60"
                style={{ background: 'var(--color-button-primary)', minHeight: '48px', fontSize: 'var(--font-size-base)' }}
              >
                {absenden.art === 'laeuft' ? 'Wird gesendet …' : 'Kostenschätzung anfordern'}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => gehe(1)}
                className="fokus-ring rounded-full px-6 py-3 font-bold text-white"
                style={{ background: 'var(--color-button-primary)', minHeight: '48px', fontSize: 'var(--font-size-base)' }}
              >
                Weiter
              </button>
            )}
          </div>
        </div>
      )}

      <PinSheet offen={pinOffen} onSchliessen={() => setPinOffen(false)} />
    </div>
  );
}

/** Ausstellungspreis unter den Ausstattungskacheln der Bad-Journey. */
function zusatzAusstellungspreis(journeyId: JourneyId, frage: Frage, wert: OptionWert, qm: number): React.ReactNode {
  if (journeyId !== 'bad' || frage.feld !== 'ausstattung') return null;
  const treffer = ausstellungsbad(String(wert), qm);
  if (!treffer) return null;
  return (
    <span className="block rounded-xl px-3 py-2" style={{ background: 'var(--gewerk-tint)' }}>
      <span className="block font-semibold text-slate-600" style={{ fontSize: 'var(--font-size-sm)' }}>
        {AUSSTELLUNGSPREIS_LABEL}
      </span>
      <span className="zahl-tabellarisch block font-black" style={{ color: 'var(--modul-blau)', fontSize: 'var(--font-size-lg)' }}>
        ca. {euro(treffer.preis)} €
      </span>
    </span>
  );
}

/** Anker vor dem Kontaktformular: Einschaetzung und Ausstellungspreis. */
function ErgebnisVorschau({
  journey,
  bad,
  eignung,
}: {
  journey: JourneyId;
  bad: Ausstellungsbad | null;
  eignung: Eignung | null;
}) {
  if (journey === 'waermepumpe' && eignung) {
    return (
      <div className="glass-tile p-6" aria-live="polite">
        <h3 className="font-black text-slate-900" style={{ fontSize: 'var(--font-size-xl)' }}>
          {eignung.titel}
        </h3>
        <p className="mt-2 text-slate-700" style={{ fontSize: 'var(--font-size-base)' }}>
          {eignung.text}
        </p>
      </div>
    );
  }
  if (bad) {
    return (
      <div className="glass-tile p-6" aria-live="polite">
        <p className="font-semibold text-slate-600" style={{ fontSize: 'var(--font-size-sm)' }}>
          {AUSSTELLUNGSPREIS_LABEL}
        </p>
        <p className="zahl-tabellarisch mt-1 font-black" style={{ color: 'var(--modul-blau)', fontSize: 'var(--font-size-2xl)' }}>
          ca. {euro(bad.preis)} €
        </p>
        <p className="mt-2 text-slate-700" style={{ fontSize: 'var(--font-size-base)' }}>
          Das ist der Preis der Einrichtung in unserer Ausstellung. Was Ihr Vorhaben insgesamt kostet,
          sagen wir Ihnen nach dieser Anfrage.
        </p>
      </div>
    );
  }
  return null;
}

/** Chips fuer die Karte "Das haben Sie uns gesagt". */
function baueChips(journeyId: JourneyId, zustand: JourneyZustand): AntwortChip[] {
  const journey = JOURNEYS[journeyId];
  const chips: AntwortChip[] = [];

  journey.schritte.forEach((schritt, index) => {
    if (schritt.art !== 'fragen') return;
    for (const frage of sichtbareFragen(schritt, zustand)) {
      const wert = leseWert(zustand, frage);
      if (wert === undefined || wert === null || wert === '') continue;

      let anzeige = '';
      if (frage.art === 'einzelauswahl') {
        anzeige = frage.optionen.find((o) => o.wert === wert)?.titel ?? '';
      } else if (frage.art === 'mehrfachauswahl') {
        const liste = Array.isArray(wert) ? (wert as OptionWert[]) : [];
        if (liste.length === 0) continue;
        anzeige = liste
          .map((w) => frage.optionen.find((o) => o.wert === w)?.titel ?? '')
          .filter(Boolean)
          .join(', ');
      } else if (frage.art === 'zahl') {
        anzeige = `${zahl(Number(wert), frage.nachkommastellen ?? 0)} ${frage.einheit}`;
      } else if (frage.art === 'anzahl') {
        anzeige = `${Number(wert)} ${frage.einheit}`;
      } else {
        anzeige = String(wert);
      }

      if (anzeige) chips.push({ id: `${schritt.id}-${frage.id}`, label: schritt.titel, wert: anzeige, schrittIndex: index });
    }
  });

  return chips;
}
