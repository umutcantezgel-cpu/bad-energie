# Einrichtung in Claude Desktop, einmalig, etwa 30 Minuten

## 1. Ordner

Diesen Ordner `Kostenschaetzung` an einen festen Ort auf dem Büro-PC legen, zum Beispiel `C:\BadEnergie\Kostenschaetzung`. Wenn Google Drive für Desktop läuft, alternativ in den Drive-Ordner, dann kann der Chef vom Handy in `02 Geplant` reinschauen. Claude arbeitet auf dem lokalen Ordner.

## 2. Claude Desktop

1. Claude Desktop öffnen, Tab Cowork.
2. Neue Aufgabe, als Arbeitsordner `Kostenschaetzung` auswählen. Claude liest `CLAUDE.md` automatisch.
3. Einmal testen, ohne Zeitplan: „Führe ANWEISUNGEN/aufgabe-1-eingang-verarbeiten.md aus." Vorher eine Testmappe in `01 Eingang` legen, zum Beispiel das Planungsformular vom Vaillant-Objekt als Foto.
4. Ergebnis in `02 Geplant` prüfen: PDF öffnen, zwei Seiten, Name richtig, Spanne aus der Vorlage.

## 3. Gmail

Connector Gmail in Claude Desktop verbinden, mit dem Postfach, aus dem die Mails rausgehen sollen. Das ist die einzige Stelle, an der Claude nach außen sendet. Vorher mit dem Chef klären, welches Postfach.

## 4. Geplante Aufgaben

In der Cowork-Aufgabe mit dem Arbeitsordner drei Aufgaben planen. Je Aufgabe den Text aus `ANWEISUNGEN/` als Anweisung übergeben:

- Aufgabe 1, Eingang verarbeiten: täglich 7:30 und 13:00
- Aufgabe 2, Freigegebene versenden: täglich 15:30
- Aufgabe 3, Wiedervorlage: täglich 8:00

Formulierung zum Anlegen: „Lege eine geplante Aufgabe an: täglich um 7:30 und 13:00 in diesem Ordner ANWEISUNGEN/aufgabe-1-eingang-verarbeiten.md ausführen." Die Aufgaben erscheinen in der Seitenleiste unter Geplant.

Wichtig: Geplante Aufgaben laufen nur, wenn Claude Desktop offen ist und der PC wach. Energiesparen und Ruhezustand ausschalten, Claude Desktop in den Autostart.

## 5. Dispatch

1. Auf dem Handy des Chefs die Claude App öffnen, Seitenleiste, Dispatch.
2. Mit dem Büro-PC koppeln, der PC muss dabei wach sein und Claude Desktop offen.
3. Testnachricht: „Testanfrage, Mustermann, Beispielweg 4 Wetzlar, Wärmepumpe statt Gas, 155 Quadratmeter Baujahr 2005." Innerhalb weniger Minuten muss die Antwort mit einer KS-Nummer kommen und in `02 Geplant` eine Mappe liegen.
4. Testmappe danach nach `99 Verworfen`.

## 6. Matrix und Terminfenster

- `00 Vorlagen/richtpreis-matrix.md` mit dem Chef füllen. Solange dort `null` steht, baut Claude nichts, sondern meldet `blockiert`.
- Die Spannen aus der Matrix in die `vorlage_*.json` eintragen, Feld `von` und `bis`.
- `00 Vorlagen/terminfenster.txt` mit den Terminfenstern der nächsten zwei Wochen füllen. Der Chef pflegt die Datei, eine Zeile je Fenster.

## 7. Wenn etwas hakt

- Aufgabe feuert nicht: PC war im Ruhezustand oder Claude Desktop zu. Beim nächsten Öffnen laufen alle verpassten Aufgaben auf einmal, das ist harmlos.
- PDF fehlt in der Mappe, HTML ist da: `python "00 Vorlagen/render.py" datenblatt.json .` in der Mappe ausführen, oder die HTML in Edge öffnen und als PDF drucken.
- Dispatch antwortet nicht: PC schläft. Anrufen, jemand weckt ihn.
