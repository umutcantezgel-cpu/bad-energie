import { createMetadata } from '@/lib/metadata';
import { buildGraph, buildFaqNode, buildBreadcrumbNode, buildWebPageNode, SITE_URL, LOCAL_BUSINESS_ID } from '@/lib/schema';
import JsonLd from '@/components/seo/JsonLd';

export const metadata = createMetadata({
  title: 'Förderung & Zuschüsse bis 70% | Bad & Energie GmbH',
  description: 'Bis zu 70% KfW-Förderung für NIBE Wärmepumpen & bis zu 4.000 € Pflegekassen-Zuschuss für barrierefreie Bäder in Wetzlar & Lahn-Dill.',
  path: '/foerderung',
});

const pageUrl = `${SITE_URL}/foerderung`;
const breadcrumbs = [
  { name: 'Home', path: '/' },
  { name: 'Förderung & Zuschüsse', path: '/foerderung' },
];

const foerderFaqs = [
  {
    question: 'Wie läuft der Antrag auf KfW-Heizungsförderung ab?',
    answer:
      'Zuerst schließen Sie mit uns einen Lieferungs- oder Leistungsvertrag mit aufschiebender Bedingung der Förderzusage ab. Anschließend erstellen wir für Sie die Bestätigung zum Antrag (BzA). Mit dieser BzA-ID registrieren Sie sich im Kundenportal „Meine KfW“ und stellen den Antrag online vor Beginn der Montage.',
  },
  {
    question: 'Welche Voraussetzungen gelten für die maximale 70% Förderung?',
    answer:
      'Die 70% Maximalförderung setzt sich zusammen aus der Grundförderung (30%), dem Geschwindigkeitsbonus (20%) beim Austausch alter fossiler Heizungen sowie dem Einkommensbonus (30% bei Haushaltseinkommen unter 40.000 €) oder dem Effizienzbonus (5%). Die Boni sind kombinierbar und werden bei 70% gedeckelt.',
  },
  {
    question: 'Gibt es auch Fördermittel für die Badsanierung?',
    answer:
      'Ja, über das KfW-Programm 159 („Altersgerecht Umbauen“) können barrierefreie Bäder gefördert werden. Zudem bezuschusst die Pflegekasse Maßnahmen zur Wohnumfeldverbesserung nach § 40 SGB XI mit bis zu 4.000 Euro pro pflegebedürftiger Person.',
  },
  {
    question: 'Unterstützt die Bad & Energie GmbH mich bei allen Formalitäten?',
    answer:
      'Selbstverständlich! Wir erstellen sämtliche für die Bewilligung erforderlichen Fachunternehmererklärungen, hydraulischen Abgleichsberechnungen nach Verfahren B und begleiten Sie Schritt für Schritt.',
  },
];

const foerderungGraph = buildGraph([
  buildWebPageNode({
    url: pageUrl,
    name: 'Heizungsförderung & Zuschüsse bis 70% | Bad & Energie GmbH',
    description:
      'Nutzen Sie bis zu 70% staatliche KfW- & BEG-Förderung beim Heizungstausch und Einbau von NIBE Wärmepumpen in Wetzlar.',
    breadcrumbItems: breadcrumbs,
  }),
  buildBreadcrumbNode(breadcrumbs, pageUrl),
  {
    '@type': 'FinancialProduct',
    '@id': `${pageUrl}#kfw458`,
    name: 'KfW Heizungsförderung (Zuschuss 458)',
    description: 'Bundesförderung für effiziente Gebäude (BEG) mit bis zu 70% Zuschuss beim Heizungstausch.',
    provider: { '@id': LOCAL_BUSINESS_ID },
    url: pageUrl,
  },
  buildFaqNode(foerderFaqs, pageUrl),
]);

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd schema={foerderungGraph} />
      {children}
    </>
  );
}
