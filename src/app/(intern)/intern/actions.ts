'use server';

/**
 * Server Actions des Intern-Bereichs.
 * Jede Aktion außer `anmelden` ruft verifySession() auf.
 */
import type {
  AnmeldeErgebnis,
  EntwurfKarte,
  EstimateResponse,
  FreigabeErgebnis,
  InternAnfrage,
  InternAnfrageDTO,
  Kalkulationsdaten,
  TerminfensterOption,
} from '@/lib/types';
import {
  abmelden as authAbmelden,
  anmelden as authAnmelden,
  verifySession,
} from '@/lib/services/auth';
import {
  ladeKalkulationsdaten as ladeKalkulationsdatenService,
} from '@/lib/services/kalkulationsdaten';
import {
  freigeben as freigebenService,
  ladeEntwuerfe as ladeEntwuerfeService,
  ladeInternAnfrage,
  ladeTerminfenster as ladeTerminfensterService,
  speichereInternAnfrage,
  stornieren as stornierenService,
} from '@/lib/services/estimates';

/** PIN-Login (Formular: email, pin). Setzt das Sitzungscookie. */
export async function anmelden(
  _prev: AnmeldeErgebnis | undefined,
  formData: FormData,
): Promise<AnmeldeErgebnis> {
  const email = String(formData.get('email') ?? '');
  const pin = String(formData.get('pin') ?? '');
  return authAnmelden({ email, pin });
}

export async function abmelden(): Promise<void> {
  await authAbmelden();
}

/** Matrix, Vorlagen mit Bausteinen, Förderregeln, Vorbehalte für die Live-Kalkulation. */
export async function ladeKalkulationsdaten(): Promise<Kalkulationsdaten> {
  await verifySession();
  return ladeKalkulationsdatenService();
}

/** Freie und reservierte Terminfenster (für den Terminvorschlag). */
export async function ladeTerminfenster(): Promise<TerminfensterOption[]> {
  await verifySession();
  return ladeTerminfensterService();
}

/** Entwurf anlegen oder aktualisieren (Autosave); Aktion ist immer 'entwurf'. */
export async function speichereEntwurf(input: InternAnfrage): Promise<EstimateResponse> {
  const session = await verifySession();
  const anlage = await speichereInternAnfrage(input, session);
  return {
    ok: true,
    modus: 'intern',
    anfrageId: anlage.anfrageId,
    ksNummer: anlage.ksNummer,
    status: anlage.status,
    aktion: 'entwurf',
    hinweise: anlage.hinweise,
    rueckmeldung: anlage.rueckmeldung,
  };
}

/** Anfrage für den Meister-Modus laden. */
export async function ladeAnfrage(anfrageId: string): Promise<InternAnfrageDTO | null> {
  await verifySession();
  return ladeInternAnfrage(anfrageId);
}

/** Entwürfe und freigegebene, noch nicht versendete Aufträge. */
export async function ladeEntwuerfe(): Promise<EntwurfKarte[]> {
  const session = await verifySession();
  return ladeEntwuerfeService(session);
}

/** Freigabe: sofort=false → fällig zur Versandzeit (18:00) oder sofort, wenn schon danach; sofort=true → synchroner Versand. */
export async function freigeben(anfrageId: string, sofort: boolean): Promise<FreigabeErgebnis> {
  const session = await verifySession();
  return freigebenService(anfrageId, session, { sofort });
}

export async function stornieren(anfrageId: string): Promise<FreigabeErgebnis> {
  const session = await verifySession();
  return stornierenService(anfrageId, session);
}
