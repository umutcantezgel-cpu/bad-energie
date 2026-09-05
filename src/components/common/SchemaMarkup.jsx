"use client";
import React from 'react';
import { siteConfig } from '@/config/site';

const SchemaMarkup = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://batherm.de';

    // LocalBusiness Schema
    const localBusinessSchema = {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "name": siteConfig.name, // "Bariş Haustechnik"
        "image": `${origin}/images/og-image.jpg`, // Adjust path if needed
        "description": siteConfig.description,
        "url": origin,
        "telephone": siteConfig.contact.phone,
        "email": siteConfig.contact.email,
        "address": {
            "@type": "PostalAddress",
            "streetAddress": siteConfig.contact.address.street,
            "addressLocality": siteConfig.contact.address.city, // Assuming zipCity string needs parsing or is fine as is? siteConfig usually has separated fields or we parse it.
            // Let's assume zipCity is like "35586 Wetzlar". 
            "postalCode": siteConfig.contact.address.postalCode || "35586", // Fallback if not separate
            "addressCountry": "DE"
        },
        "geo": {
            "@type": "GeoCoordinates",
            "latitude": "50.5518", // Wetzlar approx
            "longitude": "8.4893"
        },
        "openingHoursSpecification": [
            {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                "opens": siteConfig.contact.hours?.weekdays?.split('-')[0]?.trim() || "07:00",
                "closes": siteConfig.contact.hours?.weekdays?.split('-')[1]?.trim() || "17:00"
            }
        ],
        "priceRange": "€€",
        "areaServed": siteConfig.serviceAreas?.map(area => ({
            "@type": "City",
            "name": area
        }))
    };

    // Organization Schema (often good to have as well)
    const organizationSchema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": siteConfig.legalName || siteConfig.name,
        "url": origin,
        "logo": `${origin}/images/logo.png`,
        "contactPoint": {
            "@type": "ContactPoint",
            "telephone": siteConfig.contact.phone,
            "contactType": "customer service"
        }
    };

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
        </>
    );
};

export default SchemaMarkup;
