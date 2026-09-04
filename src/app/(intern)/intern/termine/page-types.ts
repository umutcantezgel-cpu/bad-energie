export type TerminfensterEintrag = {
  id: string;
  beschriftung: string;
  beginn: string;
  ende: string;
  reserviertFuerKsNummer: string | null;
  reserviertFuerAnfrageId: string | null;
};
