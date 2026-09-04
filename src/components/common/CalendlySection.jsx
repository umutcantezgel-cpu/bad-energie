"use client";
import React, { useEffect, useState } from 'react';
import { Calendar, Lock } from 'lucide-react';
import { useConsentGate } from '@/components/common/ConsentProvider';
import { getStoredConsent, saveConsent, NUR_ESSENZIELL } from '@/components/common/consent-store';

const CALENDLY_URL = 'https://calendly.com/batherm-info/30min?hide_event_type_details=1';

/**
 * Terminbuchung über Calendly. Der Anbieter wird erst nach ausdrücklicher
 * Einwilligung geladen, weil dabei Daten an Calendly übertragen werden.
 */
const CalendlySection = () => {
    const erlaubt = useConsentGate('externalContent');
    const [geladen, setGeladen] = useState(false);

    useEffect(() => {
        if (!erlaubt) return undefined;
        const script = document.createElement('script');
        script.src = 'https://assets.calendly.com/assets/external/widget.js';
        script.async = true;
        script.onload = () => setGeladen(true);
        document.body.appendChild(script);
        return () => {
            if (document.body.contains(script)) document.body.removeChild(script);
        };
    }, [erlaubt]);

    const laden = () => {
        const bisher = getStoredConsent() ?? NUR_ESSENZIELL;
        saveConsent({ ...bisher, externalContent: true });
    };

    return (
        <section id="booking" className="py-20 bg-slate-50">
            <div className="max-w-4xl mx-auto px-4 text-center">
                <div className="inline-flex items-center justify-center p-4 bg-[#E4040E]/10 rounded-full mb-6">
                    <Calendar className="w-7 h-7 text-[#E4040E]" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                    Beratungstermin buchen
                </h2>
                <p className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                    Wählen Sie ganz bequem online einen freien Termin für Ihre kostenlose Erstberatung.
                    Wir nehmen uns Zeit für Ihr Anliegen.
                </p>

                {erlaubt ? (
                    <div
                        className="calendly-inline-widget w-full h-[700px] bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden"
                        data-url={CALENDLY_URL}
                        style={{ minWidth: '320px' }}
                        aria-busy={!geladen}
                    />
                ) : (
                    <div className="w-full rounded-3xl border border-slate-200 bg-white p-8 sm:p-12 shadow-lg text-left">
                        <div className="flex items-start gap-4">
                            <span className="mt-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                                <Lock className="h-5 w-5" aria-hidden="true" />
                            </span>
                            <div className="space-y-3">
                                <h3 className="text-base font-bold text-slate-900">Terminkalender von Calendly</h3>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    Der Kalender wird von Calendly bereitgestellt. Beim Laden werden Ihre IP-Adresse und
                                    Angaben zu Ihrem Gerät an Calendly übertragen. Wir laden ihn deshalb erst, wenn Sie
                                    zustimmen. Ihre Einwilligung können Sie jederzeit widerrufen.
                                </p>
                                <div className="flex flex-wrap gap-3 pt-1">
                                    <button
                                        type="button"
                                        onClick={laden}
                                        className="rounded-full bg-[#0C3A87] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#0E1C76] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0C3A87] focus-visible:ring-offset-2"
                                    >
                                        Kalender laden
                                    </button>
                                    <a
                                        href="/kontakt"
                                        className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50"
                                    >
                                        Lieber anrufen
                                    </a>
                                </div>
                                <p className="text-xs text-slate-500">
                                    Mehr dazu in unserer{' '}
                                    <a href="/datenschutz" className="text-[#0C3A87] underline">Datenschutzerklärung</a>.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

export default CalendlySection;
