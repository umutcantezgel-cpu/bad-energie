import type { Metadata } from 'next';
import { createMetadata } from '@/lib/metadata';
import { buildGraph, buildFaqNode, buildBreadcrumbNode, SITE_URL } from '@/lib/schema';
import JsonLd from '@/components/seo/JsonLd';

export const metadata: Metadata = createMetadata({
  title: 'Häufig gestellte Fragen (FAQ)',
  description: 'Antworten auf häufige Fragen zu Badsanierung, NIBE Wärmepumpen, KfW-Förderung und Heizungswartung bei Bad & Energie GmbH in Wetzlar & Lahn-Dill.',
  path: '/faq',
});

const faqItems = [
  {
    question: 'Wie oft sollte meine Heizung gewartet werden?',
    answer: 'Wir empfehlen eine jährliche Wartung, idealerweise vor Beginn der Heizperiode (September/Oktober). Dies sichert maximale Energieeffizienz und verlängert die Lebensdauer Ihrer Anlage.',
  },
  {
    question: 'Wann lohnt sich der Umstieg auf eine Wärmepumpe?',
    answer: 'Bei Öl- oder Gasheizungen älter als 15 Jahre oder hohen Betriebskosten ist der Wechsel auf eine NIBE Luft-Wasser- oder Sole-Wasser-Wärmepumpe mit bis zu 70% KfW 458 Förderung hochattraktiv.',
  },
  {
    question: 'Was kostet eine Wärmepumpe nach Förderung?',
    answer: 'Durch die staatliche BEG-Förderung (Grundförderung 30% + Geschwindigkeitsbonus 20% + Einkommensbonus 30% + 5% Effizienzbonus für natürliches Kältemittel R290) reduziert sich der Eigenanteil auf einen Bruchteil der Bruttokosten.',
  },
  {
    question: 'Was kostet eine Komplettbadsanierung aus einer Hand?',
    answer: 'Die Kosten richten sich nach Raumgröße, Zustand der Leitungen und Ihren individuellen Ausstattungswünschen. Wir erstellen Ihnen nach einem kostenlosen Vor-Ort-Aufmaß gerne ein verbindliches Festpreisangebot auf Anfrage.',
  },
  {
    question: 'Gibt es Zuschüsse für barrierefreie Bäder?',
    answer: 'Ja! Bei Vorliegen eines Pflegegrads (Pflegegrad 1–5) bezuschusst die Pflegekasse den altersgerechten Badumbau mit bis zu 4.000 € pro Person.',
  },
];

export default function FaqLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pageUrl = `${SITE_URL}/faq`;
  const breadcrumbs = [
    { name: 'Home', path: '/' },
    { name: 'FAQ', path: '/faq' },
  ];

  const schemaGraph = buildGraph([
    buildFaqNode(faqItems, pageUrl),
    buildBreadcrumbNode(breadcrumbs, pageUrl),
  ]);

  return (
    <>
      <JsonLd schema={schemaGraph} />
      {children}
    </>
  );
}
