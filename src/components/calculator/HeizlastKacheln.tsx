'use client';

/**
 * Kachel „Heizlast und Gerät“ des Meister-Modus.
 *
 * Zeigt beide Rechenwege des Chefs als Bereich, dazu den Gerätevorschlag aus der
 * Baureihe (Bosch als Standard, Buderus als Alternative) und den Speicher nach
 * Personenzahl. „Vorschlag übernehmen“ setzt Größe, Kilowatt und Liter in allen
 * Positionen mit Größenvarianten; eine abweichende Wahl des Meisters bleibt stehen.
 */
import { useMemo } from 'react';
import { Gauge } from 'lucide-react';
import {
  HERSTELLER_LABEL,
  geraeteVorschlag,
  heizlastSchaetzen,
  speicherVorschlag,
} from '@/lib/services/heizlast';
import { HERSTELLER, type GebaeudeDaten, type GroessenVariante, type Hersteller } from '@/lib/types';

export type HeizlastKachelnProps = {
  gebaeude: GebaeudeDaten;
  /** Größenvarianten der gewählten Wärmepumpen-Vorlage. */
  varianten: GroessenVariante[];
  kundenansicht: boolean;
  onHersteller: (hersteller: Hersteller) => void;
  onUebernehmen: (werte: { kw: number; matrixNr: number; liter: number }) => void;
};

/** Kilowatt mit einer Nachkommastelle in deutscher Schreibweise. */
export function kwText(kw: number): string {
  return kw.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

export default function HeizlastKacheln({
  gebaeude,
  varianten,
  kundenansicht,
  onHersteller,
  onUebernehmen,
}: HeizlastKachelnProps) {
  const hersteller = gebaeude.geraet.hersteller;
  const heizlast = useMemo(() => heizlastSchaetzen(gebaeude), [gebaeude]);
  const vorschlag = useMemo(
    () => (heizlast ? geraeteVorschlag(heizlast.kwEmpfohlen, varianten, hersteller) : null),
    [heizlast, varianten, hersteller],
  );
  const variante = vorschlag ? (varianten.find((v) => v.matrixNr === vorschlag.matrixNr) ?? null) : null;
  const speicher = speicherVorschlag(gebaeude.personen, variante?.speicherLiterOptionen ?? [200, 300]);
  // Uebernommen wird nur eine belastbare Schaetzung innerhalb der Baureihe; alles andere gehoert vor Ort geklaert.
  const belastbar = heizlast?.belastbar === true;
  const uebernehmbar = Boolean(vorschlag) && belastbar && !vorschlag?.ueberBaureihe;

  return (
    <section className="glass-tile rounded-3xl border border-white/70 p-4">
      <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
        <Gauge aria-hidden className="h-5 w-5" /> Heizlast und Gerät
      </h3>

      <div className="mt-3 space-y-4">
        {!heizlast ? (
          <p className="text-base text-slate-600">
            Für die Schätzung fehlen Angaben: entweder Verbrauch und Energieart oder Wohnfläche und Baujahr.
          </p>
        ) : (
          <p aria-live="polite" className="text-2xl font-semibold tabular-nums text-slate-900">
            {heizlast.kwVon === heizlast.kwBis
              ? `${kwText(heizlast.kwBis)} kW`
              : `${kwText(heizlast.kwVon)} bis ${kwText(heizlast.kwBis)} kW`}
          </p>
        )}

        {/* Der Chef gleicht immer beide Wege ab; deshalb stehen beide dauerhaft in der Kachel. */}
        <dl className="grid gap-2 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-slate-600">Aus dem Verbrauch</dt>
            <dd className="tabular-nums text-base text-slate-900">
              {heizlast?.kwVerbrauch == null ? 'noch offen' : `${kwText(heizlast.kwVerbrauch)} kW`}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-slate-600">Aus den Gebäudedaten</dt>
            <dd className="tabular-nums text-base text-slate-900">
              {heizlast?.kwFlaeche == null ? 'noch offen' : `${kwText(heizlast.kwFlaeche)} kW`}
            </dd>
          </div>
        </dl>

        {heizlast && !belastbar ? (
          // Der reine Flaechenweg ohne Daemmungsangaben ueberschaetzt; die Abrechnung ist der belastbare Wert.
          <p className="rounded-2xl bg-[#FFFBEB] p-3 text-sm font-medium text-[#92400E]">
            Ohne Verbrauchsangabe ist die Heizlast nur grob. Verbrauch der letzten Abrechnung eintragen.
          </p>
        ) : null}

        {heizlast?.hinweise.length ? (
          <ul className="space-y-1 rounded-2xl bg-[#FFFBEB] p-3 text-sm text-[#92400E]">
            {heizlast.hinweise.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        ) : null}

        <div role="radiogroup" aria-label="Hersteller">
          <span className="block text-sm font-medium text-slate-700">Hersteller</span>
          <div className="mt-1 flex flex-wrap gap-2">
            {HERSTELLER.map((h) => {
              const gewaehlt = h === hersteller;
              return (
                <button
                  key={h}
                  type="button"
                  role="radio"
                  aria-checked={gewaehlt}
                  onClick={() => onHersteller(h)}
                  className={[
                    'fokus-ring min-h-[44px] rounded-full border px-4 text-base font-medium',
                    gewaehlt
                      ? 'border-[color:var(--modul-blau,#1B3A8C)] bg-[color:var(--modul-blau,#1B3A8C)] text-white'
                      : 'border-slate-200 bg-white text-slate-700',
                  ].join(' ')}
                >
                  {HERSTELLER_LABEL[h]}
                </button>
              );
            })}
          </div>
        </div>

        {vorschlag ? (
          <div className="rounded-2xl bg-slate-50 p-3">
            <p className="text-base font-semibold text-slate-900">
              Vorschlag: {HERSTELLER_LABEL[vorschlag.hersteller]} {vorschlag.geraetKw} kW
              {kundenansicht ? '' : `, Matrix ${vorschlag.matrixNr}`}, {speicher.liter} Liter
            </p>
            <p className="text-sm text-slate-600">Größe der Vorlage: {vorschlag.label}</p>
            {vorschlag.ueberBaureihe ? (
              <p className="mt-1 text-sm font-medium text-[#92400E]">
                Heizlast über der Baureihe, Auslegung vor Ort klären. Bitte zwei Geräte oder eine Sonderlösung prüfen.
              </p>
            ) : null}
            <button
              type="button"
              disabled={!uebernehmbar}
              onClick={() =>
                onUebernehmen({ kw: vorschlag.geraetKw, matrixNr: vorschlag.matrixNr, liter: speicher.liter })
              }
              className="fokus-ring mt-3 min-h-[56px] w-full rounded-2xl bg-[color:var(--modul-blau,#1B3A8C)] px-6 text-base font-semibold text-white disabled:opacity-50 sm:w-auto"
            >
              Vorschlag übernehmen
            </button>
            {!uebernehmbar ? (
              <p className="mt-2 text-sm text-slate-600">
                {vorschlag.ueberBaureihe
                  ? 'Die Größe wird vor Ort festgelegt, nicht aus der Schätzung übernommen.'
                  : 'Erst mit Verbrauch oder vollständigen Gebäudedaten lässt sich die Größe übernehmen. Die Größe bleibt bis dahin offen.'}
              </p>
            ) : null}
          </div>
        ) : (
          <p className="text-base text-slate-600">
            Ein Gerätevorschlag entsteht, sobald eine Wärmepumpen-Vorlage gewählt ist und die Schätzung steht.
          </p>
        )}

        {gebaeude.geraet.kw !== null ? (
          <p className="text-base text-slate-800">
            Übernommen: {gebaeude.geraet.kw} kW
            {gebaeude.geraet.speicherLiter !== null ? `, ${gebaeude.geraet.speicherLiter} Liter` : ''}
          </p>
        ) : null}
      </div>
    </section>
  );
}
