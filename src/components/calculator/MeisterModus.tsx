'use client';

/**
 * Meister-Modus: lineare Oberflaeche fuer den Termin vor Ort (Plan 4.8, Ablauf 2).
 *
 * Aufbau: Sticky-Navigation oben, Abschnitte Vorhaben, Bausteine, Kunde und Objekt,
 * Notizen und Skizze, Dokument, Abschluss; unten die Live-Kalkulationsleiste.
 *
 * Der gesamte Zustand ist eine InternAnfrage in einem useReducer. Die Kalkulation
 * laeuft live mit derselben reinen Funktion wie auf dem Server; die Matrix kommt
 * einmalig nach Anmeldung ueber ladeKalkulationsdaten. Massgeblich bleibt das
 * serverseitige Ergebnis beim Speichern.
 *
 * In der Kundenansicht werden Netto, interne Faktoren, Positionsnotizen und interne
 * Notizen nicht gerendert, also aus dem DOM entfernt.
 */
import { useCallback, useEffect, useMemo, useReducer, useRef, useState, useSyncExternalStore } from 'react';
import { ClipboardList, Image as ImageIcon, Percent, Send, Save, Users } from 'lucide-react';
import {
  ladeKalkulationsdaten,
  ladeTerminfenster,
  speichereEntwurf,
} from '@/app/(intern)/intern/actions';
import { berechne, euro, positionAusBaustein, vorschlagManuell } from '@/lib/services/calculation';
import {
  GEWERKE,
  type Baustein,
  type EstimateResponse,
  type Gewerk,
  type InternAnfrage,
  type InternAnfrageDTO,
  type Kalkulationsdaten,
  type KalkulationsErgebnis,
  type Position,
  type TerminfensterOption,
} from '@/lib/types';
import AbschlussSheet from './AbschlussSheet';
import BausteinTile from './BausteinTile';
import DokumentSchritt from './DokumentSchritt';
import FotoAufnahme from './FotoAufnahme';
import LiveCalcBar from './LiveCalcBar';
import MengenStepper from './MengenStepper';
import SketchPad from './SketchPad';
import ZuschlagToggle from './ZuschlagToggle';
import {
  entwurfSchluessel,
  ladeLokal,
  starteAutosave,
  verschmelzeEntwurf,
  type Autosave,
} from './entwurfSpeicher';
import {
  aktiveBausteine,
  ansichtAbonnieren,
  ansichtLesen,
  ansichtServerLesen,
  anhangName,
  ausDTO,
  ersteBlockierte,
  fehlendeAngaben,
  leereAnfrage,
  meisterReduzierer,
  neueId,
} from './meister-utils';

export type MeisterModusProps = { anfrageId?: string; initial?: InternAnfrageDTO | null };

const ABSCHNITTE = [
  { id: 'vorhaben', titel: 'Vorhaben' },
  { id: 'bausteine', titel: 'Bausteine' },
  { id: 'kunde', titel: 'Kunde und Objekt' },
  { id: 'notizen', titel: 'Notizen und Skizze' },
  { id: 'dokument', titel: 'Dokument' },
  { id: 'abschluss', titel: 'Abschluss' },
] as const;

const LEERES_ERGEBNIS: KalkulationsErgebnis = {
  positionen: [],
  nettoVon: 0,
  nettoBis: 0,
  rabattProzent: 0,
  bruttoVon: 0,
  bruttoBis: 0,
  foerderung: null,
  blockiert: [],
  vollstaendig: true,
};

type ManuellForm = {
  titel: string;
  gewerk: Gewerk;
  text: string;
  von: string;
  bis: string;
  stunden: string;
  stundensatz: string;
  material: string;
};

const LEERE_MANUELL: ManuellForm = {
  titel: '',
  gewerk: 'bad',
  text: '',
  von: '',
  bis: '',
  stunden: '',
  stundensatz: '',
  material: '',
};

function Feld({
  beschriftung,
  wert,
  onChange,
  typ = 'text',
  modus,
  auto,
}: {
  beschriftung: string;
  wert: string;
  onChange: (wert: string) => void;
  typ?: string;
  modus?: 'text' | 'tel' | 'email' | 'numeric' | 'decimal';
  auto?: string;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-slate-700">{beschriftung}</span>
      <input
        type={typ}
        value={wert}
        inputMode={modus}
        autoComplete={auto}
        onChange={(e) => onChange(e.target.value)}
        className="glass-input mt-1 h-12 w-full rounded-2xl border border-slate-200 bg-white px-3 text-base text-slate-900"
      />
    </label>
  );
}

export default function MeisterModus({ anfrageId, initial }: MeisterModusProps) {
  const [anfrage, dispatch] = useReducer(
    meisterReduzierer,
    initial ?? null,
    (dto: InternAnfrageDTO | null): InternAnfrage => (dto ? ausDTO(dto) : leereAnfrage()),
  );
  const ansicht = useSyncExternalStore(ansichtAbonnieren, ansichtLesen, ansichtServerLesen);
  const kundenansicht = ansicht.kundenansicht;

  const [daten, setDaten] = useState<Kalkulationsdaten | null>(null);
  const [ladefehler, setLadefehler] = useState('');
  const [laedt, setLaedt] = useState(true);
  const [terminfenster, setTerminfenster] = useState<TerminfensterOption[]>([]);
  const [terminfehler, setTerminfehler] = useState('');
  const [abschnitt, setAbschnitt] = useState<(typeof ABSCHNITTE)[number]['id']>('vorhaben');
  const [margenOffen, setMargenOffen] = useState(false);
  const [manuell, setManuell] = useState<ManuellForm>(LEERE_MANUELL);
  const [speicherWahl, setSpeicherWahl] = useState<Record<string, number>>({});
  const [skizzeIndex, setSkizzeIndex] = useState<number | null>(null);
  const [offeneDateien, setOffeneDateien] = useState<File[]>([]);
  const [abschlussOffen, setAbschlussOffen] = useState(false);
  const [sendet, setSendet] = useState(false);
  const [rueckmeldung, setRueckmeldung] = useState('');
  const [online, setOnline] = useState(true);

  const autosave = useRef<Autosave | null>(null);
  const ersteRunde = useRef(true);
  const schluessel = entwurfSchluessel(anfrageId ?? initial?.anfrageId);

  // Kalkulationsdaten und Terminfenster einmal beim Mount laden.
  useEffect(() => {
    let abgebrochen = false;
    void (async () => {
      try {
        const geladen = await ladeKalkulationsdaten();
        if (!abgebrochen) setDaten(geladen);
      } catch {
        if (!abgebrochen) setLadefehler('Kalkulationsdaten konnten nicht geladen werden.');
      } finally {
        if (!abgebrochen) setLaedt(false);
      }
      try {
        const fenster = await ladeTerminfenster();
        if (!abgebrochen) setTerminfenster(fenster);
      } catch {
        if (!abgebrochen) setTerminfehler('Terminfenster konnten nicht geladen werden.');
      }
    })();
    return () => {
      abgebrochen = true;
    };
  }, []);

  // Lokalen Entwurf uebernehmen (Konfliktregel: Server bei Status, Geraet bei Notizen und Skizzen).
  useEffect(() => {
    let abgebrochen = false;
    void (async () => {
      const lokal = await ladeLokal(schluessel);
      if (!lokal || abgebrochen) return;
      dispatch({ typ: 'ersetze', wert: initial ? verschmelzeEntwurf(ausDTO(initial), lokal) : lokal });
    })();
    return () => {
      abgebrochen = true;
    };
  }, [schluessel, initial]);

  // Autosave einrichten.
  useEffect(() => {
    autosave.current = starteAutosave({
      schluessel,
      senden: (a) => speichereEntwurf({ ...a, aktion: 'entwurf' }),
    });
    return () => {
      autosave.current?.stoppe();
      autosave.current = null;
    };
  }, [schluessel]);

  useEffect(() => {
    if (ersteRunde.current) {
      ersteRunde.current = false;
      return;
    }
    autosave.current?.melde(anfrage);
  }, [anfrage]);

  useEffect(() => {
    const setzen = () => setOnline(typeof navigator === 'undefined' || navigator.onLine !== false);
    setzen();
    window.addEventListener('online', setzen);
    window.addEventListener('offline', setzen);
    return () => {
      window.removeEventListener('online', setzen);
      window.removeEventListener('offline', setzen);
    };
  }, []);

  const alleBausteine = useMemo<Baustein[]>(
    () => (daten ? daten.vorlagen.flatMap((v) => v.bausteine) : []),
    [daten],
  );
  const gewaehlteBausteine = useMemo(
    () => aktiveBausteine(alleBausteine, anfrage.vorlageIds),
    [alleBausteine, anfrage.vorlageIds],
  );
  const basisBausteine = gewaehlteBausteine.filter((b) => !b.zuschlag);
  const zuschlagBausteine = gewaehlteBausteine.filter((b) => b.zuschlag);

  const ergebnis = useMemo<KalkulationsErgebnis>(() => {
    if (!daten) return LEERES_ERGEBNIS;
    return berechne({
      positionen: anfrage.positionen,
      matrix: daten.matrix,
      faktoren: anfrage.kalkulation,
      foerderung: anfrage.foerderung,
      foerderRegeln: daten.foerderRegeln,
    });
  }, [daten, anfrage.positionen, anfrage.kalkulation, anfrage.foerderung]);

  const positionZu = useCallback(
    (id: string): Position | null => anfrage.positionen.find((p) => p.id === id) ?? null,
    [anfrage.positionen],
  );

  // Annahmen und Vorbehalte einmal aus der Vorlage vorbelegen.
  useEffect(() => {
    if (!daten || !anfrage.vorlageIds.length) return;
    const vorlagen = daten.vorlagen.filter((v) => anfrage.vorlageIds.includes(v.id));
    if (!vorlagen.length) return;
    const teil: Partial<InternAnfrage> = {};
    if (!anfrage.annahmen.length) {
      const annahmen = [...new Set(vorlagen.flatMap((v) => v.annahmenStandard))];
      if (annahmen.length) teil.annahmen = annahmen;
    }
    if (!anfrage.vorbehalte.length) {
      const ids = new Set(vorlagen.flatMap((v) => v.vorbehaltIds));
      const texte = daten.vorbehalte.filter((v) => ids.has(v.id)).map((v) => v.text);
      if (texte.length) teil.vorbehalte = texte;
    }
    if (!anfrage.vorhabenKurz) teil.vorhabenKurz = vorlagen.map((v) => v.vorhabenKurz).join(' und ');
    if (!anfrage.gewerkHaupt) teil.gewerkHaupt = vorlagen[0].gewerkHaupt;
    if (Object.keys(teil).length) dispatch({ typ: 'feld', teil });
  }, [daten, anfrage.vorlageIds, anfrage.annahmen.length, anfrage.vorbehalte.length, anfrage.vorhabenKurz, anfrage.gewerkHaupt]);

  const setzePosition = useCallback(
    (b: Baustein, teil: { aktiv?: boolean; varianteMatrixNr?: number | null; menge?: number; liter?: number }) => {
      const alt = positionZu(b.id);
      const variante =
        teil.varianteMatrixNr !== undefined
          ? teil.varianteMatrixNr
          : (alt?.varianteMatrixNr ?? b.groessenVarianten?.[0]?.matrixNr ?? null);
      const gewaehlteVariante = b.groessenVarianten?.find((v) => v.matrixNr === variante) ?? null;
      const liter = teil.liter ?? speicherWahl[b.id] ?? gewaehlteVariante?.speicherLiterDefault;
      const neu = positionAusBaustein(b, daten?.matrix ?? [], {
        varianteMatrixNr: variante,
        menge: teil.menge ?? alt?.menge ?? b.mengeDefault,
        liter,
        kW: gewaehlteVariante?.kwLabel,
        aktiv: teil.aktiv ?? alt?.aktiv ?? !b.zuschlag,
      });
      dispatch({
        typ: 'positionSetzen',
        position: { ...neu, notizIntern: alt?.notizIntern ?? '', intern: alt?.intern ?? {} },
      });
    },
    [daten, positionZu, speicherWahl],
  );

  // Basispositionen anlegen, sobald eine Vorlage gewaehlt wurde.
  useEffect(() => {
    if (!daten) return;
    for (const b of gewaehlteBausteine) {
      if (b.zuschlag) continue;
      if (anfrage.positionen.some((p) => p.id === b.id)) continue;
      setzePosition(b, { aktiv: true });
    }
  }, [daten, gewaehlteBausteine, anfrage.positionen, setzePosition]);

  const hinweiseZu = useCallback(
    (id: string) => ergebnis.blockiert.filter((h) => h.positionId === id),
    [ergebnis.blockiert],
  );

  const springeZuBlockierter = useCallback(() => {
    const id = ersteBlockierte(ergebnis.blockiert);
    if (!id) return;
    document.getElementById(`baustein-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setAbschnitt('bausteine');
  }, [ergebnis.blockiert]);

  const manuellVorschlag = useMemo(() => {
    const wert = vorschlagManuell(
      {
        stunden: manuell.stunden ? Number(manuell.stunden) : undefined,
        stundensatz: manuell.stundensatz ? Number(manuell.stundensatz) : undefined,
        material: manuell.material ? Number(manuell.material) : undefined,
      },
      anfrage.kalkulation,
    );
    return wert;
  }, [manuell.stunden, manuell.stundensatz, manuell.material, anfrage.kalkulation]);

  const manuellHinzu = () => {
    const von = Number(manuell.von);
    const bis = Number(manuell.bis);
    if (!manuell.titel.trim() || !Number.isFinite(von) || !Number.isFinite(bis)) return;
    const position: Position = {
      id: neueId('manuell'),
      titel: manuell.titel.trim(),
      gewerk: manuell.gewerk,
      text: manuell.text.trim(),
      menge: 1,
      einheit: 'pauschal',
      von: Math.round(von),
      bis: Math.round(bis),
      matrixNr: null,
      vorlageZeileId: null,
      varianteMatrixNr: null,
      zuschlag: false,
      aktiv: true,
      quelle: 'manuell',
      notizIntern: '',
      intern: {
        stunden: manuell.stunden ? Number(manuell.stunden) : undefined,
        stundensatz: manuell.stundensatz ? Number(manuell.stundensatz) : undefined,
        material: manuell.material ? Number(manuell.material) : undefined,
      },
    };
    dispatch({ typ: 'positionSetzen', position });
    setManuell(LEERE_MANUELL);
  };

  const fehlt = fehlendeAngaben(anfrage);

  const alsEntwurf = async () => {
    setSendet(true);
    setRueckmeldung('');
    try {
      const antwort = await speichereEntwurf({ ...anfrage, aktion: 'entwurf' });
      setRueckmeldung(
        antwort.ok && antwort.modus === 'intern'
          ? `Entwurf gespeichert: ${antwort.ksNummer}. ${antwort.rueckmeldung}`
          : antwort.ok
            ? 'Entwurf gespeichert.'
            : antwort.fehler,
      );
    } catch {
      setRueckmeldung('Entwurf konnte nicht gespeichert werden. Er bleibt auf dem Geraet.');
    } finally {
      setSendet(false);
    }
  };

  const sofortSenden = async () => {
    setSendet(true);
    setRueckmeldung('');
    try {
      const antwort = await fetch('/api/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...anfrage, modus: 'intern', aktion: 'sofort' }),
      });
      const ergebnisAntwort = (await antwort.json()) as EstimateResponse;
      if (ergebnisAntwort.ok && ergebnisAntwort.modus === 'intern') {
        setRueckmeldung(ergebnisAntwort.rueckmeldung);
      } else if (!ergebnisAntwort.ok) {
        setRueckmeldung(ergebnisAntwort.fehler);
      } else {
        setRueckmeldung('Gesendet.');
      }
    } catch {
      setRueckmeldung('Versand fehlgeschlagen. Bitte erneut versuchen.');
    } finally {
      setSendet(false);
    }
  };

  const ksNummer = initial?.ksNummer ?? 'KS-0000-0000';

  return (
    <div className={kundenansicht ? 'pb-4' : 'pb-4'}>
      {kundenansicht ? (
        <div className="sticky top-0 z-30 bg-[color:var(--modul-blau,#1B3A8C)] px-4 py-2 text-center text-sm font-semibold text-white">
          Kundenansicht aktiv
        </div>
      ) : null}

      <nav aria-label="Abschnitte" className="glass-toolbar sticky top-0 z-20 -mx-4 mb-6 border-b border-white/60 bg-white/85 px-4 py-2">
        <ul className="flex gap-2 overflow-x-auto">
          {ABSCHNITTE.map((a) => (
            <li key={a.id}>
              <button
                type="button"
                aria-current={abschnitt === a.id ? 'step' : undefined}
                onClick={() => setAbschnitt(a.id)}
                className={[
                  'fokus-ring min-h-[44px] whitespace-nowrap rounded-full px-4 text-sm font-semibold',
                  abschnitt === a.id ? 'bg-[color:var(--modul-blau,#1B3A8C)] text-white' : 'bg-white text-slate-700',
                ].join(' ')}
              >
                {a.titel}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {laedt ? <p className="rounded-2xl bg-white/80 p-4 text-base text-slate-700">Kalkulationsdaten werden geladen …</p> : null}
      {ladefehler ? <p className="rounded-2xl bg-[#FEF3F2] p-4 text-base text-[#B42318]">{ladefehler}</p> : null}

      {abschnitt === 'vorhaben' ? (
        <section aria-labelledby="h-vorhaben">
          <h2 id="h-vorhaben" className="text-xl font-semibold text-slate-900">
            Vorhaben
          </h2>
          <p className="text-base text-slate-600">Mehrere Vorlagen lassen sich kombinieren.</p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {(daten?.vorlagen ?? []).map((v) => {
              const an = anfrage.vorlageIds.includes(v.id);
              return (
                <li key={v.id}>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={an}
                    onClick={() => dispatch({ typ: 'vorlage', vorlageId: v.id, an: !an })}
                    className={[
                      'glass-tile fokus-ring min-h-[96px] w-full rounded-3xl border p-4 text-left',
                      an ? 'border-[color:var(--modul-blau,#1B3A8C)] ring-2 ring-[color:var(--modul-blau,#1B3A8C)]' : 'border-white/70',
                    ].join(' ')}
                  >
                    <span className="block text-base font-semibold text-slate-900">{v.name}</span>
                    <span className="mt-1 block text-sm text-slate-600">{v.vorhabenKurz}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {abschnitt === 'bausteine' ? (
        <section aria-labelledby="h-bausteine">
          <h2 id="h-bausteine" className="text-xl font-semibold text-slate-900">
            Bausteine
          </h2>
          {!basisBausteine.length ? (
            <p className="mt-2 text-base text-slate-600">Zuerst ein Vorhaben waehlen.</p>
          ) : null}

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {basisBausteine.map((b) => (
              <BausteinTile
                key={b.id}
                baustein={b}
                position={positionZu(b.id)}
                ergebnis={ergebnis.positionen.find((p) => p.positionId === b.id) ?? null}
                hinweise={hinweiseZu(b.id)}
                kundenansicht={kundenansicht}
                speicherWahl={speicherWahl[b.id] ?? null}
                onUmschalten={(an) => setzePosition(b, { aktiv: an })}
                onVariante={(matrixNr) => setzePosition(b, { varianteMatrixNr: matrixNr, aktiv: true })}
                onSpeicher={(liter) => {
                  setSpeicherWahl((alt) => ({ ...alt, [b.id]: liter }));
                  setzePosition(b, { liter, aktiv: true });
                }}
                onMenge={(menge) => setzePosition(b, { menge })}
                onNotiz={(text) => dispatch({ typ: 'positionAendern', id: b.id, teil: { notizIntern: text } })}
              />
            ))}
          </div>

          {zuschlagBausteine.length ? (
            <>
              <h3 className="mt-8 text-lg font-semibold text-slate-900">Zuschlaege</h3>
              <ul className="mt-3 space-y-3">
                {zuschlagBausteine.map((b) => (
                  <ZuschlagToggle
                    key={b.id}
                    baustein={b}
                    position={positionZu(b.id)}
                    kundenansicht={kundenansicht}
                    onUmschalten={(an) => setzePosition(b, { aktiv: an })}
                    onMenge={(menge) => setzePosition(b, { menge, aktiv: true })}
                  />
                ))}
              </ul>
            </>
          ) : null}

          {!kundenansicht ? (
            <>
              <h3 className="mt-8 text-lg font-semibold text-slate-900">Position von Hand</h3>
              <div className="glass-tile mt-3 grid gap-3 rounded-3xl border border-white/70 p-4 sm:grid-cols-2">
                <Feld beschriftung="Titel" wert={manuell.titel} onChange={(w) => setManuell({ ...manuell, titel: w })} />
                <label className="block">
                  <span className="block text-sm font-medium text-slate-700">Gewerk</span>
                  <select
                    value={manuell.gewerk}
                    onChange={(e) => setManuell({ ...manuell, gewerk: e.target.value as Gewerk })}
                    className="glass-input mt-1 h-12 w-full rounded-2xl border border-slate-200 bg-white px-3 text-base text-slate-900"
                  >
                    {GEWERKE.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block sm:col-span-2">
                  <span className="block text-sm font-medium text-slate-700">Text</span>
                  <textarea
                    value={manuell.text}
                    rows={2}
                    onChange={(e) => setManuell({ ...manuell, text: e.target.value })}
                    className="glass-input mt-1 w-full rounded-2xl border border-slate-200 bg-white p-3 text-base text-slate-900"
                  />
                </label>
                <Feld beschriftung="von (Euro netto)" wert={manuell.von} modus="numeric" onChange={(w) => setManuell({ ...manuell, von: w })} />
                <Feld beschriftung="bis (Euro netto)" wert={manuell.bis} modus="numeric" onChange={(w) => setManuell({ ...manuell, bis: w })} />
                <Feld beschriftung="Stunden" wert={manuell.stunden} modus="decimal" onChange={(w) => setManuell({ ...manuell, stunden: w })} />
                <Feld beschriftung="Stundensatz" wert={manuell.stundensatz} modus="numeric" onChange={(w) => setManuell({ ...manuell, stundensatz: w })} />
                <Feld beschriftung="Material" wert={manuell.material} modus="numeric" onChange={(w) => setManuell({ ...manuell, material: w })} />
                <div className="flex items-end">
                  <p className="text-sm text-slate-600">
                    Vorschlag: {manuellVorschlag === null ? 'kein Vorschlag' : `${euro(manuellVorschlag)} Euro`}
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <button
                    type="button"
                    onClick={manuellHinzu}
                    className="fokus-ring min-h-[56px] rounded-2xl bg-[color:var(--modul-blau,#1B3A8C)] px-6 text-base font-semibold text-white"
                  >
                    Position hinzufuegen
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setMargenOffen(true)}
                className="fokus-ring mt-4 inline-flex min-h-[56px] items-center gap-2 rounded-2xl bg-white px-5 text-base font-semibold text-slate-700"
              >
                <Percent aria-hidden className="h-5 w-5" /> Margen und Rabatt
              </button>
            </>
          ) : null}
        </section>
      ) : null}

      {abschnitt === 'kunde' ? (
        <section aria-labelledby="h-kunde">
          <h2 id="h-kunde" className="flex items-center gap-2 text-xl font-semibold text-slate-900">
            <Users aria-hidden className="h-5 w-5" /> Kunde und Objekt
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="block text-sm font-medium text-slate-700">Anrede</span>
              <select
                value={anfrage.kontakt.anrede}
                onChange={(e) => dispatch({ typ: 'kontakt', teil: { anrede: e.target.value as 'Frau' | 'Herr' | '' } })}
                className="glass-input mt-1 h-12 w-full rounded-2xl border border-slate-200 bg-white px-3 text-base text-slate-900"
              >
                <option value="">unsicher</option>
                <option value="Frau">Frau</option>
                <option value="Herr">Herr</option>
              </select>
            </label>
            <Feld beschriftung="Vorname" auto="given-name" wert={anfrage.kontakt.vorname} onChange={(w) => dispatch({ typ: 'kontakt', teil: { vorname: w } })} />
            <Feld beschriftung="Nachname" auto="family-name" wert={anfrage.kontakt.nachname} onChange={(w) => dispatch({ typ: 'kontakt', teil: { nachname: w } })} />
            <Feld beschriftung="E-Mail" typ="email" modus="email" auto="email" wert={anfrage.kontakt.email} onChange={(w) => dispatch({ typ: 'kontakt', teil: { email: w } })} />
            <Feld beschriftung="Telefon" typ="tel" modus="tel" auto="tel" wert={anfrage.kontakt.telefon ?? ''} onChange={(w) => dispatch({ typ: 'kontakt', teil: { telefon: w } })} />
            <Feld beschriftung="Strasse" wert={anfrage.kontakt.strasse} onChange={(w) => dispatch({ typ: 'kontakt', teil: { strasse: w } })} />
            <Feld beschriftung="PLZ und Ort" wert={anfrage.kontakt.plzOrt} onChange={(w) => dispatch({ typ: 'kontakt', teil: { plzOrt: w } })} />
            <Feld beschriftung="Objektadresse" wert={anfrage.objekt.adresse} onChange={(w) => dispatch({ typ: 'objekt', teil: { adresse: w } })} />
            <Feld beschriftung="PLZ des Objekts" modus="numeric" wert={anfrage.objekt.plz ?? ''} onChange={(w) => dispatch({ typ: 'objekt', teil: { plz: w } })} />
            <label className="block">
              <span className="block text-sm font-medium text-slate-700">Eigentum</span>
              <select
                value={anfrage.objekt.eigentum}
                onChange={(e) => dispatch({ typ: 'objekt', teil: { eigentum: e.target.value as 'eigentum' | 'miete' | 'unklar' } })}
                className="glass-input mt-1 h-12 w-full rounded-2xl border border-slate-200 bg-white px-3 text-base text-slate-900"
              >
                <option value="eigentum">Eigentum</option>
                <option value="miete">Miete</option>
                <option value="unklar">unklar</option>
              </select>
            </label>
            <div>
              <span className="block text-sm font-medium text-slate-700">Wohneinheiten</span>
              <div className="mt-1">
                <MengenStepper
                  wert={anfrage.objekt.wohneinheiten}
                  einheit="je_stueck"
                  min={1}
                  max={12}
                  beschriftung="Wohneinheiten"
                  onChange={(w) => dispatch({ typ: 'objekt', teil: { wohneinheiten: Math.round(w) } })}
                />
              </div>
            </div>
            <label className="block">
              <span className="block text-sm font-medium text-slate-700">Dringlichkeit</span>
              <select
                value={anfrage.dringlichkeit}
                onChange={(e) =>
                  dispatch({ typ: 'feld', teil: { dringlichkeit: e.target.value as InternAnfrage['dringlichkeit'] } })
                }
                className="glass-input mt-1 h-12 w-full rounded-2xl border border-slate-200 bg-white px-3 text-base text-slate-900"
              >
                <option value="sofort">sofort</option>
                <option value="wochen_4">in vier Wochen</option>
                <option value="monate_3">in drei Monaten</option>
                <option value="unklar">unklar</option>
              </select>
            </label>
          </div>

          <fieldset className="mt-8">
            <legend className="text-lg font-semibold text-slate-900">Foerderung</legend>
            <div className="mt-3 space-y-2">
              {(
                [
                  ['aktiv', 'Foerderung pruefen'],
                  ['selbstBewohnt', 'selbst bewohnt'],
                  ['altOelOderGas', 'alte Oel- oder Gasheizung'],
                  ['einkommenUnterGrenze', 'Einkommen unter der Grenze'],
                  ['natuerlichesKaeltemittel', 'natuerliches Kaeltemittel'],
                ] as const
              ).map(([schluesselName, beschriftung]) => (
                <label key={schluesselName} className="flex min-h-[44px] items-center gap-3 text-base text-slate-800">
                  <input
                    type="checkbox"
                    checked={Boolean(anfrage.foerderung[schluesselName])}
                    onChange={(e) => dispatch({ typ: 'foerderung', teil: { [schluesselName]: e.target.checked } })}
                    className="h-6 w-6 rounded border-slate-300"
                  />
                  {beschriftung}
                </label>
              ))}
              {!kundenansicht ? (
                <Feld
                  beschriftung="Satz von Hand in Prozent"
                  modus="numeric"
                  wert={anfrage.foerderung.satzManuell === null || anfrage.foerderung.satzManuell === undefined ? '' : String(anfrage.foerderung.satzManuell)}
                  onChange={(w) => dispatch({ typ: 'foerderung', teil: { satzManuell: w === '' ? null : Number(w) } })}
                />
              ) : null}
            </div>
          </fieldset>
        </section>
      ) : null}

      {abschnitt === 'notizen' ? (
        <section aria-labelledby="h-notizen">
          <h2 id="h-notizen" className="flex items-center gap-2 text-xl font-semibold text-slate-900">
            <ClipboardList aria-hidden className="h-5 w-5" /> Notizen und Skizze
          </h2>
          {!kundenansicht ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Feld
                beschriftung="Etage"
                modus="numeric"
                wert={anfrage.notizen.etage === null ? '' : String(anfrage.notizen.etage)}
                onChange={(w) => dispatch({ typ: 'notizen', teil: { etage: w === '' ? null : Number(w) } })}
              />
              <label className="block">
                <span className="block text-sm font-medium text-slate-700">Aufzug</span>
                <select
                  value={anfrage.notizen.aufzug === null ? '' : anfrage.notizen.aufzug ? 'ja' : 'nein'}
                  onChange={(e) =>
                    dispatch({ typ: 'notizen', teil: { aufzug: e.target.value === '' ? null : e.target.value === 'ja' } })
                  }
                  className="glass-input mt-1 h-12 w-full rounded-2xl border border-slate-200 bg-white px-3 text-base text-slate-900"
                >
                  <option value="">unbekannt</option>
                  <option value="ja">ja</option>
                  <option value="nein">nein</option>
                </select>
              </label>
              <label className="block sm:col-span-2">
                <span className="block text-sm font-medium text-slate-700">Montagehindernisse</span>
                <textarea
                  value={anfrage.notizen.montagehindernisse}
                  rows={2}
                  onChange={(e) => dispatch({ typ: 'notizen', teil: { montagehindernisse: e.target.value } })}
                  className="glass-input mt-1 w-full rounded-2xl border border-slate-200 bg-white p-3 text-base text-slate-900"
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="block text-sm font-medium text-slate-700">Leitungswege</span>
                <textarea
                  value={anfrage.notizen.leitungswege}
                  rows={2}
                  onChange={(e) => dispatch({ typ: 'notizen', teil: { leitungswege: e.target.value } })}
                  className="glass-input mt-1 w-full rounded-2xl border border-slate-200 bg-white p-3 text-base text-slate-900"
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="block text-sm font-medium text-slate-700">Freie Notizen (bleiben intern)</span>
                <textarea
                  value={anfrage.notizen.intern}
                  rows={3}
                  onChange={(e) => dispatch({ typ: 'notizen', teil: { intern: e.target.value } })}
                  className="glass-input mt-1 w-full rounded-2xl border border-slate-200 bg-white p-3 text-base text-slate-900"
                />
              </label>
            </div>
          ) : null}

          <h3 className="mt-8 flex items-center gap-2 text-lg font-semibold text-slate-900">
            <ImageIcon aria-hidden className="h-5 w-5" /> Skizzen
          </h3>
          <ul className="mt-3 flex flex-wrap gap-3">
            {anfrage.skizzen.map((s, i) => (
              <li key={`${s.name}-${i}`} className="rounded-2xl border border-slate-200 p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.dataUrl} alt={s.name} className="h-24 w-32 object-contain" />
                <div className="mt-1 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSkizzeIndex(i)}
                    className="fokus-ring min-h-[44px] rounded-full bg-white px-3 text-sm font-medium text-slate-700"
                  >
                    Oeffnen
                  </button>
                  <button
                    type="button"
                    onClick={() => dispatch({ typ: 'skizzeEntfernen', index: i })}
                    className="fokus-ring min-h-[44px] rounded-full bg-white px-3 text-sm font-medium text-[#B42318]"
                  >
                    Entfernen
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => setSkizzeIndex(anfrage.skizzen.length)}
            className="fokus-ring mt-3 min-h-[56px] rounded-2xl bg-white px-5 text-base font-semibold text-slate-700"
          >
            Neue Skizze
          </button>

          {skizzeIndex !== null ? (
            <div className="mt-4">
              <SketchPad
                wert={anfrage.skizzen[skizzeIndex] ?? null}
                onChange={(skizze) => {
                  dispatch({ typ: 'skizzeSetzen', index: skizzeIndex, skizze });
                  setSkizzeIndex(null);
                }}
              />
            </div>
          ) : null}

          <h3 className="mt-8 text-lg font-semibold text-slate-900">Fotos</h3>
          <div className="mt-3">
            <FotoAufnahme
              fotos={anfrage.fotos}
              offeneDateien={offeneDateien}
              onFotos={(neue) => dispatch({ typ: 'fotosHinzu', fotos: neue })}
              onOffeneDateien={(dateien) => setOffeneDateien((alt) => [...alt, ...dateien])}
              onEntfernen={(index) => dispatch({ typ: 'fotoEntfernen', index })}
            />
          </div>
        </section>
      ) : null}

      {abschnitt === 'dokument' ? (
        <section aria-labelledby="h-dokument">
          <h2 id="h-dokument" className="text-xl font-semibold text-slate-900">
            Dokument
          </h2>
          <div className="mt-4">
            <DokumentSchritt
              persoenlicherSatz={anfrage.persoenlicherSatz}
              ausfuehrungSatz={anfrage.ausfuehrungSatz}
              annahmen={anfrage.annahmen}
              vorbehalte={anfrage.vorbehalte}
              terminfenster={terminfenster}
              gewaehlteFenster={anfrage.terminfensterIds}
              ladeFehler={terminfehler}
              onPersoenlicherSatz={(w) => dispatch({ typ: 'feld', teil: { persoenlicherSatz: w } })}
              onAusfuehrungSatz={(w) => dispatch({ typ: 'feld', teil: { ausfuehrungSatz: w } })}
              onAnnahmen={(w) => dispatch({ typ: 'feld', teil: { annahmen: w } })}
              onVorbehalte={(w) => dispatch({ typ: 'feld', teil: { vorbehalte: w } })}
              onFenster={(ids) => dispatch({ typ: 'termin', ids })}
            />
          </div>
        </section>
      ) : null}

      {abschnitt === 'abschluss' ? (
        <section aria-labelledby="h-abschluss">
          <h2 id="h-abschluss" className="text-xl font-semibold text-slate-900">
            Abschluss
          </h2>
          <dl className="mt-4 space-y-2 text-base">
            <div>
              <dt className="text-sm text-slate-600">Kunde</dt>
              <dd className="text-slate-900">
                {[anfrage.kontakt.anrede, anfrage.kontakt.vorname, anfrage.kontakt.nachname].filter(Boolean).join(' ') || 'noch offen'}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-slate-600">Vorhaben</dt>
              <dd className="text-slate-900">{anfrage.vorhabenKurz || 'noch offen'}</dd>
            </div>
            <div>
              <dt className="text-sm text-slate-600">Bruttospanne</dt>
              <dd className="tabular-nums text-slate-900">
                {euro(ergebnis.bruttoVon)} bis {euro(ergebnis.bruttoBis)} Euro
              </dd>
            </div>
            {ergebnis.foerderung ? (
              <div>
                <dt className="text-sm text-slate-600">Foerderzuschuss</dt>
                <dd className="tabular-nums text-slate-900">{euro(ergebnis.foerderung.zuschuss)} Euro</dd>
              </div>
            ) : null}
          </dl>

          {fehlt.length ? (
            <div className="mt-4 rounded-2xl bg-[#FFFBEB] p-3 text-sm text-[#92400E]">
              <p className="font-medium">Fehlende Angaben</p>
              <p>{fehlt.join(', ')}</p>
            </div>
          ) : null}
          {!anfrage.vorbehalte.length ? (
            <p className="mt-3 rounded-2xl bg-[#FFFBEB] p-3 text-sm text-[#92400E]">
              Kein Vorbehalt gesetzt. Bitte den Block &bdquo;Nicht enthalten und bauseits&ldquo; pr&uuml;fen.
            </p>
          ) : null}
          {rueckmeldung ? (
            <p aria-live="polite" className="mt-4 rounded-2xl bg-slate-100 p-3 text-base text-slate-800">
              {rueckmeldung}
            </p>
          ) : null}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => void alsEntwurf()}
              disabled={sendet}
              className="fokus-ring inline-flex min-h-[56px] flex-1 items-center justify-center gap-2 rounded-2xl bg-white px-6 text-base font-semibold text-slate-800 disabled:opacity-50"
            >
              <Save aria-hidden className="h-5 w-5" /> Als Entwurf speichern
            </button>
            <button
              type="button"
              onClick={() => setAbschlussOffen(true)}
              disabled={sendet || !online}
              className="fokus-ring inline-flex min-h-[56px] flex-1 items-center justify-center gap-2 rounded-2xl bg-[color:var(--modul-blau,#1B3A8C)] px-6 text-base font-semibold text-white disabled:opacity-50"
            >
              <Send aria-hidden className="h-5 w-5" /> Sofort senden
            </button>
          </div>
          {!online ? (
            <p className="mt-3 text-sm text-slate-700">
              Ohne Netz sind Freigabe und Sofortversand gesperrt. Der Entwurf liegt auf dem Geraet und geht bei Verbindung raus.
            </p>
          ) : null}
        </section>
      ) : null}

      <LiveCalcBar ergebnis={ergebnis} kundenansicht={kundenansicht} onSprungZuBlockierter={springeZuBlockierter} />

      {margenOffen && !kundenansicht ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 sm:items-center sm:p-6">
          <div role="dialog" aria-modal="true" aria-label="Margen und Rabatt" className="glass-sheet w-full max-w-lg rounded-t-3xl border border-white/70 bg-white/95 p-6 sm:rounded-3xl">
            <h2 className="text-xl font-semibold text-slate-900">Margen und Rabatt</h2>
            <div className="mt-4 grid gap-3">
              <Feld
                beschriftung="Stundensatz"
                modus="numeric"
                wert={anfrage.kalkulation.stundensatz === undefined ? '' : String(anfrage.kalkulation.stundensatz)}
                onChange={(w) => dispatch({ typ: 'kalkulation', teil: { stundensatz: w === '' ? undefined : Number(w) } })}
              />
              <Feld
                beschriftung="Materialaufschlag in Prozent"
                modus="numeric"
                wert={anfrage.kalkulation.materialZuschlagProzent === undefined ? '' : String(anfrage.kalkulation.materialZuschlagProzent)}
                onChange={(w) => dispatch({ typ: 'kalkulation', teil: { materialZuschlagProzent: w === '' ? undefined : Number(w) } })}
              />
              <Feld
                beschriftung="Rabatt in Prozent"
                modus="numeric"
                wert={anfrage.kalkulation.rabattProzent === undefined ? '' : String(anfrage.kalkulation.rabattProzent)}
                onChange={(w) => dispatch({ typ: 'kalkulation', teil: { rabattProzent: w === '' ? undefined : Number(w) } })}
              />
            </div>
            <button
              type="button"
              onClick={() => setMargenOffen(false)}
              className="fokus-ring mt-6 min-h-[56px] w-full rounded-2xl bg-[color:var(--modul-blau,#1B3A8C)] px-6 text-base font-semibold text-white"
            >
              Schliessen
            </button>
          </div>
        </div>
      ) : null}

      <AbschlussSheet
        offen={abschlussOffen}
        empfaenger={anfrage.kontakt.email}
        anhangname={anhangName(ksNummer)}
        bruttoVon={ergebnis.bruttoVon}
        bruttoBis={ergebnis.bruttoBis}
        fehlendeAngaben={fehlt}
        online={online}
        laeuft={sendet}
        rueckmeldung={rueckmeldung}
        onSenden={() => void sofortSenden()}
        onSchliessen={() => setAbschlussOffen(false)}
      />
    </div>
  );
}
