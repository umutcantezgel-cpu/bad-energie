import { seeden } from '../src/db/seed';
import { getDb } from '../src/db/client';
import { sql } from 'drizzle-orm';

seeden()
  .then(async () => {
    const db = await getDb();
    const zaehlen = async (t: string) => Number(((await db.execute(sql.raw(`select count(*)::int as n from ${t}`))) as unknown as { rows?: { n: number }[] }).rows?.[0]?.n ?? (await db.execute(sql.raw(`select count(*)::int as n from ${t}`)) as unknown as { n: number }[])[0]?.n);
    for (const t of ['richtpreis', 'vorlage', 'vorlage_zeile', 'foerder_regel', 'einstellung', 'terminfenster', 'plz_radius', 'vorbehalt']) {
      console.log(`${t}: ${await zaehlen(t)}`);
    }
    process.exit(0);
  })
  .catch((err) => { console.error('Seed fehlgeschlagen:', err); process.exit(1); });
