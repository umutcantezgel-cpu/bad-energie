import { createMetadata } from '@/lib/metadata';
import { buildGraph, buildFaqNode, buildBreadcrumbNode, buildWebPageNode, SITE_URL } from '@/lib/schema';
import JsonLd from '@/components/seo/JsonLd';

export const metadata = createMetadata({
  title: 'FAQ – Häufig gestellte Fragen zu Bad & Heizung | Bad & Energie GmbH',
  description: 'Antworten auf alle Fragen rund um Badsanierung, NIBE Wärmepumpen, Gas-Brennwert, Lüftung & Legionellenschutz in Wetzlar & Lahn-Dill.',
  path: '/faq',
});

const pageUrl = `${SITE_URL}/faq`;
const breadcrumbs = [
  { name: 'Home', path: '/' },
  { name: 'FAQ', path: '/faq' },
];

const faqs = [
  {
    question: 'Wie oft sollte meine Heizung gewartet werden?',
    answer: 'Wir empfehlen eine jährliche Wartung, idealerweise vor Beginn der Heizperiode (September/Oktober). Dies sichert die Effizienz und verlängert die Lebensdauer Ihrer Anlage.',
  },
  {
    question: 'Wann lohnt sich ein Heizungstausch?',
    answer: 'Bei Anlagen älter als 15-20 Jahre, stark steigenden Energiekosten oder häufigen Reparaturen ist ein Austausch oft wirtschaftlich sinnvoll. Wir beraten Sie gerne individuell.',
  },
  {
    question: 'Was kostet eine neue Heizung?',
    answer: 'Die Kosten variieren stark nach Anlagentyp (Gas, Wärmepumpe, Pellets) und Gebäudegröße. Gas-Brennwertheizungen beginnen bei ca. 8.000€, Wärmepumpen ab ca. 15.000€ (vor Förderung).',
  },
  {
    question: 'Welche Heizung ist die beste?',
    answer: 'Das hängt von Ihrem Gebäude, Ihrem Budget und Ihren Prioritäten ab. Wärmepumpen sind sehr effizient und werden stark gefördert, Gas ist oft günstiger in der Anschaffung.',
  },
  {
    question: 'Was kostet eine Badsanierung?',
    answer: 'Ein Standardbad beginnt bei ca. 6.900€ (Basic), während Komfort- und Luxusbäder zwischen 15.000€ und 35.000€ liegen. Nutzen Sie unseren Budgetkalkulator für eine Sofortschätzung.',
  },
  {
    question: 'Wie lange dauert eine Badsanierung?',
    answer: 'Ein komplettes Bad wird von uns im Schnitt in 8 bis 12 Werktagen schlüsselfertig fertiggestellt – mit festem Bauzeitenplan.',
  },
  {
    question: 'Was tun bei einem Wasserrohrbruch?',
    answer: 'Sofort den Hauptwasserhahn schließen, Strom im betroffenen Bereich abschalten und unseren Notdienst unter 06441 20 39 053 anrufen.',
  },
  {
    question: 'Wie vermeide ich Legionellen?',
    answer: 'Warmwasserspeicher auf mindestens 60°C halten, Leitungen regelmäßig spülen und die gesetzlich vorgeschriebene 3-jährliche Legionellenprüfung durchführen lassen.',
  },
  {
    question: 'Wie oft muss eine Wohnraumlüftung gewartet werden?',
    answer: 'Mindestens einmal jährlich sollten Filter gereinigt/gewechselt und das System überprüft werden.',
  },
  {
    question: 'In welchem Gebiet sind Sie tätig?',
    answer: 'Wir sind in Wetzlar, Gießen und im gesamten Lahn-Dill-Kreis für Sie im Einsatz.',
  },
  {
    question: 'Wie hoch ist die Förderung für Wärmepumpen?',
    answer: 'Aktuell werden NIBE Wärmepumpen mit bis zu 70% der förderfähigen Kosten bezuschusst (KfW Heizungsförderung 458).',
  },
];

const faqGraph = buildGraph([
  buildWebPageNode({
    url: pageUrl,
    name: 'Häufig gestellte Fragen (FAQ) | Bad & Energie GmbH',
    description:
      'Antworten auf alle Fragen rund um Badsanierung, Heizung, NIBE Wärmepumpen, Wohnraumlüftung und Fördermittel in Wetzlar.',
    breadcrumbItems: breadcrumbs,
  }),
  buildBreadcrumbNode(breadcrumbs, pageUrl),
  buildFaqNode(faqs, pageUrl),
]);

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd schema={faqGraph} />
      {children}
    </>
  );
}
