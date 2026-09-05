'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { parseDispatchText, type DispatchBefehl } from '@/lib/services/dispatch-parser';
import {
  BAUJAHR_KLASSE_LABEL, ENERGIEART_LABEL, HERSTELLER_LABEL, LAGE_LABEL,
  geraetAusBaureihe, heizlastSchaetzen, speicherVorschlag,
} from '@/lib/services/heizlast';
import type { HeizungsStandort } from '@/lib/types';
import { fuehreDispatchAus, type DispatchErgebnis } from './actions';

const STANDORT_LABEL: Record<HeizungsStandort, string> = {
  keller: 'Keller', erdgeschoss: 'Erdgeschoss', dachgeschoss: 'Dachgeschoss',
  anbau: 'Anbau', aussen: 'Außen', unbekannt: 'unbekannt',
};

/** Eine Zeile der Vorschau. Fehlende Angaben werden ausdrücklich als „fehlt“ markiert. */
function Zeile({ beschriftung, wert }: { beschriftung: string; wert: string | number | null | undefined }) {
  const leer = wert === null || wert === undefined || wert === '' || wert === 'unbekannt';
  return (
    <p className="flex flex-wrap gap-x-2 text-sm text-slate-800">
      <span className="font-bold">{beschriftung}:</span>
      {leer ? <span className="font-semibold text-[#B42318]">fehlt</span> : <span className="tabular-nums">{wert}</span>}
    </p>
  );
}

export default function DispatchClient() {
  const [text, setText] = useState('');
  const [laeuft, setLaeuft] = useState(false);
  const [ergebnis, setErgebnis] = useState<DispatchErgebnis | null>(null);
  const [fehler, setFehler] = useState<string | null>(null);

  // Live-Vorschau der Parsing-Ergebnisse
  const befehl: DispatchBefehl | null = useMemo(() => {
    if (!text.trim()) return null;
    return parseDispatchText(text);
  }, [text]);

  // Gerätevorschlag zur Vorschau: reine Funktionen, dieselben wie im Meister-Modus.
  const vorschau = useMemo(() => {
    if (befehl?.art !== 'portal_lead') return null;
    const schaetzung = heizlastSchaetzen(befehl.gebaeude);
    if (!schaetzung) return null;
    const hersteller = befehl.gebaeude.geraet.hersteller;
    const geraet = geraetAusBaureihe(schaetzung.kwBis, hersteller);
    return {
      kwVon: schaetzung.kwVon,
      kwBis: schaetzung.kwBis,
      geraetKw: geraet.kw,
      hersteller: HERSTELLER_LABEL[hersteller],
      liter: speicherVorschlag(befehl.gebaeude.personen).liter,
    };
  }, [befehl]);

  async function handleAusfuehren() {
    if (!befehl) return;
    setLaeuft(true);
    setFehler(null);
    setErgebnis(null);
    try {
      const res = await fuehreDispatchAus(befehl);
      if (res.ok) {
        setErgebnis(res);
        setText('');
      } else {
        setFehler(res.fehler || 'Fehler beim Ausführen.');
      }
    } catch {
      setFehler('Ein Systemfehler ist aufgetreten.');
    } finally {
      setLaeuft(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Mobile Dispatch</h1>
        <p className="mt-1 text-sm sm:text-base text-slate-600">
          Sprachnachricht diktieren oder Kurztext eingeben. Das System erkennt Befehle oder legt automatisch eine neue Anfrage an.
        </p>
      </header>

      {/* Eingabefeld */}
      <div className="space-y-3">
        <label htmlFor="dispatch-input" className="block text-sm font-bold text-slate-800">
          Diktat / Freitext eingeben
        </label>
        <div className="relative">
          <textarea
            id="dispatch-input"
            rows={5}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Beispiel: Neue Anfrage. Frau Diflo, Hainbachstraße 3 in 35641 Schöffengrund, Klimaanlage mit Heizfunktion, 0171 1234567 ..."
            className="glass-input w-full p-4 rounded-3xl border border-slate-200 text-base text-slate-900 leading-relaxed"
          />
        </div>
      </div>

      {/* Parser Vorschau */}
      {befehl ? (
        <div className="rounded-3xl border border-blue-200 bg-blue-50/60 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[color:var(--modul-blau,#1B3A8C)]">
              Erkannter Befehl: {befehl.art.toUpperCase()}
            </span>
          </div>

          {befehl.art === 'freigeben' && (
            <p className="text-sm font-semibold text-slate-900">
              Vorgang <span className="font-bold text-[color:var(--modul-blau,#1B3A8C)]">{befehl.ksNummer}</span> freigeben (Versand um 18:00).
            </p>
          )}

          {befehl.art === 'freigeben_sofort' && (
            <p className="text-sm font-semibold text-slate-900">
              Vorgang <span className="font-bold text-[color:var(--modul-blau,#1B3A8C)]">{befehl.ksNummer}</span> sofort per E-Mail versenden.
            </p>
          )}

          {befehl.art === 'anpassung' && (
            <div className="text-sm space-y-1">
              <p className="font-semibold text-slate-900">
                Notiz zu <span className="font-bold">{befehl.ksNummer}</span> ergänzen:
              </p>
              <p className="text-slate-700 italic">„{befehl.text}“</p>
            </div>
          )}

          {befehl.art === 'neuanlage' && (
            <div className="space-y-2 text-xs sm:text-sm text-slate-800">
              <p>
                <span className="font-bold">Kunde:</span> {befehl.anrede} {befehl.nachname}
              </p>
              {befehl.strasse && (
                <p>
                  <span className="font-bold">Adresse:</span> {befehl.strasse}, {befehl.plzOrt}
                </p>
              )}
              {befehl.telefon && (
                <p>
                  <span className="font-bold">Telefon:</span> {befehl.telefon}
                </p>
              )}
              {befehl.email && (
                <p>
                  <span className="font-bold">E-Mail:</span> {befehl.email}
                </p>
              )}
              <p>
                <span className="font-bold">Vorhaben:</span> {befehl.vorhabenKurz}
              </p>
              <p className="text-slate-600 italic">
                „{befehl.persoenlicherSatz}“
              </p>
            </div>
          )}

          {befehl.art === 'portal_lead' && (
            <div className="space-y-4 text-sm text-slate-800">
              <p className="text-base font-bold text-slate-900">
                Portal-Lead erkannt{befehl.portal === 'wattfox' ? ' (WattFox)' : ''}
              </p>

              <div className="space-y-1">
                <p className="text-sm font-bold uppercase tracking-wide text-slate-500">Kunde</p>
                <Zeile beschriftung="Name" wert={[befehl.kontakt.anrede, befehl.kontakt.vorname, befehl.kontakt.nachname].filter(Boolean).join(' ')} />
                <Zeile beschriftung="E-Mail" wert={befehl.kontakt.email} />
                <Zeile beschriftung="Telefon" wert={befehl.kontakt.telefon} />
                <Zeile beschriftung="Adresse" wert={[befehl.kontakt.strasse, befehl.kontakt.plzOrt].filter(Boolean).join(', ')} />
              </div>

              <div className="space-y-1">
                <p className="text-sm font-bold uppercase tracking-wide text-slate-500">Objekt</p>
                <Zeile beschriftung="PLZ" wert={befehl.objekt.plz} />
                <Zeile beschriftung="Wohnfläche" wert={befehl.gebaeude.wohnflaeche ? `${befehl.gebaeude.wohnflaeche} m²` : ''} />
                <Zeile
                  beschriftung="Baujahr"
                  wert={befehl.gebaeude.baujahr
                    ? `${befehl.gebaeude.baujahr}${befehl.gebaeude.baujahrKlasse ? ` (${BAUJAHR_KLASSE_LABEL[befehl.gebaeude.baujahrKlasse]})` : ''}`
                    : ''}
                />
                <Zeile beschriftung="Gebäudeart" wert={befehl.gebaeude.lage ? LAGE_LABEL[befehl.gebaeude.lage] : ''} />
                <Zeile beschriftung="Wohneinheiten" wert={befehl.objekt.wohneinheiten} />
                <Zeile beschriftung="Personen" wert={befehl.gebaeude.personen} />
                <Zeile beschriftung="Heizung" wert={befehl.gebaeude.bestand.energieart ? ENERGIEART_LABEL[befehl.gebaeude.bestand.energieart] : ''} />
                <Zeile
                  beschriftung="Alter der Heizung"
                  wert={befehl.gebaeude.bestand.heizungsalterJahre === null ? '' : `${befehl.gebaeude.bestand.heizungsalterJahre} Jahre`}
                />
                <Zeile beschriftung="Standort" wert={STANDORT_LABEL[befehl.gebaeude.bestand.standort]} />
              </div>

              <div className="space-y-1">
                <p className="text-sm font-bold uppercase tracking-wide text-slate-500">Daraus abgeleitet</p>
                <Zeile beschriftung="Vorlage" wert={befehl.vorlageIds.join(', ')} />
                <Zeile beschriftung="Heizlast" wert={vorschau ? `${vorschau.kwVon} bis ${vorschau.kwBis} kW` : ''} />
                <Zeile beschriftung="Gerät" wert={vorschau ? `${vorschau.hersteller} ${vorschau.geraetKw} kW` : ''} />
                <Zeile beschriftung="Speicher" wert={vorschau ? `${vorschau.liter} Liter` : ''} />
                <Zeile beschriftung="Förderung" wert={befehl.foerderung.altOelOderGas ? 'Alte Gas- oder Ölheizung, Bonus möglich' : 'kein Bonus für alte Heizung'} />
              </div>

              {befehl.hinweise.length > 0 && (
                <ul className="list-disc space-y-1 rounded-2xl bg-amber-50 p-4 pl-8 text-sm text-amber-900">
                  {befehl.hinweise.map((h) => <li key={h}>{h}</li>)}
                </ul>
              )}

              {befehl.unbekannteZeilen.length > 0 && (
                <div className="rounded-2xl bg-slate-100 p-4">
                  <p className="text-sm font-bold text-slate-700">Nicht zugeordnete Zeilen (gehen in die interne Notiz):</p>
                  <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-700">
                    {befehl.unbekannteZeilen.map((z) => <li key={z}>{z}</li>)}
                  </ul>
                </div>
              )}

              <p className="text-sm font-semibold text-slate-700">
                Der Portal-Text wird als interne Notiz gespeichert. Den persönlichen Satz für den Kunden bitte im Konfigurator ergänzen.
              </p>
            </div>
          )}

          <div className="pt-2">
            <button
              type="button"
              disabled={laeuft}
              onClick={handleAusfuehren}
              className="fokus-ring min-h-[52px] w-full rounded-2xl bg-[color:var(--modul-blau,#1B3A8C)] px-6 text-base font-semibold text-white shadow-md transition-opacity disabled:opacity-60"
            >
              {laeuft ? 'Wird verarbeitet...' : 'Bestätigen & Ausführen'}
            </button>
          </div>
        </div>
      ) : null}

      {/* Prominente Rückmeldung in 20px Typografie */}
      {ergebnis ? (
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white font-bold text-sm">
              ✓
            </span>
            <h2 className="text-base font-bold text-emerald-900">Befehl erfolgreich ausgeführt</h2>
          </div>

          <p className="text-[20px] font-bold text-slate-900 leading-snug">
            {ergebnis.rueckmeldung}
          </p>

          {ergebnis.anfrageId ? (
            <div className="flex items-center gap-4 pt-2">
              <Link
                href={`/intern/anfragen/${ergebnis.anfrageId}`}
                className="text-sm font-bold text-[color:var(--modul-blau,#1B3A8C)] hover:underline"
              >
                Vorgang öffnen →
              </Link>
              <Link
                href={`/intern/konfigurator/${ergebnis.anfrageId}`}
                className="text-sm font-bold text-slate-700 hover:underline"
              >
                Im Konfigurator bearbeiten →
              </Link>
            </div>
          ) : null}
        </div>
      ) : null}

      {fehler ? (
        <div className="rounded-2xl border border-red-200 bg-[#FEF3F2] p-4 text-sm font-medium text-[#B42318]">
          {fehler}
        </div>
      ) : null}

      {/* Hilfekarte für Befehlsgrammatik */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-2 text-xs text-slate-600">
        <p className="font-bold text-slate-800">Unterstützte Diktat-Befehle:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><code className="bg-slate-100 px-1 py-0.5 rounded font-mono">freigeben KS-2026-0031</code> – Gibt die Anfrage frei (Versand um 18:00)</li>
          <li><code className="bg-slate-100 px-1 py-0.5 rounded font-mono">freigeben und sofort senden KS-2026-0031</code> – Sofortiger Mailversand mit PDF</li>
          <li><code className="bg-slate-100 px-1 py-0.5 rounded font-mono">KS-2026-0031: Kunde möchte 200L Speicher</code> – Fügt dem Vorgang eine Notiz hinzu</li>
          <li><code className="bg-slate-100 px-1 py-0.5 rounded font-mono">Neue Anfrage. Herr Müller, Wetzlar ...</code> – Legt automatisch einen neuen Vorgang an</li>
          <li><code className="bg-slate-100 px-1 py-0.5 rounded font-mono">Portal-Text einfügen</code> – Zeilen der Form „Interesse an: …“ aus WattFox werden erkannt und die Felder vorbelegt</li>
        </ul>
      </div>
    </div>
  );
}
