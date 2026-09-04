import type { Rolle } from '@/lib/types';

export type BenutzerEintrag = {
  id: string;
  name: string;
  email: string;
  rolle: Rolle;
  funktion: string;
  aktiv: boolean;
  fehlversuche: number;
  gesperrtBis: string | null;
  letzterLoginAm: string | null;
  erstelltAm: string;
};
