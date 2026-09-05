import { mkdirSync } from 'node:fs';
import type { PgDatabase, PgQueryResultHKT } from 'drizzle-orm/pg-core';
import * as schema from './schema';

export type Db = PgDatabase<PgQueryResultHKT, typeof schema>;

type Global = typeof globalThis & { __badEnergieDb?: Promise<Db> };

/**
 * Elternordner aller lokalen PGlite-Ablagen (`./data/pglite`, `./data/e2e`).
 * Der Name steht als Zeichenkette im Code, weil der Datei-Trace des Deployments einen
 * berechneten Pfad nicht auflösen kann: Er nimmt dann das ganze Arbeitsverzeichnis in das
 * Function-Bundle auf, und das sprengt die Grenze von 250 MB entpackt.
 */
const DATEN_ORDNER = 'data';

/**
 * PGlite legt nur den letzten Teil des Pfades an; fehlt der Elternordner, bricht der Start
 * mit ENOENT ab. Angelegt wird darum ausschließlich der feste Ordner `data`, und nur dann,
 * wenn das Datenverzeichnis direkt darin liegt. Jedes andere Ziel stellt der Betrieb selbst bereit.
 */
export function brauchtDatenOrdner(verzeichnis: string): boolean {
  const teile = verzeichnis.replace(/^\.\//, '').split('/');
  return teile.length === 2 && teile[0] === DATEN_ORDNER && teile[1] !== '' && teile[1] !== '..';
}

async function verbinden(): Promise<Db> {
  const url = process.env.DATABASE_URL ?? 'pglite://./data/pglite';
  if (url.startsWith('pglite://')) {
    if (process.env.NODE_ENV === 'production' && process.env.VERCEL) {
      throw new Error('DATABASE_URL zeigt auf PGlite. In Produktion muss eine Postgres-Verbindung (Neon) gesetzt sein.');
    }
    const { PGlite } = await import('@electric-sql/pglite');
    const { drizzle } = await import('drizzle-orm/pglite');
    const verzeichnis = url.replace('pglite://', '') || './data/pglite';
    if (brauchtDatenOrdner(verzeichnis)) mkdirSync(DATEN_ORDNER, { recursive: true });
    const client = verzeichnis === 'memory' ? new PGlite() : new PGlite(verzeichnis);
    return drizzle({ client, schema }) as unknown as Db;
  }
  const postgres = (await import('postgres')).default;
  const { drizzle } = await import('drizzle-orm/postgres-js');
  // prepare: false für Pooler im Transaktionsmodus (Neon/pgbouncer)
  const client = postgres(url, { prepare: false, max: 5, idle_timeout: 20, connect_timeout: 10 });
  return drizzle({ client, schema }) as unknown as Db;
}

/** Datenbankverbindung (Singleton je Prozess). */
export function getDb(): Promise<Db> {
  const g = globalThis as Global;
  if (!g.__badEnergieDb) g.__badEnergieDb = verbinden();
  return g.__badEnergieDb;
}

export { schema };
