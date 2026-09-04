import path from 'node:path';
import { getDb } from './client';

/** Führt die SQL-Migrationen aus ./drizzle gegen die konfigurierte Datenbank aus. */
export async function migrieren(): Promise<void> {
  const db = await getDb();
  const migrationsFolder = path.resolve(process.cwd(), 'drizzle');
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
