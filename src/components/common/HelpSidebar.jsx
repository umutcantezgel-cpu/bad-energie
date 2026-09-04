"use client";
import React, { useState, useEffect } from 'react';
import {
  X,
  Search,
  Phone,
  Mail,
  MessageCircle,
  AlertCircle,
  FileText,
  CheckSquare,
  ChevronRight,
  Clock,
  Send,
  ShieldCheck,
  MapPin
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { COMPANY_DATA } from '@/config/company';

export default function HelpSidebar({ isOpen, onClose }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [phone, setPhone] = useState('');
  const [currentView, setCurrentView] = useState('main'); // main, emergency, guides, checklists

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setCurrentView('main');
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        if (currentView !== 'main') {
          setCurrentView('main');
        } else {
          onClose();
        }
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose, currentView]);

  const quickHelpCards = [
    {
      id: 'emergency',
      icon: AlertCircle,
      title: 'Erste Hilfe & Notfall-Leitfaden',
      description: 'Sofortmaßnahmen bei Rohrbruch, Heizungsausfall & Gasgeruch',
      iconColor: 'bg-[#E4040E]'
    },
    {
      id: 'guides',
      icon: FileText,
      title: 'Selbsthilfe & Anleitungen',
      description: 'Heizkörper entlüften, Wasserdruck nachfüllen & Co.',
      iconColor: 'bg-[#0C3A87]'
    },
    {
      id: 'checklists',
      icon: CheckSquare,
      title: 'Meister-Checklisten',
      description: 'Badsanierung, Heizungs-Wintercheck & Energiespartipps',
      iconColor: 'bg-emerald-600'
    }
  ];

  const detailedContent = {
    emergency: {
      title: 'Notfall-Sofortmaßnahmen',
      items: [
        {
          title: 'Wasserrohrbruch',
          content: '1. Hauptwasserhahn sofort zudrehen (meist im Keller oder Hausanschlussraum).\n2. Strom im betroffenen Bereich am Sicherungskasten abschalten.\n3. Wertgegenstände sichern & Wasser aufwischen.\n4. Bad & Energie Meister anrufen: 06441 20 39 053'
        },
        {
          title: 'Heizungsausfall im Winter',
          content: '1. Prüfen Sie den Heizungs-Notschalter.\n2. Prüfen Sie den Wasserdruck am Manometer (Soll: 1,5 – 2,0 bar).\n3. Prüfen Sie die Gas- bzw. Brennstoffzufuhr.\n4. Notieren Sie ggf. den Fehlercode im Display und rufen Sie uns an.'
        },
        {
          title: 'Gasgeruch',
          content: '1. KEINE Lichtschalter oder elektrischen Geräte betätigen, kein offenes Feuer!\n2. Fenster und Türen sofort weit öffnen.\n3. Gashahn am Zähler schließen.\n4. Gebäude verlassen und von außen Notruf 112 sowie den Gasversorger verständigen.'
        }
      ]
    },
    guides: {
      title: 'Selbsthilfe-Anleitungen',
      items: [
        {
          title: 'Heizkörper richtig entlüften',
          content: '1. Umwälzpumpe der Heizung ausschalten (falls zugänglich).\n2. Thermostatventile voll auf Stufe 5 öffnen.\n3. Entlüftungsschlüssel ansetzen, Schale bereithalten und Ventil vorsichtig öffnen, bis kontinuierlich Wasser austritt.\n4. Ventil handfest schließen und Anlagendruck prüfen.'
        },
        {
          title: 'Heizungswasserdruck nachfüllen',
          content: '1. Füllschlauch vor dem Anschließen vollständig mit Wasser befüllen (Lufteintrag vermeiden).\n2. Beide Hähne langsam öffnen.\n3. Druckmanometer bis zur grünen Markierung (ca. 1,5–1,8 bar) füllen.\n4. Hähne fest schließen und Schlauch entfernen.'
        }
      ]
    },
    checklists: {
      title: 'Meister-Checklisten',
      items: [
        {
          title: 'Heizung Winter-Fit Check',
          content: '• Wasserdruck am Kessel prüfen\n• Alle Heizkörper entlüften\n• Thermostatventile auf Leichtgängigkeit testen\n• Jährliche Meisterwartung buchen'
        },
        {
          title: 'Badsanierung Vorbereitung',
          content: '• Raumgrundriss & Anschlüsse grob ausmessen\n• Wünsche festhalten: Walk-In Dusche, Badewanne, WC-Typ\n• Budgetrahmen festlegen\n• Kostenlosen 3D-Beratungstermin in Wetzlar buchen'
        }
      ]
    }
  };

  const handleCallbackRequest = (e) => {
    e.preventDefault();
    alert(`Vielen Dank! Wir rufen Sie unter ${phone} schnellstmöglich zurück.`);
    setPhone('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-300">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="absolute top-0 right-0 h-full w-full max-w-md bg-white/95 backdrop-blur-2xl shadow-2xl p-6 overflow-y-auto flex flex-col justify-between border-l border-white/50">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-[#0C3A87]">Meister-Support</span>
              <h2 className="text-xl font-black text-slate-900">Hilfe &amp; Schnellkontakt</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              aria-label="Hilfe-Sidebar schließen"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {currentView === 'main' ? (
            <div className="space-y-6">
              {/* Quick Help Cards */}
              <div className="space-y-3">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider">Schnelle Themen</h3>
                {quickHelpCards.map((card) => {
                  const Icon = card.icon;
                  return (
                    <button
                      key={card.id}
                      onClick={() => setCurrentView(card.id)}
                      className="w-full text-left p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-[#0C3A87] transition-all flex items-center gap-3.5 group"
                    >
                      <div className={`w-10 h-10 rounded-xl ${card.iconColor} text-white flex items-center justify-center shrink-0 shadow-xs`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-black text-xs sm:text-sm text-slate-900 group-hover:text-[#0C3A87] transition-colors">{card.title}</h4>
                        <p className="text-[11px] text-slate-500 line-clamp-1">{card.description}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                    </button>
                  );
                })}
              </div>

              {/* Direct Call & Emergency */}
              <div className="p-5 rounded-2xl bg-blue-50/80 border border-blue-200/60 space-y-3">
                <span className="text-xs font-black text-[#0C3A87] flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" />
                  Direkter Meister-Draht Wetzlar
                </span>
                <p className="text-xs text-slate-600 font-medium">
                  Rufen Sie uns direkt im Showroom Hans-Sachs-Str. 12 oder der Betriebsstätte Siegmund-Hiepe-Str. 20 an:
                </p>
                <div className="space-y-2 pt-1">
                  <a
                    href={`tel:${COMPANY_DATA.headquarters.phoneLink}`}
                    className="block p-3 rounded-xl bg-white text-[#0C3A87] font-black text-xs border border-blue-200 shadow-xs text-center hover:bg-blue-50 transition-colors"
                  >
                    Hauptsitz: {COMPANY_DATA.headquarters.phone}
                  </a>
                  <a
                    href={`tel:${COMPANY_DATA.branchLahnDill.phoneLink}`}
                    className="block p-3 rounded-xl bg-white text-[#0C3A87] font-black text-xs border border-blue-200 shadow-xs text-center hover:bg-blue-50 transition-colors"
                  >
                    Betriebsstätte: {COMPANY_DATA.branchLahnDill.phone}
                  </a>
                </div>
              </div>

              {/* Callback Request */}
              <form onSubmit={handleCallbackRequest} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <span className="text-xs font-black text-slate-900">Rückruf anfordern</span>
                <p className="text-[11px] text-slate-500">Wir rufen Sie werktags innerhalb von 2 Stunden zurück.</p>
                <input
                  type="tel"
                  required
                  placeholder="Ihre Telefonnummer"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-[#0C3A87]"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl bg-[#0C3A87] hover:bg-[#0E1C76] text-white font-black text-xs shadow-xs transition-colors"
                >
                  Rückruf anfragen &rarr;
                </button>
              </form>
            </div>
          ) : (
            /* Sub-View Details */
            <div className="space-y-4">
              <button
                onClick={() => setCurrentView('main')}
                className="text-xs font-black text-[#0C3A87] flex items-center gap-1 hover:underline"
              >
                &larr; Zurück zur Übersicht
              </button>
              <h3 className="text-lg font-black text-slate-900">{detailedContent[currentView]?.title}</h3>

              <div className="space-y-3">
                {detailedContent[currentView]?.items.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <h4 className="font-black text-xs text-slate-900">{item.title}</h4>
                    <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed font-medium">
                      {item.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-200 text-center text-[10px] text-slate-400 font-medium">
          Bad &amp; Energie GmbH &middot; Meisterbetrieb Wetzlar
        </div>
      </div>
    </div>
  );
}
