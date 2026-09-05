'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Richtpreis, FoerderRegeln, Vorbehalt, Vorlage, Einheit } from '@/lib/types';
import { EINHEIT_LABEL } from '@/lib/types';
import { speichereMatrixZeile, speichereFoerderRegeln, erstelleVorbehalt, setzeDemoPreise } from './actions';
import { euro } from '@/lib/services/calculation';

/** Kennzeichen, das der Demo-Preissatz an den Hinweis der Matrixzeile hängt (` | Demo (R)`). */
const DEMO_MUSTER = / \| Demo \(([RD])\)$/;

type DemoTeile = { basis: string; demo: 'R' | 'D' | null };

/** Trennt den gepflegten Hinweis vom Demo-Kennzeichen. */
export function hinweisTeile(hinweis: string | null): DemoTeile {
  const roh = hinweis ?? '';
  const treffer = roh.match(DEMO_MUSTER);
  if (!treffer) return { basis: roh, demo: null };
  return { basis: roh.replace(DEMO_MUSTER, ''), demo: treffer[1] as 'R' | 'D' };
}

const DEMO_TITEL: Record<'R' | 'D', string> = {
  R: 'Wert aus der Referenzmappe des Altsystems',
  D: 'Angenommener Wert für die Vorführung',
};

function zahlAus(wert: string, standard: number): number {
  const n = Number(wert);
  return Number.isFinite(n) ? n : standard;
}

export default function MatrixClient({
  initialMatrix,
  initialFoerderRegeln,
  initialVorbehalte,
  vorlagen,
  blockiertZaehler,
  istChef,
  demoPreise,
}: {
  initialMatrix: Richtpreis[];
  initialFoerderRegeln: FoerderRegeln;
  initialVorbehalte: Vorbehalt[];
  vorlagen: Vorlage[];
  blockiertZaehler: Record<number, number>;
  istChef: boolean;
  demoPreise: boolean;
}) {
  const router = useRouter();
  const [matrix, setMatrix] = useState<Richtpreis[]>(initialMatrix);
  const [foerderRegeln, setFoerderRegeln] = useState<FoerderRegeln>(initialFoerderRegeln);
  const vorbehalte: Vorbehalt[] = initialVorbehalte;

  const [bearbeiteNr, setBearbeiteNr] = useState<number | null>(null);
  const [formVon, setFormVon] = useState<string>('');
  const [formBis, setFormBis] = useState<string>('');
  const [formEinheit, setFormEinheit] = useState<Einheit>('pauschal');
  const [formHinweis, setFormHinweis] = useState<string>('');

  const [neuerVorbehaltText, setNeuerVorbehaltText] = useState('');
  const [laeuft, setLaeuft] = useState(false);
  const [meldung, setMeldung] = useState<string | null>(null);
  const [fehler, setFehler] = useState<string | null>(null);
  const [demoFrage, setDemoFrage] = useState<'laden' | 'entfernen' | null>(null);

  const demoZeilen = matrix.filter((z) => hinweisTeile(z.hinweis).demo !== null).length;
  const demoAktiv = demoPreise || demoZeilen > 0;

  function startBearbeiten(z: Richtpreis) {
    setBearbeiteNr(z.nr);
    setFormVon(z.von !== null ? String(z.von) : '');
    setFormBis(z.bis !== null ? String(z.bis) : '');
    setFormEinheit(z.einheit);
    // Das Demo-Kennzeichen schneidet der Server beim Speichern ab, es gehört nicht ins Feld.
    setFormHinweis(hinweisTeile(z.hinweis).basis);
  }

  async function handleSpeichernZeile(nr: number) {
    setLaeuft(true);
    setMeldung(null);
    setFehler(null);
    const von = formVon.trim() ? Number(formVon) : null;
    const bis = formBis.trim() ? Number(formBis) : null;
    if (von !== null && bis !== null && von > bis) {
      setFehler(`Zeile ${nr}: Der Von-Wert ist größer als der Bis-Wert.`);
      setLaeuft(false);
      return;
    }
    const res = await speichereMatrixZeile(nr, von, bis, formEinheit, formHinweis);
    if (res.ok) {
      setMatrix((prev) =>
        prev.map((item) =>
          item.nr === nr ? { ...item, von, bis, einheit: formEinheit, hinweis: formHinweis } : item,
        ),
      );
      setBearbeiteNr(null);
      setMeldung(`Zeile ${nr} gespeichert. Das Demo-Kennzeichen dieser Zeile ist damit erledigt.`);
    } else {
      setFehler(res.fehler || 'Die Zeile konnte nicht gespeichert werden.');
    }
    setLaeuft(false);
  }

  async function handleSpeichernFoerderregeln(e: React.FormEvent) {
    e.preventDefault();
    setLaeuft(true);
    setMeldung(null);
    setFehler(null);
    const res = await speichereFoerderRegeln(foerderRegeln);
    if (res.ok) {
      setMeldung('Förderregeln aktualisiert.');
    } else {
      setFehler(res.fehler || 'Die Förderregeln konnten nicht gespeichert werden.');
    }
    setLaeuft(false);
  }

  async function handleNeuerVorbehalt(e: React.FormEvent) {
    e.preventDefault();
    if (!neuerVorbehaltText.trim()) return;
    setLaeuft(true);
    setMeldung(null);
    setFehler(null);
    const res = await erstelleVorbehalt(neuerVorbehaltText);
    if (res.ok) {
      setNeuerVorbehaltText('');
      setMeldung('Neuer Vorbehalt angelegt.');
      router.refresh();
    } else {
      setFehler(res.fehler || 'Der Vorbehalt konnte nicht angelegt werden.');
    }
    setLaeuft(false);
  }

  async function handleDemo(an: boolean) {
    setLaeuft(true);
    setMeldung(null);
    setFehler(null);
    setDemoFrage(null);
    const res = await setzeDemoPreise(an);
    if (res.ok) {
      setMeldung(an ? 'Demo-Preise geladen. Bitte Zeile für Zeile bestätigen.' : 'Demo-Preise entfernt.');
      router.refresh();
    } else {
      setFehler(res.fehler || 'Die Demo-Preise konnten nicht umgestellt werden.');
    }
    setLaeuft(false);
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Richtpreis-Matrix und Regeln</h1>
        <p className="mt-1 text-base text-slate-600">
          Alle Preise sind Nettowerte. Fehlende Richtpreise sperren den Versand der betroffenen Kostenschätzungen.
        </p>
      </header>

      {demoAktiv ? (
        <div className="rounded-2xl border border-[color:var(--modul-orange,#EE6C1F)] bg-orange-50 p-4">
          <p className="text-base font-bold text-[color:var(--modul-orange,#EE6C1F)]">
            Demo-Preise, vom Chef zu bestätigen
          </p>
          <p className="mt-1 text-sm text-slate-700">
            {demoZeilen > 0
              ? `${demoZeilen} Zeilen tragen noch ein Demo-Kennzeichen. Demo R stammt aus der Referenzmappe, Demo D ist eine Annahme. Sobald der Chef eine Zeile speichert, fällt ihr Kennzeichen weg.`
              : 'Der Demo-Preissatz ist eingeschaltet. Die Beträge sind noch nicht bestätigt.'}
          </p>
        </div>
      ) : null}

      {meldung ? (
        <div className="rounded-2xl bg-emerald-50 p-4 text-sm font-medium text-emerald-800">{meldung}</div>
      ) : null}

      {fehler ? (
        <div role="alert" className="rounded-2xl bg-[#FEF3F2] p-4 text-sm font-medium text-[#B42318]">
          {fehler}
        </div>
      ) : null}

      {istChef ? (
        <section className="rounded-3xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-bold text-slate-900">Demo-Preissatz</h2>
          <p className="mt-1 text-sm text-slate-600">
            Für die Vorführung. Geladene Werte sind gekennzeichnet und ersetzen keine bestätigten Preise.
          </p>
          {demoFrage ? (
            <div className="glass-sheet mt-4 rounded-2xl border border-slate-200 p-4">
              <p className="text-base font-semibold text-slate-900">
                {demoFrage === 'laden'
                  ? 'Demo-Preise in die Matrix laden? Vorhandene Beträge der betroffenen Zeilen werden überschrieben.'
                  : 'Demo-Preise entfernen? Die betroffenen Zeilen stehen danach wieder leer.'}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={laeuft}
                  onClick={() => handleDemo(demoFrage === 'laden')}
                  className="fokus-ring inline-flex min-h-[44px] items-center rounded-xl bg-[color:var(--modul-blau,#1B3A8C)] px-5 text-sm font-bold text-white disabled:opacity-60"
                >
                  Ja, {demoFrage === 'laden' ? 'laden' : 'entfernen'}
                </button>
                <button
                  type="button"
                  onClick={() => setDemoFrage(null)}
                  className="fokus-ring inline-flex min-h-[44px] items-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700"
                >
                  Abbrechen
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={laeuft}
                onClick={() => setDemoFrage('laden')}
                className="fokus-ring inline-flex min-h-[44px] items-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-60"
              >
                Demo-Preise laden
              </button>
              <button
                type="button"
                disabled={laeuft}
                onClick={() => setDemoFrage('entfernen')}
                className="fokus-ring inline-flex min-h-[44px] items-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-60"
              >
                Demo-Preise entfernen
              </button>
            </div>
          )}
        </section>
      ) : null}

      {/* 1. Richtpreis-Tabelle */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Richtpreise ({matrix.length} Zeilen)</h2>

        <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-sm font-semibold text-slate-700">
              <tr>
                <th className="w-16 px-4 py-3">Nr</th>
                <th className="px-4 py-3">Leistung</th>
                <th className="px-4 py-3 text-right">Von (Euro netto)</th>
                <th className="px-4 py-3 text-right">Bis (Euro netto)</th>
                <th className="px-4 py-3">Einheit</th>
                <th className="px-4 py-3">Hinweis</th>
                {istChef ? <th className="px-4 py-3 text-right">Aktion</th> : null}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {matrix.map((z) => {
                const istLeer = z.von === null || z.bis === null;
                const blockiert = blockiertZaehler[z.nr] || 0;
                const wirdBearbeitet = bearbeiteNr === z.nr;
                const teile = hinweisTeile(z.hinweis);

                if (wirdBearbeitet) {
                  return (
                    <tr key={z.nr} className="bg-blue-50/50">
                      <td className="px-4 py-3 font-bold text-slate-900">{z.nr}</td>
                      <td className="px-4 py-3 font-medium text-slate-900">{z.leistung}</td>
                      <td className="px-4 py-3 text-right">
                        <label className="sr-only" htmlFor={`von-${z.nr}`}>Von in Euro</label>
                        <input
                          id={`von-${z.nr}`}
                          type="number"
                          inputMode="numeric"
                          value={formVon}
                          onChange={(e) => setFormVon(e.target.value)}
                          placeholder="Von"
                          className="glass-input h-11 w-28 rounded-lg border border-slate-300 px-2 text-right text-sm font-semibold tabular-nums"
                        />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <label className="sr-only" htmlFor={`bis-${z.nr}`}>Bis in Euro</label>
                        <input
                          id={`bis-${z.nr}`}
                          type="number"
                          inputMode="numeric"
                          value={formBis}
                          onChange={(e) => setFormBis(e.target.value)}
                          placeholder="Bis"
                          className="glass-input h-11 w-28 rounded-lg border border-slate-300 px-2 text-right text-sm font-semibold tabular-nums"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <label className="sr-only" htmlFor={`einheit-${z.nr}`}>Einheit</label>
                        <select
                          id={`einheit-${z.nr}`}
                          value={formEinheit}
                          onChange={(e) => setFormEinheit(e.target.value as Einheit)}
                          className="glass-input h-11 rounded-lg border border-slate-300 px-2 text-sm font-semibold"
                        >
                          <option value="pauschal">pauschal</option>
                          <option value="je_stueck">je Stück</option>
                          <option value="je_lfm">je lfm</option>
                          <option value="je_tank">je Tank</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <label className="sr-only" htmlFor={`hinweis-${z.nr}`}>Hinweis</label>
                        <input
                          id={`hinweis-${z.nr}`}
                          type="text"
                          value={formHinweis}
                          onChange={(e) => setFormHinweis(e.target.value)}
                          placeholder="Hinweis"
                          className="glass-input h-11 w-full rounded-lg border border-slate-300 px-2 text-sm"
                        />
                      </td>
                      <td className="space-x-2 px-4 py-3 text-right">
                        <button
                          type="button"
                          disabled={laeuft}
                          onClick={() => handleSpeichernZeile(z.nr)}
                          className="fokus-ring inline-flex min-h-[44px] items-center rounded-lg bg-[color:var(--modul-blau,#1B3A8C)] px-4 text-sm font-bold text-white disabled:opacity-60"
                        >
                          Speichern
                        </button>
                        <button
                          type="button"
                          onClick={() => setBearbeiteNr(null)}
                          className="fokus-ring inline-flex min-h-[44px] items-center px-2 text-sm font-semibold text-slate-600"
                        >
                          Abbrechen
                        </button>
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr
                    key={z.nr}
                    className={`transition-colors ${istLeer ? 'bg-amber-50/40 hover:bg-amber-50/70' : 'hover:bg-slate-50/80'}`}
                  >
                    <td className="px-4 py-3 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <span>{z.nr}</span>
                        {blockiert > 0 ? (
                          <span
                            className="rounded-full bg-red-100 px-2 py-0.5 text-sm font-bold text-[#B42318]"
                            title={`Blockiert ${blockiert} offene Anfragen`}
                          >
                            {blockiert}
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">{z.leistung}</td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {z.von !== null ? (
                        <span className="font-semibold text-slate-800">{euro(z.von)} Euro</span>
                      ) : (
                        <span className="rounded bg-amber-100/80 px-2 py-0.5 text-sm font-bold text-amber-700">fehlt</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {z.bis !== null ? (
                        <span className="font-semibold text-slate-800">{euro(z.bis)} Euro</span>
                      ) : (
                        <span className="rounded bg-amber-100/80 px-2 py-0.5 text-sm font-bold text-amber-700">fehlt</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-slate-600">{EINHEIT_LABEL[z.einheit]}</td>
                    <td className="max-w-xs px-4 py-3 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        {teile.demo ? (
                          <span
                            title={DEMO_TITEL[teile.demo]}
                            className="shrink-0 rounded-full bg-[color:var(--modul-gold,#F0C000)]/25 px-2 py-0.5 text-sm font-bold text-[#8A6D00]"
                          >
                            Demo {teile.demo}
                          </span>
                        ) : null}
                        <span className="truncate">{teile.basis || (teile.demo ? '' : '—')}</span>
                      </div>
                    </td>
                    {istChef ? (
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => startBearbeiten(z)}
                          className="fokus-ring inline-flex min-h-[44px] items-center text-sm font-bold text-[color:var(--modul-blau,#1B3A8C)] hover:underline"
                        >
                          Bearbeiten
                        </button>
                      </td>
                    ) : null}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* 2. Förderregeln (Singleton) */}
      <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-bold text-slate-900">Förderung</h2>
        <p className="text-sm text-slate-600">
          Prozentsätze, Höchstsatz und förderfähige Kosten. Die Summe der zutreffenden Boni wird beim Höchstsatz gekappt.
        </p>

        <form onSubmit={handleSpeichernFoerderregeln} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label htmlFor="fr-grund" className="mb-1 block text-sm font-bold text-slate-700">Grundförderung (%)</label>
            <input
              id="fr-grund"
              type="number"
              inputMode="numeric"
              disabled={!istChef}
              value={foerderRegeln.grund}
              onChange={(e) => setFoerderRegeln({ ...foerderRegeln, grund: zahlAus(e.target.value, 0) })}
              className="glass-input h-12 w-full rounded-xl border border-slate-200 px-3 text-base font-semibold tabular-nums"
            />
          </div>
          <div>
            <label htmlFor="fr-effizienz" className="mb-1 block text-sm font-bold text-slate-700">
              Natürliches Kältemittel (R290) (%)
            </label>
            <input
              id="fr-effizienz"
              type="number"
              inputMode="numeric"
              disabled={!istChef}
              value={foerderRegeln.effizienz}
              onChange={(e) => setFoerderRegeln({ ...foerderRegeln, effizienz: zahlAus(e.target.value, 0) })}
              className="glass-input h-12 w-full rounded-xl border border-slate-200 px-3 text-base font-semibold tabular-nums"
            />
          </div>
          <div>
            <label htmlFor="fr-klima" className="mb-1 block text-sm font-bold text-slate-700">
              Alte Gas- oder Ölheizung (%)
            </label>
            <input
              id="fr-klima"
              type="number"
              inputMode="numeric"
              disabled={!istChef}
              value={foerderRegeln.klimageschwindigkeit}
              onChange={(e) => setFoerderRegeln({ ...foerderRegeln, klimageschwindigkeit: zahlAus(e.target.value, 0) })}
              className="glass-input h-12 w-full rounded-xl border border-slate-200 px-3 text-base font-semibold tabular-nums"
            />
          </div>
          <div>
            <label htmlFor="fr-einkommen" className="mb-1 block text-sm font-bold text-slate-700">
              Einkommen bis {euro(foerderRegeln.einkommenGrenze)} Euro (%)
            </label>
            <input
              id="fr-einkommen"
              type="number"
              inputMode="numeric"
              disabled={!istChef}
              value={foerderRegeln.einkommen}
              onChange={(e) => setFoerderRegeln({ ...foerderRegeln, einkommen: zahlAus(e.target.value, 0) })}
              className="glass-input h-12 w-full rounded-xl border border-slate-200 px-3 text-base font-semibold tabular-nums"
            />
          </div>
          <div>
            <label htmlFor="fr-grenze" className="mb-1 block text-sm font-bold text-slate-700">Einkommensgrenze (Euro)</label>
            <input
              id="fr-grenze"
              type="number"
              inputMode="numeric"
              disabled={!istChef}
              value={foerderRegeln.einkommenGrenze}
              onChange={(e) => setFoerderRegeln({ ...foerderRegeln, einkommenGrenze: zahlAus(e.target.value, 0) })}
              className="glass-input h-12 w-full rounded-xl border border-slate-200 px-3 text-base font-semibold tabular-nums"
            />
          </div>
          <div>
            <label htmlFor="fr-deckel" className="mb-1 block text-sm font-bold text-slate-700">Höchstsatz insgesamt (%)</label>
            <input
              id="fr-deckel"
              type="number"
              inputMode="numeric"
              disabled={!istChef}
              value={foerderRegeln.deckel}
              onChange={(e) => setFoerderRegeln({ ...foerderRegeln, deckel: zahlAus(e.target.value, 0) })}
              className="glass-input h-12 w-full rounded-xl border border-slate-200 px-3 text-base font-semibold tabular-nums"
            />
          </div>
          <div>
            <label htmlFor="fr-standard" className="mb-1 block text-sm font-bold text-slate-700">Standardfördersatz (%)</label>
            <input
              id="fr-standard"
              type="number"
              inputMode="numeric"
              disabled={!istChef}
              placeholder="leer: aus den Boni rechnen"
              value={foerderRegeln.standardsatz === null ? '' : foerderRegeln.standardsatz}
              onChange={(e) =>
                setFoerderRegeln({
                  ...foerderRegeln,
                  standardsatz: e.target.value.trim() === '' ? null : zahlAus(e.target.value, 0),
                })
              }
              className="glass-input h-12 w-full rounded-xl border border-slate-200 px-3 text-base font-semibold tabular-nums"
            />
          </div>
          <div>
            <label htmlFor="fr-kosten1" className="mb-1 block text-sm font-bold text-slate-700">
              Förderfähige Kosten 1. Wohneinheit (Euro)
            </label>
            <input
              id="fr-kosten1"
              type="number"
              inputMode="numeric"
              disabled={!istChef}
              value={foerderRegeln.kostenWe1}
              onChange={(e) => setFoerderRegeln({ ...foerderRegeln, kostenWe1: zahlAus(e.target.value, 0) })}
              className="glass-input h-12 w-full rounded-xl border border-slate-200 px-3 text-base font-semibold tabular-nums"
            />
          </div>
          <div>
            <label htmlFor="fr-kostenweitere" className="mb-1 block text-sm font-bold text-slate-700">
              Kosten je weitere Wohneinheit (Euro)
            </label>
            <input
              id="fr-kostenweitere"
              type="number"
              inputMode="numeric"
              disabled={!istChef}
              value={foerderRegeln.kostenJeWeitere}
              onChange={(e) => setFoerderRegeln({ ...foerderRegeln, kostenJeWeitere: zahlAus(e.target.value, 0) })}
              className="glass-input h-12 w-full rounded-xl border border-slate-200 px-3 text-base font-semibold tabular-nums"
            />
          </div>
          <div>
            <label htmlFor="fr-maxwe" className="mb-1 block text-sm font-bold text-slate-700">Maximale Wohneinheiten</label>
            <input
              id="fr-maxwe"
              type="number"
              inputMode="numeric"
              min={1}
              max={12}
              disabled={!istChef}
              value={foerderRegeln.maxWe}
              onChange={(e) => setFoerderRegeln({ ...foerderRegeln, maxWe: zahlAus(e.target.value, 1) })}
              className="glass-input h-12 w-full rounded-xl border border-slate-200 px-3 text-base font-semibold tabular-nums"
            />
          </div>
          <div>
            <label htmlFor="fr-rundung" className="mb-1 block text-sm font-bold text-slate-700">Eigenanteil runden auf (Euro)</label>
            <input
              id="fr-rundung"
              type="number"
              inputMode="numeric"
              disabled={!istChef}
              value={foerderRegeln.eigenanteilRundung}
              onChange={(e) => setFoerderRegeln({ ...foerderRegeln, eigenanteilRundung: zahlAus(e.target.value, 1) })}
              className="glass-input h-12 w-full rounded-xl border border-slate-200 px-3 text-base font-semibold tabular-nums"
            />
          </div>

          {istChef ? (
            <div className="col-span-full pt-2">
              <button
                type="submit"
                disabled={laeuft}
                className="fokus-ring min-h-[44px] rounded-xl bg-[color:var(--modul-blau,#1B3A8C)] px-5 text-sm font-bold text-white shadow-sm disabled:opacity-60"
              >
                Förderregeln speichern
              </button>
            </div>
          ) : null}
        </form>
      </section>

      {/* 3. Vorbehaltskatalog */}
      <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-bold text-slate-900">Nicht enthalten und bauseits</h2>
        <p className="text-sm text-slate-600">
          Standardausschlüsse, die dem Kunden in der Kostenschaetzung genannt werden.
        </p>

        <ul className="space-y-2">
          {vorbehalte.map((v) => (
            <li
              key={v.id}
              className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm"
            >
              <span className="font-medium text-slate-800">{v.text}</span>
              {v.gewerk ? (
                <span className="shrink-0 text-sm font-bold uppercase text-slate-500">{v.gewerk}</span>
              ) : null}
            </li>
          ))}
        </ul>

        {istChef ? (
          <form onSubmit={handleNeuerVorbehalt} className="flex flex-wrap gap-2 pt-2">
            <label className="sr-only" htmlFor="vorbehalt-neu">Neuen Vorbehalt ergänzen</label>
            <input
              id="vorbehalt-neu"
              type="text"
              value={neuerVorbehaltText}
              onChange={(e) => setNeuerVorbehaltText(e.target.value)}
              placeholder="Neuen Vorbehalt ergänzen, etwa Elektroanschluss bis Zählerschrank bauseits"
              className="glass-input h-12 min-w-[16rem] flex-1 rounded-xl border border-slate-200 px-3 text-base"
            />
            <button
              type="submit"
              disabled={laeuft}
              className="fokus-ring min-h-[44px] rounded-xl bg-slate-900 px-5 text-sm font-bold text-white disabled:opacity-60"
            >
              Hinzufügen
            </button>
          </form>
        ) : null}
      </section>

      {/* 4. Vorlagen und Bausteine (nur lesbar) */}
      <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-bold text-slate-900">Vorlagen ({vorlagen.length})</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {vorlagen.map((v) => (
            <div key={v.id} className="space-y-2 rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <h3 className="text-base font-bold text-slate-900">{v.name}</h3>
              <p className="text-sm text-slate-600">{v.vorhabenKurz} · {v.bausteine.length} Bausteine</p>
              <div className="space-y-1 pt-1 text-sm text-slate-500">
                {v.bausteine.map((b) => (
                  <div key={b.id} className="flex justify-between gap-3">
                    <span>{b.titel}</span>
                    <span className="shrink-0 tabular-nums text-slate-400">Matrix {b.matrixNr ?? 'manuell'}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
