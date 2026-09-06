# Bad & Energie GmbH — Website und Vertriebsmodul

Next.js 16 (App Router) mit einem integrierten Vertriebs- und Kalkulationsmodul: öffentlicher Touch-Konfigurator,
geschützter Meister-Modus unter `/intern`, serverseitige Kostenschätzung als DIN-A4-PDF, Versand an Kunde und Büro.

## Schnellstart

```bash
nvm use            # Node 22 (.nvmrc, engines)
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
| `npx tsx scripts/bundle-pruefen.ts` | Größe der Function-Bundles aus dem letzten Build prüfen (Warnschwelle 200 MB, Vercel bricht bei 250 MB ab) |

## Umgebungsvariablen

Alle Variablen stehen mit Erläuterung in `.env.example`; gelesen und geprüft werden sie in `src/lib/env.ts`.
Geheimnisse mit `openssl rand -base64 48` erzeugen.

| Variable | Pflicht | Bedeutung |
|---|---|---|
| `APP_URL` | in Produktion (https) | Öffentliche Basisadresse, Grundlage aller Links in Mails und PDF |
| `DATABASE_URL` | in Produktion (Postgres) | Neon-Verbindung im Pooler-Modus; lokal `pglite://./data/pglite`, im Test `pglite://memory` |
| `SESSION_SECRET` | in Produktion | Signatur der Sitzungscookies, mindestens 32 Zeichen |
| `CRON_SECRET` | in Produktion | Bearer-Token der Job-Route, mindestens 32 Zeichen |
| `BLOB_READ_WRITE_TOKEN` | in Produktion | Vercel Blob (privat); lokal liegen die Dateien unter `./data/blob` |
| `MAIL_FROM` | ja | Absender der Mails |
| `MAIL_TRANSPORT` | in Produktion `resend` | `resend` oder `file`; der Dateiadapter schreibt `.eml` nach `./data/outbox` und hat auf Vercel keine Platte |
| `RESEND_API_KEY` | bei `MAIL_TRANSPORT=resend` | Schlüssel des Resend-Kontos |
| `RESEND_WEBHOOK_SECRET` | bei `MAIL_TRANSPORT=resend` | Signaturprüfung von `/api/webhooks/resend`; ohne Secret ist der Webhook ungeschützt |
| `MAIL_TEST_TO` | nein | Auffangadresse: solange gesetzt, gehen alle Mails dorthin, der echte Empfänger steht im Betreff. Im Livebetrieb entfernen |
| `INTAKE_AI` | nein (Vorgabe `off`) | Schalter für die KI-gestützte Eingangsverarbeitung |
| `CHROME_EXECUTABLE_PATH` | nein | Lokaler Chrome oder Chromium für die PDF-Erzeugung in der Entwicklung; Produktion nutzt `@sparticuz/chromium` |
| `SKIP_ENV_VALIDATION` | nein | `1` überspringt die Startprüfung, nur für Werkzeuge und Tests |
| `NODE_ENV` | nein | Setzt Next selbst; steuert die harten Produktionsprüfungen |

In Produktion verweigert der Start, wenn `APP_URL` nicht auf https zeigt, `DATABASE_URL` auf PGlite zeigt oder
`SESSION_SECRET`, `CRON_SECRET`, `BLOB_READ_WRITE_TOKEN`, `MAIL_TRANSPORT=resend`, `RESEND_API_KEY` oder
`RESEND_WEBHOOK_SECRET` fehlen.

Lokal genügen die Vorgaben: Datenbank als PGlite-Datei unter `./data/pglite`, Mails als `.eml` unter `./data/outbox`,
Dateien unter `./data/blob`. PGlite verträgt nur einen Prozess: Migration und Seed laufen nur, wenn `npm run dev` nicht läuft.

## Betrieb auf Vercel

Projekt `bad-energie` in der Region **fra1**, Produktionsadresse `https://bad-energie-nu.vercel.app`.
Das Projekt läuft auf **Vercel Pro** (kommerzielle Nutzung, Cron im Minutentakt, Funktionslaufzeit bis 300 s).

### Einrichtung im Vercel-Dashboard (Reihenfolge im Dashboard)

1. **Storage → Neon Postgres** (Region Frankfurt) mit dem Projekt verbinden. Vercel setzt `DATABASE_URL` selbst.
2. **Storage → Blob Store** anlegen, Zugriff privat. Vercel setzt `BLOB_READ_WRITE_TOKEN` selbst. Dateien werden
   ausschließlich über authentifizierte Routen ausgeliefert.
3. **Settings → Environment Variables** (Production) in dieser Reihenfolge setzen:

   | Variable | Wert |
   |---|---|
   | `APP_URL` | `https://bad-energie-nu.vercel.app` |
   | `SESSION_SECRET` | `openssl rand -base64 48` |
   | `CRON_SECRET` | `openssl rand -base64 48` |
   | `MAIL_FROM` | `Bad & Energie Vorführung <onboarding@resend.dev>` (Livebetrieb: `info@bad-energie.de`) |
   | `MAIL_TRANSPORT` | `resend` |
   | `MAIL_TEST_TO` | Auffangadresse der Vorführung (im Livebetrieb löschen) |
   | `RESEND_API_KEY` | Schlüssel aus dem Resend-Konto |
   | `RESEND_WEBHOOK_SECRET` | Secret des Webhooks auf `https://bad-energie-nu.vercel.app/api/webhooks/resend` |
   | `INTAKE_AI` | `off` |

4. Danach lokal `npx vercel env pull .env.production.local`, dann `npm run db:migrate`,
   `npm run db:seed -- --demo` und `npm run benutzer …` gegen Neon ausführen und deployen.

**Resend**: Die Domain `bad-energie.de` ist angelegt, aber noch nicht verifiziert (Region us-east-1). Bis zur
Verifizierung sendet Resend nur an die eigene Kontoadresse, deshalb die Auffangadresse in `MAIL_TEST_TO`.
Für den Livebetrieb: SPF, DKIM und DMARC verifizieren, EU-Region wählen, `MAIL_FROM` auf `info@bad-energie.de` stellen.

**Sicherung**: Neon Point-in-Time-Recovery (PITR) aktivieren. `SESSION_SECRET` gehört mit in die Sicherung,
sonst sind alle Sitzungen nach einer Wiederherstellung ungültig.

**Größe der Functions**: Die entpackte Function darf 250 MB nicht überschreiten. `next.config.ts` schließt über
`outputFileTracingExcludes` alles aus, was der Server nie liest (Bilder aus `public`, Laufzeitdaten unter `data`,
Altsystem und lokales Material). Nach jedem Build prüft `npx tsx scripts/bundle-pruefen.ts` die Größe je Route.

### Zeitsteuerung

Die Zeiten stehen in UTC. Auf Pro laufen die Jobs minutengenau; der Versand prüft alle fünf Minuten, ob freigegebene Aufträge fällig sind.
Alle drei stehen in `vercel.json` und laufen gegen `/api/jobs/[job]`:

| Job | Zeitplan | Bedeutung |
|---|---|---|
| `versand` | `*/5 * * * *` | alle fünf Minuten; sendet freigegebene Aufträge, sobald ihr 18:00-Puffer (Berliner Zeit) abgelaufen ist, und holt Fehlversuche nach Backoff nach |
| `eingang` | `30 5,11 * * *` | bewertet Web-Anfragen im Eingang neu (Matrix inzwischen gefüllt, Triage, Positionen vorbelegt) |
| `wiedervorlage` | `0 4 * * *` (04:00 UTC) | Erinnerungen nach Regel 9; führt Speicherfrist und Bereinigung mit aus |

Jeder Job lässt sich zusätzlich von Hand auslösen: mit dem Bearer-Token oder als angemeldeter Benutzer mit
der Rolle `chef` aus dem Intern-Bereich heraus.

```bash
# Job von Hand auslösen (CRON_SECRET aus den Projektvariablen)
curl -X POST -H "Authorization: Bearer $CRON_SECRET" https://bad-energie-nu.vercel.app/api/jobs/versand
curl -X POST -H "Authorization: Bearer $CRON_SECRET" https://bad-energie-nu.vercel.app/api/jobs/wiedervorlage
curl -X POST -H "Authorization: Bearer $CRON_SECRET" https://bad-energie-nu.vercel.app/api/jobs/eingang
curl -X POST -H "Authorization: Bearer $CRON_SECRET" https://bad-energie-nu.vercel.app/api/jobs/speicherfrist
curl -X POST -H "Authorization: Bearer $CRON_SECRET" https://bad-energie-nu.vercel.app/api/jobs/bereinigung
```

Ein Job läuft je Zeitfenster nur einmal; ein zweiter Aufruf im selben Fenster meldet 409, solange der erste
Lauf arbeitet oder erfolgreich war.

## Vorführung

Adresse `https://bad-energie-nu.vercel.app`. Anmeldung unter `/intern` mit `chef@bad-energie.de` und der Vorführ-PIN `482916`. Bis die Domain `bad-energie.de` bei Resend verifiziert ist, sendet Resend nur an die verifizierte Kontoadresse (`phoenixprojekt1@gmail.com`); alle Kundenmails und Büro-Dossiers landen deshalb bei dieser Auffangadresse, im Betreff steht der eigentliche Empfänger („[an: …]“). Preise sind der Demo-Preissatz (unter `/intern/matrix` gekennzeichnet); der Chef ersetzt sie dort durch seine Werte.

1. **Kunde** (öffentlich, ohne Anmeldung): `/heizung/heizungskonfigurator`. Sieben Schritte: Gas, älter als
   zwanzig Jahre, 22.000 kWh, Standort Keller; Einfamilienhaus, 150 m², vor 1978, 1 Wohnung, 2 Personen;
   Heizkörper; Wärmepumpe; selbst bewohnt, Einkommen nein; Eigentum, PLZ 35578, in den nächsten Wochen;
   Kontaktdaten und „Kostenschätzung anfordern“. Ergebnis: Spanne 31.000 bis 40.000 €, Zuschuss 16.500 € mit
   drei Bausteinen, Eigenanteil 15.000 bis 23.000 €, Heizkosten heute 2.420 € und mit Wärmepumpe 1.510 € im Jahr.
   Das Büro bekommt sofort eine Hinweismail (Auffangadresse).
2. **Büro**: `/intern` anmelden, `/intern/board` zeigt die Anfrage in „Eingang“ mit Spanne und Dringlichkeit;
   „Details“ zeigt Kalkulation, Kunde und Gebäude, Konfigurator-Antworten und den Verlauf.
3. **Meister vor Ort**: auf der Karte „Bearbeiten“ öffnet den Konfigurator im Meister-Modus (geführt, sieben
   Abschnitte). „Bausteine“ zeigt die Positionen mit Matrixzeile und die Größenvariante 10 kW als Vorschlag;
   „Gebäude und Heizung“ ist aus dem Web-Lead vorbelegt und rechnet die Heizlast auf beiden Wegen (9,2 kW aus dem
   Verbrauch, 18,9 kW aus der Fläche), schlägt Bosch 10 kW mit 200 Litern vor und zeigt die Betriebskosten pro
   Monat; Türbreite 73 eintragen zeigt die Warnung; „Kunde und Objekt“ braucht die Objektadresse; „Dokument“
   braucht den persönlichen Satz und genau zwei Terminfenster (freie Fenster unter `/intern/termine` anlegen);
   „Abschluss“ → „Sofort senden“ → „Jetzt senden“. Nach wenigen Sekunden: Kundenmail mit dem PDF
   „Kostenschaetzung KS-… Bad und Energie.pdf“ und Büro-Dossier mit Datenblatt, CSV und PDF in der Auffangadresse;
   die Detailansicht zeigt unter „Dokumente“ die PDF-Vorschau.
4. **Dispatch** (Handy): `/intern/dispatch`, den Text eines Portal-Leads (WattFox) einfügen, Vorschau prüfen,
   „Bestätigen & Ausführen“. Ohne Verbrauchsangabe bleibt die Größe der Wärmepumpe bewusst offen (blockiert),
   der Meister ergänzt sie im Konfigurator.
5. **Entwürfe**: im Konfigurator „Als Entwurf speichern“, dann `/intern/entwuerfe`: Freigabeblatt mit Warnungen,
   „Freigeben (18:00)“ oder „Freigeben und sofort senden“. Freigegebene Aufträge sendet der Cron alle fünf Minuten,
   sobald der 18:00-Puffer abgelaufen ist.
6. **Kundenansicht**: der Schalter oben rechts blendet Netto, Matrixnummern und interne Faktoren aus, damit das
   Tablet dem Kunden gezeigt werden kann.

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
