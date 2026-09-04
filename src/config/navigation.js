// NAVIGATION CONFIGURATION - BAD & ENERGIE GMBH
// Hierarchical Mega-Menu and Quick Link Definitions

export const navigationLinks = [
    {
        name: 'Bad & Wellness',
        path: '/bad',
        badge: 'Beliebt',
        description: 'Vom 3D-Traumbad bis zum barrierefreien Komfortbad',
        submenu: [
            {
                category: 'Planung & Anfrage',
                items: [
                    { name: 'Online-Budgetkalkulator Bad', path: '/bad/budgetkalkulator', desc: 'In 2 Minuten Kosten für Ihr Bad berechnen' },
                    { name: 'Multi-Step Badanfrage', path: '/bad/badanfrage', desc: 'Detailliertes Angebot mit Maßen & Fotos anfordern' },
                    { name: '3D-Badplaner Guide', path: '/bad/badplaner', desc: 'Interaktive 3D-Raumgestaltung vor Ort & online' }
                ]
            },
            {
                category: 'Musterbäder & Kollektionen',
                items: [
                    { name: 'Musterbad-Übersicht', path: '/bad/musterbaeder', desc: 'Basic, Premium & Luxus in 4 Raumgrößen' },
                    { name: 'Basic-Bad 8,2 ㎡ (ca. 6.942 €)', path: '/bad/musterbaeder/basic-bad-8_2', desc: 'Mineralguss, VIGOUR & COSMO Design' },
                    { name: 'Komfort-Bad 15,9 ㎡ (ca. 17.231 €)', path: '/bad/musterbaeder/premium-bad-15_9', desc: 'Doppelwaschtisch, Wanne & LED-Brause' }
                ]
            },
            {
                category: 'Leistungen & Gewerke',
                items: [
                    { name: 'Badsanierung Wetzlar', path: '/bad/badsanierung', desc: 'Komplettbad schlüsselfertig aus Meisterhand' },
                    { name: 'Barrierefreies Bad', path: '/bad/barrierefreies-bad', desc: 'DIN 18040-2 & bis zu 4.000 € Pflegekassen-Zuschuss' },
                    { name: 'Bad aus einer Hand', path: '/bad/bad-aus-einer-hand', desc: 'Koordination aller Gewerke mit Festpreisgarantie' },
                    { name: 'Fliesenverlegung', path: '/bad/fliesen', desc: 'Großformatige Fliesen, Naturstein & Mosaik' }
                ]
            }
        ]
    },
    {
        name: 'Heizung & Energie',
        path: '/heizung',
        badge: 'bis 70% Förderung',
        description: 'Zukunftssichere Wärmepumpen, Hybrid & Brennwerttechnik',
        submenu: [
            {
                category: 'Wärmepumpen & Partner',
                items: [
                    { name: 'Wärmepumpen-Zentrum', path: '/heizung/waermepumpe', desc: 'Luft/Wasser, Sole/Wasser & Grundwasser' },
                    { name: 'NIBE Effizienz Partner', path: '/heizung/nibe-partner', desc: 'Zertifizierter Premium-Fachpartner in Wetzlar' },
                    { name: 'Fördermittelberatung BEG', path: '/foerderung', desc: 'Bis zu 70 % staatlicher Zuschuss über KfW/BAFA' },
                    { name: 'Heizungskonfigurator', path: '/heizung/heizungskonfigurator', desc: 'Passende Heizlösung online ermitteln' }
                ]
            },
            {
                category: 'Heizsysteme & Modernisierung',
                items: [
                    { name: 'Gas-Brennwerttechnik', path: '/heizung/gas-brennwerttechnik', desc: 'Hocheffiziente Brennwert- und Hybridsysteme' },
                    { name: 'Wand- & Fußbodenheizung', path: '/heizung/wand-und-fussbodenheizung', desc: 'Behagliche Strahlungswärme für Wärmepumpen' },
                    { name: 'Heizen mit Holz & Pellets', path: '/heizung/heizen-mit-holz', desc: 'CO2-neutrale Biomasseheizungen' },
                    { name: 'Öl- & Gasheizung', path: '/heizung/oel-gasheizung', desc: 'Moderne Brennwertkessel & Austausch' },
                    { name: 'Heizkörper & Designradiatoren', path: '/heizung/heizkoerper', desc: 'COSMO & Kermi Niedertemperaturkörper' }
                ]
            },
            {
                category: 'Service, Check & Miete',
                items: [
                    { name: 'Heizungscheck & Hydraulischer Abgleich', path: '/heizung/heizungscheck', desc: 'Effizienzprüfung & Fördervoraussetzung' },
                    { name: 'Kundendienst & Wartungsverträge', path: '/heizung/kundendienst-wartung', desc: 'Werterhalt, Sicherheit & 24/7 Notfallservice' },
                    { name: 'Wärme mieten (Contracting)', path: '/heizung/waerme-mieten', desc: 'Moderne Heizung ohne hohe Anschaffungskosten' },
                    { name: 'Brennstoffzelle & BHKW', path: '/heizung/brennstoffzelle', desc: 'Gleichzeitige Erzeugung von Strom & Wärme' }
                ]
            }
        ]
    },
    {
        name: 'Lüftung & Klima',
        path: '/lueftung',
        description: 'Gesundes Raumklima, Schimmelschutz & Klimatisierung',
        submenu: [
            {
                category: 'Wohnraumlüftung',
                items: [
                    { name: 'Lüftungstechnik Übersicht', path: '/lueftung', desc: 'Bautenschutz & Energieeinsparung' },
                    { name: 'Zentrale Wohnraumlüftung', path: '/lueftung/zentrale-wohnraumlueftung', desc: 'Bis zu 92 % Wärmerückgewinnung im Neubau' },
                    { name: 'Dezentrale Wohnraumlüftung', path: '/lueftung/dezentrale-wohnraumlueftung', desc: 'Optimale Nachrüstung ohne Rohrkanäle' }
                ]
            },
            {
                category: 'Klimatisierung',
                items: [
                    { name: 'Klimaanlagen & Split-Geräte', path: '/lueftung/klimaanlage', desc: 'Effizientes Kühlen und Heizen im Sommer & Winter' }
                ]
            }
        ]
    },
    {
        name: 'Haustechnik & Hygiene',
        path: '/haustechnik',
        description: 'Wasseraufbereitung, Legionellenprävention & PV',
        submenu: [
            {
                category: 'Trinkwasser & Hygiene',
                items: [
                    { name: 'Haustechnik Übersicht', path: '/haustechnik', desc: 'Moderne Leitungsnetze & Haustechnik' },
                    { name: 'Trinkwasserhygiene & Legionellen', path: '/haustechnik/legionellen', desc: 'Gesetzliche Prüfpflicht, thermische/mechanische Desinfektion' },
                    { name: 'Trinkwasserfilter', path: '/haustechnik/trinkwasserfilter', desc: 'Schutz vor Schmutzpartikeln & Korrosion' },
                    { name: 'Entkalkungsanlagen', path: '/haustechnik/entkalkung', desc: 'Weiches Wasser schützt Armaturen & Rohrleitungen' }
                ]
            },
            {
                category: 'Solar & Ökologie',
                items: [
                    { name: 'Photovoltaik & Stromspeicher', path: '/energie/photovoltaik', desc: 'Solarstrom für Wärmepumpe & Haushalt' },
                    { name: 'Solarthermie', path: '/energie/solarthermie', desc: 'Kostenlose Sonnenwärme für Warmwasser & Heizung' },
                    { name: 'Regen- & Grauwassernutzung', path: '/haustechnik/regen-und-grauwassernutzung', desc: 'Trinkwassereinsparung für Garten & WC' }
                ]
            }
        ]
    },
    {
        name: 'Gewerbe',
        path: '/gewerbe',
        description: 'Objekt- und Anlagenbau für Unternehmen & Kommunen',
        submenu: [
            {
                category: 'B2B & Großobjekte',
                items: [
                    { name: 'Gewerbekunden Übersicht', path: '/gewerbe', desc: 'Zuverlässiger Partner für Industrie & Wohnungsbau' },
                    { name: 'Objekt- & Anlagenbau', path: '/gewerbe/objekt-u-anlagenbau', desc: 'Schnittstellenkoordination & Generalunternehmer' },
                    { name: 'Gewerbliche Sanitäranlagen', path: '/gewerbe/sanitaeranlagen', desc: 'Vandalensichere, barrierefreie & hygienische Anlagen' },
                    { name: 'Großheizanlagen & Regenerativ', path: '/gewerbe/grossheizanlagen', desc: 'Kaskaden-Wärmepumpen & Industriebrennwert' }
                ]
            }
        ]
    },
    {
        name: 'Über uns',
        path: '/unternehmen',
        submenu: [
            {
                category: 'Unser Betrieb',
                items: [
                    { name: 'Unternehmen & Historie', path: '/unternehmen', desc: 'Tradition seit 1926 & Meisterbetrieb seit 2001' },
                    { name: 'Unser Team', path: '/team', desc: 'Sabri Demir & qualifizierte Handwerksmeister' },
                    { name: 'Partner & Hersteller', path: '/partner', desc: 'NIBE, VIGOUR, COSMO, Duka, CONEL, Buderus' },
                    { name: 'Karriere & Jobs', path: '/karriere', desc: 'Werden Sie Teil unseres Meisterteams' },
                    { name: 'Ausbildung bei uns', path: '/karriere/ausbildung', desc: 'Anlagenmechaniker SHK mit Zukunft' },
                    { name: 'Downloads & Broschüren', path: '/downloads', desc: 'Leitfäden, Förderübersichten & Zertifikate' }
                ]
            },
            {
                category: 'Virtuelle Showrooms',
                items: [
                    { name: 'Virtuelle Ausstellung Wetzlar', path: '/ausstellung/wetzlar', desc: 'Digitaler 360°-Rundgang durch Bäderwelten' },
                    { name: 'Virtuelle Ausstellung Gießen', path: '/ausstellung/giessen', desc: 'Inspiration für Bad & innovative Haustechnik' }
                ]
            }
        ]
    },
    {
        name: 'Referenzen',
        path: '/referenzen',
        description: 'Echte Kundenprojekte aus Wetzlar, Gießen & Lahn-Dill'
    },
    {
        name: 'Kontakt',
        path: '/kontakt'
    }
];

export const quickLinks = [
    { name: 'Notdienst für Bestandskunden', path: '/notdienst' },
    { name: 'Online-Terminvereinbarung', path: '/termin' },
    { name: 'BEG & KfW Fördermittelberatung', path: '/foerderung' },
    { name: 'Budgetkalkulator Bad', path: '/bad/budgetkalkulator' },
    { name: 'Heizungskonfigurator', path: '/heizung/heizungskonfigurator' },
    { name: 'Musterbad-Katalog', path: '/bad/musterbaeder' },
    { name: 'Impressum', path: '/impressum' },
    { name: 'Datenschutzerklärung', path: '/datenschutz' },
    { name: 'Cookie-Richtlinie (EU)', path: '/cookie-richtlinie' },
    { name: 'Barrierefreiheitserklärung', path: '/barrierefreiheit' }
];

export const footerServiceLinks = [
    { name: 'Badsanierung Wetzlar', path: '/bad/badsanierung' },
    { name: 'Barrierefreies Bad nach DIN 18040-2', path: '/bad/barrierefreies-bad' },
    { name: 'Wärmepumpen & NIBE Partner', path: '/heizung/waermepumpe' },
    { name: 'Gas-Brennwert & Hybridsysteme', path: '/heizung/gas-brennwerttechnik' },
    { name: 'Zentrale Wohnraumlüftung', path: '/lueftung/zentrale-wohnraumlueftung' },
    { name: 'Trinkwasserfilter & Entkalkung', path: '/haustechnik/entkalkung' },
    { name: 'Legionellenprüfung & Desinfektion', path: '/haustechnik/legionellen' },
    { name: 'Photovoltaik & Solarthermie', path: '/energie/photovoltaik' },
    { name: 'Gewerblicher Objekt- & Anlagenbau', path: '/gewerbe' },
    { name: 'Heizungscheck & Wartungsservice', path: '/heizung/kundendienst-wartung' }
];
