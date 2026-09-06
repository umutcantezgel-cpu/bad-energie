// seo.config.js - Bad & Energie GmbH

export const SEO_CONFIG = {
    // Global SEO
    global: {
        siteName: "Bad & Energie GmbH",
        author: "Sabri Demir",
        language: "de",
        locale: "de_DE",
        charset: "UTF-8"
    },

    // Target Keywords (Lokale Suchintentionen)
    keywords: {
        primary: [
            "Badsanierung Wetzlar",
            "Wärmepumpen Wetzlar",
            "NIBE Effizienz Partner Wetzlar",
            "Barrierefreies Bad Wetzlar",
            "Heizungsbau Lahn-Dill"
        ],
        secondary: [
            "Wohnraumlüftung Wetzlar",
            "Trinkwasserhygiene Legionellen Wetzlar",
            "Gas-Brennwerttechnik Wetzlar",
            "Photovoltaik Wärmepumpe",
            "Bad aus einer Hand Wetzlar"
        ],
        long_tail: [
            "Badsanierung Wetzlar Kosten Festpreis",
            "KfW Förderung Heizungstausch bis 70 Prozent",
            "Pflegekassenzuschuss barrierefreies Bad Wetzlar"
        ]
    },

    // Pages SEO Configuration
    pages: {
        home: {
            title: "Bad & Energie GmbH - Meisterbetrieb für Badsanierung & Heiztechnik Wetzlar",
            description: "Ihr Meisterbetrieb für schlüsselfertige Badsanierung, NIBE Wärmepumpen, Gas-Brennwert, Wohnraumlüftung und Trinkwasserhygiene in Wetzlar & Lahn-Dill.",
            keywords: ["Badsanierung", "Wärmepumpe", "Heizung", "Wetzlar", "NIBE Partner"],
            canonical: "https://bad-energie.de/",
            ogImage: "/images/og/home.jpg",
            ogDescription: "Ihr Fachbetrieb für Badsanierung, Wärmepumpen und Haustechnik in Wetzlar"
        },

        services: {
            title: "Unsere Leistungen | Bad & Energie GmbH Wetzlar",
            description: "Badsanierung, innovative Heiztechnik, Wohnraumlüftung, Trinkwasserhygiene und regenerative Energien. Beratung mit Festpreisgarantie.",
            keywords: ["Badsanierung", "Heizungstausch", "Wohnraumlüftung", "Wetzlar"],
            canonical: "https://bad-energie.de/leistungen",
            ogImage: "/images/og/services.jpg"
        },

        portfolio: {
            title: "Referenzen & Kundenprojekte | Bad & Energie GmbH Wetzlar",
            description: "Entdecken Sie über 1.000 erfolgreich realisierte Komplettbäder, Wärmepumpenanlagen und Haustechnikprojekte.",
            keywords: ["Projekte", "Referenzen", "Musterbäder", "Wetzlar"],
            canonical: "https://bad-energie.de/referenzen"
        },

        contact: {
            title: "Kontakt & Standorte | Bad & Energie GmbH Wetzlar",
            description: "Siegmund-Hiepe-Str. 20 in 35578 Wetzlar. Telefon 06441-42956. Schnelle Terminvergabe.",
            keywords: ["Kontakt", "Standort Wetzlar", "Beratungstermin", "Bad & Energie"],
            canonical: "https://bad-energie.de/kontakt"
        }
    },

    // Schema Markup Definition Helper
    getOrganizationSchema: () => ({
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "name": "Bad & Energie GmbH Lahn-Dill",
        "description": "Meisterbetrieb für Badsanierung, NIBE Wärmepumpen, Wohnraumlüftung und Trinkwasserhygiene in Wetzlar",
        "image": "https://bad-energie.de/logo.png",
        "url": "https://bad-energie.de",
        "address": {
            "@type": "PostalAddress",
            "streetAddress": "Siegmund-Hiepe-Str. 20",
            "addressLocality": "Wetzlar",
            "postalCode": "35578",
            "addressCountry": "DE"
        },
        "telephone": "+49 6441 42956",
        "email": "info@bad-energie.de",
        "areaServed": ["Wetzlar", "Gießen", "Lahn-Dill-Kreis"],
        "priceRange": "€€€",
        "sameAs": [],
        "openingHours": [
            "Mo-Do 07:00-16:45",
            "Fr 07:00-13:30"
        ]
    })
};

export default SEO_CONFIG;
