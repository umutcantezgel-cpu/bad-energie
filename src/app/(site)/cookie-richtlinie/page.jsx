import React from 'react';
import Link from 'next/link';

export const metadata = {
    title: 'Cookie-Richtlinie (EU) | Bad & Energie GmbH Wetzlar',
    description: 'Informationen über die Verwendung von Cookies und ähnlichen Technologien auf der Website der Bad & Energie GmbH.',
    alternates: { canonical: 'https://bad-energie.de/cookie-richtlinie' }
};

export default function CookieRichtliniePage() {
    return (
        <div className="pt-32 pb-20 bg-slate-50 min-h-screen">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-md border border-slate-200 space-y-8 text-slate-800">
                    <div>
                        <span className="text-xs uppercase font-extrabold tracking-wider text-[#0C3A87]">
                            EU-Richtlinie über den Schutz der Privatsphäre in der elektronischen Kommunikation
                        </span>
                        <h1 className="text-3xl font-black text-slate-900 mt-1">Cookie-Richtlinie (EU)</h1>
                    </div>

                    <div className="space-y-4 text-xs text-slate-600 leading-relaxed border-b border-slate-100 pb-6">
                        <h2 className="text-base font-bold text-slate-900">1. Einführung</h2>
                        <p>
                            Unsere Website, <a href="https://bad-energie.de" className="text-[#0C3A87] underline">https://bad-energie.de</a> (im Folgenden: &bdquo;Die Website&ldquo;), verwendet Cookies und ähnliche Technologien (der Einfachheit halber werden all diese unter &bdquo;Cookies&ldquo; zusammengefasst). Cookies werden außerdem von uns beauftragten Drittparteien platziert.
                        </p>
                    </div>

                    <div className="space-y-4 text-xs text-slate-600 leading-relaxed border-b border-slate-100 pb-6">
                        <h2 className="text-base font-bold text-slate-900">2. Was sind Cookies?</h2>
                        <p>
                            Ein Cookie ist eine kleine, einfache Datei, die mit den Seiten dieser Website gesendet und von Ihrem Browser auf der Festplatte Ihres Computers oder eines anderen Geräts gespeichert wird. Die darin gespeicherten Informationen können bei späteren Besuchen an unsere Server oder die Server der relevanten Drittparteien zurückgesendet werden.
                        </p>
                    </div>

                    <div className="space-y-4 text-xs text-slate-600 leading-relaxed border-b border-slate-100 pb-6">
                        <h2 className="text-base font-bold text-slate-900">3. Cookie-Kategorien</h2>
                        <div className="space-y-3">
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                                <h3 className="font-bold text-slate-900 text-sm mb-1">Technisch notwendig (immer aktiv)</h3>
                                <p>
                                    Diese Einträge sind für den Betrieb der Website erforderlich und setzen keine Einwilligung voraus: Ihre Einwilligungsentscheidung (<span className="font-mono">baris_consent_settings</span>, Speicher des Browsers, ohne Ablaufdatum, jederzeit löschbar), die Zwischenspeicherung Ihrer Konfigurator-Angaben (<span className="font-mono">be-konfigurator</span>, nur bis zum Schließen des Browsers) sowie im internen Bereich unser Sitzungscookie (<span className="font-mono">sitzung</span> beziehungsweise <span className="font-mono">__Host-sitzung</span>, Laufzeit maximal zwölf Stunden).
                                </p>
                            </div>

                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                                <h3 className="font-bold text-slate-900 text-sm mb-1">Statistik und Analyse</h3>
                                <p>
                                    Helfen uns zu verstehen, wie Besucher die Website nutzen. Wird nur nach Ihrer Einwilligung geladen, etwa Google Analytics.
                                </p>
                            </div>

                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                                <h3 className="font-bold text-slate-900 text-sm mb-1">Marketing und Werbung</h3>
                                <p>
                                    Dienen der Messung von Werbekampagnen, etwa der Meta Pixel. Wird nur nach Ihrer Einwilligung geladen.
                                </p>
                            </div>

                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                                <h3 className="font-bold text-slate-900 text-sm mb-1">Kartendienste</h3>
                                <p>
                                    Ermöglichen die Anzeige interaktiver Karten. Dabei werden Daten an den Anbieter übertragen.
                                </p>
                            </div>

                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                                <h3 className="font-bold text-slate-900 text-sm mb-1">Externe Inhalte</h3>
                                <p>
                                    Erlauben das Laden von Inhalten anderer Anbieter, etwa des Terminkalenders von Calendly auf der Seite Beratung. Ohne Ihre Einwilligung sehen Sie dort nur einen Hinweis mit einer Schaltfläche zum Laden.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
                        <h2 className="text-base font-bold text-slate-900">4. Zustimmung verwalten &amp; widerrufen</h2>
                        <p>
                            Wenn Sie unsere Website zum ersten Mal besuchen, zeigen wir Ihnen ein Pop-up mit einer Erklärung zu Cookies an. Sobald Sie auf &bdquo;Auswahl speichern&ldquo; klicken, geben Sie uns Ihr Einverständnis, die von Ihnen gewählten Kategorien von Cookies zu verwenden. Sie können die Verwendung von Cookies jederzeit über Ihren Browser oder unsere Cookie-Einstellungen deaktivieren bzw. widerrufen.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
