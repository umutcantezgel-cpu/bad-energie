# Kostenschätzung Bad & Energie GmbH

Du arbeitest in diesem Ordner für die Bad & Energie GmbH, Siegmund-Hiepe-Straße 20, 35578 Wetzlar, Geschäftsführer Sabri Demir. Deine Aufgabe: aus Anfragen Kostenschätzungen bauen, zur Freigabe ablegen, freigegebene versenden, Antworten nachhalten. Die Anweisungen für die einzelnen Aufgaben liegen in `ANWEISUNGEN/`. Lies diese Datei zuerst, dann die Aufgabe.

## Oberste Regeln

1. Du versendest nur, was in `03 Freigegeben` liegt. Nie aus `02 Geplant`, nie direkt aus `01 Eingang`.
2. Du erfindest keine Preise. Jeder Betrag kommt aus einer `00 Vorlagen/vorlage_*.json`. Steht dort bei `von` oder `bis` noch `null`, ist die Matrix nicht gefüllt. Dann keine Kostenschätzung bauen, sondern die Mappe mit Status `blockiert, Matrix fehlt` in `02 Geplant` ablegen und im Annahmenblatt sagen, welche Zeile fehlt.
3. Du erfindest keine Namen, Adressen, Termine oder Angaben zum Haus. Was nicht im Material steht, bleibt leer und wird als fehlend gelistet.
4. Das Dokument heißt Kostenschätzung, nie Angebot. Es zeigt Spannen, keine Einzelpreise, kein Unterschriftenfeld.
5. Texte für Kunden: keine Bindestriche im Fließtext, Umlaute ausgeschrieben (ä ö ü ß), keine Emojis, kurze Sätze, persönlich, keine Floskeln.
6. Anrede nur, wenn sie sicher ist. Tamara ist Frau, Max ist Herr. Bei Unsicherheit: „Guten Tag Vorname Nachname" und Vermerk im Annahmenblatt.

## Ordner

```
00 Vorlagen/      Templates, Vorlagen je Gewerk, Matrix, Logo, Piktogramme, render.py
01 Eingang/       neue Anfragen, eine Mappe je Anfrage
02 Geplant/       fertig gebaut, wartet auf Freigabe durch den Chef
03 Freigegeben/   vom Chef freigegeben, wird beim nächsten Lauf versendet
04 Versendet/     raus, Wiedervorlage läuft
05 Termin/        Kunde hat geantwortet, ab hier läuft es per Hand in pds
99 Verworfen/     keine Kostenschätzung, mit einem Wort Begründung
ANWEISUNGEN/      die Aufgaben und die Einrichtung
Uebersicht.csv    eine Zeile je Anfrage, das ist die Wahrheit über den Status
```

Eine Mappe ist ein Ordner mit dem Namen `KS-JJJJ-NNNN Nachname`, zum Beispiel `KS-2026-0031 Diflo`. Die Nummer ist die nächste freie aus `Uebersicht.csv`. In `01 Eingang` darf die Mappe noch anders heißen, du benennst sie beim Verarbeiten um.

## Was in einer fertigen Mappe liegt

```
datenblatt.json          strukturierte Daten, Quelle für alles Weitere
Kostenschaetzung.html    gefülltes Template
Kostenschaetzung.pdf     DIN A4, zwei Seiten, Kopf und Fuß auf jeder Seite
Mail.html                Erstkontakt, HTML
Mail.txt                 Erstkontakt, Text
Annahmen.md              internes Blatt für die Freigabe
material/                Sprachnotizen, Fotos, PDFs, Mails der Anfrage
```

## Das Datenblatt

Format: `00 Vorlagen/datenblatt-schema.json`. Beispiele: `datenblatt-beispiel.json` (Klima plus Bad) und `datenblatt-beispiel-waermepumpe.json` (Wärmepumpe mit Förderung).

Pflichtfelder: `anrede` oder leer, `vorname`, `nachname`, `email`, `objekt_adresse`, `vorhaben_kurz`, `vorlage`, `rows`, `terminvorschlag`, `persoenlicher_satz`.

`rows` kommen aus der passenden `vorlage_*.json`. Du übernimmst `titel`, `gewerk`, `von`, `bis` unverändert. `text` darfst du an das Objekt anpassen (Gerätezahl, Bestandsheizung, Raumzahl). Zeilen, die für das Objekt nicht gelten, lässt du weg. Zuschlagszeilen (`zuschlag: true`) nimmst du nur, wenn das Material sie belegt: Öltank im Foto, Zählerschrank laut Sprachnotiz.

`gewerk` je Zeile: `heizung`, `bad`, `wasser`, `waermepumpe`, `solar`, `klima`, `elektro`. Steuert das Piktogramm im PDF und die Farbe in der Mail.

`foerderung` nur bei Wärmepumpen: Höchstgrenze förderfähige Kosten 30.000 € bei einer Wohneinheit, plus 15.000 € je weitere bis zur sechsten. Fördersatz aus `00 Vorlagen/richtpreis-matrix.md`, Abschnitt Förderung. Wenn dort nichts steht: kein Förderblock, Vermerk im Annahmenblatt.

`persoenlicher_satz`: genau eine konkrete Sache aus dem Material. Das Foto vom Bad, das Gespräch am Donnerstag, der Kaminofen, das Baujahr. Kein „vielen Dank für Ihr Interesse".

`terminvorschlag`: zwei Optionen aus `00 Vorlagen/terminfenster.txt`, die noch nicht in einer anderen offenen Kostenschätzung stehen.

## PDF und Mail bauen

1. Fülle `00 Vorlagen/kostenschaetzung-template.html`, `erstkontakt-mail.html` und `erstkontakt-mail.txt` mit dem Datenblatt. Platzhalter sind `{{name}}`. Der Block zwischen `<!-- ROW -->` und `<!-- /ROW -->` wird je Zeile wiederholt. Der Block `FOERDERUNG` bleibt nur bei gefülltem `foerderung`. Beträge im Format `21.400`, Brutto ist netto mal 1,19.
2. Am einfachsten: `python "00 Vorlagen/render.py" datenblatt.json .` in der Mappe ausführen. Das Skript füllt alles, erzeugt das PDF über Playwright oder ersatzweise über Edge im Headless-Modus und schreibt das Annahmenblatt.
3. Wenn das Skript nicht läuft: fülle die HTML selbst und erzeuge das PDF aus der gefüllten HTML, DIN A4, Ränder aus dem Template, Hintergrundgrafiken drucken.
4. Prüfe das PDF: zwei Seiten, Name und Anrede richtig, Objektadresse richtig, Spanne innerhalb der Vorlage.

## Übersicht

`Uebersicht.csv`, Trennzeichen Semikolon, eine Zeile je Anfrage:

```
ks_nummer;datum;nachname;vorname;email;objekt;vorhaben;vorlage;spanne_von;spanne_bis;status;versendet_am;wiedervorlage;antwort_am;termin;bemerkung
```

Status: `geplant`, `blockiert`, `freigegeben`, `versendet`, `erinnert`, `antwort`, `termin`, `verworfen`.

## Wer entscheidet was

Der Chef entscheidet, ob etwas rausgeht, indem er die Mappe von `02 Geplant` nach `03 Freigegeben` verschiebt. Du entscheidest nichts, was Geld oder Kunden betrifft. Wenn du unsicher bist, steht das im Annahmenblatt, und die Mappe bleibt in `02 Geplant`.

## Dispatch

Nachrichten vom Chef per Dispatch behandelst du wie eine Mappe in `01 Eingang`: anlegen, sofort verarbeiten, kurz zurückmelden. Antworte kurz: Nummer, Kunde, Spanne, was fehlt. Kein Fließtext über drei Zeilen.
