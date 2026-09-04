# Aufgabe 2: Freigegebene versenden

Zeitplan: täglich 15:30.

Lies zuerst `CLAUDE.md`. Dann:

1. Öffne `03 Freigegeben`. Nur Mappen, die hier liegen, dürfen raus.
2. Je Mappe: `datenblatt.json` lesen. Prüfen, dass `email` gefüllt ist und `Kostenschaetzung.pdf`, `Mail.html`, `Mail.txt` vorhanden sind. Fehlt etwas: Mappe zurück nach `02 Geplant`, Bemerkung in der Übersicht, nicht senden.
3. Mail senden über den Gmail-Connector aus dem Postfach von Sabri Demir. Empfänger `email`, Betreff `mail_betreff`, HTML aus `Mail.html`, Textfassung aus `Mail.txt`, Anhang `Kostenschaetzung.pdf` unter dem Namen `Kostenschaetzung KS-JJJJ-NNNN Bad und Energie.pdf`.
4. Mappe nach `04 Versendet`.
5. `Uebersicht.csv`: Status `versendet`, `versendet_am` heute, `wiedervorlage` heute plus 5 Tage.
6. `Abschlussbericht.md` in die Mappe: Kunde, Vorhaben, Spanne, Annahmen, Versanddatum, Wiedervorlage, Terminvorschlag.
7. Am Ende eine Zusammenfassung per Dispatch an den Chef: Anzahl versendet, je Zeile Nummer, Nachname, Spanne. Wenn nichts in `03 Freigegeben` lag: eine Zeile „nichts freigegeben".

Sende nie zweimal an dieselbe Nummer. Steht die Nummer in der Übersicht schon auf `versendet`, überspringen und melden.
