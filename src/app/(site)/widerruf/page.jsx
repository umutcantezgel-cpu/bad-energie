"use client";
import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Printer, Download, FileText } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { Button } from '@/components/ui/button';

export default function Widerruf() {
    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="relative min-h-screen py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="relative">
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-xl rounded-3xl border border-white/30 shadow-[0_8px_32px_rgba(0,0,0,0.1)]" />

                    <div className="relative p-8 md:p-12">
                        {/* Back Link */}
                        <Link href="/agb" className="inline-flex items-center text-gray-500 hover:text-[#1a3a52] mb-6 transition-colors">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Zurück zu den AGB
                        </Link>

                        <div className="flex items-center gap-3 mb-8">
                            <FileText className="w-10 h-10 text-[#1a3a52]" />
                            <div>
                                <h1 className="text-3xl font-bold text-[#1a3a52]">Widerrufsbelehrung &amp; Muster-Widerrufsformular</h1>
                                <p className="text-gray-500 text-sm mt-1">gemäß § 246a Abs. 1 EGBGB</p>
                            </div>
                        </div>

                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 text-sm text-amber-900">
                            <p>
                                <strong>Hinweis:</strong> Wenn Sie den Vertrag widerrufen wollen, dann füllen Sie
                                bitte dieses Formular aus und senden Sie es zurück.
                            </p>
                        </div>

                        {/* Form Content */}
                        <div className="border-2 border-gray-300 rounded-xl p-6 md:p-8 space-y-6 bg-white print:border print:shadow-none">
                            {/* Address */}
                            <div className="border-b pb-4">
                                <p className="font-semibold text-[#1a3a52] mb-2">An:</p>
                                <p className="text-gray-700">
                                    {siteConfig.legalName}<br />
                                    {siteConfig.contact.address.street}<br />
                                    {siteConfig.contact.address.zipCity}<br />
                                    E-Mail: {siteConfig.contact.email}
                                </p>
                            </div>

                            {/* Declaration */}
                            <div className="space-y-4">
                                <div>
                                    <p className="font-semibold text-[#1a3a52] mb-2">
                                        Hiermit widerrufe(n) ich/wir (*) den von mir/uns (*) abgeschlossenen Vertrag
                                        über die Erbringung der folgenden Dienstleistung:
                                    </p>
                                    <div className="border-b-2 border-gray-300 h-12 bg-gray-50 rounded print:bg-white" />
                                </div>

                                <div>
                                    <p className="font-semibold text-[#1a3a52] mb-2">Bestellt am (*) / erhalten am (*):</p>
                                    <div className="border-b-2 border-gray-300 h-12 bg-gray-50 rounded print:bg-white" />
                                </div>

                                <div>
                                    <p className="font-semibold text-[#1a3a52] mb-2">Name des/der Verbraucher(s):</p>
                                    <div className="border-b-2 border-gray-300 h-12 bg-gray-50 rounded print:bg-white" />
                                </div>

                                <div>
                                    <p className="font-semibold text-[#1a3a52] mb-2">Anschrift des/der Verbraucher(s):</p>
                                    <div className="border-b-2 border-gray-300 h-12 bg-gray-50 rounded print:bg-white" />
                                    <div className="border-b-2 border-gray-300 h-12 bg-gray-50 rounded mt-2 print:bg-white" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="font-semibold text-[#1a3a52] mb-2">Datum:</p>
                                        <div className="border-b-2 border-gray-300 h-12 bg-gray-50 rounded print:bg-white" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-[#1a3a52] mb-2">Unterschrift:</p>
                                        <div className="border-b-2 border-gray-300 h-12 bg-gray-50 rounded print:bg-white" />
                                    </div>
                                </div>
                            </div>

                            <p className="text-sm text-gray-500 italic pt-4 border-t">
                                (*) Unzutreffendes streichen.
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="mt-8 flex flex-wrap gap-4 justify-center print:hidden">
                            <Button onClick={handlePrint} className="flex items-center gap-2">
                                <Printer className="w-4 h-4" />
                                Formular drucken
                            </Button>
                            <Link href="/kontakt">
                                <Button variant="outline" className="flex items-center gap-2">
                                    <Download className="w-4 h-4" />
                                    Per E-Mail senden
                                </Button>
                            </Link>
                        </div>

                        {/* Additional Info */}
                        <div className="mt-8 p-4 bg-gray-50 rounded-xl text-sm text-gray-600">
                            <p className="font-semibold text-[#1a3a52] mb-2">Widerrufsfolgen:</p>
                            <p className="mb-2">
                                Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen, die wir von Ihnen
                                erhalten haben, unverzüglich und spätestens binnen vierzehn Tagen ab dem Tag zurückzuzahlen,
                                an dem die Mitteilung über Ihren Widerruf dieses Vertrags bei uns eingegangen ist.
                            </p>
                            <p>
                                Haben Sie verlangt, dass die Dienstleistungen während der Widerrufsfrist beginnen soll,
                                so haben Sie uns einen angemessenen Betrag zu zahlen, der dem Anteil der bis zu dem
                                Zeitpunkt, zu dem Sie uns von der Ausübung des Widerrufsrechts hinsichtlich dieses
                                Vertrags unterrichten, bereits erbrachten Dienstleistungen im Vergleich zum
                                Gesamtumfang der im Vertrag vorgesehenen Dienstleistungen entspricht.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
