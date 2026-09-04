# Sicherheitsspezifikation (verbindlich)

Diese Datei beschreibt den Soll-Zustand des Vertriebs- und Kalkulationsmoduls. Jede Abweichung ist ein Fehler, kein Stil.

## Geltungsbereich
Website (`src/app/(site)`), Intern-Bereich (`src/app/(intern)`), Route Handler (`src/app/api`), Dienste (`src/lib/services`), Jobs (`src/lib/jobs`), Datenbank (`src/db`).

## Zugang und Sitzungen
- Intern-Bereich nur nach PIN-Login (6 bis 8 Ziffern je Benutzer). PINs werden mit `crypto.scryptSync` gehasht (N = 2^15, r = 8, p = 1, 16 Byte Salt), Format `scrypt$N$r$p$salt$hash`, Vergleich mit `timingSafeEqual`. Unbekannte Benutzer erhalten einen Dummy-Vergleich (konstante Antwortzeit).
- Sperre nach 5 Fehlversuchen für 15 Minuten je Benutzer; Rate-Limit je IP über die Tabelle `rate_limit`.
- Sitzung: opake ID (32 Zufallsbytes), in der Datenbank nur `sha256(SESSION_SECRET + id)`. Cookie `sitzung` (Entwicklung) bzw. `__Host-sitzung` (Produktion): `httpOnly`, `sameSite=lax`, `path=/`, kein `domain`, `secure` immer beim `__Host-`-Namen. Absolut 12 h, Leerlauf 2 h gleitend. Deaktivieren eines Benutzers widerruft alle seine Sitzungen.
- `verifySession()` (`server-only`, React `cache()`) wird in jeder Intern-Page, jeder Server Action und jedem `/api/intern/*`-Handler aufgerufen. `src/proxy.ts` prüft nur optimistisch das Cookie und ist keine Autorisierung.
- Rollen: `chef` (alles), `bauleiter` (eigene Anfragen anlegen, kalkulieren, freigeben, sofort senden), `buero` (anlegen, kalkulieren, keine Freigabe).

## Datengrenzen
- Interne Faktoren (Stundensatz, Materialaufschlag, Rabatt, Margenhinweis), Positionsnotizen, interne Notizen, Skizzen und Fotos erreichen nie eine öffentliche Seite, nie ein Kundendokument, nie eine Kundenmail. Die Richtpreis-Matrix erreicht nur authentifizierte Clients.
- Öffentliche Antworten sind ausschließlich `OeffentlicheErgebnisDTO` (gerundete Bruttospanne, Förderbetrag, Text). Die Bestätigungsseite rendert nur `TokenSeiteDTO`.
- Module unter `src/db/**`, `src/lib/services/**` (außer der reinen Berechnung) und `src/lib/jobs/**` beginnen mit `import 'server-only'`.
- CI prüft den Build-Output (`.next/static`, vorgerendertes HTML) gegen eine Deny-Liste interner Feldnamen und gegen Sentinel-Beträge eines CI-Seeds.

## Server Actions und Route Handler
- Jede Server Action ruft `verifySession()` auf oder steht auf der gepflegten Allow-Liste öffentlicher Aktionen (PIN-Login, Terminbestätigung); diese prüfen stattdessen Rate-Limit und Token bzw. PIN.
- Mutierende `/api/intern/*`-Handler prüfen `Origin` bzw. `Sec-Fetch-Site`. `sameSite=lax` ist ein Sicherheitsmerkmal, kein Default.
- Body-Limit für Server Actions 4 MB; Binärdaten (Fotos, Skizzen) laufen über Route Handler oder direkte Blob-Uploads mit serverseitig ausgestelltem Token.
- Öffentliche Endpunkte (`/api/estimate` im Kunden-Modus, Terminbestätigung) tragen Honeypot, Zeitfalle und Rate-Limit (`x-real-ip`).

## Uploads und Dateien
- Prüfung über Magic Bytes, nicht über den vom Client gemeldeten MIME-Typ. Erlaubt: JPEG, PNG, WebP, HEIC (nach Konvertierung), PDF. `image/svg+xml` wird abgelehnt.
- Bilder werden mit `sharp` neu kodiert (max. 2000 px, EXIF und GPS entfernt); nur das Ergebnis wird gespeichert.
- Ablage in Vercel Blob (`access: 'private'`) unter `anhaenge/<anfrage_id>/<uuid>.<ext>`; der Client-Dateiname ist nur Metadatum und nie Teil eines Pfads.
- Auslieferung nur über `GET /api/intern/anfragen/[id]/anhaenge/[anhangId]` nach `verifySession()`, mit Prüfung `anhang.anfrage_id === params.id` und Rollenregel; Header `Cache-Control: private, no-store`, `X-Content-Type-Options: nosniff`, `Content-Disposition` mit RFC-5987-Dateinamen.

## Dokumente und Mails
- Template-Tokens werden HTML-escaped. Ausnahmen sind ausschließlich engine-erzeugte Tokens (`row_icon`, `gewerk_chips`, `annahmen_liste`, `vorbehalte_liste`, `legende`, `logo_base64`, `icon_*`, `font_base64`), deren Inhalte vor dem Einbau escaped werden. Kein `dangerouslySetInnerHTML` außerhalb dieser Engine und `JsonLd`.
- PDF-Rendering in Chromium mit deaktiviertem JavaScript, ohne Netzwerkzugriff, mit Timeout.
- Mail-Header werden vor dem Versand validiert (Betreff ohne CR/LF, Empfänger nach RFC 5322, Anhangname aus `KS-\d{4}-\d{4}`). Jeder Versandauftrag trägt einen Idempotency-Key.
- Die Eingangsbestätigung ist standardmäßig aus und bei Aktivierung je Empfänger und global gedrosselt; sie enthält keinen Freitext des Absenders.

## Geheimnisse und Umgebung
- Keine Geheimnisse im Repository. `src/lib/env.ts` validiert beim Start `APP_URL`, `DATABASE_URL`, `BLOB_READ_WRITE_TOKEN`, `RESEND_API_KEY`, `RESEND_WEBHOOK_SECRET`, `MAIL_FROM`, `CRON_SECRET`, `SESSION_SECRET`; Produktion verweigert den Start bei Fehlern.
- `CRON_SECRET` wird mit `timingSafeEqual` über SHA-256 verglichen. Unbekannte Jobs antworten 404.
- Die Git-Historie enthielt einen Google-Maps-Schlüssel und Passwort-Artefakte. Der Schlüssel ist zu widerrufen; die Historie gilt bis zu einer Bereinigung als kompromittiert.

## Logging und Datenschutz
- Logging nur über `src/services/logger.js`; `secureError` redigiert Geheimnisfelder. Keine personenbezogenen Daten in Job-Logs.
- Speicherfrist aus `einstellung.speicherfrist_monate` (Default 24). Der Job `speicherfrist` löscht Anfrage, Kunde, Positionen, Anhänge (inklusive Blob), Dokumente, Versandaufträge und Ereignisse und schreibt ein Löschprotokoll ohne personenbezogene Daten. Auskunft (Art. 15) und Löschung (Art. 17) sind Aktionen im Intern-Bereich.

## Vorfall
1. Betroffene Zugangsdaten widerrufen und neu setzen (Vercel, Neon, Blob, Resend, `SESSION_SECRET`, `CRON_SECRET`).
2. Alle Sitzungen widerrufen (`sitzung.widerrufen_am`).
3. Ereignisprotokoll (`ereignis`, `job_lauf`) sichern und auswerten.
