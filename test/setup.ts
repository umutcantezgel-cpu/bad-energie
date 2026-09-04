// Tests laufen immer gegen eine In-Memory-PGlite-Datenbank und ohne Mailversand.
process.env.DATABASE_URL = 'pglite://memory';
process.env.MAIL_TRANSPORT = 'file';
