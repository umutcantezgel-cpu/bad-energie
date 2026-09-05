// NAVIGATION CONFIGURATION - BAD & ENERGIE GMBH
// Hierarchical Mega-Menu and Quick Link Definitions (TypeScript)

export interface NavigationSubItem {
    name: string;
    path: string;
    desc?: string;
    badge?: string;
}

export interface NavigationCategory {
    category: string;
    items: NavigationSubItem[];
}

export interface NavigationHighlight {
    title: string;
    description: string;
    path: string;
    ctaText: string;
    badge?: string;
    tag?: string;
}

export interface NavigationLink {
    name: string;
    path: string;
    overviewLabel?: string;
    badge?: string;
    description?: string;
    submenu?: NavigationCategory[];
    highlight?: NavigationHighlight;
}

export const navigationLinks: NavigationLink[] = [
    {
        name: 'Bad & Wellness',
        path: '/bad',
        overviewLabel: 'Alle Leistungen in Bad & Wellness ansehen',
        badge: 'Beliebt',
        description: 'Vom 3D-Traumbad bis zum barrierefreien Komfortbad aus Meisterhand',
        submenu: [
            {
                category: 'Planung & Kalkulation',
                items: [
                    { name: 'Online-Budgetkalkulator Bad', path: '/bad/budgetkalkulator', desc: 'In 2 Minuten Richtpreis für Ihr Bad berechnen' },
                    { name: 'Multi-Step Badanfrage', path: '/bad/badanfrage', desc: 'Detailliertes Angebot mit Maßen & Fotos anfordern' },
                    { name: '3D-Badplaner Guide', path: '/bad/badplaner', desc: 'Interaktive Raumgestaltung vor Ort & digital' }
                ]
            },
            {
                category: 'Sanierung & Gewerke',
                items: [
                    { name: 'Badsanierung Wetzlar', path: '/bad/badsanierung', desc: 'Komplettbad schlüsselfertig aus Meisterhand' },
                    { name: 'Barrierefreies Bad', path: '/bad/barrierefreies-bad', desc: 'DIN 18040-2 & bis zu 4.000 € Pflegekassen-Zuschuss' },
                    { name: 'Bad aus einer Hand', path: '/bad/bad-aus-einer-hand', desc: 'Koordination aller Gewerke mit Festpreisgarantie' },
                    { name: 'Fliesenverlegung & Naturstein', path: '/bad/fliesen', desc: 'Großformatige Fliesen, Naturstein & Mosaik' }
                ]
            }
        ],
        highlight: {
            title: 'Musterbäder & Kollektionen',
            description: 'Entdecken Sie Basic, Premium & Luxus in 4 realen Raumgrößen mit individueller Planung auf Anfrage.',
            path: '/bad/musterbaeder',
            ctaText: 'Musterbäder ansehen',
            badge: 'Ausstellung'
        }
    },
    {
        name: 'Heizung & Energie',
        path: '/heizung',
        overviewLabel: 'Alle Leistungen in Heizung & Energie ansehen',
        badge: 'bis 70% Förderung',
        description: 'Zukunftssichere Wärmepumpen, Hybrid & moderne Brennwerttechnik',
        submenu: [
            {
                category: 'Wärmepumpen & Partner',
                items: [
                    { name: 'Wärmepumpen-Zentrum', path: '/heizung/waermepumpe', desc: 'Luft/Wasser, Sole/Wasser & Erdreich-Systeme' },
                    { name: 'NIBE Effizienz Partner', path: '/heizung/nibe-partner', desc: 'Zertifizierter Premium-Fachpartner in Wetzlar' },
                    { name: 'Heizungskonfigurator', path: '/heizung/heizungskonfigurator', desc: 'Passende Heizlösung online ermitteln' },
                    { name: 'Heizungscheck & Abgleich', path: '/heizung/heizungscheck', desc: 'Effizienzprüfung & Fördervoraussetzung' }
                ]
            },
            {
                category: 'Heizsysteme & Service',
                items: [
                    { name: 'Gas-Brennwert & Hybrid', path: '/heizung/gas-brennwerttechnik', desc: 'Hocheffiziente Brennwert- und Hybridsysteme' },
                    { name: 'Wand- & Fußbodenheizung', path: '/heizung/wand-und-fussbodenheizung', desc: 'Niedertemperatur-Strahlungswärme' },
                    { name: 'Kundendienst & Wartungsverträge', path: '/heizung/kundendienst-wartung', desc: 'Werterhalt, Sicherheit & 24/7 Notdienst' },
                    { name: 'Wärme mieten (Contracting)', path: '/heizung/waerme-mieten', desc: 'Moderne Heizung ohne Anschaffungskosten' }
                ]
            }
        ],
        highlight: {
            title: 'KfW-Förderung 2026',
            description: 'Sichern Sie sich bis zu 70 % staatlichen Zuschuss für den Heizungstausch. Wir beraten Sie herstellerunabhängig.',
            path: '/foerderung',
            ctaText: 'Fördermittel-Check starten',
            badge: 'BEG Zuschuss'
        }
    },
    {
        name: 'Haustechnik & Klima',
        path: '/haustechnik',
        overviewLabel: 'Alle Leistungen in Haustechnik & Klima ansehen',
        description: 'Wohnraumlüftung, Klimatechnik, Trinkwasserhygiene & Photovoltaik',
        submenu: [
            {
                category: 'Wohnraumlüftung & Klima',
                items: [
                    { name: 'Lüftungstechnik Übersicht', path: '/lueftung', desc: 'Gesundes Raumklima & Bautenschutz' },
                    { name: 'Zentrale Wohnraumlüftung', path: '/lueftung/zentrale-wohnraumlueftung', desc: 'Bis zu 92 % Wärmerückgewinnung im Neubau' },
                    { name: 'Dezentrale Wohnraumlüftung', path: '/lueftung/dezentrale-wohnraumlueftung', desc: 'Optimale Nachrüstung ohne Rohre' },
                    { name: 'Klimaanlagen & Split-Geräte', path: '/lueftung/klimaanlage', desc: 'Effizientes Kühlen und Heizen' }
                ]
            },
            {
                category: 'Trinkwasser & Solarenergie',
                items: [
                    { name: 'Haustechnik Übersicht', path: '/haustechnik', desc: 'Moderne Leitungsnetze & Installation' },
                    { name: 'Trinkwasserhygiene & Legionellen', path: '/haustechnik/legionellen', desc: 'Gesetzliche Prüfpflicht & Desinfektion' },
                    { name: 'Entkalkung & Wasserfilter', path: '/haustechnik/entkalkung', desc: 'Weiches Wasser schützt Rohre & Armaturen' },
                    { name: 'Photovoltaik & Solarthermie', path: '/energie/photovoltaik', desc: 'Solarstrom für Wärmepumpe & Haushalt' }
                ]
            }
        ]
    },
    {
        name: 'Gewerbe',
        path: '/gewerbe',
        overviewLabel: 'Alle Leistungen für Gewerbe & Großanlagen ansehen',
        description: 'Objekt- und Anlagenbau für Unternehmen, Bauträger & Kommunen',
        submenu: [
            {
                category: 'B2B & Großobjekte',
                items: [
                    { name: 'Gewerbekunden Übersicht', path: '/gewerbe', desc: 'Zuverlässiger Meisterpartner für Gewerbe & Industrie' },
                    { name: 'Objekt- & Anlagenbau', path: '/gewerbe/objekt-u-anlagenbau', desc: 'Schnittstellenkoordination & Generalunternehmer' },
                    { name: 'Gewerbliche Sanitäranlagen', path: '/gewerbe/sanitaeranlagen', desc: 'Vandalensichere & barrierefreie Anlagen' },
                    { name: 'Großheizanlagen & Kaskaden', path: '/gewerbe/grossheizanlagen', desc: 'Kaskaden-Wärmepumpen & Industriebrennwert' }
                ]
            }
        ]
    },
    {
        name: 'Über uns',
        path: '/unternehmen',
        overviewLabel: 'Mehr über unser Unternehmen & Team erfahren',
        description: 'Meisterbetrieb seit 2001, Handwerkstradition seit 1926 & Ausstellungen',
        submenu: [
            {
                category: 'Meisterbetrieb & Team',
                items: [
                    { name: 'Unternehmen & Historie', path: '/unternehmen', desc: 'Tradition seit 1926 & Meisterbetrieb seit 2001' },
                    { name: 'Unser Team & Meister', path: '/team', desc: 'Sabri Demir & qualifizierte Handwerksmeister' },
                    { name: 'Partner & Hersteller', path: '/partner', desc: 'NIBE, VIGOUR, COSMO, Duka, CONEL, Buderus' },
                    { name: 'Karriere & Ausbildung', path: '/karriere', desc: 'Werden Sie Teil unseres Meisterteams' }
                ]
            },
            {
                category: 'Erleben & Service',
                items: [
                    { name: 'Referenzen & Kundenprojekte', path: '/referenzen', desc: 'Echte Arbeiten in Wetzlar, Gießen & Lahn-Dill' },
                    { name: 'Virtuelle Ausstellung Wetzlar', path: '/ausstellung/wetzlar', desc: 'Digitaler 360°-Rundgang durch Bäderwelten' },
                    { name: 'Virtuelle Ausstellung Gießen', path: '/ausstellung/giessen', desc: 'Inspiration für Bad & innovative Haustechnik' },
                    { name: 'Kontakt & Anfahrt', path: '/kontakt', desc: 'Showroom Hans-Sachs-Str. 12, Wetzlar' }
                ]
            }
        ]
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
