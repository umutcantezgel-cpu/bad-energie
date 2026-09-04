import type { AnfrageStatus, Dringlichkeit, Gewerk } from '@/lib/types';

export type BoardKarte = {
  id: string;
  ksNummer: string;
  nachname: string;
  vorhabenKurz: string;
  status: AnfrageStatus;
  dringlichkeit: Dringlichkeit;
  gewerkHaupt: Gewerk | null;
  summeNettoVon: number | null;
  summeNettoBis: number | null;
  erstelltAm: string;
};
