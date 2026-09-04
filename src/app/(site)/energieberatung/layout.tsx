import { createMetadata } from '@/lib/metadata';
import { buildGraph, buildServiceNode, buildFaqNode, buildBreadcrumbNode, buildWebPageNode, SITE_URL } from '@/lib/schema';
import JsonLd from '@/components/seo/JsonLd';

export const metadata = createMetadata({
  title: 'Energieberatung für Sanierung & Effizienz',
  description: 'Professionelle Energieberatung in Wetzlar. Individueller Sanierungsfahrplan, Energieausweis und Fördermittelberatung vom Meister.',
  path: '/energieberatung',
});

const pageUrl = `${SITE_URL}/energieberatung`;
const breadcrumbs = [
  { name: 'Home', path: '/' },
  { name: 'Energieberatung', path: '/energieberatung' },
];

const energieFaqs = [
  {
    question: 'Ist eine Wärmepumpe auch im Altbau ohne Fußbodenheizung wirtschaftlich?',
    answer:
      'Ja, moderne Luft-Wasser-Wärmepumpen erreichen auch bei Vorlauftemperaturen von bis zu 55 °C sehr gute Effizienzwerte (JAZ > 3,5). Durch den gezielten Austausch einzelner Heizkörper gegen Niedertemperatur-Heizkörper lässt sich der Wirkungsgrad weiter deutlich steigern.',
  },
  {
    question: 'Was bringt ein hydraulischer Abgleich konkret?',
    answer:
      'Durch einen hydraulischen Abgleich wird jeder Heizkörper genau mit der Wassermenge versorgt, die er für die gewünschte Raumtemperatur benötigt. Das verhindert überhitzte oder unterversorgte Räume, senkt den Brennstoffverbrauch um bis zu 15% und ist Voraussetzung für staatliche Förderungen.',
  },
  {
    question: 'Wie schnell amortisiert sich eine Heizungsmodernisierung?',
    answer:
      'Dank staatlicher Zuschüsse von bis zu 70% und Brennstoffeinsparungen von 40 bis 60% im Vergleich zu alten Gas- oder Ölheizungen amortisiert sich eine moderne Wärmepumpenanlage meist schon nach 7 bis 10 Jahren.',
  },
  {
    question: 'Kommen Sie für die Energieberatung direkt zu mir nach Hause?',
    answer:
      'Ja. Wir führen die technische Bestandsaufnahme direkt bei Ihnen vor Ort in Wetzlar, Gießen, Marburg, Limburg und dem gesamten Umland durch, um alle baulichen Gegebenheiten exakt zu erfassen.',
  },
];

const energieGraph = buildGraph([
  buildWebPageNode({
    url: pageUrl,
    name: 'Energieberatung & Sanierungsfahrplan Wetzlar | Batherm Haustechnik',
    description:
      'Unabhängige Energieberatung für Heizungstausch, Wärmepumpen, hydraulischen Abgleich und staatliche Förderung.',
    breadcrumbItems: breadcrumbs,
  }),
  buildBreadcrumbNode(breadcrumbs, pageUrl),
  buildServiceNode({
    name: 'Energieberatung & Sanierungsfahrplan (iSFP)',
    serviceType: 'Energieberatung & Gebäude-Effizienz',
    description:
      'Vor-Ort-Bestandsaufnahme, raumweise Heizlastberechnung nach DIN EN 12831, Sanierungsfahrplan und Fördermittelberatung.',
    url: pageUrl,
    offers: [
      { name: 'Vor-Ort-Bestandsaufnahme', description: 'Gebäude- und Heizungsanalyse vor Ort' },
      { name: 'Heizlastberechnung', description: 'Raumweise Heizlastberechnung nach DIN EN 12831' },
      { name: 'Hydraulischer Abgleich', description: 'Berechnung nach Verfahren B' },
      { name: 'Fördermittel-Service', description: 'Begleitung von KfW- & BAFA-Anträgen' },
    ],
  }),
  buildFaqNode(energieFaqs, pageUrl),
]);

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd schema={energieGraph} />
      {children}
    </>
  );
}

