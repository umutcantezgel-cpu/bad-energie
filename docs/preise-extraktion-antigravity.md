# Auftrag: Echte Angebotspreise aus 2026 in vier Ergebnisdateien überführen

Du liest einen Ordner mit rund 300 Angeboten der Bad & Energie GmbH (Markdown, ein Dokument je
Angebot, Jahr 2026). Am Ende lieferst du **genau vier Dateien**. Die Rohtexte der Angebote bleiben
bei dir: Gib niemals Angebotsinhalte als Fließtext in den Chat zurück, sondern schreibe
ausschließlich in die vier Dateien.

Diese Preise steuern später eine Kostenschätzungs-Software. Ein falscher Wert erzeugt dort ein
falsches Kundendokument. Deshalb gilt: **Lieber `null` als geraten.**

---

## 1. Eingabe und Arbeitsweise

- Eingabeordner: `<ORDNER>` (alle `.md`-Dateien, auch in Unterordnern).
- Arbeite in Blöcken von **25 Dokumenten**. Nach jedem Block hängst du die Ergebnisse an
  `positionen.jsonl` und `angebote.jsonl` an und schreibst den Fortschritt (`zuletzt: <Dateiname>`,
  `fertig: <n> von <gesamt>`) an das Ende von `pruefbericht.md`. So geht bei einem Abbruch nichts
  verloren und du kannst an der Stelle weitermachen.
- Wenn ein Dokument unlesbar, leer oder kein Angebot ist (Mahnung, Rechnung, Lieferschein, Notiz):
  keine Position erzeugen, stattdessen eine Zeile im Abschnitt „Nicht verwertet" des Prüfberichts.
- Rechne am Ende nach: Anzahl Dateien = verwertet + nicht verwertet. Die Zahl muss aufgehen.

---

## 2. Absolute Regeln

1. **Nichts erfinden.** Kein Preis, keine Menge, keine Einheit, die nicht im Dokument steht. Fehlt
   ein Wert, schreibst du `null`.
2. **Alles netto.** Steht im Dokument brutto, rechne `netto = brutto / 1,19`, runde auf volle Euro
   und setze `"war_brutto": true`. Steht kein Mehrwertsteuersatz dabei und der Betrag ist erkennbar
   brutto, setze zusätzlich `"unsicher": true`.
3. **Rabatte trennen.** Positionspreise erfasst du **vor** Nachlass. Einen Gesamtnachlass erfasst du
   einmal je Angebot im Feld `nachlass_prozent` bzw. `nachlass_euro`. Rechne Nachlässe niemals in
   die Einzelpositionen hinein.
4. **Keine Personendaten.** Kundenname, Anschrift, Telefon, E-Mail, Auftragsnummer des Kunden
   werden **nicht** übernommen. Als Beleg dient allein der Dateiname. Ort/PLZ nur als
   **erste zwei Ziffern** der PLZ (z. B. „35"), sonst nichts.
5. **Einzelpreis und Gesamtpreis.** Erfasse beides, wenn beides dasteht. Prüfe
   `menge × einzelpreis = gesamtpreis` (±2 €). Weicht es ab, setze `"unsicher": true` und schreib
   eine Zeile in den Prüfbericht.
6. **Pauschalpositionen** („Komplettbad schlüsselfertig", „Wärmepumpe inkl. Montage") sind wertvoll,
   aber nur, wenn erkennbar ist, was enthalten ist. Erfasse sie mit `"pauschal_umfang"` als
   Stichwortliste dessen, was der Text nennt.

---

## 3. Zielkategorien (Matrixzeilen 1 bis 17)

Jede Position ordnest du **einer** dieser Nummern zu. Passt keine, nimm `"matrix_nr": null` und
fülle `"neu_kategorie"` mit einer kurzen, sachlichen Bezeichnung (z. B. „Fußbodenheizung
nachrüsten", „Solarthermie Demontage"). Diese Restpositionen sind ausdrücklich erwünscht — aus
ihnen entsteht später die Erweiterung der Matrix.

| Nr | Leistung | Einheit | Erkennungsmerkmale im Angebotstext |
|---|---|---|---|
| 1 | Wärmepumpe Luft/Wasser **5 bis 7 kW**, Gasbestand, mit Speicher | pauschal | Wärmepumpe mit Leistungsangabe 4–7 kW, inkl. Inneneinheit/Speicher |
| 2 | Wärmepumpe Luft/Wasser **10 kW**, Gasbestand, mit Speicher | pauschal | Leistungsangabe 8–11 kW |
| 3 | Wärmepumpe Luft/Wasser **12 kW und mehr** | pauschal | Leistungsangabe ab 12 kW, oft 2 Wohneinheiten |
| 4 | Demontage Gasheizung inkl. Gasleitung und Abmeldung | pauschal | Ausbau Gastherme, Rückbau Gasleitung, Abmeldung Versorger |
| 5 | Demontage Ölheizung inkl. Tank entleeren, reinigen, entsorgen | **je_tank** | Öltank, Tankreinigung, Tankentsorgung. Menge = Anzahl Tanks |
| 6 | Rohrleitungen, Armaturen, Befüllung | pauschal | Anbindeleitungen, Armaturen, Dämmung, Befüllung, VDI 2035 |
| 7 | Elektro, Anmeldung §14a, Zuleitung | pauschal | Zuleitung Wärmepumpe, Absicherung, Anmeldung Netzbetreiber |
| 8 | Heizlast, Abgleich, Förderservice, Inbetriebnahme | pauschal | Heizlastberechnung, hydraulischer Abgleich, Fachunternehmererklärung, Inbetriebnahme |
| 9 | Zuschlag Heizkörpertausch | **je_stueck** | Heizkörper tauschen/liefern. Menge = Anzahl Heizkörper |
| 10 | Zuschlag Zählerschrank oder Unterverteilung erneuern | pauschal | Zählerschrank, Unterverteilung, Zählerplatz nach TAB |
| 11 | Multisplit Klima **1 Außen, 2 bis 3 Innen** | pauschal | Klimaanlage, Anzahl Inneneinheiten 2–3 |
| 12 | Multisplit Klima **1 Außen, 4 bis 5 Innen** | pauschal | Anzahl Inneneinheiten 4–5 |
| 13 | Demontage Bestandsheizung bei Klima | pauschal | Rückbau alte Heizung im Klima-Angebot |
| 14 | Bad einfach, Fliese auf Fliese, **bis 4 m²**, Hausmarke | pauschal | Teilsanierung ohne Abriss, kleines Bad/Gäste-WC |
| 15 | Bad komplett, **bis 6 m²**, mit Abriss und Neufliesen | pauschal | Komplettbad, Abbruch, neue Fliesen, Sanitärobjekte |
| 16 | Durchlauferhitzer inklusive Starkstromzuleitung | pauschal | Durchlauferhitzer, Starkstrom |
| 17 | Trockenbau Vorwand oder Rückwand | **je_lfm** | Vorwandinstallation, Rückwand, Trockenbau. Menge = laufende Meter |

**Zuordnungsregeln:**

- Entscheidend ist die **Leistung**, nicht die Formulierung. „Gastherme demontieren und entsorgen"
  gehört zu 4, auch wenn das Wort „Demontage" fehlt.
- Bei Wärmepumpen entscheidet die **kW-Angabe** über 1/2/3. Fehlt sie im Text, suche sie im
  Gerätetyp (z. B. „WLW186i-7 AR" → 7 kW, „Vitocal 250-A 10" → 10 kW). Findest du keine, nimm
  `"matrix_nr": null` und `"neu_kategorie": "Wärmepumpe ohne Leistungsangabe"`.
- Bei Bädern entscheidet die **Quadratmeterzahl** über 14/15, ersatzweise „mit Abriss" (15) gegen
  „Fliese auf Fliese" (14). Steht eine andere Größe (z. B. 9 m²), nimm `null` und
  `"neu_kategorie": "Bad komplett über 6 m²"` und trage `"qm"` ein.
- Deckt **eine** Angebotsposition mehrere Matrixzeilen ab (z. B. „Wärmepumpe inkl. Demontage der
  Gastherme und Elektroanschluss"), setze `"matrix_nr": null`, `"neu_kategorie": "Sammelposition"`
  und liste in `"deckt_ab": [1,4,7]`, welche Zeilen enthalten sind. Zerlege den Preis **nicht**.
- Eine Position, die nur Material ohne Montage enthält („nur Lieferung"), bekommt
  `"nur_material": true`. Diese Werte gehören nicht in dieselbe Spanne wie Komplettpositionen.

---

## 4. Ausgabedatei 1: `positionen.jsonl`

Eine Zeile je Angebotsposition, kompaktes JSON, keine Einrückung, keine Leerzeilen.

```json
{"beleg":"2026-03-14_A-12345.md","datum":"2026-03-14","gewerk":"waermepumpe","matrix_nr":2,"neu_kategorie":null,"deckt_ab":null,"titel":"Luft/Wasser-Wärmepumpe 10 kW mit 300 l Speicher","menge":1,"einheit":"pauschal","einzelpreis_netto":19850,"gesamtpreis_netto":19850,"kw":10,"liter":300,"qm":null,"stueck":null,"lfm":null,"nur_material":false,"pauschal_umfang":null,"war_brutto":false,"unsicher":false,"notiz":null}
```

Feldregeln:

- `gewerk`: genau einer von `heizung`, `bad`, `wasser`, `waermepumpe`, `solar`, `pv`, `klima`,
  `lueftung`, `elektro`.
- `einheit`: genau einer von `pauschal`, `je_stueck`, `je_lfm`, `je_tank`.
- `menge`, Preise: Zahlen ohne Tausendertrennzeichen, Preise als **volle Euro** (kaufmännisch
  gerundet). Keine Strings, keine Währungszeichen.
- `kw`, `liter`, `qm`, `stueck`, `lfm`: die im Text genannten Kennzahlen, sonst `null`. Sie sind für
  die Größenvarianten entscheidend — erfasse sie, wo immer sie dastehen.
- `notiz`: höchstens 120 Zeichen, nur wenn etwas für die Preisbewertung wichtig ist (z. B.
  „Altbau, Zuleitung 30 m", „Sonderpreis Stammkunde").

---

## 5. Ausgabedatei 2: `angebote.jsonl`

Eine Zeile je Angebot — für die Nachvollziehbarkeit der Summen.

```json
{"beleg":"2026-03-14_A-12345.md","datum":"2026-03-14","vorhaben":"waermepumpe_gas","plz2":"35","summe_netto":31240,"nachlass_prozent":3,"nachlass_euro":null,"positionen":7,"status":"vollstaendig"}
```

- `vorhaben`: eines von `waermepumpe_gas`, `waermepumpe_oel`, `klima_multisplit`, `bad_einfach`,
  `bad_komplett`, `heizung_sonstiges`, `sonstiges`.
- `status`: `vollstaendig`, wenn die Summe der Positionen (minus Nachlass) der Angebotssumme
  entspricht (±10 €); sonst `abweichung` und eine Zeile im Prüfbericht.

---

## 6. Ausgabedatei 3: `matrix-vorschlag.json`

Das ist die Datei, die am Ende in die Software geht. Je Matrixzeile 1 bis 17 **ein** Objekt,
zusätzlich ein Block `neue_zeilen` für die Restpositionen.

Berücksichtige nur Positionen mit `unsicher: false` und `nur_material: false`. Bei
`je_stueck`, `je_lfm`, `je_tank` rechnest du mit dem **Einzelpreis**, bei `pauschal` mit dem
Gesamtpreis.

```json
{
  "erzeugt_am": "2026-09-15",
  "quelle": "300 Angebote 2026, Bad & Energie GmbH",
  "zeilen": [
    {
      "nr": 2,
      "leistung": "Wärmepumpe Luft/Wasser 10 kW, Gasbestand, mit Speicher",
      "einheit": "pauschal",
      "n": 34,
      "min": 17900,
      "p10": 18600,
      "median": 20100,
      "p90": 23800,
      "max": 29500,
      "vorschlag_von": 18600,
      "vorschlag_bis": 23800,
      "streuung_hinweis": "eng",
      "belege": ["2026-03-14_A-12345.md", "..."]
    }
  ],
  "neue_zeilen": [
    {
      "bezeichnung": "Fußbodenheizung nachrüsten",
      "gewerk": "heizung",
      "einheit": "pauschal",
      "n": 11,
      "p10": 4200,
      "median": 5600,
      "p90": 7900,
      "belege": ["..."]
    }
  ]
}
```

Regeln für die Aggregation:

- `vorschlag_von` = p10, `vorschlag_bis` = p90, beide **auf volle 100 € gerundet** (von abrunden,
  bis aufrunden). So bleiben einzelne Ausreißer außen vor, die Spanne bildet aber den üblichen
  Bereich ab.
- `streuung_hinweis`: `eng`, wenn p90/p10 ≤ 1,5; `mittel` bis 2,5; `weit` darüber. Bei `weit`
  schreibst du in den Prüfbericht, welcher Faktor die Streuung erklärt (Gerätegröße, Altbau,
  Sonderlösung), soweit aus den Belegen erkennbar.
- Zeilen mit `n < 3`: trotzdem ausgeben, aber `vorschlag_von` und `vorschlag_bis` auf `null` setzen
  und `"streuung_hinweis": "zu wenige Belege"`. Drei Angebote sind die Untergrenze für eine Spanne.
- `belege`: höchstens 20 Dateinamen je Zeile, sonst wird die Datei zu groß.
- `neue_zeilen`: Fasse ähnliche Restpositionen zusammen (gleiche Leistung, andere Wortwahl). Gib
  nur Gruppen mit `n ≥ 3` aus, sortiert nach `n` absteigend, höchstens 40 Gruppen.

---

## 7. Ausgabedatei 4: `pruefbericht.md`

Kurz, sachlich, für einen Menschen zum Nachschlagen. Abschnitte in dieser Reihenfolge:

1. **Zahlenspiegel**: Dateien gesamt, verwertet, nicht verwertet, Positionen gesamt, davon
   zugeordnet / neue Kategorie / unsicher.
2. **Nicht verwertet**: Dateiname + einzeiliger Grund.
3. **Rechenabweichungen**: Angebote mit `status: abweichung`, jeweils Soll/Ist.
4. **Auffällige Preise**: Positionen, die unter p10/2 oder über p90×2 der eigenen Matrixzeile
   liegen, mit Dateiname und Betrag. Nicht löschen — nur melden.
5. **Weite Streuungen**: je Matrixzeile mit `streuung_hinweis: weit` ein Satz zur Ursache.
6. **Offene Fragen an den Betrieb**: alles, was ein Mensch entscheiden muss (z. B. „12 Angebote
   enthalten Wärmepumpen ohne kW-Angabe", „Bäder über 6 m² sind in der Matrix nicht vorgesehen").
7. **Fortschritt**: die während der Arbeit angehängten Blockmeldungen.

---

## 8. Abschluss

Wenn alle Dokumente verarbeitet sind, prüfe selbst:

- Ist jede Zeile in `positionen.jsonl` gültiges JSON? (Ein Syntaxfehler macht die ganze Datei
  unbrauchbar.)
- Enthält `matrix-vorschlag.json` genau 17 Objekte im Block `zeilen`, auch die ohne Belege?
- Steht in keiner Datei ein Kundenname, eine Anschrift, eine Telefonnummer oder eine E-Mail?
- Gehen die Zahlen im Zahlenspiegel auf?

Melde im Chat am Ende **nur** diese vier Zeilen:

```
positionen.jsonl      <n> Zeilen
angebote.jsonl        <n> Zeilen
matrix-vorschlag.json 17 Zeilen + <n> neue Kategorien
pruefbericht.md       <n> offene Fragen
```

Keine Zusammenfassung der Angebote, keine Beispieltexte, keine Preislisten im Chat.
