// OFFICIAL COMPANY DATA - BAD & ENERGIE GMBH
// Master Data Hub for Wetzlar & Lahn-Dill

import { Award, Users, Target, Heart, Clock, Shield, CheckCircle, Zap, Droplet, Flame, PhoneCall, Sparkles } from 'lucide-react';

export const COMPANY_DATA = {
    // Legal Information (Handelsregister)
    legalName: "Bad & Energie GmbH Lahn-Dill",
    tradeName: "Bad & Energie GmbH Lahn-Dill",
    owner: {
        firstName: "Sabri",
        lastName: "Demir",
        title: "Geschäftsführer",
        fullName: "Sabri Demir"
    },

    // Headquarters & Branch Addresses
    headquarters: {
        street: "Siegmund-Hiepe-Str. 20",
        postalCode: "35578",
        city: "Wetzlar",
        state: "Hessen",
        country: "Deutschland",
        fullAddress: "Siegmund-Hiepe-Str. 20, 35578 Wetzlar, Deutschland",
        phone: "06441-42956",
        phoneLink: "0644142956",
        fax: "06441-48781",
        email: "info@bad-energie.de",
        mapsUrl: "https://maps.app.goo.gl/txCk3uNgQjeTJWux9"
    },

    branchLahnDill: {
        street: "Siegmund-Hiepe-Str. 20",
        postalCode: "35578",
        city: "Wetzlar",
        state: "Hessen",
        country: "Deutschland",
        fullAddress: "Siegmund-Hiepe-Str. 20, 35578 Wetzlar, Deutschland",
        phone: "06441-42956",
        phoneLink: "0644142956",
        fax: "06441-48781",
        email: "info@bad-energie.de"
    },

    // Address & Contact (Backwards compatibility)
    address: {
        street: "Siegmund-Hiepe-Str. 20",
        postalCode: "35578",
        city: "Wetzlar",
        state: "Hessen",
        country: "Deutschland",
        countryCode: "DE",
        fullAddress: "Siegmund-Hiepe-Str. 20, 35578 Wetzlar, Deutschland"
    },

    // Tax & Registration
    tax: {
        ustId: "DE215 933 612", // Umsatzsteuer-Identifikationsnummer
        taxNumber: "FA GI 020 229 01420",
        registerNumber: "HRB 2449",
        court: "Amtsgericht Wetzlar",
        registerStatus: "Eingetragene Gesellschaft mit beschränkter Haftung (HRB 2449 AG Wetzlar)"
    },

    // Authority & Compliance
    authority: {
        name: "Handwerkskammer Wiesbaden",
        shortName: "HWK Wiesbaden",
        type: "Handwerkskammer",
        responsibility: "Meisterbetrieb für Sanitär-, Heizungs- und Klimatechnik",
        certification: "Meisterbetrieb seit 2001 (Tradition seit 1926)"
    },

    // Business Information
    business: {
        industryType: "Sanitär-, Heizungs-, Lüftungs- und Klimatechnik (SHK)",
        businessType: "Meisterbetrieb & NIBE Effizienz Partner",
        primaryServices: [
            "Badsanierung & Bad aus einer Hand",
            "Barrierefreie Badmodernisierung",
            "Wärmepumpen & NIBE Partnertechnik",
            "Gas-Brennwerttechnik & Hybridsysteme",
            "Zentrale & Dezentrale Wohnraumlüftung",
            "Trinkwasserhygiene & Legionellenprüfung",
            "Solarthermie & Photovoltaik",
            "Gewerblicher Objekt- und Anlagenbau"
        ],
        serviceArea: [
            "Wetzlar",
            "Gießen",
            "Lahn-Dill-Kreis",
            "Marburg",
            "Limburg an der Lahn",
            "Bad Nauheim",
            "Friedberg",
            "Butzbach",
            "Herborn",
            "Dillenburg",
            "Haiger",
            "Braunfels",
            "Solms",
            "Lahnau",
            "Aßlar",
            "Hüttenberg",
            "Linden",
            "Pohlheim"
        ],
        establishmentYear: 2001,
        traditionYear: 1926
    },

    // Contact
    contact: {
        phone: "06441-42956",
        phoneSecondary: "06441-42956",
        phoneFormatted: "06441-42956",
        phoneLink: "0644142956",
        phoneSecondaryLink: "0644142956",
        fax: "06441-48781",
        email: "info@bad-energie.de",
        emailSecondary: "info@bad-energie.de",
        website: "https://bad-energie.de",
        emergency: {
            available: true,
            phone: "06441-42956",
            phoneSecondary: "06441-42956",
            note: "Zuverlässiger Notdienst-Service für unsere Bestandskunden"
        }
    },

    // Social Media
    social: {
        instagram: "https://www.instagram.com/badundenergie",
        facebook: ""
    },

    // Business Hours
    hours: {
        monday: { open: "07:00", close: "16:45", type: "normal" },
        tuesday: { open: "07:00", close: "16:45", type: "normal" },
        wednesday: { open: "07:00", close: "16:45", type: "normal" },
        thursday: { open: "07:00", close: "16:45", type: "normal" },
        friday: { open: "07:00", close: "13:30", type: "short" },
        saturday: { open: "00:00", close: "00:00", type: "emergency_only", note: "Notdienst für Bestandskunden" },
        sunday: { open: "00:00", close: "00:00", type: "emergency_only", note: "Notdienst für Bestandskunden" },
        formattedWeekdays: "Mo - Do: 07:00 – 16:45 Uhr",
        formattedFriday: "Fr: 07:00 – 13:30 Uhr"
    },

    // 8-Punkte Qualitätsversprechen
    qualityPromises: [
        {
            title: "Umfassende & individuelle Expertenberatung",
            description: "Persönliche Vor-Ort-Analyse und maßgeschneiderte Konzepte durch unsere Meister und Fachingenieure."
        },
        {
            title: "Kompetente Begleitung bis zur Umsetzung",
            description: "Ihr fester Ansprechpartner begleitet Ihr Vorhaben von der ersten Skizze bis zur schlüsselfertigen Übergabe."
        },
        {
            title: "Technisch fundierte & detaillierte Planung",
            description: "Präzise 3D-Badplanung und exakte wärmetechnische Heizlastberechnungen nach DIN-Normen."
        },
        {
            title: "Transparente Festpreisgarantie",
            description: "Klare, verbindliche Kostenaufstellung ohne versteckte Überraschungen oder Nachforderungen."
        },
        {
            title: "Langjährige Partnerschaft mit Top-Herstellern",
            description: "Zertifizierter NIBE Effizienz Partner sowie enge Kooperation mit VIGOUR, COSMO, Duka und CONEL."
        },
        {
            title: "Ausschließliche Verwendung von Markenprodukten",
            description: "Geprüfte Premium-Komponenten garantieren höchste Langlebigkeit, Ersatzteilsicherheit und Werterhalt."
        },
        {
            title: "Qualifiziertes Fachpersonal",
            description: "Eigenes Team aus ausgebildeten Gesellen, Meistern und Auszubildenden mit regelmäßigen Herstellerschulungen."
        },
        {
            title: "Hohe Termintreue & proaktive Kommunikation",
            description: "Verlässliche Bauzeitpläne, saubere Ausführung mit Staubschutz und transparente Absprachen."
        }
    ]
};

export const values = [
    { icon: Shield, title: "Meisterqualität seit 2001", description: "Verbindung aus fast 100 Jahren Handwerkstradition und neuester Energietechnik." },
    { icon: Clock, title: "Termintreue & Festpreis", description: "Verbindliche Zeitpläne und transparente Kostenkalkulation ohne versteckte Aufschläge." },
    { icon: Heart, title: "Alles aus einer Hand", description: "Komplette Gewerke-Koordination für stressfreie Badsanierung und Heizungserneuerung." },
    { icon: Users, title: "Kundenfokus 5/5", description: "Erstklassige Kundenzufriedenheit und individuelle Betreuung im Lahn-Dill-Kreis." },
    { icon: Target, title: "Zertifizierte Effizienz", description: "Als NIBE Effizienz Partner sichern wir maximale Förderung von bis zu 70 % über die BEG." },
    { icon: Award, title: "Staubarme Sanierung", description: "Modernste Schutzsysteme und saubere Baustellenführung für maximalen Wohnkomfort." }
];

export const historyTimeline = [
    {
        year: "1926",
        title: "Gründung durch Karl Schmidt",
        description: "Gründung des SHK-Handwerksbetriebs in Wetzlar, Hintergasse. Wachstum bis zum 2. Weltkrieg mit bis zu 20 Mitarbeitern."
    },
    {
        year: "1945",
        title: "Übernahme durch Rudolf Schmidt",
        description: "Weiterführung des Betriebs nach dem 2. Weltkrieg. In den 1950ern Kauf und Umzug in die Garbenheimer Str. 4 in Wetzlar."
    },
    {
        year: "2001",
        title: "Umfirmierung in Bad & Energie GmbH",
        description: "Übernahme durch Rudolf Giesbert Diesfeld. Etablierung als führende Größe für Sanitär- und Heiztechnik im Lahn-Dill-Kreis."
    },
    {
        year: "2021 - Heute",
        title: "Zukunft & Leitung durch Sabri Demir",
        description: "Übernahme durch Sabri Demir mit komplettem Team, Kundenstamm und Maschinenpark. Ausbau des Hauptstandorts in der Siegmund-Hiepe-Str. 20 mit starkem Fokus auf erneuerbare Energien und digitale Planung."
    }
];

export const partnerBrands = [
    { name: "NIBE", category: "Wärmepumpen & Effizienztechnik", partnerStatus: "Offizieller NIBE Effizienz Partner" },
    { name: "VIGOUR", category: "Sanitärkeramik & Armaturen", partnerStatus: "Fachpartner (derby, white, one, clivia)" },
    { name: "COSMO", category: "Design-Heizkörper & Fußbodenheizung", partnerStatus: "Fachpartner" },
    { name: "Duka", category: "Echtglas-Duschwände & Walk-In", partnerStatus: "Fachpartner" },
    { name: "CONEL", category: "Installationstechnik & Vorwandelemente", partnerStatus: "Fachpartner VIS" },
    { name: "Buderus / Bosch", category: "Heizsysteme & Brennwerttechnik", partnerStatus: "Fachpartner" },
    { name: "Wolf", category: "Lüftungs- & Heizsysteme", partnerStatus: "Fachpartner" },
    { name: "Kermi", category: "Heizkörper & Duschkabinen", partnerStatus: "Fachpartner" }
];

export const certifications = [
    { name: "Handwerksmeister SHK", issuer: "HWK Wiesbaden", year: "2001" },
    { name: "NIBE Effizienz Partner", issuer: "NIBE Systemtechnik", year: "2024" },
    { name: "Zertifizierter Fachbetrieb für Trinkwasserhygiene", issuer: "DVGW / VDI 6023", year: "2023" },
    { name: "TRF-Fachbetrieb Flüssiggas", issuer: "DVFG", year: "2022" }
];

export const team = [
    { name: "Sabri Demir", role: "Geschäftsführer & Projektleitung", experience: "Meisterbetrieb seit 2001", image: "" },
    { name: "SHK Meisterteam", role: "Bauleitung & 3D-Planung", experience: "Langjährige Fachexpertise", image: "" },
    { name: "Monteurteam", role: "Anlagenmechaniker & Servicetechniker", experience: "Fachhandwerker", image: "" }
];

export const meinTeam = team;

export default COMPANY_DATA;

