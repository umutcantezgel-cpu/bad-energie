'use client';
/**
 * Ergebnis des Kunden-Modus.
 * Zeigt entweder eine gerundete Bruttospanne oder die persönliche Zusage.
 * Es erscheinen nie Nettobeträge, nie Zeilenpreise und nie interne Faktoren.
 */
import React from 'react';
import Link from 'next/link';
import { COMPANY_DATA } from '@/config/company';
import { euro } from '@/lib/services/calculation';
import type { OeffentlicheErgebnisDTO } from '@/lib/types';
import type { Eignung } from '@/lib/journeys';
import {
  AUSSTELLUNGSPREIS_LABEL,
  UNVERBINDLICHKEITS_HINWEIS,
  VERTRAUEN_SIEGEL,
  foerderSatzText,
  heizkostenSatz,
  type Ausstellungsbad,
} from './konfigurator-utils';
import Piktogramm from './piktogramme';

export type AntwortChip = { id: string; label: string; wert: string; schrittIndex: number };

export type ErgebnisKarteProps = {
  ksNummer: string;
  ergebnis: OeffentlicheErgebnisDTO;
  zusage: string;
  chips: AntwortChip[];
  bad?: Ausstellungsbad | null;
  eignung?: Eignung | null;
  /** Liste „Das ist enthalten“, je Strecke; Standard ist die Badliste. */
  enthalten?: string[];
  onSpringeZuSchritt: (index: number) => void;
};

const ENTHALTEN = [
  'Abbau und Entsorgung der alten Einrichtung',
  'Material und Montage durch unsere Meister',
  'Anschluss an Wasser, Abwasser und Strom',
  'Endreinigung der Baustelle',
];

export default function ErgebnisKarte({
  ksNummer,
  ergebnis,
  zusage,
  chips,
  bad,
  eignung,
  onSpringeZuSchritt,
  enthalten,
}: ErgebnisKarteProps) {
  const hatSpanne =
    ergebnis.pfad === 'spanne' &&
    typeof ergebnis.bruttoVonGerundet === 'number' &&
    typeof ergebnis.bruttoBisGerundet === 'number';

  const gesamt = hatSpanne ? Number(ergebnis.bruttoBisGerundet) : null;
  const heizkosten = heizkostenSatz(ergebnis);
  const foerderZusatz = foerderSatzText(ergebnis);

  return (
    <div className="space-y-8" aria-live="polite">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Spanne oder Zusage */}
        <section className="glass-tile p-6 sm:p-8 lg:col-span-3">
          <p className="font-bold uppercase tracking-wider text-slate-500" style={{ fontSize: 'var(--font-size-sm)' }}>
            Ihre Anfrage {ksNummer}
          </p>

          {eignung ? (
            <div className="mt-3 flex items-start gap-3 rounded-2xl p-4" style={{ background: 'var(--gewerk-solar-tint)' }}>
              <span style={{ color: 'var(--gewerk-solar-text)' }}>
                <Piktogramm name={eignung.stufe === 'gut' ? 'haken' : eignung.stufe === 'anpassungen' ? 'waermepumpe' : 'kalender'} groesse={26} />
              </span>
              <div>
                <p className="font-black text-slate-900" style={{ fontSize: 'var(--font-size-lg)' }}>
                  {eignung.titel}
                </p>
                <p className="mt-1 text-slate-700" style={{ fontSize: 'var(--font-size-base)' }}>
                  {eignung.text}
                </p>
              </div>
            </div>
          ) : null}

          {hatSpanne ? (
            <>
              <h2 className="zahl-tabellarisch mt-4 font-black tracking-tight text-slate-900" style={{ fontSize: 'var(--font-size-display)' }}>
                Voraussichtlich etwa {euro(ergebnis.bruttoVonGerundet)} bis {euro(ergebnis.bruttoBisGerundet)} €
              </h2>
              <p className="mt-2 text-slate-700" style={{ fontSize: 'var(--font-size-lg)' }}>
                inklusive Material, Montage und Mehrwertsteuer
              </p>
              {typeof ergebnis.foerderzuschuss === 'number' && ergebnis.foerderzuschuss > 0 ? (
                <p
                  className="zahl-tabellarisch mt-4 rounded-2xl p-4 font-bold"
                  style={{ background: 'var(--gewerk-solar-tint)', color: 'var(--gewerk-solar-text)', fontSize: 'var(--font-size-lg)' }}
                >
                  Der Staat zahlt voraussichtlich {euro(ergebnis.foerderzuschuss)} € dazu.
                  {typeof ergebnis.eigenanteilVon === 'number' && typeof ergebnis.eigenanteilBis === 'number' ? (
                    <span className="block font-semibold" style={{ fontSize: 'var(--font-size-base)' }}>
                      Für Sie bleiben etwa {euro(ergebnis.eigenanteilVon)} bis {euro(ergebnis.eigenanteilBis)} €.
                    </span>
                  ) : null}
                  {foerderZusatz ? (
                    <span className="mt-2 block font-semibold" style={{ fontSize: 'var(--font-size-base)' }}>
                      {foerderZusatz}
                    </span>
                  ) : null}
                </p>
              ) : null}
            </>
          ) : (
            <>
              <h2 className="mt-4 font-black tracking-tight text-slate-900" style={{ fontSize: 'var(--font-size-2xl)' }}>
                Wir melden uns innerhalb von zwei Werktagen
              </h2>
              <p className="mt-3 text-slate-700" style={{ fontSize: 'var(--font-size-lg)' }}>
                {zusage}
              </p>
            </>
          )}

          {/* Fachregel 4: wo Beträge stehen, steht der Unverbindlichkeitshinweis; auch ohne Spanne,
              weil die Zusage denselben Vorbehalt trägt. */}
          <p className="mt-4 text-slate-600" style={{ fontSize: 'var(--font-size-sm)', lineHeight: 1.5 }}>
            {UNVERBINDLICHKEITS_HINWEIS}
          </p>

          {heizkosten ? (
            <div className="mt-5 rounded-2xl border border-slate-200 p-4">
              <h3 className="font-black text-slate-900" style={{ fontSize: 'var(--font-size-lg)' }}>
                Ihre Heizkosten
              </h3>
              <p className="zahl-tabellarisch mt-2 text-slate-700" style={{ fontSize: 'var(--font-size-base)' }}>
                {heizkosten}
              </p>
            </div>
          ) : null}
        </section>

        {/* Antwort-Chips */}
        <section className="glass-tile p-6 sm:p-8 lg:col-span-2">
          <h3 className="font-black text-slate-900" style={{ fontSize: 'var(--font-size-lg)' }}>
            Das haben Sie uns gesagt
          </h3>
          <p className="mt-1 text-slate-600" style={{ fontSize: 'var(--font-size-sm)' }}>
            Ein Tippen führt zurück zur Frage.
          </p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {chips.map((chip) => (
              <li key={chip.id}>
                <button
                  type="button"
                  onClick={() => onSpringeZuSchritt(chip.schrittIndex)}
                  className="fokus-ring rounded-full border border-slate-300 bg-white px-3.5 py-2 text-left font-semibold text-slate-700"
                  style={{ fontSize: 'var(--font-size-sm)', minHeight: '44px' }}
                >
                  <span className="text-slate-500">{chip.label}: </span>
                  {chip.wert}
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Vergleichsblock Ausstellungspreis */}
      {bad ? (
        <section className="glass-tile p-6 sm:p-8">
          <h3 className="font-black text-slate-900" style={{ fontSize: 'var(--font-size-lg)' }}>
            Woraus sich der Betrag zusammensetzt
          </h3>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-2xl p-4" style={{ background: 'var(--gewerk-wasser-tint)' }}>
              <p className="font-semibold text-slate-700" style={{ fontSize: 'var(--font-size-sm)' }}>
                {AUSSTELLUNGSPREIS_LABEL}
              </p>
              <p className="zahl-tabellarisch mt-1 font-black" style={{ color: 'var(--modul-blau)', fontSize: 'var(--font-size-2xl)' }}>
                {euro(bad.preis)} €
              </p>
              <p className="mt-1 text-slate-600" style={{ fontSize: 'var(--font-size-sm)' }}>
                {bad.titel}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="font-semibold text-slate-700" style={{ fontSize: 'var(--font-size-sm)' }}>
                Gesamt mit Handwerk
              </p>
              <p className="zahl-tabellarisch mt-1 font-black text-slate-900" style={{ fontSize: 'var(--font-size-2xl)' }}>
                {gesamt ? `bis etwa ${euro(gesamt)} €` : 'sagen wir Ihnen persönlich'}
              </p>
              <p className="mt-1 text-slate-600" style={{ fontSize: 'var(--font-size-sm)' }}>
                mit Abbruch, Rohbau, Fliesen und Montage
              </p>
            </div>
          </div>
          <p className="mt-4 text-slate-700" style={{ fontSize: 'var(--font-size-base)' }}>
            Der Ausstellungspreis zeigt nur die Einrichtung. Der Gesamtbetrag enthält alle Arbeiten, die
            aus einem alten Raum ein fertiges Bad machen.
          </p>
          <Link
            href={`/bad/musterbaeder/${bad.slug}`}
            className="fokus-ring mt-4 inline-flex items-center gap-2 font-bold underline"
            style={{ color: 'var(--modul-blau)', fontSize: 'var(--font-size-base)' }}
          >
            Dieses Bad in der Ausstellung ansehen
          </Link>
        </section>
      ) : null}

      {/* Vertrauensblock */}
      <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="glass-tile p-6">
          <h3 className="font-black text-slate-900" style={{ fontSize: 'var(--font-size-lg)' }}>
            Das ist enthalten
          </h3>
          <ul className="mt-3 space-y-2 text-slate-700" style={{ fontSize: 'var(--font-size-base)' }}>
            {(enthalten ?? ENTHALTEN).map((zeile) => (
              <li key={zeile} className="flex items-start gap-2">
                <span style={{ color: 'var(--status-freigegeben)' }}>
                  <Piktogramm name="haken" groesse={20} />
                </span>
                <span>{zeile}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="glass-tile p-6">
          <h3 className="font-black text-slate-900" style={{ fontSize: 'var(--font-size-lg)' }}>
            Das ist nicht enthalten
          </h3>
          <ul className="mt-3 space-y-2 text-slate-700" style={{ fontSize: 'var(--font-size-base)' }}>
            {(ergebnis.nichtEnthalten?.length ? ergebnis.nichtEnthalten : ['Arbeiten, die erst nach dem Öffnen der Wand sichtbar werden']).map((zeile) => (
              <li key={zeile} className="flex items-start gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                <span>{zeile}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="glass-tile p-6">
          <h3 className="font-black text-slate-900" style={{ fontSize: 'var(--font-size-lg)' }}>
            Warum eine Spanne
          </h3>
          <p className="mt-3 text-slate-700" style={{ fontSize: 'var(--font-size-base)' }}>
            Vor dem ersten Blick hinter die Wand kennt niemand den genauen Betrag. Die Spanne zeigt ehrlich,
            wo Ihr Vorhaben liegt. Den festen Preis nennen wir nach dem Termin vor Ort.
          </p>
          <p className="mt-4 font-semibold text-slate-900" style={{ fontSize: 'var(--font-size-base)' }}>
            Meisterbetrieb seit {COMPANY_DATA.business.establishmentYear} in Wetzlar
          </p>
          <p className="font-semibold text-slate-900" style={{ fontSize: 'var(--font-size-base)' }}>
            {VERTRAUEN_SIEGEL}
          </p>
          <a
            href={`tel:${COMPANY_DATA.contact.phoneLink}`}
            className="fokus-ring mt-2 inline-block font-bold underline"
            style={{ color: 'var(--modul-blau)', fontSize: 'var(--font-size-base)' }}
          >
            {COMPANY_DATA.contact.phone}
          </a>
        </div>
      </section>
    </div>
  );
}
