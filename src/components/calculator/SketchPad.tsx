'use client';

/**
 * SketchPad des Meister-Modus (Plan 4.8.1).
 *
 * Feste logische Leinwand 2480 x 1754, die auf den Viewport skaliert wird; dadurch
 * bleibt eine Skizze beim Drehen des Geraets unveraendert. Gezeichnet wird mit
 * Pointer Events samt Druck, geglaettet ueber perfect-freehand.
 *
 * Palm Rejection: sobald ein Stift erkannt wurde, dienen Finger nur noch dem
 * Verschieben und Zoomen. Zwei Finger verschieben und zoomen immer.
 *
 * Werkzeuge: Stift, Marker, Radierer, Massband (zwei Tipps ergeben eine Linie mit
 * editierbarem Zentimeterwert) und Text. Undo und Redo halten 30 Schritte.
 * Der Export ist ein PNG in logischer Groesse.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import getStroke from 'perfect-freehand';
import {
  Eraser,
  Highlighter,
  Maximize,
  Pencil,
  Redo2,
  Ruler,
  Trash2,
  Type as TypeIcon,
  Undo2,
} from 'lucide-react';
import type { Gewerk, SkizzeExport } from '@/lib/types';
import {
  ANSICHT_START,
  GEWERK_HEX,
  GEWERK_NAME,
  LEINWAND_BREITE,
  LEINWAND_HOEHE,
  anwenden,
  ansichtSkalierung,
  begrenzeZoom,
  kannRueckgaengig,
  kannWiederholen,
  massLabel,
  neueId,
  neuerStack,
  radiere,
  rueckgaengig,
  trifftElement,
  wiederholen,
  zuLeinwand,
  type Ansicht,
  type Element,
  type Punkt,
  type SkizzeModell,
  type UndoStack,
  type Werkzeug,
} from './meister-utils';

export type SketchPadProps = {
  wert?: SkizzeExport | null;
  onChange: (skizze: SkizzeExport) => void;
  hintergrund?: string;
};

const FARBEN: Gewerk[] = ['bad', 'heizung', 'waermepumpe', 'klima', 'elektro'];
const RADIERER_RADIUS = 24;
const WERKZEUGE: { schluessel: Werkzeug; beschriftung: string }[] = [
  { schluessel: 'stift', beschriftung: 'Stift' },
  { schluessel: 'marker', beschriftung: 'Marker' },
  { schluessel: 'radierer', beschriftung: 'Radierer' },
  { schluessel: 'massband', beschriftung: 'Massband' },
  { schluessel: 'text', beschriftung: 'Text' },
];

function strichOptionen(werkzeug: 'stift' | 'marker', breite: number) {
  return {
    size: breite,
    thinning: werkzeug === 'stift' ? 0.6 : 0.1,
    smoothing: 0.55,
    streamline: 0.45,
    simulatePressure: false,
  };
}

function zeichneElement(ctx: CanvasRenderingContext2D, element: Element): void {
  if (element.art === 'strich') {
    const umriss = getStroke(
      element.punkte.map((p) => [p.x, p.y, p.druck]),
      strichOptionen(element.werkzeug, element.breite),
    );
    if (!umriss.length) return;
    ctx.save();
    ctx.globalAlpha = element.werkzeug === 'marker' ? 0.35 : 1;
    ctx.fillStyle = element.farbe;
    ctx.beginPath();
    ctx.moveTo(umriss[0][0], umriss[0][1]);
    for (let i = 1; i < umriss.length; i += 1) ctx.lineTo(umriss[i][0], umriss[i][1]);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    return;
  }
  if (element.art === 'mass') {
    ctx.save();
    ctx.strokeStyle = element.farbe;
    ctx.fillStyle = element.farbe;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(element.von.x, element.von.y);
    ctx.lineTo(element.bis.x, element.bis.y);
    ctx.stroke();
    for (const punkt of [element.von, element.bis]) {
      ctx.beginPath();
      ctx.arc(punkt.x, punkt.y, 9, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.font = '40px system-ui, sans-serif';
    ctx.textBaseline = 'bottom';
    ctx.fillText(element.label, (element.von.x + element.bis.x) / 2 + 12, (element.von.y + element.bis.y) / 2 - 12);
    ctx.restore();
    return;
  }
  ctx.save();
  ctx.fillStyle = element.farbe;
  ctx.font = `${element.groesse}px system-ui, sans-serif`;
  ctx.textBaseline = 'top';
  ctx.fillText(element.text, element.position.x, element.position.y);
  ctx.restore();
}

export default function SketchPad({ wert, onChange, hintergrund }: SketchPadProps) {
  const flaeche = useRef<HTMLDivElement>(null);
  const leinwand = useRef<HTMLCanvasElement>(null);
  const zeiger = useRef(new Map<number, { x: number; y: number; typ: string }>());
  const stiftGesehen = useRef(false);
  const aktuellerStrich = useRef<Punkt[] | null>(null);
  const pinchStart = useRef<{ abstand: number; zoom: number } | null>(null);
  const hintergrundBild = useRef<HTMLImageElement | null>(null);

  const [stack, setStack] = useState<UndoStack<SkizzeModell>>(() => neuerStack<SkizzeModell>({ elemente: [] }));
  const [werkzeug, setWerkzeug] = useState<Werkzeug>('stift');
  const [gewerk, setGewerk] = useState<Gewerk>('bad');
  const [ansicht, setAnsicht] = useState<Ansicht>(ANSICHT_START);
  const [basis, setBasis] = useState(0.3);
  const [massStart, setMassStart] = useState<{ x: number; y: number } | null>(null);
  const [textEingabe, setTextEingabe] = useState<{ x: number; y: number; wert: string } | null>(null);
  const [labelEingabe, setLabelEingabe] = useState<{ id: string; wert: string } | null>(null);
  const [rechtshaendig, setRechtshaendig] = useState(true);

  const farbe = GEWERK_HEX[gewerk];
  const elemente = stack.gegenwart.elemente;

  const malAlles = useCallback(
    (ctx: CanvasRenderingContext2D, liste: Element[], laufend: Punkt[] | null) => {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, LEINWAND_BREITE, LEINWAND_HOEHE);
      const bild = hintergrundBild.current;
      if (bild && bild.naturalWidth > 0) {
        const faktor = Math.min(LEINWAND_BREITE / bild.naturalWidth, LEINWAND_HOEHE / bild.naturalHeight);
        const b = bild.naturalWidth * faktor;
        const h = bild.naturalHeight * faktor;
        ctx.drawImage(bild, (LEINWAND_BREITE - b) / 2, (LEINWAND_HOEHE - h) / 2, b, h);
      }
      for (const element of liste) zeichneElement(ctx, element);
      if (laufend && laufend.length) {
        zeichneElement(ctx, {
          id: 'laufend',
          art: 'strich',
          werkzeug: werkzeug === 'marker' ? 'marker' : 'stift',
          farbe,
          breite: werkzeug === 'marker' ? 34 : 12,
          punkte: laufend,
        });
      }
    },
    [farbe, werkzeug],
  );

  const zeichne = useCallback(() => {
    const canvas = leinwand.current;
    const box = flaeche.current;
    if (!canvas || !box) return;
    const breite = box.clientWidth;
    const hoehe = box.clientHeight;
    if (breite <= 0 || hoehe <= 0) return;
    const dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1;
    if (canvas.width !== Math.round(breite * dpr) || canvas.height !== Math.round(hoehe * dpr)) {
      canvas.width = Math.round(breite * dpr);
      canvas.height = Math.round(hoehe * dpr);
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, breite, hoehe);
    ctx.save();
    ctx.translate(ansicht.panX, ansicht.panY);
    ctx.scale(basis * ansicht.zoom, basis * ansicht.zoom);
    malAlles(ctx, elemente, aktuellerStrich.current);
    ctx.restore();
  }, [ansicht, basis, elemente, malAlles]);

  // Hintergrundfoto laden (annotierte Kopie entsteht beim Export).
  useEffect(() => {
    if (!hintergrund) {
      hintergrundBild.current = null;
      return;
    }
    const bild = new Image();
    bild.onload = () => {
      hintergrundBild.current = bild;
      zeichne();
    };
    bild.src = hintergrund;
  }, [hintergrund, zeichne]);

  // Groesse der Leinwand an den Viewport binden (rotationsstabil).
  useEffect(() => {
    const box = flaeche.current;
    if (!box || typeof ResizeObserver === 'undefined') return;
    const beobachter = new ResizeObserver(() => {
      setBasis(ansichtSkalierung(box.clientWidth, box.clientHeight));
    });
    beobachter.observe(box);
    setBasis(ansichtSkalierung(box.clientWidth, box.clientHeight));
    return () => beobachter.disconnect();
  }, []);

  useEffect(() => {
    zeichne();
  }, [zeichne]);

  const setzeModell = useCallback((naechste: Element[]) => {
    setStack((alt) => anwenden(alt, { elemente: naechste }));
  }, []);

  const punktAus = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>): { x: number; y: number } => {
      const box = flaeche.current;
      if (!box) return { x: 0, y: 0 };
      const rect = box.getBoundingClientRect();
      return zuLeinwand(e.clientX - rect.left, e.clientY - rect.top, basis, ansicht);
    },
    [ansicht, basis],
  );

  const beiPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
    zeiger.current.set(e.pointerId, { x: e.clientX, y: e.clientY, typ: e.pointerType });
    if (e.pointerType === 'pen') stiftGesehen.current = true;

    const fingerZaehler = [...zeiger.current.values()].filter((z) => z.typ === 'touch').length;
    if (fingerZaehler >= 2) {
      const finger = [...zeiger.current.values()].filter((z) => z.typ === 'touch');
      pinchStart.current = { abstand: Math.hypot(finger[0].x - finger[1].x, finger[0].y - finger[1].y), zoom: ansicht.zoom };
      aktuellerStrich.current = null;
      return;
    }
    // Palm Rejection: nach dem ersten Stift zeichnen Finger nicht mehr.
    if (e.pointerType === 'touch' && stiftGesehen.current) return;

    const punkt = punktAus(e);
    if (werkzeug === 'text') {
      setTextEingabe({ x: punkt.x, y: punkt.y, wert: '' });
      return;
    }
    if (werkzeug === 'massband') {
      const getroffen = elemente.find((el) => el.art === 'mass' && trifftElement(el, punkt, RADIERER_RADIUS));
      if (getroffen && getroffen.art === 'mass') {
        setLabelEingabe({ id: getroffen.id, wert: getroffen.label });
        return;
      }
      if (!massStart) {
        setMassStart(punkt);
      } else {
        setzeModell([
          ...elemente,
          { id: neueId('mass'), art: 'mass', farbe, von: massStart, bis: punkt, label: massLabel(massStart, punkt) },
        ]);
        setMassStart(null);
      }
      return;
    }
    if (werkzeug === 'radierer') {
      setzeModell(radiere(elemente, punkt, RADIERER_RADIUS));
      return;
    }
    aktuellerStrich.current = [{ x: punkt.x, y: punkt.y, druck: e.pressure > 0 ? e.pressure : 0.5 }];
    zeichne();
  };

  const beiPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const bekannt = zeiger.current.get(e.pointerId);
    if (!bekannt) return;
    const vorher = { ...bekannt };
    zeiger.current.set(e.pointerId, { x: e.clientX, y: e.clientY, typ: e.pointerType });

    const finger = [...zeiger.current.values()].filter((z) => z.typ === 'touch');
    if (finger.length >= 2 && pinchStart.current) {
      const abstand = Math.hypot(finger[0].x - finger[1].x, finger[0].y - finger[1].y);
      const zoom = begrenzeZoom((pinchStart.current.zoom * abstand) / (pinchStart.current.abstand || 1));
      setAnsicht((a) => ({ ...a, zoom }));
      return;
    }
    if (e.pointerType === 'touch' && stiftGesehen.current) {
      setAnsicht((a) => ({ ...a, panX: a.panX + (e.clientX - vorher.x), panY: a.panY + (e.clientY - vorher.y) }));
      return;
    }
    if (werkzeug === 'radierer' && e.buttons) {
      const punkt = punktAus(e);
      setzeModell(radiere(elemente, punkt, RADIERER_RADIUS));
      return;
    }
    if (!aktuellerStrich.current) return;
    const punkt = punktAus(e);
    aktuellerStrich.current = [...aktuellerStrich.current, { x: punkt.x, y: punkt.y, druck: e.pressure > 0 ? e.pressure : 0.5 }];
    zeichne();
  };

  const beiPointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    zeiger.current.delete(e.pointerId);
    if ([...zeiger.current.values()].filter((z) => z.typ === 'touch').length < 2) pinchStart.current = null;
    const punkte = aktuellerStrich.current;
    aktuellerStrich.current = null;
    if (!punkte || punkte.length === 0) {
      zeichne();
      return;
    }
    setzeModell([
      ...elemente,
      {
        id: neueId('strich'),
        art: 'strich',
        werkzeug: werkzeug === 'marker' ? 'marker' : 'stift',
        farbe,
        breite: werkzeug === 'marker' ? 34 : 12,
        punkte,
      },
    ]);
  };

  /** Export in logischer Groesse; Ergebnis geht als eigene Skizze in die Anfrage. */
  const exportiere = useCallback(() => {
    const canvas = document.createElement('canvas');
    canvas.width = LEINWAND_BREITE;
    canvas.height = LEINWAND_HOEHE;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    malAlles(ctx, elemente, null);
    onChange({
      name: hintergrund ? 'Skizze annotiert' : (wert?.name ?? 'Skizze'),
      dataUrl: canvas.toDataURL('image/png'),
      breite: LEINWAND_BREITE,
      hoehe: LEINWAND_HOEHE,
    });
  }, [elemente, hintergrund, malAlles, onChange, wert?.name]);

  const werkzeugSymbol = useMemo(
    () => ({
      stift: <Pencil aria-hidden className="h-5 w-5" />,
      marker: <Highlighter aria-hidden className="h-5 w-5" />,
      radierer: <Eraser aria-hidden className="h-5 w-5" />,
      massband: <Ruler aria-hidden className="h-5 w-5" />,
      text: <TypeIcon aria-hidden className="h-5 w-5" />,
    }),
    [],
  );

  return (
    <div className={`flex gap-3 ${rechtshaendig ? 'flex-row' : 'flex-row-reverse'}`}>
      <div className="glass-toolbar flex w-16 shrink-0 flex-col items-center gap-2 rounded-3xl border border-white/70 bg-white/85 p-2">
        {WERKZEUGE.map((w) => (
          <button
            key={w.schluessel}
            type="button"
            aria-pressed={werkzeug === w.schluessel}
            aria-label={w.beschriftung}
            onClick={() => {
              setWerkzeug(w.schluessel);
              setMassStart(null);
            }}
            className={[
              'fokus-ring flex h-14 w-14 items-center justify-center rounded-2xl',
              werkzeug === w.schluessel ? 'bg-[color:var(--modul-blau,#1B3A8C)] text-white' : 'bg-white text-slate-700',
            ].join(' ')}
          >
            {werkzeugSymbol[w.schluessel]}
          </button>
        ))}
        <span className="my-1 h-px w-8 bg-slate-200" />
        {FARBEN.map((g) => (
          <button
            key={g}
            type="button"
            aria-pressed={gewerk === g}
            aria-label={`Farbe ${GEWERK_NAME[g]}`}
            onClick={() => setGewerk(g)}
            className={`fokus-ring flex h-14 w-14 items-center justify-center rounded-2xl ${gewerk === g ? 'ring-2 ring-slate-900' : ''}`}
          >
            <span className="h-7 w-7 rounded-full" style={{ backgroundColor: GEWERK_HEX[g] }} />
          </button>
        ))}
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setStack(rueckgaengig(stack))}
            disabled={!kannRueckgaengig(stack)}
            className="fokus-ring inline-flex min-h-[44px] items-center gap-2 rounded-full bg-white px-4 text-sm font-medium text-slate-700 disabled:opacity-40"
          >
            <Undo2 aria-hidden className="h-4 w-4" /> Zurueck
          </button>
          <button
            type="button"
            onClick={() => setStack(wiederholen(stack))}
            disabled={!kannWiederholen(stack)}
            className="fokus-ring inline-flex min-h-[44px] items-center gap-2 rounded-full bg-white px-4 text-sm font-medium text-slate-700 disabled:opacity-40"
          >
            <Redo2 aria-hidden className="h-4 w-4" /> Vor
          </button>
          <button
            type="button"
            onClick={() => setAnsicht(ANSICHT_START)}
            className="fokus-ring inline-flex min-h-[44px] items-center gap-2 rounded-full bg-white px-4 text-sm font-medium text-slate-700"
          >
            <Maximize aria-hidden className="h-4 w-4" /> Ansicht zuruecksetzen
          </button>
          <button
            type="button"
            onClick={() => setzeModell([])}
            className="fokus-ring inline-flex min-h-[44px] items-center gap-2 rounded-full bg-white px-4 text-sm font-medium text-[#B42318]"
          >
            <Trash2 aria-hidden className="h-4 w-4" /> Leeren
          </button>
          <button
            type="button"
            onClick={() => setRechtshaendig((r) => !r)}
            className="fokus-ring inline-flex min-h-[44px] items-center rounded-full bg-white px-4 text-sm font-medium text-slate-700"
          >
            Leiste {rechtshaendig ? 'rechts' : 'links'}
          </button>
          <button
            type="button"
            onClick={exportiere}
            className="fokus-ring ml-auto inline-flex min-h-[44px] items-center rounded-full bg-[color:var(--modul-blau,#1B3A8C)] px-5 text-sm font-semibold text-white"
          >
            Skizze uebernehmen
          </button>
        </div>

        <div
          ref={flaeche}
          className="relative h-[52vh] min-h-[320px] w-full overflow-hidden rounded-3xl border border-slate-200 bg-white"
        >
          <canvas
            ref={leinwand}
            className="h-full w-full"
            style={{ touchAction: 'none' }}
            onPointerDown={beiPointerDown}
            onPointerMove={beiPointerMove}
            onPointerUp={beiPointerUp}
            onPointerCancel={beiPointerUp}
          />
          {massStart ? (
            <p className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-sm text-slate-700">
              Zweiten Punkt antippen
            </p>
          ) : null}
          {textEingabe ? (
            <div className="absolute left-3 bottom-3 flex items-center gap-2 rounded-2xl bg-white/95 p-2 shadow">
              <label className="sr-only" htmlFor="skizze-text">
                Text
              </label>
              <input
                id="skizze-text"
                autoFocus
                value={textEingabe.wert}
                onChange={(e) => setTextEingabe({ ...textEingabe, wert: e.target.value })}
                className="glass-input h-12 rounded-xl border border-slate-200 px-3 text-base"
              />
              <button
                type="button"
                onClick={() => {
                  if (textEingabe.wert.trim()) {
                    setzeModell([
                      ...elemente,
                      { id: neueId('text'), art: 'text', farbe, position: { x: textEingabe.x, y: textEingabe.y }, groesse: 48, text: textEingabe.wert.trim() },
                    ]);
                  }
                  setTextEingabe(null);
                }}
                className="fokus-ring h-12 rounded-xl bg-[color:var(--modul-blau,#1B3A8C)] px-4 text-sm font-semibold text-white"
              >
                Setzen
              </button>
            </div>
          ) : null}
          {labelEingabe ? (
            <div className="absolute left-3 bottom-3 flex items-center gap-2 rounded-2xl bg-white/95 p-2 shadow">
              <label className="sr-only" htmlFor="skizze-mass">
                Mass in Zentimeter
              </label>
              <input
                id="skizze-mass"
                autoFocus
                value={labelEingabe.wert}
                onChange={(e) => setLabelEingabe({ ...labelEingabe, wert: e.target.value })}
                className="glass-input h-12 w-32 rounded-xl border border-slate-200 px-3 text-base"
              />
              <button
                type="button"
                onClick={() => {
                  setzeModell(
                    elemente.map((el) => (el.id === labelEingabe.id && el.art === 'mass' ? { ...el, label: labelEingabe.wert } : el)),
                  );
                  setLabelEingabe(null);
                }}
                className="fokus-ring h-12 rounded-xl bg-[color:var(--modul-blau,#1B3A8C)] px-4 text-sm font-semibold text-white"
              >
                Uebernehmen
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
