'use client';

/**
 * Abschnitt „Gebäude und Heizung“ des Meister-Modus.
 *
 * Bildet den Datenerfassungsbogen des Chefs ab (Beleg 10) und ergänzt Zugang, Platz
 * und Betriebskosten aus den Belegen 1 bis 4. Wenige große Entscheidungen je Kachel,
 * alles antippbar; freie Zahlen nur, wo der Bogen sie verlangt.
 *
 * Vorbelegung kommt aus `anfrage.gebaeude`, das der Server aus dem Web-Lead füllt.
 * In der Kundenansicht bleiben Rechenwege und interne Hinweise aus dem DOM.
 */
import { useMemo } from 'react';
import { Building2, Flame, Ruler, Wallet } from 'lucide-react';
import { euro } from '@/lib/services/calculation';
import {
  BAUJAHR_KLASSE_LABEL,
  ENERGIEART_LABEL,
  FENSTER_LABEL,
  HEIZWERT,
  KESSELTYP_LABEL,
  LAGE_LABEL,
  baujahrKlasseFuer,
  betriebskosten,
  heizlastSchaetzen,
  kesseltypVermutet,
  speicherVorschlag,
} from '@/lib/services/heizlast';
import {
  BAUJAHR_KLASSEN,
  BETRIEBSKOSTEN_STANDARD,
  ENERGIEARTEN,
  FENSTER,
  HEIZUNGS_STANDORTE,
  KESSELTYPEN,
  LAGEN,
  VERTEILUNGEN,
  type GroessenVariante,
  type InternAnfrage,
  type Kalkulationsdaten,
  type KalkulationsErgebnis,
} from '@/lib/types';
import HeizlastKacheln from './HeizlastKacheln';
import type { MeisterAktion } from './meister-utils';

export type GebaeudeSchrittProps = {
  anfrage: InternAnfrage;
  dispatch: (aktion: MeisterAktion) => void;
  daten: Kalkulationsdaten | null;
  ergebnis: KalkulationsErgebnis;
  kundenansicht: boolean;
  /** Größenvarianten der gewählten Wärmepumpen-Vorlage (Grundlage des Gerätevorschlags). */
  varianten: GroessenVariante[];
  /** Übernimmt Gerät und Speicher in alle Positionen mit Größenvarianten. */
  onVorschlagUebernehmen: (werte: { kw: number; matrixNr: number; liter: number }) => void;
  /** Setzt nur das Speichervolumen (Kachel „Speicher und Platz“). */
  onSpeicher: (liter: number) => void;
};

const STANDORT_LABEL: Record<(typeof HEIZUNGS_STANDORTE)[number], string> = {
  keller: 'Keller',
  erdgeschoss: 'Erdgeschoss',
  dachgeschoss: 'Dachgeschoss',
  anbau: 'Anbau',
  aussen: 'Außen',
  unbekannt: 'Unbekannt',
};

const VERTEILUNG_LABEL: Record<(typeof VERTEILUNGEN)[number], string> = {
  heizkoerper: 'Heizkörper',
  fussboden: 'Fußboden',
  gemischt: 'Gemischt',
};

const EINHEIT_TEXT: Record<'kwh' | 'liter' | 'm3' | 'kg', string> = {
  kwh: 'kWh im Jahr',
  liter: 'Liter im Jahr',
  m3: 'Kubikmeter im Jahr',
  kg: 'Kilogramm im Jahr',
};

// ---------------------------------------------------------------------------
// Kleine Bausteine der Oberfläche (auch von HeizlastKacheln und FoerderKachel genutzt)
// ---------------------------------------------------------------------------

export function Kachel({
  titel,
  symbol,
  children,
}: {
  titel: string;
  symbol?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="glass-tile rounded-3xl border border-white/70 p-4">
      <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
        {symbol}
        {titel}
      </h3>
      <div className="mt-3 space-y-4">{children}</div>
    </section>
  );
}

export type ChipOption<T> = { wert: T; label: string };

/** Einzelauswahl als große Chips. Ein zweites Antippen hebt die Wahl wieder auf. */
export function Chips<T extends string | number>({
  beschriftung,
  optionen,
  wert,
  onWaehlen,
  hinweis,
}: {
  beschriftung: string;
  optionen: ChipOption<T>[];
  wert: T | null;
  onWaehlen: (wert: T | null) => void;
  hinweis?: string;
}) {
  return (
    <div role="radiogroup" aria-label={beschriftung}>
      <span className="block text-sm font-medium text-slate-700">{beschriftung}</span>
      <div className="mt-1 flex flex-wrap gap-2">
        {optionen.map((o) => {
          const gewaehlt = o.wert === wert;
          return (
            <button
              key={String(o.wert)}
              type="button"
              role="radio"
              aria-checked={gewaehlt}
              onClick={() => onWaehlen(gewaehlt ? null : o.wert)}
              className={[
                'fokus-ring min-h-[44px] rounded-full border px-4 text-base font-medium',
                gewaehlt
                  ? 'border-[color:var(--modul-blau,#1B3A8C)] bg-[color:var(--modul-blau,#1B3A8C)] text-white'
                  : 'border-slate-200 bg-white text-slate-700',
              ].join(' ')}
            >
              {o.label}
            </button>
          );
        })}
      </div>
      {hinweis ? <p className="mt-1 text-sm text-slate-600">{hinweis}</p> : null}
    </div>
  );
}

/** Ja-Nein-Wahl mit dritter Möglichkeit „unbekannt“ (null). */
export function JaNein({
  beschriftung,
  wert,
  onWaehlen,
}: {
  beschriftung: string;
  wert: boolean | null;
  onWaehlen: (wert: boolean | null) => void;
}) {
  return (
    <Chips<'ja' | 'nein'>
      beschriftung={beschriftung}
      optionen={[
        { wert: 'ja', label: 'Ja' },
        { wert: 'nein', label: 'Nein' },
      ]}
      wert={wert === null ? null : wert ? 'ja' : 'nein'}
      onWaehlen={(w) => onWaehlen(w === null ? null : w === 'ja')}
    />
  );
}

/** Zahlenfeld mit Einheit; leer bedeutet „nicht erhoben“. */
export function ZahlFeld({
  beschriftung,
  wert,
  einheit,
  min,
  max,
  schritt = 1,
  fehler,
  onChange,
}: {
  beschriftung: string;
  wert: number | null;
  einheit?: string;
  min?: number;
  max?: number;
  schritt?: number;
  fehler?: string;
  onChange: (wert: number | null) => void;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-slate-700">{beschriftung}</span>
      <span className="mt-1 flex items-center gap-2">
        <input
          type="number"
          inputMode="decimal"
          value={wert === null ? '' : String(wert)}
          min={min}
          max={max}
          step={schritt}
          aria-invalid={fehler ? true : undefined}
          onChange={(e) => {
            const roh = e.target.value;
            const zahl = Number(roh);
            onChange(roh === '' || !Number.isFinite(zahl) ? null : zahl);
          }}
          className="glass-input h-12 w-32 rounded-2xl border border-slate-200 bg-white px-3 text-base tabular-nums text-slate-900"
        />
        {einheit ? <span className="text-base text-slate-600">{einheit}</span> : null}
      </span>
      {fehler ? <span className="mt-1 block text-sm font-medium text-[#B42318]">{fehler}</span> : null}
    </label>
  );
}

/** Stepper mit großen Touchzielen für kleine ganze Zahlen und die Wohnfläche. */
export function WertStepper({
  beschriftung,
  wert,
  einheit,
  min = 0,
  max = 999,
  schritt = 1,
  onChange,
}: {
  beschriftung: string;
  wert: number | null;
  einheit: string;
  min?: number;
  max?: number;
  schritt?: number;
  onChange: (wert: number) => void;
}) {
  const aktuell = wert ?? min;
  const setze = (naechster: number) => onChange(Math.min(max, Math.max(min, Math.round(naechster * 10) / 10)));
  return (
    <div>
      <span className="block text-sm font-medium text-slate-700">{beschriftung}</span>
      <div className="mt-1 flex items-center gap-2">
        <button
          type="button"
          aria-label={`${beschriftung} verringern`}
          onClick={() => setze(aktuell - schritt)}
          disabled={aktuell <= min}
          className="fokus-ring flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-white text-2xl text-slate-700 disabled:opacity-40"
        >
          &minus;
        </button>
        <label className="flex flex-col items-center">
          <span className="sr-only">{beschriftung}</span>
          <input
            type="number"
            inputMode="decimal"
            value={wert === null ? '' : String(wert)}
            min={min}
            max={max}
            step={schritt}
            onChange={(e) => {
              const zahl = Number(e.target.value);
              if (e.target.value === '' || !Number.isFinite(zahl)) return;
              setze(zahl);
            }}
            className="glass-input h-14 w-24 rounded-2xl border border-slate-200 bg-white text-center text-base tabular-nums text-slate-900"
          />
        </label>
        <button
          type="button"
          aria-label={`${beschriftung} erhöhen`}
          onClick={() => setze(aktuell + schritt)}
          disabled={aktuell >= max}
          className="fokus-ring flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-white text-2xl text-slate-700 disabled:opacity-40"
        >
          +
        </button>
        <span className="text-base text-slate-600">{einheit}</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Abschnitt
// ---------------------------------------------------------------------------

export default function GebaeudeSchritt({
  anfrage,
  dispatch,
  daten,
  kundenansicht,
  varianten,
  onVorschlagUebernehmen,
  onSpeicher,
}: GebaeudeSchrittProps) {
  const g = anfrage.gebaeude;
  const klasse = baujahrKlasseFuer(g);
  const kesselVorschlag = kesseltypVermutet(g.bestand);
  const verbrauchEinheit = g.bestand.energieart
    ? (g.bestand.verbrauchEinheit ?? HEIZWERT[g.bestand.energieart].einheit)
    : 'kwh';

  const heizlast = useMemo(() => heizlastSchaetzen(g), [g]);
  const betrieb = useMemo(
    () => (daten ? betriebskosten(g, daten.betriebskosten ?? BETRIEBSKOSTEN_STANDARD, heizlast) : null),
    [daten, g, heizlast],
  );

  const speicherOptionen = useMemo(() => {
    const alle = varianten.flatMap((v) => v.speicherLiterOptionen ?? []);
    const eindeutig = [...new Set(alle)].sort((a, b) => a - b);
    return eindeutig.length ? eindeutig : [200, 300];
  }, [varianten]);
  const speicherEmpfehlung = speicherVorschlag(g.personen, speicherOptionen);

  const tuerZuSchmal = g.platz.tuerbreiteCm !== null && g.platz.tuerbreiteCm < 80;

  return (
    <section aria-labelledby="h-gebaeude">
      <h2 id="h-gebaeude" className="flex items-center gap-2 text-xl font-semibold text-slate-900">
        <Building2 aria-hidden className="h-5 w-5" /> Gebäude und Heizung
      </h2>
      <p className="text-base text-slate-600">Nach dem Erfassungsbogen. Was schon bekannt ist, steht bereits drin.</p>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Kachel titel="Gebäude" symbol={<Building2 aria-hidden className="h-5 w-5" />}>
          <WertStepper
            beschriftung="Wohnfläche"
            wert={g.wohnflaeche}
            einheit="Quadratmeter"
            min={10}
            max={2000}
            schritt={5}
            onChange={(w) => dispatch({ typ: 'gebaeude', teil: { wohnflaeche: w } })}
          />
          <ZahlFeld
            beschriftung="Baujahr"
            wert={g.baujahr}
            min={1800}
            max={2100}
            onChange={(w) => dispatch({ typ: 'gebaeude', teil: { baujahr: w } })}
          />
          <Chips
            beschriftung="Baujahrklasse"
            optionen={BAUJAHR_KLASSEN.map((k) => ({ wert: k, label: BAUJAHR_KLASSE_LABEL[k] }))}
            wert={g.baujahrKlasse}
            onWaehlen={(w) => dispatch({ typ: 'gebaeude', teil: { baujahrKlasse: w } })}
            hinweis={klasse ? `Gerechnet wird mit ${BAUJAHR_KLASSE_LABEL[klasse]}.` : 'Baujahr oder Klasse angeben.'}
          />
          <Chips
            beschriftung="Lage"
            optionen={LAGEN.map((l) => ({ wert: l, label: LAGE_LABEL[l] }))}
            wert={g.lage}
            onWaehlen={(w) => dispatch({ typ: 'gebaeude', teil: { lage: w } })}
          />
          <Chips<number>
            beschriftung="Außenwanddämmung"
            optionen={[
              { wert: 0, label: 'keine' },
              { wert: 5, label: '5 cm' },
              { wert: 10, label: '10 cm' },
              { wert: 15, label: '15 cm' },
            ]}
            wert={g.aussenwandDaemmungCm}
            onWaehlen={(w) => dispatch({ typ: 'gebaeude', teil: { aussenwandDaemmungCm: w } })}
          />
          <Chips<number>
            beschriftung="Dachdämmung"
            optionen={[
              { wert: 0, label: 'keine' },
              { wert: 15, label: '15 cm' },
              { wert: 20, label: '20 cm' },
              { wert: 25, label: '25 cm' },
            ]}
            wert={g.dachDaemmungCm}
            onWaehlen={(w) => dispatch({ typ: 'gebaeude', teil: { dachDaemmungCm: w } })}
          />
          <Chips
            beschriftung="Fenster"
            optionen={FENSTER.map((f) => ({ wert: f, label: FENSTER_LABEL[f] }))}
            wert={g.fenster}
            onWaehlen={(w) => dispatch({ typ: 'gebaeude', teil: { fenster: w } })}
          />
          <WertStepper
            beschriftung="Personen im Haushalt"
            wert={g.personen}
            einheit="Personen"
            min={1}
            max={20}
            onChange={(w) => dispatch({ typ: 'gebaeude', teil: { personen: Math.round(w) } })}
          />
          <WertStepper
            beschriftung="Duschen"
            wert={g.duschen}
            einheit="Stück"
            min={0}
            max={10}
            onChange={(w) => dispatch({ typ: 'gebaeude', teil: { duschen: Math.round(w) } })}
          />
          <WertStepper
            beschriftung="Wannen"
            wert={g.wannen}
            einheit="Stück"
            min={0}
            max={10}
            onChange={(w) => dispatch({ typ: 'gebaeude', teil: { wannen: Math.round(w) } })}
          />
        </Kachel>

        <Kachel titel="Bestehende Heizung" symbol={<Flame aria-hidden className="h-5 w-5" />}>
          <Chips
            beschriftung="Energieart"
            optionen={ENERGIEARTEN.map((e) => ({ wert: e, label: ENERGIEART_LABEL[e] }))}
            wert={g.bestand.energieart}
            onWaehlen={(w) =>
              dispatch({
                typ: 'gebaeudeBestand',
                teil: { energieart: w, verbrauchEinheit: w ? HEIZWERT[w].einheit : null },
              })
            }
          />
          <Chips
            beschriftung="Kesseltyp"
            optionen={KESSELTYPEN.map((k) => ({ wert: k, label: KESSELTYP_LABEL[k] }))}
            wert={g.bestand.kesseltyp}
            onWaehlen={(w) => dispatch({ typ: 'gebaeudeBestand', teil: { kesseltyp: w } })}
            hinweis={
              g.bestand.kesseltyp
                ? undefined
                : `Vorschlag aus Energieart und Alter: ${KESSELTYP_LABEL[kesselVorschlag]}.`
            }
          />
          <ZahlFeld
            beschriftung="Verbrauch im Jahr"
            wert={g.bestand.verbrauchJahr}
            einheit={EINHEIT_TEXT[verbrauchEinheit]}
            min={0}
            max={1000000}
            onChange={(w) => dispatch({ typ: 'gebaeudeBestand', teil: { verbrauchJahr: w } })}
          />
          <ZahlFeld
            beschriftung="Alter der Heizung"
            wert={g.bestand.heizungsalterJahre}
            einheit="Jahre"
            min={0}
            max={80}
            onChange={(w) => dispatch({ typ: 'gebaeudeBestand', teil: { heizungsalterJahre: w } })}
          />
          <ZahlFeld
            beschriftung="Heizkörper"
            wert={g.bestand.heizkoerper}
            einheit="Stück"
            min={0}
            max={60}
            onChange={(w) => dispatch({ typ: 'gebaeudeBestand', teil: { heizkoerper: w } })}
          />
          <Chips
            beschriftung="Verteilung"
            optionen={VERTEILUNGEN.map((v) => ({ wert: v, label: VERTEILUNG_LABEL[v] }))}
            wert={g.bestand.verteilung}
            onWaehlen={(w) => dispatch({ typ: 'gebaeudeBestand', teil: { verteilung: w } })}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <ZahlFeld
              beschriftung="Vorlauf"
              wert={g.bestand.vorlaufC}
              einheit="Grad"
              min={20}
              max={95}
              onChange={(w) => dispatch({ typ: 'gebaeudeBestand', teil: { vorlaufC: w } })}
            />
            <ZahlFeld
              beschriftung="Rücklauf"
              wert={g.bestand.ruecklaufC}
              einheit="Grad"
              min={15}
              max={90}
              onChange={(w) => dispatch({ typ: 'gebaeudeBestand', teil: { ruecklaufC: w } })}
            />
          </div>
          <JaNein
            beschriftung="Zirkulation vorhanden"
            wert={g.bestand.zirkulation}
            onWaehlen={(w) => dispatch({ typ: 'gebaeudeBestand', teil: { zirkulation: w } })}
          />
          <Chips
            beschriftung="Standort der Heizung"
            optionen={HEIZUNGS_STANDORTE.map((s) => ({ wert: s, label: STANDORT_LABEL[s] }))}
            wert={g.bestand.standort}
            onWaehlen={(w) => dispatch({ typ: 'gebaeudeBestand', teil: { standort: w ?? 'unbekannt' } })}
          />
          <JaNein
            beschriftung="Solarthermie vorhanden"
            wert={g.bestand.solarthermie}
            onWaehlen={(w) => dispatch({ typ: 'gebaeudeBestand', teil: { solarthermie: w === true } })}
          />
        </Kachel>

        <HeizlastKacheln
          gebaeude={g}
          varianten={varianten}
          kundenansicht={kundenansicht}
          onHersteller={(hersteller) => dispatch({ typ: 'gebaeudeGeraet', teil: { hersteller } })}
          onUebernehmen={onVorschlagUebernehmen}
        />

        <Kachel titel="Speicher und Platz" symbol={<Ruler aria-hidden className="h-5 w-5" />}>
          <Chips<number>
            beschriftung="Warmwasserspeicher"
            optionen={speicherOptionen.map((l) => ({ wert: l, label: `${l} Liter` }))}
            wert={g.geraet.speicherLiter}
            onWaehlen={(w) => {
              if (w === null) return;
              onSpeicher(w);
            }}
            hinweis={`Nach ${g.personen ?? 2} Personen passt ${speicherEmpfehlung.liter} Liter.`}
          />
          <ZahlFeld
            beschriftung="Türbreite zum Heizraum"
            wert={g.platz.tuerbreiteCm}
            einheit="Zentimeter"
            min={40}
            max={250}
            fehler={tuerZuSchmal ? 'Unter 80 cm. Transportweg vor Ort klären.' : undefined}
            onChange={(w) => dispatch({ typ: 'gebaeudePlatz', teil: { tuerbreiteCm: w } })}
          />
          <label className="block">
            <span className="block text-sm font-medium text-slate-700">Heizraum</span>
            <input
              type="text"
              value={g.platz.heizraum}
              onChange={(e) => dispatch({ typ: 'gebaeudePlatz', teil: { heizraum: e.target.value } })}
              className="glass-input mt-1 h-12 w-full rounded-2xl border border-slate-200 bg-white px-3 text-base text-slate-900"
            />
          </label>
          <label className="block">
            <span className="block text-sm font-medium text-slate-700">Ort der Außeneinheit</span>
            <input
              type="text"
              value={g.platz.aussenEinheitOrt}
              onChange={(e) => dispatch({ typ: 'gebaeudePlatz', teil: { aussenEinheitOrt: e.target.value } })}
              className="glass-input mt-1 h-12 w-full rounded-2xl border border-slate-200 bg-white px-3 text-base text-slate-900"
            />
          </label>
          <JaNein
            beschriftung="Abstände eingehalten"
            wert={g.platz.abstaendeOk}
            onWaehlen={(w) => dispatch({ typ: 'gebaeudePlatz', teil: { abstaendeOk: w } })}
          />
        </Kachel>

        <Kachel titel="Betriebskosten" symbol={<Wallet aria-hidden className="h-5 w-5" />}>
          {!betrieb ? (
            <p className="text-base text-slate-600">Verbrauch oder Gebäudedaten ergänzen, dann rechnen wir den Vergleich.</p>
          ) : (
            <>
              <dl className="grid gap-3 sm:grid-cols-3">
                <div>
                  <dt className="text-sm text-slate-600">Heute ({betrieb.energieartLabel})</dt>
                  <dd className="tabular-nums text-base font-semibold text-slate-900">
                    {betrieb.heuteJahr === null ? 'kein Preis hinterlegt' : `${euro(betrieb.heuteJahr)} Euro im Jahr`}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-600">Mit Wärmepumpe</dt>
                  <dd className="tabular-nums text-base font-semibold text-slate-900">
                    {euro(betrieb.wpJahr)} Euro im Jahr
                  </dd>
                  <dd className="tabular-nums text-base text-slate-700">etwa {euro(betrieb.proMonat)} Euro im Monat</dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-600">Mit eigenem Solarstrom</dt>
                  <dd className="tabular-nums text-base font-semibold text-slate-900">
                    {euro(betrieb.wpMitPvJahr)} Euro im Jahr
                  </dd>
                </div>
              </dl>
              {betrieb.ersparnisJahr !== null && betrieb.ersparnisJahr > 0 ? (
                <p className="rounded-2xl bg-[#ECFDF3] p-3 text-base font-semibold text-[#15803D]">
                  Ersparnis etwa {euro(betrieb.ersparnisJahr)} Euro im Jahr.
                </p>
              ) : null}
              {!kundenansicht ? (
                <p className="text-sm text-slate-600">
                  Rechenweg: Wärmebedarf {betrieb.waermebedarfKwh.toLocaleString('de-DE')} Kilowattstunden (
                  {betrieb.quelle === 'verbrauch' ? 'aus dem Verbrauch' : 'aus der Schätzung'}), Jahresarbeitszahl{' '}
                  {betrieb.jaz.toLocaleString('de-DE')}, Strombedarf {betrieb.stromKwhWp.toLocaleString('de-DE')}{' '}
                  Kilowattstunden. Preise aus den Einstellungen.
                </p>
              ) : null}
            </>
          )}
          <label className="flex min-h-[44px] items-center gap-3 text-base text-slate-800">
            <input
              type="checkbox"
              checked={g.geraet.pvGewuenscht}
              onChange={(e) => dispatch({ typ: 'gebaeudeGeraet', teil: { pvGewuenscht: e.target.checked } })}
              className="h-6 w-6 rounded border-slate-300"
            />
            Eigener Solarstrom gewünscht
          </label>
          {g.geraet.pvGewuenscht ? (
            <ZahlFeld
              beschriftung="Leistung der Solaranlage"
              wert={g.geraet.pvKwp}
              einheit="Kilowatt Peak"
              min={0}
              max={100}
              schritt={0.1}
              onChange={(w) => dispatch({ typ: 'gebaeudeGeraet', teil: { pvKwp: w } })}
            />
          ) : null}
        </Kachel>
      </div>
    </section>
  );
}
