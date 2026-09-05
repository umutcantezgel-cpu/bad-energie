# Bad & Energie GmbH — Website und Vertriebsmodul

Next.js 16 (App Router) mit einem integrierten Vertriebs- und Kalkulationsmodul: öffentlicher Touch-Konfigurator,
geschützter Meister-Modus unter `/intern`, serverseitige Kostenschätzung als DIN-A4-PDF, Versand an Kunde und Büro.

## Schnellstart

```bash
nvm use            # Node 20.9 oder neuer (Next 16)
npm ci
cp .env.example .env.local
npm run db:migrate         # legt die lokale PGlite-Datenbank unter ./data an
npm run db:seed -- --demo  # Vorlagen, Einstellungen, Terminfenster und der Demo-Preissatz (ohne --demo bleibt die Matrix leer)
npm run benutzer -- --email chef@bad-energie.de --name "Sabri Demir" --rolle chef --funktion "Geschäftsführer"
npm run dev
```

Die PIN wird beim Anlegen einmalig ausgegeben. Anmeldung im Meister-Modus unter `http://localhost:3000/intern`.

## Skripte

| Befehl | Zweck |
|---|---|
| `npm run dev` | Entwicklungsserver |
| `npm run build` / `npm start` | Produktionsbuild und -server |
| `npm run lint` / `npm run typecheck` | ESLint und TypeScript |
| `npm test` | Vitest (reine Logik, PGlite im Speicher) |
| `npm run test:e2e` | Playwright |
| `npm run db:generate` | SQL-Migration aus dem Drizzle-Schema erzeugen |
| `npm run db:migrate` / `npm run db:seed` | Migrationen ausführen, Grunddaten laden |
| `npm run benutzer -- --email … --name … --rolle chef` | Benutzer für den Intern-Bereich anlegen |

## Umgebungsvariablen

Alle Variablen stehen mit Erläuterung in `.env.example`. In Produktion verweigert der Start, wenn
`APP_URL` (https), `DATABASE_URL` (Postgres), `SESSION_SECRET`, `CRON_SECRET`, `BLOB_READ_WRITE_TOKEN`
oder bei aktivem Resend-Versand `RESEND_API_KEY` fehlen. Geheimnisse mit `openssl rand -base64 32` erzeugen.

Lokal genügen die Vorgaben: Datenbank als PGlite-Datei unter `./data/pglite`, Mails als `.eml` unter `./data/outbox`,
Dateien unter `./data/blob`. PGlite verträgt nur einen Prozess: Migration und Seed laufen nur, wenn `npm run dev` nicht läuft.

`MAIL_TEST_TO` ist die Auffangadresse: Solange sie gesetzt ist, gehen alle Mails dorthin, der echte Empfänger steht
im Betreff. Für die Vorführung wird sie auf die Adresse gesetzt, die die Mails sehen soll; im Livebetrieb entfällt sie.

## Betrieb auf Vercel

1. Projekt mit dem Repository verbinden, Region **fra1**, Plan **Pro** (Cron im Minutentakt, längere Funktionslaufzeit für die PDF-Erzeugung).
2. **Neon Postgres** (EU) anlegen, `DATABASE_URL` als gepoolte Verbindung setzen, danach `npm run db:migrate` und `npm run db:seed` gegen diese Datenbank ausführen.
3. **Vercel Blob** Store (EU) anlegen, `BLOB_READ_WRITE_TOKEN` setzen. Dateien sind privat und werden nur über authentifizierte Routen ausgeliefert.
4. **Resend**: Domain `bad-energie.de` verifizieren (SPF, DKIM, DMARC), EU-Region wählen, `RESEND_API_KEY`, `RESEND_WEBHOOK_SECRET` und `MAIL_FROM` setzen, `MAIL_TRANSPORT=resend`. Webhook auf `/api/webhooks/resend` zeigen lassen.
5. `SESSION_SECRET`, `CRON_SECRET` und `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` setzen. Die Cron-Jobs stehen in `vercel.json` und laufen gegen `/api/jobs/[job]`.
6. Erste Anmeldung: Benutzer über `npm run benutzer` gegen die Produktionsdatenbank anlegen.

Sicherung: Neon Point-in-Time-Recovery (PITR) aktivieren. `SESSION_SECRET` und `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` gehören mit in die Sicherung.

### Manuelle Cron-Ausführung & Tests
```bash
# Job manuell über Bearer-Token triggern
curl -X POST -H "Authorization: Bearer $CRON_SECRET" https://bad-energie.de/api/jobs/versand
curl -X POST -H "Authorization: Bearer $CRON_SECRET" https://bad-energie.de/api/jobs/wiedervorlage
curl -X POST -H "Authorization: Bearer $CRON_SECRET" https://bad-energie.de/api/jobs/eingang
curl -X POST -H "Authorization: Bearer $CRON_SECRET" https://bad-energie.de/api/jobs/speicherfrist
curl -X POST -H "Authorization: Bearer $CRON_SECRET" https://bad-energie.de/api/jobs/bereinigung
```

## Aufbau & Routen

### Öffentliche Journeys (Kunden-Modus)
- `/bad/badanfrage` / `/bad/budgetkalkulator`: Badmodernisierung (N = 6 Schritte)
- `/heizung/heizungskonfigurator`: Heizungstausch mit BEG KfW 458 Förderrechner (N = 7 Schritte)
- `/heizung/waermepumpe/check`: Wärmepumpen-Eignungscheck (N = 6 Schritte)
- `/termin`: Online-Terminbuchung (direkte Übermittlung an `POST /api/estimate`)

### Intern-Bereich (`/intern`)
- `/intern`: PIN-Authentifizierung (Session-Cookie `sitzung` / `__Host-sitzung`)
- `/intern/board`: Kanban-Übersicht aller Anfragen und Status
- `/intern/entwuerfe`: Freigabeliste für Kostenschätzungs-Entwürfe (18:00 Puffer)
- `/intern/konfigurator`: Meister-Modus mit Baustein-Kacheln, Zuschlägen, SketchPad, PDF-Vorschau
- `/intern/dispatch`: Schnellverarbeitung von Freigaben und Kurzbefehlen
- `/intern/matrix`: Verwaltung der Richtpreis-Matrix (Zeilen 1 bis 17)
- `/intern/termine`: Verwaltung der freien Terminfenster und Reservierungen
- `/intern/einstellungen`: Puffer-Uhrzeit (18:00), Speicherfrist (24 Monate), Briefbogendaten
- `/intern/benutzer`: Benutzerverwaltung & PIN-Vergabe (nur Rolle `chef`)

## Fachliche Regeln

Verbindlich sind die Regeln aus dem Altsystem: Das Dokument heißt **Kostenschätzung**, nie Angebot, zeigt Spannen
von…bis und hat kein Unterschriftenfeld. Es entstehen keine erfundenen Preise: Fehlt eine Zeile der Richtpreis-Matrix,
blockiert das System den Versand und benennt die fehlende Zeile. Beträge werden brutto mit dem Faktor 1,19 ausgewiesen.
Der Versand läuft über einen Puffer bis 18:00 Uhr oder sofort von der Baustelle. Nach fünf Tagen ohne Antwort entsteht
eine Erinnerung, die erneut freigegeben werden muss.

Nach dem Seed ohne `--demo` ist die Matrix leer, also blockiert. Das ist beabsichtigt: Der Betrieb trägt die Beträge unter
`/intern/matrix` ein, erst danach zeigt der öffentliche Konfigurator Spannen. Die Heizlast-Schnellschätzung, der
Gerätevorschlag aus der Bosch-Baureihe, der Speichervorschlag nach Personen und der Betriebskostenvergleich folgen dem
Erfassungsbogen des Chefs (`src/lib/services/heizlast.ts`, Prüfwerte in `heizlast.test.ts`).

## Sicherheit

`SECURITY.md` ist die verbindliche Spezifikation (Sitzungen, Datengrenzen, Uploads, Mail, Geheimnisse, Löschfristen).
Bekannter Altlastenpunkt: In der Git-Historie liegen ein Google-Maps-Schlüssel und Passwort-Artefakte. Der Schlüssel ist
zu widerrufen; bis zu einer Bereinigung der Historie gilt das Repository als kompromittiert.
