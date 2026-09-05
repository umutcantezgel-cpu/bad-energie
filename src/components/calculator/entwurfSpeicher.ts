/**
 * Lokaler Entwurfsspeicher und Autosave des Meister-Modus.
 *
 * Der Entwurf liegt in IndexedDB (native API, keine Bibliothek) je Anfrage. Aenderungen
 * werden entprellt an die Server Action `speichereEntwurf` gegeben. Ohne Netz sammelt
 * eine Outbox die betroffenen Schluessel und leert sich beim Ereignis `online`.
 *
 * Konfliktregel: der Server gewinnt bei Status und Nummern, das Geraet gewinnt bei
 * Notizen, Positionsnotizen, Skizzen, Fotos und den vor Ort erhobenen Gebaeudedaten
 * (siehe `verschmelzeEntwurf`).
 */
import type { InternAnfrage } from '@/lib/types';
import { normalisiereAnfrage } from './meister-utils';

export const DATENBANK = 'bad-energie-entwuerfe';
export const SPEICHER = 'entwuerfe';
export const OUTBOX = 'outbox';
export const ENTPRELLUNG_MS = 1500;

// ---------------------------------------------------------------------------
// Synchronisationszustand (rein, daher direkt pruefbar)
// ---------------------------------------------------------------------------

export type SyncStatus = 'ruhend' | 'sendet' | 'gespeichert' | 'offline' | 'fehler';
export type SyncZustand = { status: SyncStatus; offen: number; zuletzt: number | null; meldung: string };

export const SYNC_START: SyncZustand = { status: 'ruhend', offen: 0, zuletzt: null, meldung: '' };

export type SyncAktion =
  | { typ: 'aenderung' }
  | { typ: 'sendet' }
  | { typ: 'erfolg'; zeit: number }
  | { typ: 'fehler'; meldung: string }
  | { typ: 'offline' }
  | { typ: 'online' };

/** Reiner Reduzierer des Sync-Badges. */
export function syncReduzierer(zustand: SyncZustand, aktion: SyncAktion): SyncZustand {
  switch (aktion.typ) {
    case 'aenderung':
      return { ...zustand, offen: zustand.offen + 1, status: zustand.status === 'offline' ? 'offline' : 'ruhend' };
    case 'sendet':
      return { ...zustand, status: zustand.status === 'offline' ? 'offline' : 'sendet' };
    case 'erfolg':
      return { status: 'gespeichert', offen: 0, zuletzt: aktion.zeit, meldung: '' };
    case 'fehler':
      return { ...zustand, status: 'fehler', meldung: aktion.meldung };
    case 'offline':
      return { ...zustand, status: 'offline' };
    case 'online':
      return { ...zustand, status: zustand.offen > 0 ? 'sendet' : 'gespeichert', meldung: '' };
    default:
      return zustand;
  }
}

/** Beschriftung des Sync-Badges. */
export function syncText(zustand: SyncZustand): string {
  switch (zustand.status) {
    case 'sendet':
      return 'Wird gesendet';
    case 'gespeichert':
      return 'Gespeichert';
    case 'offline':
      return zustand.offen > 0
        ? `Offline, ${zustand.offen} ${zustand.offen === 1 ? 'Aenderung' : 'Aenderungen'} lokal`
        : 'Offline';
    case 'fehler':
      return zustand.meldung || 'Nicht gespeichert';
    default:
      return zustand.offen > 0 ? 'Nicht gespeichert' : 'Bereit';
  }
}

// ---------------------------------------------------------------------------
// Modulweiter Zustand fuer das Badge in der Toolbar
// ---------------------------------------------------------------------------

let syncZustand: SyncZustand = SYNC_START;
const syncHoerer = new Set<() => void>();

export function syncLesen(): SyncZustand {
  return syncZustand;
}

export function syncServerLesen(): SyncZustand {
  return SYNC_START;
}

export function syncAbonnieren(hoerer: () => void): () => void {
  syncHoerer.add(hoerer);
  return () => {
    syncHoerer.delete(hoerer);
  };
}

export function syncMelden(aktion: SyncAktion): SyncZustand {
  const naechste = syncReduzierer(syncZustand, aktion);
  if (naechste === syncZustand) return syncZustand;
  syncZustand = naechste;
  for (const h of syncHoerer) h();
  return syncZustand;
}

/** Nur fuer Tests. */
export function syncZuruecksetzen(): void {
  syncZustand = SYNC_START;
}

// ---------------------------------------------------------------------------
// Konfliktregel
// ---------------------------------------------------------------------------

/**
 * Server gewinnt bei Kennungen und Status, das Geraet gewinnt bei allem, was
 * vor Ort entsteht: Notizen, Positionsnotizen, Skizzen, Fotos und die
 * Gebaeude- und Heizungsdaten (der Meister erhebt sie am Objekt).
 */
export function verschmelzeEntwurf(server: InternAnfrage, lokal: InternAnfrage): InternAnfrage {
  const notizenJePosition = new Map(lokal.positionen.map((p) => [p.id, p.notizIntern]));
  return {
    ...server,
    gebaeude: {
      ...lokal.gebaeude,
      bestand: { ...lokal.gebaeude.bestand },
      platz: { ...lokal.gebaeude.platz },
      geraet: { ...lokal.gebaeude.geraet },
    },
    notizen: { ...lokal.notizen },
    skizzen: [...lokal.skizzen],
    fotos: [...lokal.fotos],
    positionen: server.positionen.map((p) => {
      const notiz = notizenJePosition.get(p.id);
      return notiz && notiz !== p.notizIntern ? { ...p, notizIntern: notiz } : p;
    }),
  };
}

// ---------------------------------------------------------------------------
// IndexedDB
// ---------------------------------------------------------------------------

type Eintrag = { schluessel: string; wert: InternAnfrage; zeit: number };

function verfuegbar(): boolean {
  return typeof indexedDB !== 'undefined';
}

function oeffne(): Promise<IDBDatabase> {
  return new Promise((erfuellen, ablehnen) => {
    const anfrage = indexedDB.open(DATENBANK, 1);
    anfrage.onupgradeneeded = () => {
      const db = anfrage.result;
      if (!db.objectStoreNames.contains(SPEICHER)) db.createObjectStore(SPEICHER, { keyPath: 'schluessel' });
      if (!db.objectStoreNames.contains(OUTBOX)) db.createObjectStore(OUTBOX, { keyPath: 'schluessel' });
    };
    anfrage.onsuccess = () => erfuellen(anfrage.result);
    anfrage.onerror = () => ablehnen(anfrage.error ?? new Error('IndexedDB nicht verfuegbar'));
  });
}

function fuehreAus<T>(
  speicher: string,
  modus: IDBTransactionMode,
  arbeit: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T | null> {
  if (!verfuegbar()) return Promise.resolve(null);
  return oeffne()
    .then(
      (db) =>
        new Promise<T | null>((erfuellen, ablehnen) => {
          const tx = db.transaction(speicher, modus);
          const anfrage = arbeit(tx.objectStore(speicher));
          anfrage.onsuccess = () => erfuellen(anfrage.result ?? null);
          anfrage.onerror = () => ablehnen(anfrage.error ?? new Error('Schreibfehler'));
          tx.oncomplete = () => db.close();
        }),
    )
    .catch(() => null);
}

export function entwurfSchluessel(anfrageId?: string): string {
  return anfrageId && anfrageId.trim() ? anfrageId : 'neu';
}

export async function speichereLokal(schluessel: string, wert: InternAnfrage): Promise<void> {
  await fuehreAus<IDBValidKey>(SPEICHER, 'readwrite', (store) => store.put({ schluessel, wert, zeit: Date.now() } satisfies Eintrag));
}

export async function ladeLokal(schluessel: string): Promise<InternAnfrage | null> {
  const eintrag = await fuehreAus<Eintrag | undefined>(SPEICHER, 'readonly', (store) => store.get(schluessel) as IDBRequest<Eintrag | undefined>);
  // Aeltere Entwuerfe kennen `gebaeude` noch nicht; fehlende Teile werden ergaenzt.
  return eintrag?.wert ? normalisiereAnfrage(eintrag.wert) : null;
}

export async function loescheLokal(schluessel: string): Promise<void> {
  await fuehreAus<undefined>(SPEICHER, 'readwrite', (store) => store.delete(schluessel) as IDBRequest<undefined>);
}

export async function outboxSetzen(schluessel: string): Promise<void> {
  await fuehreAus<IDBValidKey>(OUTBOX, 'readwrite', (store) => store.put({ schluessel, zeit: Date.now() }));
}

export async function outboxEntfernen(schluessel: string): Promise<void> {
  await fuehreAus<undefined>(OUTBOX, 'readwrite', (store) => store.delete(schluessel) as IDBRequest<undefined>);
}

export async function outboxSchluessel(): Promise<string[]> {
  const alle = await fuehreAus<IDBValidKey[]>(OUTBOX, 'readonly', (store) => store.getAllKeys());
  return (alle ?? []).map((k) => String(k));
}

// ---------------------------------------------------------------------------
// Autosave
// ---------------------------------------------------------------------------

export type AutosaveOptionen = {
  schluessel: string;
  senden: (anfrage: InternAnfrage) => Promise<unknown>;
  verzoegerung?: number;
};

export type Autosave = {
  /** Meldet eine Aenderung; speichert lokal sofort und sendet entprellt. */
  melde: (anfrage: InternAnfrage) => void;
  /** Sendet den letzten Stand sofort. */
  jetzt: () => Promise<void>;
  /** Entfernt Zeitgeber und Ereignishorcher. */
  stoppe: () => void;
};

function online(): boolean {
  return typeof navigator === 'undefined' || navigator.onLine !== false;
}

export function starteAutosave(optionen: AutosaveOptionen): Autosave {
  const verzoegerung = optionen.verzoegerung ?? ENTPRELLUNG_MS;
  let letzte: InternAnfrage | null = null;
  let zeitgeber: ReturnType<typeof setTimeout> | null = null;
  // Zwei Speicherlaeufe duerfen sich nie ueberholen: Ein zweiter Lauf ohne bekannte
  // Vorgangskennung legt sonst einen zweiten Vorgang mit eigener KS-Nummer an.
  // Deshalb haengen alle Laeufe an einer Kette; waehrend ein Lauf laeuft, wird nur
  // vorgemerkt und danach der juengste Stand einmal nachgereicht.
  let kette: Promise<void> = Promise.resolve();
  let offen = false;

  const ausfuehren = async (): Promise<void> => {
    if (!offen || !letzte) return;
    offen = false;
    if (!online()) {
      syncMelden({ typ: 'offline' });
      await outboxSetzen(optionen.schluessel);
      return;
    }
    syncMelden({ typ: 'sendet' });
    try {
      await optionen.senden(letzte);
      await outboxEntfernen(optionen.schluessel);
      syncMelden({ typ: 'erfolg', zeit: Date.now() });
    } catch {
      await outboxSetzen(optionen.schluessel);
      syncMelden({ typ: 'fehler', meldung: 'Nicht gespeichert, wird erneut versucht' });
    }
  };

  const senden = (): Promise<void> => {
    offen = true;
    // Ein Fehler darf die Kette nicht abreissen lassen, sonst speichert das Geraet nie wieder.
    const naechste = kette.then(ausfuehren, ausfuehren);
    kette = naechste;
    return naechste;
  };

  const beiOnline = () => {
    syncMelden({ typ: 'online' });
    void senden();
  };
  const beiOffline = () => {
    syncMelden({ typ: 'offline' });
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('online', beiOnline);
    window.addEventListener('offline', beiOffline);
    if (!online()) syncMelden({ typ: 'offline' });
  }

  return {
    melde(anfrage) {
      letzte = anfrage;
      syncMelden({ typ: 'aenderung' });
      void speichereLokal(optionen.schluessel, anfrage);
      if (zeitgeber) clearTimeout(zeitgeber);
      zeitgeber = setTimeout(() => {
        zeitgeber = null;
        void senden();
      }, verzoegerung);
    },
    async jetzt() {
      if (zeitgeber) {
        clearTimeout(zeitgeber);
        zeitgeber = null;
      }
      await senden();
    },
    stoppe() {
      if (zeitgeber) clearTimeout(zeitgeber);
      zeitgeber = null;
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', beiOnline);
        window.removeEventListener('offline', beiOffline);
      }
    },
  };
}
