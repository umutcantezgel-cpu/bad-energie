// MASTER SERVICES DATA - BAD & ENERGIE GMBH
// Complete service structure across all divisions

export const SERVICES = [
    {
        id: "bad",
        name: "Bad & Wellness",
        shortDescription: "Komplettbäder, Badsanierung Wetzlar & barrierefreie Komfortbäder aus einer Hand",
        icon: "Droplets",
        color: "primary",
        priority: 1,
        link: "/bad",

        subcategories: [
            { id: "badsanierung", name: "Badsanierung Wetzlar", path: "/bad/badsanierung", icon: "bath" },
            { id: "barrierefrei", name: "Barrierefreies Bad", path: "/bad/barrierefreies-bad", icon: "shield" },
            { id: "aus-einer-hand", name: "Bad aus einer Hand", path: "/bad/bad-aus-einer-hand", icon: "sparkles" },
            { id: "musterbaeder", name: "Musterbäder & Kollektionen", path: "/bad/musterbaeder", icon: "layers" },
            { id: "fliesen", name: "Fliesenverlegung", path: "/bad/fliesen", icon: "grid" },
            { id: "budgetkalkulator", name: "Budgetkalkulator", path: "/bad/budgetkalkulator", icon: "calculator" }
        ],

        features: [
            "3D-Badplanung mit fotorealistischer Visualisierung",
            "Festpreisgarantie & verbindlicher Terminplan",
            "Komplette Koordination aller Gewerke (Fliesen, Elektro, Sanitär)",
            "Barrierefreie Umbauten nach DIN 18040-2 mit bis zu 4.000 € Pflegekassen-Zuschuss",
            "Markenpartner: VIGOUR (derby/white/one), Duka, CONEL, COSMO",
            "Staubarme Sanierung durch modernste Schutzsysteme"
        ],

        detailText: "Vom ersten Beratungsgespräch und der 3D-Visualisierung über den behutsamen Rückbau bis hin zur millimetergenauen Installation von Waschtischanlagen, bodengleichen Duschen und edlen Fliesen: Die Bad & Energie GmbH realisiert Ihr Traumbad schlüsselfertig mit Festpreisgarantie.",
        ctaText: "Badprojekt anfragen",
        heroImage: "/images/uploads/01.webp",
        gallery: [
            "/images/uploads/01.webp",
            "/images/uploads/02.webp",
            "/images/uploads/03.webp"
        ]
    },

    {
        id: "heizung",
        name: "Heizung & Wärmepumpen",
        shortDescription: "Zukunftssichere Wärmepumpen (NIBE Partner), Gas-Brennwert, Fußbodenheizung & bis zu 70% Förderung",
        icon: "Flame",
        color: "secondary",
        priority: 2,
        link: "/heizung",

        subcategories: [
            { id: "waermepumpe", name: "Wärmepumpen", path: "/heizung/waermepumpe", icon: "zap" },
            { id: "nibe", name: "NIBE Effizienz Partner", path: "/heizung/nibe-partner", icon: "award" },
            { id: "brennwert", name: "Gas-Brennwerttechnik", path: "/heizung/gas-brennwerttechnik", icon: "flame" },
            { id: "fussbodenheizung", name: "Wand- & Fußbodenheizung", path: "/heizung/wand-und-fussbodenheizung", icon: "sun" },
            { id: "holz", name: "Heizen mit Holz & Pellets", path: "/heizung/heizen-mit-holz", icon: "box" },
            { id: "foerderung", name: "Fördermittelberatung BEG", path: "/foerderung", icon: "badge-percent" },
            { id: "konfigurator", name: "Heizungskonfigurator", path: "/heizung/heizungskonfigurator", icon: "sliders" }
        ],

        features: [
            "Zertifizierter NIBE Effizienz Partner für Spitzen-Wärmepumpentechnik",
            "Luft-Wasser-, Sole-Wasser- (Erdwärme) und Wasser-Wasser-Systeme",
            "Bis zu 70 % staatliche BEG-/KfW-Förderung inklusive Antragsbegleitung",
            "Hocheffiziente Gas-Brennwert- und Hybridsysteme für Bestandsgebäude",
            "Hydraulischer Abgleich nach Verfahren B & Heizungscheck",
            "Moderne Flächenheizungen für maximalen Wärmekomfort"
        ],

        detailText: "Wir machen Ihre Heizung fit für die Zukunft. Als offizieller NIBE Effizienz Partner projektieren und installieren wir Wärmepumpensysteme mit maximaler Jahresarbeitszahl. Wir prüfen Fördermöglichkeiten, berechnen exakte Heizlasten und übernehmen den fachgerechten hydraulischen Abgleich.",
        ctaText: "Heizungsberatung sichern",
        heroImage: "/images/uploads/04.webp",
        gallery: [
            "/images/uploads/04.webp",
            "/images/uploads/05.webp"
        ]
    },

    {
        id: "lueftung",
        name: "Lüftung & Klimatechnik",
        shortDescription: "Kontrollierte Wohnraumlüftung mit Wärmerückgewinnung, Bautenschutz & moderne Klimasysteme",
        icon: "Wind",
        color: "info",
        priority: 3,
        link: "/lueftung",

        subcategories: [
            { id: "zentral", name: "Zentrale Wohnraumlüftung", path: "/lueftung/zentrale-wohnraumlueftung", icon: "fan" },
            { id: "dezentral", name: "Dezentrale Wohnraumlüftung", path: "/lueftung/dezentrale-wohnraumlueftung", icon: "repeat" },
            { id: "klima", name: "Klimaanlagen & Split-Geräte", path: "/lueftung/klimaanlage", icon: "snowflake" }
        ],

        features: [
            "Kontrollierte Be- und Entlüftung mit bis zu 92 % Wärmerückgewinnung",
            "Effektiver Bautenschutz: Zuverlässige Vermeidung von Feuchtigkeit & Schimmel",
            "Pollen- und Feinstaubfilter für Allergiker",
            "Flüsterleise Split-Klimaanlagen mit Wärmepumpenfunktion (Kühlen & Heizen)",
            "Geringer Energieverbrauch durch Inverter-Technologie",
            "Fachgerechte Einregulierung nach DIN 1946-6"
        ],

        detailText: "Frische, gefilterte Luft rund um die Uhr bei geschlossenen Fenstern. Unsere Lüftungslösungen schützen die Bausubstanz Ihres hochisolierten Gebäudes vor Schimmel, senken Lüftungswärmeverluste und sorgen für ein gesundes Wohlfühlklima im Sommer wie im Winter.",
        ctaText: "Lüftungskonzept anfragen",
        heroImage: "/images/uploads/06.webp",
        gallery: [
            "/images/uploads/06.webp"
        ]
    },

    {
        id: "haustechnik",
        name: "Haustechnik & Trinkwasserhygiene",
        shortDescription: "Trinkwasserfilter, Wasserenthärtung, Legionellenprävention nach TrinkwV & Grauwassersysteme",
        icon: "Shield",
        color: "primary",
        priority: 4,
        link: "/haustechnik",

        subcategories: [
            { id: "legionellen", name: "Legionellen & Hygiene", path: "/haustechnik/legionellen", icon: "activity" },
            { id: "filter", name: "Trinkwasserfilter", path: "/haustechnik/trinkwasserfilter", icon: "filter" },
            { id: "entkalkung", name: "Entkalkungsanlagen", path: "/haustechnik/entkalkung", icon: "droplets" },
            { id: "grauwasser", name: "Regen- & Grauwassernutzung", path: "/haustechnik/regen-und-grauwassernutzung", icon: "refresh-cw" },
            { id: "installation", name: "Sanitärinstallation", path: "/haustechnik/sanitaerinstallation", icon: "wrench" }
        ],

        features: [
            "Gesetzliche Legionellenprüfung nach Trinkwasserverordnung für Mehrfamilienhäuser",
            "Thermische Desinfektion (>60 °C) & chemische Spülverfahren",
            "Mechanische Ultrafiltrationsanlagen mit automatischer Sensor-Rückspülung",
            "Moderne Wasserenthärtungsanlagen zum Schutz von Rohrleitungen und Armaturen",
            "Rückspülbare Trinkwasser-Feinfilter gegen Partikeleintrag",
            "Regen- und Grauwassernutzung für nachhaltige Ressourcenschonung"
        ],

        detailText: "Wasser ist unser wichtigstes Lebensmittel. Wir gewährleisten durch modernste Filtertechnik, bedarfsgerechte Enthärtung und präventive Legionellenschutz-Konzepte allerhöchste Trinkwasserhygiene und dauerhaften Werterhalt Ihrer Rohrleitungsinstallationen.",
        ctaText: "Wassercheck anfordern",
        heroImage: "/images/uploads/07.webp",
        gallery: [
            "/images/uploads/07.webp"
        ]
    },

    {
        id: "energie",
        name: "Regenerative Energien & Solar",
        shortDescription: "Photovoltaik, Solarthermie & Speicher – Intelligente Kopplung mit modernen Wärmepumpen",
        icon: "Sun",
        color: "warning",
        priority: 5,
        link: "/energie",

        subcategories: [
            { id: "pv", name: "Photovoltaik & Stromspeicher", path: "/energie/photovoltaik", icon: "zap" },
            { id: "solarthermie", name: "Solarthermie", path: "/energie/solarthermie", icon: "sun" }
        ],

        features: [
            "Synergetische Kopplung von PV und Wärmepumpe für maximalen Eigenverbrauch",
            "Solare Trinkwassererwärmung & solare Heizungsunterstützung",
            "Moderne Hochleistungs-Batteriespeicher mit Notstromoption",
            "Wirtschaftlichkeitsberechnung & Amortisationsanalyse für Hessen",
            "Fachgerechte Dachmontage und netzseitige Inbetriebnahme"
        ],

        detailText: "Nutzen Sie die unerschöpfliche Kraft der Sonne. Wir kombinieren Photovoltaik- und Solarthermieanlagen mit modernen Wärmepumpensystemen zu autarken Energiesystemen, die Ihre Strom- und Heizkosten auf ein Minimum reduzieren.",
        ctaText: "Solarpotenzial prüfen",
        heroImage: "/images/uploads/08.webp",
        gallery: [
            "/images/uploads/08.webp"
        ]
    },

    {
        id: "gewerbe",
        name: "Gewerbekunden & Objektbau",
        shortDescription: "Industrieheizung, gewerbliche Sanitäranlagen, Groß-Wärmepumpen & Generalunternehmer-Koordination",
        icon: "Building",
        color: "secondary",
        priority: 6,
        link: "/gewerbe",

        subcategories: [
            { id: "objektbau", name: "Objekt- & Anlagenbau", path: "/gewerbe/objekt-u-anlagenbau", icon: "building" },
            { id: "sanitaer-gewerbe", name: "Gewerbliche Sanitäranlagen", path: "/gewerbe/sanitaeranlagen", icon: "users" },
            { id: "grossheizanlagen", name: "Großheizanlagen", path: "/gewerbe/grossheizanlagen", icon: "flame" }
        ],

        features: [
            "Erfahrener Partner für Wohnungsbaugesellschaften, Kommunen und Industrie",
            "Schnittstellenkoordination aller TGA-Gewerke",
            "Großkaskaden für Wärmepumpen und Spitzenlast-Brennwerttechnik",
            "Vandalismusgeschützte, barrierefreie Sanitärräume nach Arbeitsstättenrichtlinie",
            "Termin- und Kostentreue bei Großprojekten",
            "Rechtssichere Abnahmen & Revisionsdokumentation"
        ],

        detailText: "Planungssicherheit und Ausführungsqualität für Großprojekte: Bad & Energie GmbH plant, errichtet und wartet komplexe TGA-Anlagen im Industrie-, Gewerbe- und öffentlichen Sektor im gesamten Lahn-Dill-Kreis und Mittelhessen.",
        ctaText: "B2B Projekt anfragen",
        heroImage: "/images/uploads/09.webp",
        gallery: [
            "/images/uploads/09.webp"
        ]
    }
];

export default SERVICES;
