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

/** PIN-Login (Formular: email, pin). Setzt das Sitzungscookie über die API. */
export async function anmelden(
  _prev: AnmeldeErgebnis | undefined,
  formData: FormData,
): Promise<AnmeldeErgebnis> {
  const email = String(formData.get('email') ?? '');
  const pin = String(formData.get('pin') ?? '');
  try {
    const res = await fetch('/api/intern/anmelden', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, pin }),
    });
    return await res.json();
  } catch (err) {
    return { ok: false, fehler: (err as Error).message || 'Netzwerkfehler.' };
  }
}

export async function abmelden(): Promise<void> {
  await fetch('/api/intern/abmelden', { method: 'POST' });
}

/** Matrix, Vorlagen mit Bausteinen, Förderregeln, Vorbehalte für die Live-Kalkulation. */
export async function ladeKalkulationsdaten(): Promise<Kalkulationsdaten> {
  const res = await fetch('/api/intern/kalkulationsdaten');
  if (!res.ok) throw new Error('Fehler beim Laden der Kalkulationsdaten.');
  return await res.json();
}

/** Freie und reservierte Terminfenster (für den Terminvorschlag). */
export async function ladeTerminfenster(): Promise<TerminfensterOption[]> {
  const res = await fetch('/api/intern/terminfenster');
  if (!res.ok) throw new Error('Fehler beim Laden der Terminfenster.');
  return await res.json();
}

/**
 * Entwurf anlegen oder aktualisieren. Der Autosave ruft ohne Option auf; das bewusste
 * „Als Entwurf speichern“ setzt `auftragAnlegen`, damit der Vorgang mit einem
 * Erstkontakt-Auftrag im Status entwurf in der Freigabeliste erscheint.
 */
export async function speichereEntwurf(
  input: InternAnfrage,
  optionen: { auftragAnlegen?: boolean } = {},
): Promise<EstimateResponse> {
  const res = await fetch('/api/intern/entwurf', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...input, auftragAnlegen: optionen.auftragAnlegen === true }),
  });
  const antwort = (await res.json().catch(() => null)) as EstimateResponse | null;
  // Der Endpunkt prüft Body und Zuständigkeit; seine Meldung ist brauchbarer als ein Sammeltext.
  if (!res.ok || !antwort) {
    const fehler = antwort && !antwort.ok ? antwort.fehler : '';
    const e = new Error(fehler || `Fehler beim Speichern des Entwurfs (Status ${res.status}).`) as Error & { status?: number };
    e.status = res.status;
    throw e;
  }
  return antwort;
}

/** Anfrage für den Meister-Modus laden. */
export async function ladeAnfrage(anfrageId: string): Promise<InternAnfrageDTO | null> {
  const res = await fetch(`/api/intern/anfragen/${encodeURIComponent(anfrageId)}`);
  if (!res.ok) return null;
  return await res.json();
}

/** Entwürfe und freigegebene, noch nicht versendete Aufträge. */
export async function ladeEntwuerfe(): Promise<EntwurfKarte[]> {
  const res = await fetch('/api/intern/entwuerfe');
  if (!res.ok) throw new Error('Fehler beim Laden der Entwürfe.');
  return await res.json();
}

/** Freigabe: sofort=false → fällig zur Versandzeit (18:00) oder sofort, wenn schon danach; sofort=true → synchroner Versand. */
export async function freigeben(anfrageId: string, sofort: boolean): Promise<FreigabeErgebnis> {
  const res = await fetch('/api/intern/freigeben', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ anfrageId, sofort }),
  });
  return await res.json();
}

export async function stornieren(anfrageId: string): Promise<FreigabeErgebnis> {
  const res = await fetch('/api/intern/stornieren', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ anfrageId }),
  });
  return await res.json();
}
