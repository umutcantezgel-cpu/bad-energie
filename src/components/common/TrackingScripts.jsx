"use client";
import React, { useEffect } from 'react';
import Script from 'next/script';
import { useConsentGate } from '@/components/common/ConsentProvider';

/**
 * Lädt Analyse- und Marketing-Skripte ausschließlich nach Einwilligung.
 * Ohne konfigurierte Kennungen passiert nichts.
 */
const TrackingScripts = () => {
    const analyseErlaubt = useConsentGate('analytics');
    const marketingErlaubt = useConsentGate('marketing');

    const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID || '';
    const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || '';

    useEffect(() => {
        if (!marketingErlaubt || !META_PIXEL_ID || typeof window === 'undefined') return;
        if (window.fbq) return;
        /* eslint-disable */
        !function (f, b, e, v, n, t, s) {
            if (f.fbq) return; n = f.fbq = function () {
                n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments)
            };
            if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0';
            n.queue = []; t = b.createElement(e); t.async = !0;
            t.src = v; s = b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t, s)
        }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
        /* eslint-enable */
        window.fbq('init', META_PIXEL_ID);
        window.fbq('track', 'PageView');
    }, [marketingErlaubt, META_PIXEL_ID]);

    if (!analyseErlaubt || !GA4_ID) return null;

    return (
        <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`} strategy="lazyOnload" />
            <Script id="ga4-init" strategy="lazyOnload">
                {`
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());
                    gtag('config', '${GA4_ID}', { page_path: window.location.pathname });
                `}
            </Script>
        </>
    );
};

export default TrackingScripts;
