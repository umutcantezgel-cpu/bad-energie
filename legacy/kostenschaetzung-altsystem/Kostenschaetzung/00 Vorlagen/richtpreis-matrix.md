# Richtpreis-Matrix

Füllt der Chef, einmal. Alle Beträge netto, als Spanne. Enthalten: Material, Montage, Anfahrt, Inbetriebnahme. Die Zahlen werden danach in die `vorlage_*.json` übertragen, Felder `von` und `bis`. Solange dort `null` steht, baut Claude keine Kostenschätzung.

| Nr | Leistung | von | bis | Hinweis |
|---|---|---|---|---|
| 1 | Wärmepumpe Luft/Wasser 5 bis 7 kW, Gasbestand, mit Speicher | | | vorlage_waermepumpe_gas, Zeile 1, klein |
| 2 | Wärmepumpe Luft/Wasser 10 kW, Gasbestand, mit Speicher | | | vorlage_waermepumpe_gas, Zeile 1 |
| 3 | Wärmepumpe Luft/Wasser 12 kW und mehr, 2 Wohneinheiten | | | vorlage_waermepumpe_gas, Zeile 1, groß |
| 4 | Demontage Gasheizung inkl. Gasleitung und Abmeldung | | | vorlage_waermepumpe_gas, Zeile 2 |
| 5 | Demontage Ölheizung inkl. Tank entleeren, reinigen, entsorgen | | | vorlage_waermepumpe_oel, Zeile 2, je Tank |
| 6 | Rohrleitungen, Armaturen, Befüllung | | | beide Wärmepumpen-Vorlagen, Zeile 3 |
| 7 | Elektro, Anmeldung §14a, Zuleitung | | | beide Wärmepumpen-Vorlagen, Zeile 4 |
| 8 | Heizlast, Abgleich, Förderservice, Inbetriebnahme | | | beide Wärmepumpen-Vorlagen, Zeile 5 |
| 9 | Zuschlag Heizkörpertausch | | | je Stück, Zuschlagszeile |
| 10 | Zuschlag Zählerschrank oder Unterverteilung erneuern | | | Zuschlagszeile |
| 11 | Multisplit Klima 1 Außen, 2 bis 3 Innen | | | vorlage_klima_multisplit, Zeile 1, klein |
| 12 | Multisplit Klima 1 Außen, 4 bis 5 Innen | | | vorlage_klima_multisplit, Zeile 1 |
| 13 | Demontage Bestandsheizung bei Klima | | | vorlage_klima_multisplit, Zeile 2 |
| 14 | Bad einfach, Fliese auf Fliese, bis 4 m², Hausmarke | | | vorlage_bad_einfach, Zeile 1 |
| 15 | Bad komplett, bis 6 m², mit Abriss und Neufliesen | | | eigene Vorlage später |
| 16 | Durchlauferhitzer inklusive Starkstromzuleitung | | | Zuschlagszeile, Bad und Klima |
| 17 | Trockenbau Vorwand oder Rückwand | | | je lfm, Zuschlagszeile |

## Förderung Wärmepumpe

Grundförderung 30 %, Effizienzbonus 5 % bei natürlichem Kältemittel, Klimageschwindigkeitsbonus 20 % bei Austausch einer alten Öl oder Gasheizung im selbst bewohnten Haus, Einkommensbonus 30 % bei Haushaltseinkommen bis 40.000 €. Deckel 70 %. Höchstgrenze förderfähige Kosten 30.000 € bei einer Wohneinheit, plus 15.000 € je weitere bis zur sechsten.

Standardsatz, den Claude ohne weitere Angabe nimmt: ____ % (bitte eintragen, Vorschlag 55 %)

## Regeln, wer was bekommt

1. Kostenschätzung: Eigentümer, klares Vorhaben, erreichbar per Mail oder Telefon.
2. Nur Terminmail: Mieter, kein Vorhaben genannt, unter 50 m², oder Anfrage nur „was kostet eine Wärmepumpe".
3. Verwerfen: keine Kontaktdaten, Objekt weiter als 40 km von Wetzlar, reine Preisanfrage ohne Objekt.
