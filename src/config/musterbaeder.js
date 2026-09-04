// MUSTERBÄDER & BADINSPIRATION DATA
// Exact specifications, dimensions, equipment lists and prices from Bad & Energie GmbH
// Complete 12-variant catalogue across 4 room sizes (4.6, 7.0, 8.2, 15.9 m²) and 3 tiers (Basic, Premium, Luxus)

export const MUSTERBAEDER = [
    // -------------------------------------------------------------
    // BASIC LINE (Solide Markenqualität & Einstiegspreise)
    // -------------------------------------------------------------
    {
        id: "basic-4-6",
        slug: "basic-bad-4_6",
        size: "4,6 ㎡",
        sqm: 4.6,
        tier: "Basic",
        title: "Basic-Bad 4,6 ㎡",
        headline: "Kompakter Komfort mit durchdachter Raumausnutzung",
        priceFormatted: "ca. 5.854,00 €",
        priceNumber: 5854,
        vatNote: "inkl. gesetzl. MwSt.",
        image: "/images/uploads/03.webp",
        highlights: [
            "COSMO Classic Design-Badheizkörper (177 x 60 cm)",
            "VIGOUR derby style Waschtisch mit 4-seitig hinterleuchtetem LED-Lichtspiegel (4.000 K)",
            "VIGOUR clivia Stahl-Duschwanne (90 x 90 cm) mit Novellini Young 2.0 Eckeinstieg",
            "VIGOUR clivia Wand-Tiefspül-WC mit PflegePLUS & CONEL VIS Vorwandelement",
            "Hochwertiges VIGOUR derby style Chrom-Accessoires-Set"
        ],
        components: [
            {
                category: "Dusch-Anlage",
                items: [
                    "VIGOUR clivia Stahl-Duschwanne, 90 x 90 x 3,2 cm, mit Wannenträger, weiß inkl. TRINNITY Ablaufgarnitur mit Sifon und Farbset",
                    "Novellini Young 2.0 EHF, 2 Eckeinstiegshälften 87–89 x 200 cm, ESG aqua, chrom",
                    "Hansapolo Einhand-Aufputz-Brausearmatur mit Thermo Cool, verchromt inkl. VIGOUR individual 3.0 Brausegarnitur mit Stange 90 cm, Schlauch und Handbrause 3-fach verstellbar"
                ],
                price: "ca. 2.705,00 €"
            },
            {
                category: "Waschtisch-Anlage",
                items: [
                    "VIGOUR derby style Waschtisch, 65 x 48 cm, weiß mit PflegePLUS-Beschichtung und Halbsäule weiß sowie TRINNITY Waschtisch-Röhrensiphon und Eckventil",
                    "Hansapolo Einhand-Waschtischarmatur mit Ablaufgarnitur, verchromt",
                    "VIGOUR derby LED-Lichtspiegel, 65 x 80 cm, 4-seitig umlaufende Beleuchtung 3 cm und hinterleuchtet, 4.000 Kelvin"
                ],
                price: "ca. 1.138,00 €"
            },
            {
                category: "WC-Anlage",
                items: [
                    "VIGOUR clivia Wand-Tiefspül-WC, weiß mit PflegePLUS-Beschichtung und WC-Sitz mit Deckel und Absenkautomatik inkl. Schallschutzset",
                    "CONEL WC-Element VIS mit UP-Spülkasten, 112 cm und VIGOUR Betätigungsplatte seidenmatt für 2-Mengen-Spültechnik"
                ],
                price: "ca. 873,00 €"
            },
            {
                category: "Badheizkörper",
                items: [
                    "COSMO Classic Bad- und Designheizkörper, 177 x 60 cm, RAL 9016"
                ],
                price: "ca. 751,00 €"
            },
            {
                category: "Accessoires",
                items: [
                    "VIGOUR derby style Bürstengarnitur mit Papierhalter mit Deckel, verchromt",
                    "VIGOUR derby style Handtuchhalter 45 cm, starr und Flüssigseifenspender mit Glas, verchromt"
                ],
                price: "ca. 387,00 €"
            }
        ]
    },
    {
        id: "basic-7-0",
        slug: "basic-bad-7",
        size: "7,0 ㎡",
        sqm: 7.0,
        tier: "Basic",
        title: "Basic-Bad 7,0 ㎡",
        headline: "Familienfreundliche Vollausstattung mit Badewanne & Dusche",
        priceFormatted: "ca. 7.025,00 €",
        priceNumber: 7025,
        vatNote: "inkl. gesetzl. MwSt.",
        image: "/images/uploads/04.webp",
        highlights: [
            "VIGOUR one Stahl-Körperform-Badewanne (170 x 75 cm)",
            "VIGOUR derby Stahl-Duschwanne (120 x 90 cm) mit VIGOUR individual 2.0 Glaswand",
            "VIGOUR one Waschtisch-Set mit Spiegelschrank & Unterschrank in Hochglanz",
            "VIGOUR derby Wand-Tiefspül-WC ohne Spülrand mit PflegePLUS",
            "COSMO Astro Design-Badheizkörper (140 x 60 cm)"
        ],
        components: [
            {
                category: "Badewannen-Anlage",
                items: [
                    "VIGOUR one Stahl-Körperform-Badewanne, 170 x 75 cm, weiß, inkl. Wannenträger sowie Ab- und Überlaufgarnitur",
                    "VIGOUR derby Einhand-Aufputz-Badearmatur und Wannenset mit Wandhalter, Brauseschlauch und 1-facher Handbrause, verchromt"
                ],
                price: "ca. 830,00 €"
            },
            {
                category: "Dusch-Anlage",
                items: [
                    "VIGOUR derby Stahl-Duschwanne, 120 x 90 x 3,5 cm, Ablauf mittig kurz, weiß inkl. Wannenträger und TRINNITY Ablaufgarnitur",
                    "VIGOUR derby Aufputz-Brause-Thermostat Safe-Tee inkl. Brausegarnitur mit Stange 90 cm, Schlauch und 3-facher Handbrause, verchromt",
                    "VIGOUR individual 2.0 Seitenwand 2-teilig in 90 x 195 cm und Pendeltür mit Festfeld links, silber matt, ESG transparent mit PflegePLUS"
                ],
                price: "ca. 3.123,00 €"
            },
            {
                category: "Waschtisch-Anlage",
                items: [
                    "VIGOUR one Set inkl. Spiegelschrank, Mineralguss-Waschtisch in Alpinweiß mit Waschtischunterschrank 82 x 51,5 cm in Weiß Hochglanz und Eckventil",
                    "VIGOUR derby Einhand-Waschtischarmatur mit Ablaufgarnitur, verchromt und Raumspar-Möbel-Siphon"
                ],
                price: "ca. 1.529,00 €"
            },
            {
                category: "WC-Anlage",
                items: [
                    "VIGOUR derby Wand-Tiefspül-WC ohne Spülrand, weiß mit PflegePLUS, abnehmbarer WC-Sitz mit Absenkautomatik und Edelstahlscharnieren sowie Schallschutzset",
                    "CONEL VIS WC-Element für Trockenbau mit UP-Spülkasten 112 cm und VIGOUR DON Betätigungsplatte seidenmatt für 2-Mengen-Spülung"
                ],
                price: "ca. 969,00 €"
            },
            {
                category: "Badheizkörper",
                items: [
                    "COSMO Astro Design-Badheizkörper, 140 x 60 cm, RAL 9016"
                ],
                price: "ca. 574,00 €"
            }
        ]
    },
    {
        id: "basic-8-2",
        slug: "basic-bad-8_2",
        size: "8,2 ㎡",
        sqm: 8.2,
        tier: "Basic",
        title: "Basic-Bad 8,2 ㎡",
        headline: "Funktionaler Komfort mit zeitlosem Design",
        priceFormatted: "ca. 6.942,00 €",
        priceNumber: 6942,
        vatNote: "inkl. gesetzl. MwSt.",
        image: "/images/uploads/01.webp",
        highlights: [
            "Mineralguss-Waschtisch in Alpinweiß mit Spiegelschrank",
            "2 VIGOUR one Hochschränke in Anthrazit Hochglanz",
            "Begehbare Duschzone mit Duka ESG-Glasseitenwand (120 x 200 cm)",
            "VIGOUR clivia Wand-Tiefspül-WC ohne Spülrand",
            "COSMO Design-Badheizkörper"
        ],
        components: [
            {
                category: "Dusch-Anlage",
                items: [
                    "VIGOUR derby Stahl-Duschwanne, 120 x 90 x 3,5 cm, weiß, mit Ablaufgarnitur und verchromtem Farbset",
                    "VIGOUR derby Renovierungsset mit Aufputz-Brausethermostat und Brausegarnitur, 3-fach verstellbar, 90 cm",
                    "Duka Seitenwand, 120 x 200 cm, silber Hochglanz, ESG transparent"
                ],
                price: "ca. 2.458,00 €"
            },
            {
                category: "Waschtisch-Anlage",
                items: [
                    "VIGOUR one Set bestehend aus Spiegelschrank, Mineralguss-Waschtisch in Alpinweiß und Waschtischunterschrank 82 x 51,5 cm in Anthrazit Hochglanz mit Siphon Dallmer und Eckventil",
                    "VIGOUR derby Einhand-Waschtischarmatur mit Ablaufgarnitur, verchromt",
                    "2 VIGOUR one Hochschränke in Anthrazit Hochglanz, 30 x 32 x 160 cm"
                ],
                price: "ca. 2.329,00 €"
            },
            {
                category: "WC-Anlage",
                items: [
                    "VIGOUR clivia Wand-Tiefspül-WC ohne Spülrand, weiß, mit clivia lux WC-Sitz und Deckel (Edelstahl-Scharniere, Schallschutzset)",
                    "CONEL VIS WC-Element mit UP-Spülkasten, Bauhöhe 112 cm",
                    "VIGOUR AI Betätigungsplatte für 2-Mengen-Spülung (Glas weiß / Kunststoff weiß)"
                ],
                price: "ca. 1.261,00 €"
            },
            {
                category: "Badheizkörper",
                items: [
                    "COSMO Bad- und Designheizkörper in RAL9016, 176,4 x 60 cm"
                ],
                price: "ca. 201,00 €"
            },
            {
                category: "Accessoires",
                items: [
                    "VIGOUR derby Bürstengarnitur, Papierhalter und Flüssigseifenspender mit Glas, verchromt"
                ],
                price: "ca. 693,00 €"
            }
        ]
    },
    {
        id: "basic-15-9",
        slug: "basic-bad-15_9",
        size: "15,9 ㎡",
        sqm: 15.9,
        tier: "Basic",
        title: "Basic-Bad 15,9 ㎡",
        headline: "Großzügiges Raumbad mit separatem WC & breitem Möbelwaschtisch",
        priceFormatted: "ca. 12.034,00 €",
        priceNumber: 12034,
        vatNote: "inkl. gesetzl. MwSt.",
        image: "/images/uploads/05.webp",
        highlights: [
            "VIGOUR clivia Stahl-Mittelablaufbadewanne (180 x 80 cm) mit GESSI MANZONI Armatur",
            "VIGOUR derby Mineralguss-Duschwanne mit Antirutsch (120 x 100 cm) & Duka Gallery Schwenktür",
            "Heibad Agus Möbelset 140 cm in Metallic-Braun mit Großspiegel",
            "VIGOUR derby Wand-Tiefspül-WC rund ohne Spülrand mit CONEL VIS Modul",
            "VIGOUR derby Badheizkörper (180 x 60 cm)"
        ],
        components: [
            {
                category: "Badewannen-Anlage",
                items: [
                    "VIGOUR clivia Stahl-Mittelablaufbadewanne, 180 x 80 cm, weiß mit Wannenträger sowie VIGOUR Ab-/Überlaufgarnitur und Farbset verchromt",
                    "GESSI MANZONI Aufputz-Wannen-Einhandarmatur mit Umsteller in chrom",
                    "GESSI EMPORIO Wand-Brausehalter, Antikalk-Handbrause und Design-Brauseschlauch"
                ],
                price: "ca. 1.930,00 €"
            },
            {
                category: "Dusch-Anlage",
                items: [
                    "VIGOUR derby Mineralguss-Duschwanne mit Antirutsch, 120 x 100 x 3,2 cm, weiß mit TRINNITY Farbset und Ablauf",
                    "Duka Gallery Schwenktür für Nische rechts, 100 x 195 cm in chrom/Alu Hochglanz ESG transparent",
                    "GESSI Manzoni Aufputz-Brause-Einhandarmatur und Brausestangen-Set 60 cm in chrom"
                ],
                price: "ca. 2.732,00 €"
            },
            {
                category: "Waschtisch-Anlage",
                items: [
                    "Heibad Agus Möbelset aus Waschtisch und Waschtischunterschrank in Metallic braun, 140 cm, mit Röhrensiphon und Eckventil",
                    "GESSI MANZONI Waschtisch-Einhandarmatur mit Ablaufgarnitur in chrom",
                    "Heibad Agus Wandspiegel, 140 x 72,5 cm, passend in Metallic braun"
                ],
                price: "ca. 5.076,00 €"
            },
            {
                category: "WC-Anlage",
                items: [
                    "VIGOUR derby Wand-Tiefspül-WC rund ohne Spülrand mit verdeckter Befestigung, weiß mit PflegePLUS, Softclose-Sitz und Schallschutzset",
                    "CONEL VIS WC-Element mit UP-Spülkasten 112 cm und VIGOUR AI Betätigungsplatte seidenmatt"
                ],
                price: "ca. 1.038,00 €"
            },
            {
                category: "Badheizkörper",
                items: [
                    "VIGOUR derby Badheizkörper, 180 x 60 cm, in weiß RAL 9016"
                ],
                price: "ca. 688,00 €"
            },
            {
                category: "Accessoires",
                items: [
                    "GESSI EMPORIO Wand-Papierrollenhalter, Stand-Seifenspender aus satiniertem Glas und WC-Bürstengarnitur in chrom"
                ],
                price: "ca. 570,00 €"
            }
        ]
    },

    // -------------------------------------------------------------
    // PREMIUM LINE (Gehobener Komfort & Edle Materialien)
    // -------------------------------------------------------------
    {
        id: "premium-4-6",
        slug: "premium-bad-4_6",
        size: "4,6 ㎡",
        sqm: 4.6,
        tier: "Premium",
        title: "Komfort-Bad 4,6 ㎡",
        headline: "Barrierefreier Luxus und Edelstahl-Akzente auf kompaktem Raum",
        priceFormatted: "ca. 10.009,00 €",
        priceNumber: 10009,
        vatNote: "inkl. gesetzl. MwSt.",
        image: "/images/uploads/03.webp",
        highlights: [
            "Barrierefreies 5-Eck Duschelement 90 cm mit VIGOUR individual 5.0 Glasabtrennung",
            "VIGOUR derby Asymmetrischer Waschtisch (100 cm) mit Gessi Flessa 316 Edelstahlarmatur",
            "4-seitig hinterleuchteter LED-Lichtspiegel (100 x 80 cm)",
            "CONEL VIS Wand-WC-Eck-Element mit VIGOUR derby Kompakt-WC",
            "COSMO Wien Design-Badheizkörper (175,4 x 50 cm)"
        ],
        components: [
            {
                category: "Dusch-Anlage",
                items: [
                    "Duschelement 90 cm 5-Eck, rollstuhlbefahrbar, Ablauf waagerecht",
                    "VIGOUR derby Duschsystem mit Thermostat Safe-Tee, Handbrause 3-fach und Schlauch, verchromt",
                    "VIGOUR individual 5.0 Duschabtrennung teilgerahmt Fünfeck, 90 x 200 cm, 2-teilig mit Festfeld, Silber Hochglanz, ESG mit PflegePlusXtra"
                ],
                price: "ca. 2.724,00 €"
            },
            {
                category: "Waschtisch-Anlage",
                items: [
                    "VIGOUR derby Mineralguss-Waschtisch und Waschtischunterschrank 57 x 48 x 100 cm in Weiß Hochglanz mit Eckventil und Siphon",
                    "Gessi Flessa 316 Waschtisch-Einhandarmatur mit Ablaufgarnitur, Edelstahl matt gebürstet",
                    "VIGOUR derby LED-Lichtspiegel, 100 x 80 cm, 4-seitig hinterleuchtet"
                ],
                price: "ca. 3.820,00 €"
            },
            {
                category: "WC-Anlage",
                items: [
                    "VIGOUR derby Wand-Tiefspül-WC kompakt (48 cm), weiß mit PflegePLUS und derby style WC-Sitz mit Absenkautomatik und Edelstahlscharnieren",
                    "CONEL VIS Wand-WC-Eck-Element inkl. Verkleidung und VIGOUR AI Betätigungsplatte weiß"
                ],
                price: "ca. 1.657,00 €"
            },
            {
                category: "Badheizkörper",
                items: [
                    "COSMO Wien Design-Badheizkörper, 175,4 x 50 cm, RAL 9016"
                ],
                price: "ca. 1.532,00 €"
            },
            {
                category: "Accessoires",
                items: [
                    "VIGOUR derby Papierhalter mit Deckel, Bürstengarnitur, Flüssigseifenspender und Glashalter aus Glas/Chrom"
                ],
                price: "ca. 276,00 €"
            }
        ]
    },
    {
        id: "premium-7-0",
        slug: "premium-bad-7",
        size: "7,0 ㎡",
        sqm: 7.0,
        tier: "Premium",
        title: "Premium-Bad 7,0 ㎡",
        headline: "Elegante Balance aus Funktion, Ästhetik und bodengleicher Duschzone",
        priceFormatted: "ca. 11.450,00 €",
        priceNumber: 11450,
        vatNote: "inkl. gesetzl. MwSt.",
        image: "/images/uploads/04.webp",
        highlights: [
            "VIGOUR white Waschtischanlage 100 cm mit Touch-LED-Spiegel",
            "Bodengleiche Walk-In Duschzone mit VIGOUR individual Edelstahlrinne",
            "Duka rahmenlose Festglaswand mit PflegePLUS-Beschichtung",
            "Design-Badheizkörper mit Handtuchwärmefunktion",
            "VIGOUR white randloses Wand-WC mit CONEL VIS UP-Element"
        ],
        components: [
            {
                category: "Dusch-Anlage",
                items: [
                    "Bodengleiche Walk-In Dusche mit VIGOUR individual Designrinne und Duka Festglaswand 100 x 200 cm",
                    "VIGOUR vogue Regendusch-System mit Thermostat und Anti-Kalk-Düsen"
                ],
                price: "ca. 3.650,00 €"
            },
            {
                category: "Möbel & Keramik",
                items: [
                    "VIGOUR white Waschtisch 100 cm mit Softclose-Schubladen und samtweißem Lack",
                    "LED-Lichtspiegel mit Touch-Sensor und Farbtemperaturwechsel (2.700–6.500 K)",
                    "Randloses VIGOUR Design-WC mit CONEL Vorwandmodul"
                ],
                price: "ca. 5.950,00 €"
            },
            {
                category: "Heizung & Details",
                items: [
                    "COSMO Designheizkörper in Anthrazit oder Weiß",
                    "VIGOUR individual Accessoires-Set verchromt"
                ],
                price: "ca. 1.850,00 €"
            }
        ]
    },
    {
        id: "premium-8-2",
        slug: "premium-bad-8_2",
        size: "8,2 ㎡",
        sqm: 8.2,
        tier: "Premium",
        title: "Premium-Bad 8,2 ㎡",
        headline: "Stilvolles Ambiente mit großzügigem Waschtisch & Walk-In Dusche",
        priceFormatted: "ca. 13.800,00 €",
        priceNumber: 13800,
        vatNote: "inkl. gesetzl. MwSt.",
        image: "/images/uploads/01.webp",
        highlights: [
            "VIGOUR white 120 cm Möbelwaschtisch mit samtweißer Front",
            "LED-Lichtspiegel 120 x 75 cm mit Lichtband und Dimmfunktion",
            "Walk-In Dusche mit VIGOUR individual 3.0 Edelstahlrinne und Duka Echtglas",
            "VIGOUR white randloses Wand-WC mit verdeckter Befestigung",
            "COSMO Wien Design-Badheizkörper drehbar"
        ],
        components: [
            {
                category: "Dusch-Anlage",
                items: [
                    "VIGOUR individual 3.0 Edelstahlrinne mit Duka Walk-In Glaswand 120 x 200 cm",
                    "VIGOUR vogue Duschthermostat mit Regenkopfbrause (25 cm) und 2-Strahl-Handbrause"
                ],
                price: "ca. 4.200,00 €"
            },
            {
                category: "Waschtisch-Anlage",
                items: [
                    "VIGOUR white Waschtischanlage 120 cm mit Doppel-Schublade und Mineralguss-Becken",
                    "VIGOUR white Einhand-Waschtischarmatur chrom",
                    "LED-Lichtspiegel 120 cm mit stufenloser Lichtfarbregelung"
                ],
                price: "ca. 5.600,00 €"
            },
            {
                category: "WC-Anlage",
                items: [
                    "VIGOUR white Wand-Tiefspül-WC ohne Spülrand mit Soft-Close Sitz",
                    "CONEL VIS WC-Vorwandmodul 112 cm mit Glas-Betätigungsplatte"
                ],
                price: "ca. 1.650,00 €"
            },
            {
                category: "Heizung & Zubehör",
                items: [
                    "COSMO Wien Designheizkörper drehbar, 175,4 x 60 cm",
                    "VIGOUR white Design-Accessoires-Set"
                ],
                price: "ca. 2.350,00 €"
            }
        ]
    },
    {
        id: "premium-15-9",
        slug: "premium-bad-15_9",
        size: "15,9 ㎡",
        sqm: 15.9,
        tier: "Premium / Komfort",
        title: "Komfort-Bad 15,9 ㎡",
        headline: "Großzügige Wellness-Oase für höchste Komfort- und Designansprüche",
        priceFormatted: "ca. 17.231,00 €",
        priceNumber: 17231,
        vatNote: "inkl. gesetzl. MwSt.",
        image: "/images/uploads/02.webp",
        highlights: [
            "Möbel-Doppelwaschtisch 140 cm mit PflegePlus & LED-Lichtspiegel (2.700–6.500 K)",
            "Große Stahl-Badewanne 190 x 90 cm mit Wasserzulauffunktion",
            "Bodengleiche Walk-In Dusche mit VIGOUR individual 3.0 Rinne (100 cm)",
            "VIGOUR vogue LED-Kopfbrause dropless 30 cm",
            "COSMO Wien Design-Badheizkörper drehbar (175,4 x 75 cm)"
        ],
        components: [
            {
                category: "Badewannen-Anlage",
                items: [
                    "VIGOUR derby Stahl-Badewanne, 190 x 90 cm, Mittelablauf, weiß, mit Wannenträger und Ab-/Überlaufgarnitur mit Wasserzulauf-Funktionseinheit",
                    "VIGOUR white Badearmatur und Unterputzkörper mit Wandanschlussbogen, 1-strahlige Stabhandbrause und Design-Brauseschlauch verchromt"
                ],
                price: "ca. 2.799,00 €"
            },
            {
                category: "Dusch-Anlage",
                items: [
                    "VIGOUR individual 3.0 Designrinne 100 cm, Edelstahl mit Designrost",
                    "VIGOUR vogue Duschsystem Thermostat mit LED-Kopfbrause dropless (30 cm), Design-Brauseschlauch verchromt und VIGOUR individual 4.0 2-strahlige Handbrause (12 cm)",
                    "VIGOUR individual 4.0 Wandbrausehalter eckig, verchromt",
                    "VIGOUR individual 5.0 Pendeltür mit vogue Scharnierdesign für Nische, ESG klar, PflegePLUS chrom inkl. Aufmaß und Montage"
                ],
                price: "ca. 5.117,00 €"
            },
            {
                category: "Waschtisch-Anlage",
                items: [
                    "VIGOUR white Mineralguss Möbel-Doppelwaschtisch, 140 x 49 cm, weiß mit PflegePLUS und Eckventil",
                    "VIGOUR white Waschtischunterschrank-Aufsatz, 56,6 x 50 x 140 cm, samtweiß matt",
                    "VIGOUR white Einhand-Waschtischarmatur mit Ablaufgarnitur, verchromt",
                    "VIGOUR white LED-Lichtspiegel mit Lichtband oben, 140 x 75 cm, Farbwechsel 2700-6500K (kalt/warm)"
                ],
                price: "ca. 5.386,00 €"
            },
            {
                category: "WC-Anlage",
                items: [
                    "VIGOUR white Wand-Tiefspül-WC ohne Spülrand, unsichtbare Befestigung, weiß mit PflegePLUS, WC-Sitz mit Absenkautomatik und Edelstahl-Scharnieren sowie Schallschutzset",
                    "CONEL VIS WC-Element mit UP-Spülkasten, 112 cm",
                    "VIGOUR AI Betätigungsplatte für 2-Mengen-Spülung (Glas weiß / Kunststoff weiß)"
                ],
                price: "ca. 1.512,00 €"
            },
            {
                category: "Badheizkörper",
                items: [
                    "COSMO Wien Design-Badheizkörper drehbar, 175,4 x 75 cm, RAL 9016"
                ],
                price: "ca. 1.668,00 €"
            },
            {
                category: "Accessoires",
                items: [
                    "VIGOUR white Papierhalter ohne Deckel und Wand-Bürstengarnitur, verchromt mit Behälter aus weißer Keramik",
                    "VIGOUR white Handtuchhalter 1-armig starr (48 cm) und Wand-Seifenspender mit weißer Keramik, verchromt"
                ],
                price: "ca. 749,00 €"
            }
        ]
    },

    // -------------------------------------------------------------
    // LUXUS LINE (High-End Spa, Dusch-WC & Maßanfertigungen)
    // -------------------------------------------------------------
    {
        id: "luxus-4-6",
        slug: "luxus-bad-4_6",
        size: "4,6 ㎡",
        sqm: 4.6,
        tier: "Luxus",
        title: "Luxus-Bad 4,6 ㎡",
        headline: "High-End Mini-Spa mit Dusch-WC und dimmbarer Lichtarchitektur",
        priceFormatted: "ca. 14.500,00 €",
        priceNumber: 14500,
        vatNote: "inkl. gesetzl. MwSt.",
        image: "/images/uploads/03.webp",
        highlights: [
            "High-End Dusch-WC mit Gesäßdusche, Geruchsabsaugung und Warmluftföhn",
            "Bodengleiche Walk-In Rainshower mit Decken-LED & rahmenloser Duka Glasfront",
            "Maßgefertigter Mineralwerkstoff-Waschtisch mit Echtholz-Unterschrank",
            "Smarter LED-Lichtspiegel mit Touch-Steuerung und Anti-Beschlag-Heizung",
            "Smarte Fußbodentemperierung und Design-Heizpaneel"
        ],
        components: [
            {
                category: "Dusch-Anlage & Spa",
                items: [
                    "Bodengleiche Walk-In Erlebnisdusche mit integriertem Deckenregenpaneel und Farb-Lichttherapie",
                    "Duka rahmenlose Einscheibensicherheitsglas-Front (100 x 210 cm) mit Spezial-Lotuseffekt",
                    "Unterputz-Thermostatbatterie mit digitaler Temperatureinstellung"
                ],
                price: "ca. 4.800,00 €"
            },
            {
                category: "Waschtisch & Möbel",
                items: [
                    "Maßgefertigter Waschtisch aus edlem Mineralwerkstoff mit Echtholz-Unterbau (Eiche natur oder Räuchereiche)",
                    "Designer-Armatur in Gunmetal oder gebürstetem Messing",
                    "Smart-LED-Spiegel mit integrierter Uhr, Bluetooth-Sound und Heizfolie"
                ],
                price: "ca. 4.900,00 €"
            },
            {
                category: "Dusch-WC der Spitzenklasse",
                items: [
                    "Premium Dusch-WC mit Funkfernbedienung, oszillierender Komfortdusche, Sitzheizung und Selbstreinigung",
                    "CONEL VIS UP-Vorwandelement mit automatischer Geruchsabsaugung und Glas-Betätigungsplatte"
                ],
                price: "ca. 3.200,00 €"
            },
            {
                category: "Heizung & Licht",
                items: [
                    "COSMO Flach-Designheizkörper und elektrische Fußbodentemperierung",
                    "Indirekte LED-Schattenfugenbeleuchtung"
                ],
                price: "ca. 1.600,00 €"
            }
        ]
    },
    {
        id: "luxus-7-0",
        slug: "luxus-bad-7",
        size: "7,0 ㎡",
        sqm: 7.0,
        tier: "Luxus",
        title: "Luxus-Bad 7,0 ㎡",
        headline: "Exklusive Spa-Atmosphäre mit Mineralguss-Wanne & Dusch-WC",
        priceFormatted: "ca. 18.900,00 €",
        priceNumber: 18900,
        vatNote: "inkl. gesetzl. MwSt.",
        image: "/images/uploads/04.webp",
        highlights: [
            "Ergonomische Mineralguss-Badewanne mit Unterputz-Kaskadeneinlauf",
            "Walk-In Regendusche mit VIGOUR individual Deckenpaneel & Duka Glas",
            "Doppelwaschtischanlage 120 cm samtweiß mit ambienter LED-Beleuchtung",
            "Intelligentes Dusch-WC mit Fernbedienung & Nachtlicht",
            "COSMO Design-Wandpaneel mit programmierbarem Raumthermostat"
        ],
        components: [
            {
                category: "Badewannen & Spa",
                items: [
                    "Mineralguss-Designwanne mit samtig-warmer Haptik und Schwallauslauf aus der Wand",
                    "Unterputz-Thermostatarmatur mit Stabhandbrause"
                ],
                price: "ca. 4.600,00 €"
            },
            {
                category: "Dusch-Anlage",
                items: [
                    "VIGOUR individual Walk-In Dusche mit Decken-Regenkopfbrause und Wanneneinstieg bodengleich",
                    "Duka rahmenlose Glasabtrennung 120 x 205 cm"
                ],
                price: "ca. 5.100,00 €"
            },
            {
                category: "Doppelwaschtisch & Möbel",
                items: [
                    "Doppelbecken-Möbelanlage 120 cm mit Softclose-Auszügen und matter Oberfläche",
                    "2 Designer-Waschtischarmaturen Unterputz",
                    "Großflächiger LED-Lichtspiegel mit warm/kalt Dimmung"
                ],
                price: "ca. 4.900,00 €"
            },
            {
                category: "Dusch-WC & Heizung",
                items: [
                    "Komfort-Dusch-WC mit verdeckten Anschlüssen und CONEL VIS Modul",
                    "COSMO Design-Heizwand und Fußboden-Heizsystem"
                ],
                price: "ca. 4.300,00 €"
            }
        ]
    },
    {
        id: "luxus-8-2",
        slug: "luxus-bad-8_2",
        size: "8,2 ㎡",
        sqm: 8.2,
        tier: "Luxus",
        title: "Luxus-Bad 8,2 ㎡",
        headline: "High-End Wellness mit freistehender Wanne & Decken-Regenhimmel",
        priceFormatted: "ca. 21.400,00 €",
        priceNumber: 21400,
        vatNote: "inkl. gesetzl. MwSt.",
        image: "/images/uploads/01.webp",
        highlights: [
            "Freistehende Mineralguss-Badewanne mit Bodenstandarmatur",
            "Großzügige Walk-In Dusche mit VIGOUR individual Decken-Regenhimmel",
            "Designer-Waschtisch 140 cm in Mattlack mit LED-Schattenfuge",
            "Komfort-Dusch-WC mit Warmluftföhn & Selbstreinigung",
            "Design-Badheizkörper mit integriertem Handtuchwärmer"
        ],
        components: [
            {
                category: "Freistehende Wanne",
                items: [
                    "Freistehende Luxus-Badewanne aus mattem Mineralguss mit Bodenstand-Armatur in Mattschwarz oder Chrom"
                ],
                price: "ca. 5.800,00 €"
            },
            {
                category: "Dusch-Anlage",
                items: [
                    "Bodengleiche Walk-In Duschzone mit VIGOUR individual Decken-Regenhimmel (40 x 40 cm)",
                    "Duka 140 cm rahmenlose Echtglaswand mit Lotuseffekt"
                ],
                price: "ca. 6.200,00 €"
            },
            {
                category: "Waschtisch & Möbel",
                items: [
                    "140 cm Designer-Doppelwaschtisch in samtmatten Trendfarben mit Push-to-Open Auszügen",
                    "2 UP-Waschtischmischer und doppelter LED-Lichtspiegel mit Gestensteuerung"
                ],
                price: "ca. 5.400,00 €"
            },
            {
                category: "Dusch-WC & Raumwärme",
                items: [
                    "High-End Dusch-WC mit beheizbarem Sitz, Fernbedienung und Nachtlicht",
                    "COSMO Design-Wandheizkörper & elektronische Fußbodenheizung"
                ],
                price: "ca. 4.000,00 €"
            }
        ]
    },
    {
        id: "luxus-15-9",
        slug: "luxus-bad-15_9",
        size: "15,9 ㎡",
        sqm: 15.9,
        tier: "Luxus",
        title: "Luxus-Bad 15,9 ㎡",
        headline: "Kompromisslose High-End Architektur & Private-Spa Atmosphäre",
        priceFormatted: "ca. 24.800,00 €",
        priceNumber: 24800,
        vatNote: "inkl. gesetzl. MwSt.",
        image: "/images/uploads/05.webp",
        highlights: [
            "Freistehende Mineralguss-Badewanne mit Bodenstandarmatur",
            "Großformatige Walk-In Erlebnisdusche mit Decken-Regenpaneel & Farb-LED",
            "Möbel-Doppelwaschtisch in Echtholz-/Mattlack-Ausführung mit Doppel-LED-Spiegel",
            "Dusch-WC der Spitzenklasse mit Gesäßdusche, Geruchsabsaugung & Föhn",
            "Individuelle Lichtzonen und Smart-Home Steuerung"
        ],
        components: [
            {
                category: "Spa & Badewanne",
                items: [
                    "Freistehende Luxus-Badewanne in mattem Mineralwerkstoff mit Bodenstand-Armatur"
                ],
                price: "ca. 6.200,00 €"
            },
            {
                category: "Erlebnis-Dusche",
                items: [
                    "Walk-In Duschanlage mit VIGOUR individual Decken-Regenbrause und elektronischer Thermostatsteuerung",
                    "Duka rahmenlose Echtglas-Architektur 140 x 210 cm"
                ],
                price: "ca. 7.900,00 €"
            },
            {
                category: "Doppelwaschtisch & Dusch-WC",
                items: [
                    "Maßgefertigter Doppelwaschtisch mit samtig-matter Oberfläche",
                    "Intelligentes Dusch-WC mit Fernbedienung und Selbstreinigungsfunktion"
                ],
                price: "ca. 8.400,00 €"
            },
            {
                category: "Heizung & Licht",
                items: [
                    "COSMO Design-Wandheizkörper & Fußboden-Temperierung",
                    "Integrierte LED-Schattenfugen-Beleuchtung"
                ],
                price: "ca. 2.300,00 €"
            }
        ]
    }
];

export const ROOM_SIZES = [
    { label: "4,6 ㎡ (Kompaktbad / Gäste-WC)", value: "4.6", sqm: 4.6 },
    { label: "7,0 ㎡ (Standard-Familienbad)", value: "7.0", sqm: 7.0 },
    { label: "8,2 ㎡ (Komfort-Badezimmer)", value: "8.2", sqm: 8.2 },
    { label: "15,9 ㎡ (Großzügiges Spa-Bad)", value: "15.9", sqm: 15.9 }
];

export const QUALITY_TIERS = [
    {
        name: "Basic",
        subtitle: "Solide Markenqualität zu fairen Einstiegspreisen",
        priceRange: "4.500 € – 8.000 €",
        description: "Hochwertige Sanitärausstattung mit VIGOUR derby/clivia, CONEL und COSMO Komponenten. Robust, pflegeleicht und langlebig."
    },
    {
        name: "Premium",
        subtitle: "Gehobener Komfort mit edlen Oberflächen",
        priceRange: "9.000 € – 18.000 €",
        description: "Bodengleiche Walk-In Duschen, VIGOUR white Design-Waschtische, Duka Echtglaswände und drehbare Designheizkörper."
    },
    {
        name: "Luxus",
        subtitle: "High-End Spa & Maßanfertigungen ohne Kompromisse",
        priceRange: "ab 20.000 €",
        description: "Freistehende Wannen, Dusch-WCs mit Komfortfunktionen, VIGOUR individual Deckenpaneele und smarte LED-Lichtarchitektur."
    }
];

export default MUSTERBAEDER;

