import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { InternAnfrage } from '@/lib/types';
import { starteAutosave, syncLesen, syncZuruecksetzen, verschmelzeEntwurf } from './entwurfSpeicher';
import { leereAnfrage } from './meister-utils';

/**
 * Der Autosave laeuft ohne IndexedDB und ohne window; beide Zugriffe sind im Modul
 * abgesichert, deshalb genuegt die Node-Umgebung.
 */
describe('starteAutosave', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    syncZuruecksetzen();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('fasst mehrere Aenderungen in der Entprellung zu einem Speicherlauf zusammen', async () => {
    const gesendet: InternAnfrage[] = [];
    const speicher = starteAutosave({
      schluessel: 'neu',
      verzoegerung: 1500,
      senden: async (a) => {
        gesendet.push(a);
      },
    });
    const basis = leereAnfrage();

    speicher.melde({ ...basis, vorhabenKurz: 'Bad' });
    await vi.advanceTimersByTimeAsync(400);
    speicher.melde({ ...basis, vorhabenKurz: 'Bad und Heizung' });
    await vi.advanceTimersByTimeAsync(400);
    speicher.melde({ ...basis, vorhabenKurz: 'Waermepumpe' });
    await vi.advanceTimersByTimeAsync(1500);

    expect(gesendet).toHaveLength(1);
    expect(gesendet[0].vorhabenKurz).toBe('Waermepumpe');
    expect(syncLesen().status).toBe('gespeichert');
    speicher.stoppe();
  });

  it('startet waehrend eines laufenden Laufs keinen zweiten und reicht den juengsten Stand nach', async () => {
    const gesendet: InternAnfrage[] = [];
    // Der Aufloeser wird im haengenden Lauf gesetzt; ein Platzhalter haelt den Typ einfach.
    let loesen: () => void = () => undefined;
    // Der Aufrufer haelt die Kennung aus der Antwort fest, so wie es der Meister-Modus tut.
    let kennung: string | null = null;
    const speicher = starteAutosave({
      schluessel: 'neu',
      verzoegerung: 1500,
      senden: async (a) => {
        const koerper = { ...a, anfrageId: a.anfrageId ?? kennung ?? undefined };
        gesendet.push(koerper);
        if (koerper.anfrageId) return;
        await new Promise<void>((erfuellen) => {
          loesen = erfuellen;
        });
        kennung = 'A-1';
      },
    });

    speicher.melde({ ...leereAnfrage(), vorhabenKurz: 'Bad' });
    await vi.advanceTimersByTimeAsync(1500);
    expect(gesendet).toHaveLength(1);
    expect(gesendet[0].anfrageId).toBeUndefined();

    // Aenderung waehrend der erste Lauf noch haengt: sie darf weder verloren gehen
    // noch einen zweiten Vorgang mit eigener KS-Nummer anlegen.
    speicher.melde({ ...leereAnfrage(), vorhabenKurz: 'Bad und Heizung' });
    await vi.advanceTimersByTimeAsync(1500);
    expect(gesendet).toHaveLength(1);

    loesen();
    await vi.advanceTimersByTimeAsync(50);

    expect(gesendet).toHaveLength(2);
    expect(gesendet[1].vorhabenKurz).toBe('Bad und Heizung');
    expect(gesendet[1].anfrageId).toBe('A-1');
    speicher.stoppe();
  });

  it('sendet nach einem Fehler weiter', async () => {
    const gesendet: InternAnfrage[] = [];
    let ersterLauf = true;
    const speicher = starteAutosave({
      schluessel: 'neu',
      verzoegerung: 1500,
      senden: async (a) => {
        gesendet.push(a);
        if (ersterLauf) {
          ersterLauf = false;
          throw new Error('Netzfehler');
        }
      },
    });

    speicher.melde({ ...leereAnfrage(), vorhabenKurz: 'Bad' });
    await vi.advanceTimersByTimeAsync(1500);
    expect(syncLesen().status).toBe('fehler');

    speicher.melde({ ...leereAnfrage(), vorhabenKurz: 'Heizung' });
    await vi.advanceTimersByTimeAsync(1500);

    expect(gesendet).toHaveLength(2);
    expect(syncLesen().status).toBe('gespeichert');
    speicher.stoppe();
  });

  it('jetzt sendet den letzten Stand ohne auf die Entprellung zu warten', async () => {
    const gesendet: InternAnfrage[] = [];
    const speicher = starteAutosave({
      schluessel: 'neu',
      verzoegerung: 1500,
      senden: async (a) => {
        gesendet.push(a);
      },
    });

    speicher.melde({ ...leereAnfrage(), vorhabenKurz: 'Bad' });
    await speicher.jetzt();

    expect(gesendet).toHaveLength(1);
    await vi.advanceTimersByTimeAsync(2000);
    expect(gesendet).toHaveLength(1);
    speicher.stoppe();
  });
});

describe('verschmelzeEntwurf', () => {
  it('laesst dem Geraet die vor Ort erhobenen Daten und dem Server die Kennungen', () => {
    const server: InternAnfrage = { ...leereAnfrage(), anfrageId: 'A-1', vorhabenKurz: 'Serverstand' };
    const lokal: InternAnfrage = {
      ...leereAnfrage(),
      vorhabenKurz: 'Geraetestand',
      notizen: { ...leereAnfrage().notizen, intern: 'Zaehlerschrank pruefen' },
      gebaeude: { ...leereAnfrage().gebaeude, wohnflaeche: 150 },
    };

    const verschmolzen = verschmelzeEntwurf(server, lokal);

    expect(verschmolzen.anfrageId).toBe('A-1');
    expect(verschmolzen.vorhabenKurz).toBe('Serverstand');
    expect(verschmolzen.notizen.intern).toBe('Zaehlerschrank pruefen');
    expect(verschmolzen.gebaeude.wohnflaeche).toBe(150);
  });
});
