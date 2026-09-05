'use client';

/**
 * Förderkachel im Abschnitt „Kunde und Objekt“.
 *
 * Die Zeilen tragen die Bezeichnungen des Chefs vom Notizzettel (Beleg 1): Grundförderung,
 * natürliches Kältemittel, alte Gas- oder Ölheizung, Einkommen bis zur Grenze. Prozente und
 * Deckel kommen aus den Förderregeln, Zuschuss und Eigenanteil aus der laufenden Kalkulation.
 */
import { BadgeEuro } from 'lucide-react';
import { euro, foerderSatz } from '@/lib/services/calculation';
import type { FoerderRegeln, FoerderungEingabe, FoerderungErgebnis } from '@/lib/types';

export type FoerderKachelProps = {
  eingabe: FoerderungEingabe;
  regeln: FoerderRegeln | null;
  ergebnis: FoerderungErgebnis | null;
  kundenansicht: boolean;
  onAendern: (teil: Partial<FoerderungEingabe>) => void;
};

type Schalter = {
  schluessel: keyof Pick<FoerderungEingabe, 'selbstBewohnt' | 'natuerlichesKaeltemittel' | 'altOelOderGas' | 'einkommenUnterGrenze'>;
  label: string;
  prozent: number | null;
};

export default function FoerderKachel({ eingabe, regeln, ergebnis, kundenansicht, onAendern }: FoerderKachelProps) {
  const satz = regeln ? foerderSatz(regeln, eingabe) : null;
  const summe = satz ? satz.boni.grund + satz.boni.effizienz + satz.boni.klimageschwindigkeit + satz.boni.einkommen : 0;
  const zeilen: Schalter[] = regeln
    ? [
      { schluessel: 'selbstBewohnt', label: 'Selbst bewohnt', prozent: null },
      { schluessel: 'natuerlichesKaeltemittel', label: `Natürliches Kältemittel (R290) ${regeln.effizienz} %`, prozent: regeln.effizienz },
      { schluessel: 'altOelOderGas', label: `Alte Gas- oder Ölheizung ${regeln.klimageschwindigkeit} %`, prozent: regeln.klimageschwindigkeit },
      { schluessel: 'einkommenUnterGrenze', label: `Einkommen bis ${euro(regeln.einkommenGrenze)} Euro ${regeln.einkommen} %`, prozent: regeln.einkommen },
    ]
    : [];

  return (
    <section className="glass-tile mt-8 rounded-3xl border border-white/70 p-4">
      <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
        <BadgeEuro aria-hidden className="h-5 w-5" /> Förderung
      </h3>

      <label className="mt-3 flex min-h-[44px] items-center gap-3 text-base text-slate-800">
        <input
          type="checkbox"
          checked={eingabe.aktiv}
          onChange={(e) => onAendern({ aktiv: e.target.checked })}
          className="h-6 w-6 rounded border-slate-300"
        />
        Förderung prüfen
      </label>

      {!regeln ? (
        <p className="mt-3 text-base text-slate-600">Förderregeln werden geladen.</p>
      ) : (
        <>
          <p className="mt-3 flex items-baseline justify-between gap-4 text-base text-slate-800">
            <span>Grundförderung {regeln.grund} %</span>
            <span className="text-sm text-slate-600">immer enthalten</span>
          </p>
          <ul className="mt-2 space-y-2">
            {zeilen.map((z) => (
              <li key={z.schluessel}>
                <label className="flex min-h-[44px] items-center gap-3 text-base text-slate-800">
                  <input
                    type="checkbox"
                    checked={Boolean(eingabe[z.schluessel])}
                    onChange={(e) => onAendern({ [z.schluessel]: e.target.checked } as Partial<FoerderungEingabe>)}
                    className="h-6 w-6 rounded border-slate-300"
                  />
                  {z.label}
                </label>
              </li>
            ))}
          </ul>

          <dl className="mt-4 space-y-2 border-t border-slate-200 pt-3 text-base">
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-slate-600">Summe der Bausteine</dt>
              <dd className="tabular-nums font-semibold text-slate-900">{summe} %</dd>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-slate-600">Deckel {regeln.deckel} %</dt>
              <dd className="tabular-nums font-semibold text-slate-900">
                {ergebnis ? `${ergebnis.satz} %` : `${Math.min(summe, regeln.deckel)} %`}
              </dd>
            </div>
            {ergebnis ? (
              <>
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-slate-600">Zuschuss</dt>
                  <dd className="tabular-nums font-semibold text-[color:var(--modul-orange,#EE6C1F)]">
                    {euro(ergebnis.zuschuss)} Euro
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-slate-600">Eigenanteil</dt>
                  <dd className="tabular-nums font-semibold text-slate-900">
                    {euro(ergebnis.eigenanteilVon)} bis {euro(ergebnis.eigenanteilBis)} Euro
                  </dd>
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-600">
                Zuschuss und Eigenanteil erscheinen, sobald die Kostenschätzung eine Spanne hat.
              </p>
            )}
          </dl>
        </>
      )}

      {!kundenansicht ? (
        <label className="mt-4 block">
          <span className="block text-sm font-medium text-slate-700">Satz von Hand in Prozent</span>
          <span className="block text-sm text-slate-500">Leer lassen für die Bausteine. Ohne Förderung den Schalter „Förderung prüfen“ abwählen.</span>
          <input
            type="number"
            inputMode="numeric"
            min={1}
            max={regeln?.deckel ?? 70}
            value={eingabe.satzManuell === null || eingabe.satzManuell === undefined ? '' : String(eingabe.satzManuell)}
            onChange={(e) => onAendern({ satzManuell: e.target.value === '' || Number(e.target.value) < 1 ? null : Number(e.target.value) })}
            className="glass-input mt-1 h-12 w-32 rounded-2xl border border-slate-200 bg-white px-3 text-base tabular-nums text-slate-900"
          />
        </label>
      ) : null}
    </section>
  );
}
