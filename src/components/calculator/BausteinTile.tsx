'use client';

/**
 * Kachel einer Vorlagenzeile im Meister-Modus.
 *
 * Antippen aktiviert oder deaktiviert die Position. Die Kachel zeigt Gewerkepunkt,
 * Titel, Text, Spanne von bis, Matrix-Chip, Groessenvariante als Segmented Control,
 * Speicherwahl, Mengenwahl und das interne Notizfeld. Fehlt ein Matrixwert, faerbt
 * sich die Kachel rot und benennt die fehlende Zeile (Fachregel 2).
 *
 * Die aus der Heizlast vorgeschlagene Groesse traegt den Zusatz „Vorschlag“; eine
 * abweichende Wahl des Meisters bleibt stehen.
 *
 * In der Kundenansicht werden Betraege, Matrix-Chip und Notiz nicht gerendert,
 * also aus dem DOM entfernt, nicht nur versteckt.
 */
import { euro } from '@/lib/services/calculation';
import type { Baustein, Hinweis, Position, PositionErgebnis } from '@/lib/types';
import MengenStepper from './MengenStepper';
import PositionNotiz from './PositionNotiz';
import { GEWERK_MODUL_FARBE, GEWERK_NAME } from './meister-utils';

export type BausteinTileProps = {
  baustein: Baustein;
  position: Position | null;
  ergebnis: PositionErgebnis | null;
  hinweise: Hinweis[];
  kundenansicht: boolean;
  /** Gewaehltes Speichervolumen in Litern (nur bei Groessenvarianten mit Speicher). */
  speicherWahl: number | null;
  /** Matrixnummer der aus der Heizlast vorgeschlagenen Groesse; wird als „Vorschlag“ markiert. */
  vorschlagMatrixNr?: number | null;
  onUmschalten: (an: boolean) => void;
  onVariante: (matrixNr: number) => void;
  onSpeicher: (liter: number) => void;
  onMenge: (menge: number) => void;
  onNotiz: (text: string) => void;
};

export default function BausteinTile({
  baustein,
  position,
  ergebnis,
  hinweise,
  kundenansicht,
  speicherWahl,
  vorschlagMatrixNr = null,
  onUmschalten,
  onVariante,
  onSpeicher,
  onMenge,
  onNotiz,
}: BausteinTileProps) {
  const an = Boolean(position?.aktiv);
  const varianten = baustein.groessenVarianten ?? [];
  const gewaehlteVariante = varianten.find((v) => v.matrixNr === position?.varianteMatrixNr) ?? null;
  const speicherOptionen = gewaehlteVariante?.speicherLiterOptionen ?? [];
  const blockiert = an && hinweise.length > 0;
  // Eine blockierte Zeile zeigt keine Spanne der Vorlage; sonst stuende dort ein Preis, den niemand gewaehlt hat.
  const spanneVon = blockiert ? null : (ergebnis?.einzelVon ?? baustein.spanne?.von ?? null);
  const spanneBis = blockiert ? null : (ergebnis?.einzelBis ?? baustein.spanne?.bis ?? null);
  const farbe = GEWERK_MODUL_FARBE[baustein.gewerk];

  return (
    <article
      id={`baustein-${baustein.id}`}
      data-aktiv={an ? 'ja' : 'nein'}
      data-blockiert={blockiert ? 'ja' : 'nein'}
      className={[
        'glass-tile relative flex flex-col rounded-3xl border p-4 transition-transform',
        blockiert ? 'border-[#B42318]' : an ? 'border-[color:var(--modul-blau,#1B3A8C)]' : 'border-white/70',
        an ? 'ring-2 ring-[color:var(--modul-blau,#1B3A8C)]' : '',
      ].join(' ')}
    >
      {an ? <span aria-hidden className="absolute left-0 top-4 bottom-4 w-1 rounded-full" style={{ backgroundColor: farbe }} /> : null}

      <button
        type="button"
        role="switch"
        aria-checked={an}
        onClick={() => onUmschalten(!an)}
        className="fokus-ring flex min-h-[56px] w-full items-start gap-3 rounded-2xl text-left"
      >
        <span aria-hidden className="mt-1.5 h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: farbe }} />
        <span className="flex-1">
          <span className="block text-base font-semibold leading-snug text-slate-900">{baustein.titel}</span>
          <span className="sr-only">Gewerk {GEWERK_NAME[baustein.gewerk]}</span>
          <span className="mt-1 block text-sm leading-snug text-slate-600">{position?.text ?? baustein.text}</span>
        </span>
      </button>

      {!kundenansicht ? (
        <p className="mt-3 flex flex-wrap items-center gap-2 text-sm">
          {spanneVon !== null && spanneBis !== null ? (
            <span className="tabular-nums font-medium text-slate-800">
              {euro(spanneVon)} bis {euro(spanneBis)} Euro netto
            </span>
          ) : (
            <span className="font-medium text-[#B42318]">ohne Spanne</span>
          )}
          {baustein.matrixNr !== null || position?.varianteMatrixNr ? (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[13px] text-slate-600">
              Matrix {position?.varianteMatrixNr ?? baustein.matrixNr}
            </span>
          ) : null}
        </p>
      ) : null}

      {varianten.length ? (
        <div className="mt-3" role="radiogroup" aria-label={`Groesse fuer ${baustein.titel}`}>
          {position?.varianteMatrixNr === null || position?.varianteMatrixNr === undefined ? (
            // Die Groesse wird nie geraten; ohne Wahl bleibt die Zeile ohne Spanne (Fachregel 2).
            <p className="mb-2 text-sm font-medium text-[#B42318]">Größe nach Heizlast wählen</p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            {varianten.map((v) => {
              const gewaehlt = v.matrixNr === position?.varianteMatrixNr;
              const empfohlen = vorschlagMatrixNr !== null && v.matrixNr === vorschlagMatrixNr;
              return (
                <button
                  key={v.matrixNr}
                  type="button"
                  role="radio"
                  aria-checked={gewaehlt}
                  onClick={() => onVariante(v.matrixNr)}
                  className={[
                    'fokus-ring min-h-[44px] rounded-full border px-4 text-sm font-medium',
                    gewaehlt
                      ? 'border-[color:var(--modul-blau,#1B3A8C)] bg-[color:var(--modul-blau,#1B3A8C)] text-white'
                      : empfohlen
                        ? 'border-[color:var(--modul-gold,#F0C000)] bg-white text-slate-700'
                        : 'border-slate-200 bg-white text-slate-700',
                  ].join(' ')}
                >
                  {v.label}
                  {empfohlen ? (
                    <span className={gewaehlt ? 'ml-2 text-white/80' : 'ml-2 text-slate-600'}> Vorschlag</span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {speicherOptionen.length ? (
        <div className="mt-3" role="radiogroup" aria-label={`Speicher fuer ${baustein.titel}`}>
          <span className="text-sm text-slate-600">Speicher</span>
          <div className="mt-1 flex flex-wrap gap-2">
            {speicherOptionen.map((liter) => {
              const gewaehlt = (speicherWahl ?? gewaehlteVariante?.speicherLiterDefault ?? null) === liter;
              return (
                <button
                  key={liter}
                  type="button"
                  role="radio"
                  aria-checked={gewaehlt}
                  onClick={() => onSpeicher(liter)}
                  className={[
                    'fokus-ring min-h-[44px] rounded-full border px-4 text-sm font-medium',
                    gewaehlt
                      ? 'border-[color:var(--modul-blau,#1B3A8C)] bg-[color:var(--modul-blau,#1B3A8C)] text-white'
                      : 'border-slate-200 bg-white text-slate-700',
                  ].join(' ')}
                >
                  {liter} Liter
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {an && baustein.einheit !== 'pauschal' ? (
        <div className="mt-3">
          <MengenStepper
            wert={position?.menge ?? baustein.mengeDefault}
            einheit={baustein.einheit}
            beschriftung={`Menge fuer ${baustein.titel}`}
            onChange={onMenge}
          />
        </div>
      ) : null}

      {blockiert ? (
        <ul className="mt-3 space-y-1 rounded-2xl bg-[#FEF3F2] p-3 text-sm font-medium text-[#B42318]">
          {hinweise.map((h, i) => (
            <li key={`${h.code}-${i}`}>{h.text}</li>
          ))}
        </ul>
      ) : null}

      {an && !kundenansicht ? (
        <PositionNotiz wert={position?.notizIntern ?? ''} onChange={onNotiz} />
      ) : null}
    </article>
  );
}
