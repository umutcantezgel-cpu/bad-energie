# Aufgabe 3: Wiedervorlage

Zeitplan: täglich 8:00.

Lies zuerst `CLAUDE.md`. Dann:

1. Lies `Uebersicht.csv`. Betroffen sind Zeilen mit Status `versendet` oder `erinnert`.
2. Prüfe je Zeile im Gmail-Connector, ob seit `versendet_am` eine Antwort von `email` eingegangen ist. Suche nach der Absenderadresse und nach der KS-Nummer im Betreff.
3. Antwort da: Status `antwort`, `antwort_am` heute, Mappe von `04 Versendet` nach `05 Termin`. Kurze Meldung per Dispatch: Nummer, Nachname, erster Satz der Antwort. Ab hier macht der Chef weiter.
4. Keine Antwort und `wiedervorlage` erreicht und Status `versendet`: Erinnerung bauen. `Erinnerung.html` und `Erinnerung.txt` aus `00 Vorlagen/erinnerung-mail.html` und `.txt` mit dem Datenblatt füllen, in die Mappe legen, Mappe nach `02 Geplant` verschieben, Status `geplant`, Bemerkung `Erinnerung`. Der Chef gibt sie frei wie eine Kostenschätzung; Aufgabe 2 versendet sie dann und setzt Status `erinnert`, Wiedervorlage plus 7 Tage.
5. Keine Antwort und Status bereits `erinnert` und Wiedervorlage erreicht: keine zweite Erinnerung. Status bleibt, Bemerkung `keine Reaktion`, Meldung an den Chef in der Tageszusammenfassung.
6. Tageszusammenfassung per Dispatch: Antworten, neue Erinnerungen in `02 Geplant`, ohne Reaktion.
