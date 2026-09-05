import { getDb } from './client';

/** Führt die SQL-Migrationen aus ./drizzle gegen die konfigurierte Datenbank aus. */
export async function migrieren(): Promise<void> {
  const db = await getDb();
  // Feste Zeichenkette statt berechnetem Pfad: der Datei-Trace der Function bleibt dadurch klein.
  const migrationsFolder = 'drizzle';
  const url = process.env.DATABASE_URL ?? 'pglite://./data/pglite';
  if (url.startsWith('pglite://')) {
    const { migrate } = await import('drizzle-orm/pglite/migrator');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await migrate(db as any, { migrationsFolder });
  } else {
    const { migrate } = await import('drizzle-orm/postgres-js/migrator');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await migrate(db as any, { migrationsFolder });
  }
}
