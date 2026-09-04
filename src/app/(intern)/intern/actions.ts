'use server';

/**
 * Server Actions des Intern-Bereichs. Vertrag zwischen Oberfläche und Backend.
 * STUB: Signaturen sind verbindlich, die Implementierung folgt im Backend-Arbeitsstrang.
 * Jede Aktion außer `anmelden` ruft verifySession() auf.
 */
import type {
  AnmeldeErgebnis, EntwurfKarte, EstimateResponse, FreigabeErgebnis, InternAnfrage, InternAnfrageDTO,
  Kalkulationsdaten, TerminfensterOption,
} from '@/lib/types';

const nichtImplementiert = (name: string) => new Error(`${name}: nicht implementiert`);

/** PIN-Login (Formular: email, pin). Setzt das Sitzungscookie. */
export async function anmelden(_prev: AnmeldeErgebnis | undefined, _formData: FormData): Promise<AnmeldeErgebnis> {
  throw nichtImplementiert('anmelden');
}

export async function abmelden(): Promise<void> {
  throw nichtImplementiert('abmelden');
}

/** Matrix, Vorlagen mit Bausteinen, Förderregeln, Vorbehalte für die Live-Kalkulation. */
export async function ladeKalkulationsdaten(): Promise<Kalkulationsdaten> {
  throw nichtImplementiert('ladeKalkulationsdaten');
}

/** Freie und reservierte Terminfenster (für den Terminvorschlag). */
export async function ladeTerminfenster(): Promise<TerminfensterOption[]> {
  throw nichtImplementiert('ladeTerminfenster');
}

/** Entwurf anlegen oder aktualisieren (Autosave); Aktion ist immer 'entwurf'. */
export async function speichereEntwurf(_input: InternAnfrage): Promise<EstimateResponse> {
  throw nichtImplementiert('speichereEntwurf');
}

/** Anfrage für den Meister-Modus laden. */
export async function ladeAnfrage(_anfrageId: string): Promise<InternAnfrageDTO | null> {
  throw nichtImplementiert('ladeAnfrage');
}

/** Entwürfe und freigegebene, noch nicht versendete Aufträge. */
export async function ladeEntwuerfe(): Promise<EntwurfKarte[]> {
  throw nichtImplementiert('ladeEntwuerfe');
}

/** Freigabe: sofort=false → fällig zur Versandzeit (18:00) oder sofort, wenn schon danach; sofort=true → synchroner Versand. */
export async function freigeben(_anfrageId: string, _sofort: boolean): Promise<FreigabeErgebnis> {
  throw nichtImplementiert('freigeben');
}

export async function stornieren(_anfrageId: string): Promise<FreigabeErgebnis> {
  throw nichtImplementiert('stornieren');
}
