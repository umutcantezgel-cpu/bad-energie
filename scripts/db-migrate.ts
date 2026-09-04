import { migrieren } from '../src/db/migrate';

migrieren()
  .then(() => {
    console.log('Migrationen ausgeführt.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Migration fehlgeschlagen:', err);
    process.exit(1);
  });
