# Aufgabe 1: Eingang verarbeiten

Zeitplan: täglich 7:30 und 13:00. Zusätzlich sofort bei jeder Dispatch-Nachricht.

Lies zuerst `CLAUDE.md`. Dann:

1. Öffne `01 Eingang`. Jede Mappe ist eine Anfrage. Liegt Material lose im Ordner, lege eine Mappe je Anfrage an und sortiere es hinein.
2. Lies je Mappe alles: Sprachnotizen transkribieren, Fotos beschreiben, PDFs und Mails lesen. Prüfe zuerst die Regel aus `00 Vorlagen/richtpreis-matrix.md`, Abschnitt Regeln: Kostenschätzung, nur Terminmail oder verwerfen.
3. Bei „verwerfen": Mappe nach `99 Verworfen`, Datei `grund.txt` mit einem Satz, Zeile in `Uebersicht.csv` mit Status `verworfen`. Fertig.
4. Bei „nur Terminmail": Datenblatt nur mit Kontaktdaten und Vorhaben, `Mail.html` und `Mail.txt` aus `00 Vorlagen/terminmail.txt`, kein PDF. Mappe nach `02 Geplant`, Status `geplant`, Bemerkung `nur Termin`.
5. Bei „Kostenschätzung": Datenblatt nach `CLAUDE.md` bauen, Vorlage wählen, Zeilen übernehmen, Spannen prüfen. Ist eine Spanne `null`: Status `blockiert`, Annahmenblatt mit der fehlenden Zeile, Mappe nach `02 Geplant`, weiter mit der nächsten.
6. PDF, Mail und Annahmenblatt bauen, siehe `CLAUDE.md`, Abschnitt PDF und Mail bauen.
7. Mappe umbenennen in `KS-JJJJ-NNNN Nachname`, nach `02 Geplant` verschieben, Material in Unterordner `material/`.
8. Zeile in `Uebersicht.csv` anhängen, Status `geplant`.
9. Am Ende eine Zusammenfassung: wie viele Mappen, welche Nummern, welche blockiert, was fehlt. Bei Dispatch als Antwort, sonst als `LAUF-JJJJ-MM-TT-hhmm.md` in `02 Geplant`.

Du versendest nichts.
