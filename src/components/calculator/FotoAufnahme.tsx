'use client';

/**
 * Fotoaufnahme vor Ort. Der Browser oeffnet direkt die Kamera (capture="environment").
 * Jedes Bild wird clientseitig auf 2000 px verkleinert; dabei fallen EXIF und GPS weg.
 * HEIC ohne Browser-Dekodierung wird benannt und als Datei fuer den spaeteren
 * Upload vorgemerkt, statt still zu scheitern.
 */
import { useRef, useState } from 'react';
import { Camera, Trash2 } from 'lucide-react';
import { verkleinereBild } from './bildVerkleinern';

export type FotoWert = { name: string; dataUrl: string; beschreibung: string };

export type FotoAufnahmeProps = {
  fotos: FotoWert[];
  offeneDateien: File[];
  onFotos: (fotos: FotoWert[]) => void;
  onOffeneDateien: (dateien: File[]) => void;
  onEntfernen: (index: number) => void;
  /** Beschreibung eines Bildes aendern (Index in `fotos`). */
  onBeschreibung: (index: number, beschreibung: string) => void;
};

export default function FotoAufnahme({ fotos, offeneDateien, onFotos, onOffeneDateien, onEntfernen, onBeschreibung }: FotoAufnahmeProps) {
  const eingabe = useRef<HTMLInputElement>(null);
  const [laeuft, setLaeuft] = useState(false);
  const [meldung, setMeldung] = useState('');

  const verarbeite = async (dateiliste: FileList | null) => {
    if (!dateiliste || !dateiliste.length) return;
    setLaeuft(true);
    setMeldung('');
    const neue: FotoWert[] = [];
    const nachtraeglich: File[] = [];
    const probleme: string[] = [];
    for (const datei of Array.from(dateiliste)) {
      const ergebnis = await verkleinereBild(datei);
      if (ergebnis.ok) {
        neue.push({ name: ergebnis.name, dataUrl: ergebnis.dataUrl, beschreibung: '' });
      } else if (ergebnis.grund === 'heic') {
        nachtraeglich.push(ergebnis.datei);
        probleme.push(`${ergebnis.name}: HEIC wird beim Senden gewandelt.`);
      } else if (ergebnis.grund === 'format') {
        probleme.push(`${ergebnis.name}: Format nicht erlaubt.`);
      } else {
        probleme.push(`${ergebnis.name}: konnte nicht gelesen werden.`);
      }
    }
    if (neue.length) onFotos(neue);
    if (nachtraeglich.length) onOffeneDateien(nachtraeglich);
    setMeldung(probleme.join(' '));
    setLaeuft(false);
    if (eingabe.current) eingabe.current.value = '';
  };

  return (
    <div>
      <input
        ref={eingabe}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        className="sr-only"
        onChange={(e) => void verarbeite(e.target.files)}
      />
      <button
        type="button"
        onClick={() => eingabe.current?.click()}
        disabled={laeuft}
        className="fokus-ring inline-flex min-h-[56px] items-center gap-2 rounded-2xl bg-[color:var(--modul-blau,#1B3A8C)] px-5 text-base font-semibold text-white disabled:opacity-60"
      >
        <Camera aria-hidden className="h-5 w-5" />
        {laeuft ? 'Bild wird verkleinert' : 'Foto aufnehmen'}
      </button>

      {meldung ? (
        <p aria-live="polite" className="mt-2 text-sm text-slate-700">
          {meldung}
        </p>
      ) : null}

      {offeneDateien.length ? (
        <p className="mt-2 text-sm text-slate-700">
          {offeneDateien.length} Datei{offeneDateien.length === 1 ? '' : 'en'} wird beim Senden gewandelt.
        </p>
      ) : null}

      {fotos.length ? (
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {fotos.map((foto, index) => (
            <li key={`${foto.name}-${index}`} className="relative overflow-hidden rounded-2xl border border-slate-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={foto.dataUrl} alt={foto.name} className="h-32 w-full object-cover" />
              <button
                type="button"
                aria-label={`${foto.name} entfernen`}
                onClick={() => onEntfernen(index)}
                className="fokus-ring absolute right-2 top-2 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-[#B42318]"
              >
                <Trash2 aria-hidden className="h-4 w-4" />
              </button>
              <label className="block p-2">
                <span className="sr-only">{`Beschreibung fuer ${foto.name}`}</span>
                <input
                  type="text"
                  value={foto.beschreibung}
                  maxLength={200}
                  placeholder="Was ist zu sehen?"
                  onChange={(e) => onBeschreibung(index, e.target.value)}
                  className="glass-input h-12 w-full rounded-2xl border border-slate-200 bg-white px-3 text-base text-slate-900"
                />
              </label>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
