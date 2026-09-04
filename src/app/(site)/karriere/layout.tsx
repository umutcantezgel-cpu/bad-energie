import { createMetadata } from '@/lib/metadata';
import { buildGraph, buildJobPostingNode, buildFaqNode, buildBreadcrumbNode, buildWebPageNode, SITE_URL } from '@/lib/schema';
import JsonLd from '@/components/seo/JsonLd';

export const metadata = createMetadata({
  title: 'Karriere & Jobs im SHK-Handwerk | Bad & Energie GmbH Wetzlar',
  description: 'Werden Sie Teil unseres Meisterteams bei der Bad & Energie GmbH in Wetzlar. Aktuelle Jobs für Anlagenmechaniker SHK, Kundendienstmonteure und Azubis.',
  path: '/karriere',
});

const pageUrl = `${SITE_URL}/karriere`;
const breadcrumbs = [
  { name: 'Home', path: '/' },
  { name: 'Karriere & Jobs', path: '/karriere' },
];

const jobs = [
  {
    title: 'Anlagenmechaniker SHK (m/w/d) für Sanitär- & Heizungstechnik',
    description:
      'Installation von NIBE Wärmepumpen, Fußbodenheizungen, Trinkwasserinstallationen und schlüsselfertigen Badsanierungen in Wetzlar und Region.',
    employmentType: 'FULL_TIME',
  },
  {
    title: 'Servicetechniker / Kundendienstmonteur SHK (m/w/d)',
    description:
      'Wartung, Instandhaltung und Störungsbeseitigung von Wärmepumpen, Gas- und Solaranlagen im Raum Wetzlar und Mittelhessen.',
    employmentType: 'FULL_TIME',
  },
  {
    title: 'Auszubildender zum Anlagenmechaniker SHK (m/w/d)',
    description:
      'Fundierte Ausbildung im SHK-Handwerk mit Zukunft: Lerne moderne Wärmepumpentechnik, Klimatechnik und hochwertige Bäder von Meistern ihres Fachs.',
    employmentType: 'FULL_TIME',
  },
];

const karriereFaqs = [
  {
    question: 'Wie läuft der Bewerbungsprozess bei der Bad & Energie GmbH ab?',
    answer:
      'Ganz unkompliziert: Sie rufen uns an unter 06441 20 39 053 oder schreiben eine kurze E-Mail an anfrage@bad-energie-profi.de.',
  },
  {
    question: 'Gibt es Möglichkeiten zur fachlichen Weiterbildung?',
    answer:
      'Ja, wir fördern gezielt Produktschulungen direkt bei Herstellern wie NIBE, Lehrgänge zum Kälteschein sowie Weiterbildungen zum Meister oder Techniker.',
  },
  {
    question: 'Werden Überstunden bezahlt oder ausgeglichen?',
    answer:
      'Jede geleistete Überstunde wird auf Ihrem persönlichen Zeitkonto erfasst und kann wahlweise vergütet oder durch Freizeit ausgeglichen werden.',
  },
];

const karriereGraph = buildGraph([
  buildWebPageNode({
    url: pageUrl,
    name: 'Karriere & Jobs im SHK-Handwerk in Wetzlar | Bad & Energie GmbH',
    description:
      'Stellenangebote für Anlagenmechaniker SHK, Servicetechniker und Azubis bei der Bad & Energie GmbH in Wetzlar.',
    breadcrumbItems: breadcrumbs,
  }),
  buildBreadcrumbNode(breadcrumbs, pageUrl),
  ...jobs.map((job) => buildJobPostingNode(job, pageUrl)),
  buildFaqNode(karriereFaqs, pageUrl),
]);

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd schema={karriereGraph} />
      {children}
    </>
  );
}
