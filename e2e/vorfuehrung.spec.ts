/**
 * E2E des Vorführ-Ablaufs (Plan Kapitel 11, Arbeitspaket AP7).
 *
 * Die Datenbank liegt unter `pglite://./data/e2e` und wird vor dem Start des
 * Entwicklungsservers durch `npm run e2e:vorbereiten` (e2e/global-setup.ts) frisch
 * migriert, mit Demo-Preisen geseedet und um den Chef-Benutzer ergänzt.
 *
 * Die Szenarien laufen in allen drei Projekten (desktop, tablet, handy).
 */
import { expect, test, type Page } from '@playwright/test';
import {
  WATTFOX_TEXT,
  alsChefAnmelden,
  neueOutboxMails,
  outboxDateien,
  umgebungVorbereiten,
} from './helfer';

/** Kennzeichnet die Anfrage dieses Laufs, damit parallele Läufe sich nicht verwechseln. */
function laufKennung(projekt: string): string {
  return `E2E${projekt}${Date.now().toString().slice(-6)}`;
}

/**
 * Wählt eine Kachel innerhalb ihrer Fragegruppe. Die Gruppen tragen die Frage als
 * `aria-label`, dadurch bleiben gleichlautende Kacheltexte anderer Fragen außen vor.
 */
async function waehle(page: Page, gruppe: string, option: string): Promise<void> {
  const feld = page.getByRole('radiogroup', { name: gruppe, exact: true });
  await feld.getByRole('radio', { name: option }).click();
}

// ---------------------------------------------------------------------------
// a) und b): Kundenstrecke, Board, Meister-Modus, Sofortversand
// ---------------------------------------------------------------------------

test.describe.serial('Vorführ-Ablauf Heizung', () => {
  const vorgang = { ksNummer: '', nachname: '', anfrageUrl: '' };

  test('a) Heizungs-Journey führt zur Ergebnisseite mit Spanne, Förderbausteinen und Heizkosten', async ({
    page,
  }, testInfo) => {
    vorgang.nachname = laufKennung(testInfo.project.name);
    await umgebungVorbereiten(page);
    await page.goto('/heizung/heizungskonfigurator');

    const weiter = page.getByRole('button', { name: 'Weiter', exact: true });

    // Schritt 1: Was heizt heute
    await expect(page.getByRole('heading', { name: 'Womit heizen Sie heute?' })).toBeVisible();
    await waehle(page, 'Ihre heutige Heizung', 'Gas');
    await waehle(page, 'Wie alt ist die Anlage ungefähr?', 'Älter als zwanzig Jahre');
    await page.locator('#feld-verbrauchJahr').fill('22000');
    await waehle(page, 'Wo steht die Heizung heute?', 'Im Keller');
    await weiter.click();

    // Schritt 2: Ihr Haus
    await expect(page.getByRole('heading', { name: 'Erzählen Sie uns von Ihrem Haus' })).toBeVisible();
    await waehle(page, 'Um welches Gebäude geht es?', 'Einfamilienhaus');
    await page.getByLabel('Wie viel Wohnfläche wird beheizt?').fill('150');
    await expect(page.getByText('150 Quadratmeter')).toBeVisible();
    await waehle(page, 'Aus welcher Zeit stammt das Haus?', 'Vor 1978');
    // Wohneinheiten (1) und Personen (2) stehen bereits auf den Vorgabewerten.
    await expect(page.getByLabel('Wie viele Personen leben im Haus?', { exact: true })).toHaveValue('2');
    await weiter.click();

    // Schritt 3: Wärme im Raum
    await expect(page.getByRole('heading', { name: 'Wie kommt die Wärme heute in Ihre Räume?' })).toBeVisible();
    await waehle(page, 'Ihre Wärme im Raum', 'Über Heizkörper');
    await weiter.click();

    // Schritt 4: Zukunft
    await expect(page.getByRole('heading', { name: 'Was soll künftig heizen?' })).toBeVisible();
    await waehle(page, 'Ihr Wunsch für die Zukunft', 'Wärmepumpe');
    await weiter.click();

    // Schritt 5: Zuschuss
    await expect(page.getByRole('heading', { name: 'Wie viel zahlt der Staat dazu?' })).toBeVisible();
    await waehle(page, 'Wohnen Sie selbst in dem Haus?', 'Ja, ich wohne hier');
    await waehle(
      page,
      'Liegt Ihr zu versteuerndes Haushaltseinkommen unter 40.000 Euro im Jahr?',
      'Nein oder noch offen',
    );
    await weiter.click();

    // Schritt 6: Haus und Zeit
    await expect(page.getByRole('heading', { name: 'Noch zwei Angaben zum Haus' })).toBeVisible();
    await waehle(page, 'Gehört Ihnen das Haus?', 'Ja, mir');
    await page.locator('#feld-plz').fill('35578');
    await waehle(page, 'Wann soll es losgehen?', 'In den nächsten Wochen');
    await weiter.click();

    // Schritt 7: Kontakt
    await expect(page.getByRole('heading', { name: 'Wohin dürfen wir antworten?' })).toBeVisible();
    await page.getByLabel('Anrede').selectOption('Frau');
    await page.getByLabel('Vorname').fill('Anna');
    await page.getByLabel('Nachname').fill(vorgang.nachname);
    await page.getByLabel('E-Mail-Adresse').fill('kundin@example.org');
    await page.getByLabel('Telefonnummer').fill('06441 1234567');
    await page.getByLabel('Ich habe die Datenschutzerklärung zur Kenntnis genommen.').check();
    await page.getByRole('button', { name: 'Kostenschätzung anfordern' }).click();

    // Ergebnisseite
    const anfrageZeile = page.getByText(/Ihre Anfrage KS-\d{4}-\d{4}/);
    await expect(anfrageZeile).toBeVisible({ timeout: 120_000 });
    const kopf = (await anfrageZeile.textContent()) ?? '';
    vorgang.ksNummer = (kopf.match(/KS-\d{4}-\d{4}/) ?? [''])[0];
    expect(vorgang.ksNummer).toMatch(/^KS-\d{4}-\d{4}$/);

    await expect(page.getByRole('heading', { name: /Voraussichtlich etwa .* bis .* €/ })).toBeVisible();
    await expect(page.getByText('Das ist enthalten')).toBeVisible();
    await expect(page.getByText(/Darin enthalten: /)).toBeVisible();
    await expect(page.getByText(/Heute etwa .* € im Jahr/)).toBeVisible();
    await expect(page.getByText('Bosch Premium Partner 2026')).toBeVisible();

    // Der Kundenmodus zeigt keine internen Größen. Geprüft wird der Konfigurator selbst
    // (`div.modul`); der Werbetext der Seite ringsum gehört nicht zum Modul und nennt an
    // anderer Stelle „Heizlastberechnungen“.
    const modul = await page.locator('div.modul').first().innerHTML();
    expect(modul).not.toContain('Heizlast');
    expect(modul.toLowerCase()).not.toContain('stundensatz');
    expect(modul.toLowerCase()).not.toContain('netto');
    // Leistungsangaben in Kilowatt sind tabu; die eigene Verbrauchsangabe in
    // Kilowattstunden bleibt erlaubt, sie steht so auf der Abrechnung des Kunden.
    expect(modul).not.toMatch(/\d[\d.,\s]*kW(?!h)/);
  });

  test('b) Board, Meister-Modus, Vorschlag übernehmen und Sofortversand', async ({ page }) => {
    test.skip(vorgang.ksNummer === '', 'Szenario a) hat keine Anfrage erzeugt.');
    await umgebungVorbereiten(page);
    await alsChefAnmelden(page);

    // Board zeigt die neue Anfrage
    await page.goto('/intern/board');
    // Das Board rendert die Kanban-Spalten und die Listenansicht gleichzeitig und blendet
    // je nach Breite eine davon aus; deshalb nur die sichtbare Karte nehmen.
    const karte = page
      .locator('div.glass-card')
      .filter({ hasText: vorgang.ksNummer })
      .filter({ visible: true })
      .first();
    await expect(karte).toBeVisible();
    await expect(karte).toContainText(vorgang.nachname);

    // Detail und Konfigurator
    await karte.getByRole('link', { name: /Details/ }).click();
    await expect(page.getByRole('link', { name: 'Im Konfigurator öffnen' })).toBeVisible();
    vorgang.anfrageUrl = page.url();
    await page.getByRole('link', { name: 'Im Konfigurator öffnen' }).click();
    await page.waitForURL('**/intern/konfigurator/**');

    // Abschnitt „Gebäude und Heizung“ ist aus dem Web-Lead vorbelegt
    await page.getByRole('button', { name: 'Gebäude und Heizung' }).click();
    await expect(page.getByRole('heading', { name: 'Gebäude und Heizung' })).toBeVisible();
    await expect(page.getByLabel('Wohnfläche', { exact: true })).toHaveValue('150');

    // Vorschlag übernehmen setzt die Größenvariante
    await expect(page.getByText(/Vorschlag: (Bosch|Buderus) \d+ kW/)).toBeVisible();
    await page.getByRole('button', { name: 'Vorschlag übernehmen' }).click();
    await page.getByRole('button', { name: 'Bausteine', exact: true }).click();
    const zehnKw = page.getByRole('radio', { name: '10 kW', exact: false }).first();
    await expect(zehnKw).toBeVisible();
    await expect(zehnKw).toHaveAttribute('aria-checked', 'true');

    // Kunde: Anrede und Telefon
    await page.getByRole('button', { name: 'Kunde und Objekt' }).click();
    await page.getByLabel('Anrede').selectOption('Frau');
    await page.getByLabel('Telefon', { exact: true }).fill('06441 1234567');
    await page.getByLabel('Objektadresse').fill('Musterweg 5, 35578 Wetzlar');

    // Dokument: persönlicher Satz und zwei Terminfenster
    await page.getByRole('button', { name: 'Dokument', exact: true }).click();
    await page
      .getByLabel('Persoenlicher Satz (Pflicht)')
      .fill('Die alte Gastherme steht im Keller, der Platz neben dem Haus reicht aus.');
    const fensterFeld = page.locator('fieldset').filter({ hasText: 'Terminvorschlag, genau zwei Fenster' });
    const schalter = fensterFeld.getByRole('switch');
    const anzahl = await schalter.count();
    let gewaehlt = 0;
    for (let i = 0; i < anzahl && gewaehlt < 2; i += 1) {
      const s = schalter.nth(i);
      if (await s.isEnabled()) {
        await s.click();
        gewaehlt += 1;
      }
    }
    expect(gewaehlt).toBe(2);
    await expect(fensterFeld.getByText('2 von 2 gewaehlt')).toBeVisible();

    // Abschluss: sofort senden
    const vorher = await outboxDateien();
    await page.getByRole('button', { name: 'Abschluss', exact: true }).click();
    await page.getByRole('button', { name: 'Sofort senden' }).click();
    const sheet = page.getByRole('dialog', { name: 'Kostenschaetzung sofort senden' });
    await expect(sheet).toBeVisible();
    await expect(sheet).toContainText(`Kostenschaetzung ${vorgang.ksNummer} Bad und Energie.pdf`);
    await sheet.getByRole('button', { name: 'Jetzt senden' }).click();

    const rueckmeldung = sheet.locator('[aria-live="polite"]');
    await expect(rueckmeldung).toContainText(/versendet/i, { timeout: 180_000 });
    await expect(rueckmeldung).toContainText(vorgang.ksNummer);

    // Postausgang: Kundenmail mit PDF und Dossier mit datenblatt.json
    const mails = await neueOutboxMails(vorher, 2);
    expect(mails.length).toBeGreaterThanOrEqual(2);
    const kundenmail = mails.find(
      (m) =>
        m.inhalt.includes(`X-Anhaenge: Kostenschaetzung ${vorgang.ksNummer} Bad und Energie.pdf`) &&
        !m.inhalt.includes('datenblatt.json'),
    );
    const dossier = mails.find((m) => m.inhalt.includes('datenblatt.json'));
    expect(kundenmail, `Kundenmail mit PDF-Anhang fehlt. Dateien: ${mails.map((m) => m.name).join(', ')}`).toBeTruthy();
    expect(dossier, 'Dossier-Mail mit datenblatt.json fehlt.').toBeTruthy();
    expect(kundenmail?.name).not.toBe(dossier?.name);
    expect(kundenmail?.inhalt).toContain('To: kundin@example.org');
  });
});

// ---------------------------------------------------------------------------
// c) bis g): eigenständige Szenarien
// ---------------------------------------------------------------------------

test.describe('Intern-Bereich', () => {
  test('c) Dispatch erkennt den WattFox-Lead und legt den Vorgang an', async ({ page }) => {
    await umgebungVorbereiten(page);
    await alsChefAnmelden(page);
    await page.goto('/intern/dispatch');

    await page.getByLabel('Diktat / Freitext eingeben').fill(WATTFOX_TEXT);
    const vorschau = page.locator('div').filter({ hasText: 'Portal-Lead erkannt' }).last();
    await expect(page.getByText('Erkannter Befehl: PORTAL_LEAD')).toBeVisible();
    await expect(vorschau).toContainText('150 m²');
    await expect(vorschau).toContainText('1965');
    await expect(vorschau).toContainText('Keller');

    await page.getByRole('button', { name: 'Bestätigen & Ausführen' }).click();
    const meldung = page.getByText('Befehl erfolgreich ausgeführt');
    await expect(meldung).toBeVisible({ timeout: 120_000 });
    await expect(page.getByText(/KS-\d{4}-\d{4}/).first()).toBeVisible();
  });

  test('d) Matrix zeigt den Demo-Hinweis und verliert ihn nach dem Speichern von Zeile 4', async ({ page }) => {
    await umgebungVorbereiten(page);
    await alsChefAnmelden(page);
    await page.goto('/intern/matrix');

    await expect(page.getByText('Demo-Preise, vom Chef zu bestätigen')).toBeVisible();

    const zeile4 = page.locator('tbody tr').filter({ has: page.locator('td').first().getByText('4', { exact: true }) }).first();
    await expect(zeile4).toBeVisible();
    const demoAbzeichen = zeile4.getByText(/^Demo [RD]$/);

    // Der Lauf ist wiederholbar: fehlt das Abzeichen (früherer Lauf im selben Projekt),
    // erst den Demo-Preissatz nachladen. Danach ist ein echtes Neuladen nötig, weil
    // MatrixClient die Tabelle in eigenem Zustand hält (`useState(initialMatrix)`).
    if ((await demoAbzeichen.count()) === 0) {
      await page.getByRole('button', { name: 'Demo-Preise laden' }).click();
      await page.getByRole('button', { name: 'Ja, laden' }).click();
      await expect(page.getByText(/Demo-Preise geladen/)).toBeVisible({ timeout: 60_000 });
      await page.reload();
      await expect(zeile4).toBeVisible();
    }
    await expect(demoAbzeichen).toBeVisible();

    await zeile4.getByRole('button', { name: 'Bearbeiten' }).click();
    await page.getByLabel('Von in Euro').fill('900');
    await page.getByLabel('Bis in Euro').fill('1500');
    await page.getByRole('button', { name: 'Speichern', exact: true }).click();

    await expect(page.getByText('Zeile 4 gespeichert. Das Demo-Kennzeichen dieser Zeile ist damit erledigt.')).toBeVisible({
      timeout: 60_000,
    });
    await expect(zeile4.getByText(/^Demo [RD]$/)).toHaveCount(0);
    await expect(zeile4).toContainText('900');
    await expect(zeile4).toContainText('1.500');
  });

  test('e) Kundenansicht entfernt Netto, Stundensatz und Matrixnummern aus dem DOM', async ({ page }) => {
    await umgebungVorbereiten(page, { kundenansicht: true });
    await alsChefAnmelden(page);

    await expect(page.getByText('Kundenansicht aktiv').first()).toBeVisible();
    await page.getByRole('switch', { name: 'Wärmepumpe statt Gasheizung' }).click();
    await page.getByRole('button', { name: 'Bausteine', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Bausteine' })).toBeVisible();
    await expect(page.getByText('Wärmepumpe und Speicher')).toBeVisible();

    let inhalt = await page.content();
    expect(inhalt).not.toContain('Netto');
    expect(inhalt).not.toContain('Stundensatz');
    expect(inhalt).not.toContain('Matrix ');

    await page.getByRole('button', { name: 'Gebäude und Heizung' }).click();
    await expect(page.getByRole('heading', { name: 'Gebäude und Heizung' })).toBeVisible();
    inhalt = await page.content();
    expect(inhalt).not.toContain('Netto');
    expect(inhalt).not.toContain('Stundensatz');
    expect(inhalt).not.toContain('Matrix ');
  });

  test('f) Türbreite 73 erscheint unter den fehlenden Angaben', async ({ page }) => {
    await umgebungVorbereiten(page);
    await alsChefAnmelden(page);

    await page.getByRole('button', { name: 'Gebäude und Heizung' }).click();
    await page.getByLabel('Türbreite zum Heizraum').fill('73');
    await expect(page.getByText('Unter 80 cm. Transportweg vor Ort klären.')).toBeVisible();

    await page.getByRole('button', { name: 'Abschluss', exact: true }).click();
    const fehlend = page.locator('p').filter({ hasText: 'Türbreite unter 80' }).first();
    await expect(fehlend).toBeVisible();
  });

  test('g) ohne Anmeldung: Weiterleitung auf /intern und 401 auf der Schnittstelle', async ({ page, request }) => {
    await umgebungVorbereiten(page);
    const antwort = await page.goto('/intern/entwuerfe');
    expect(antwort?.url()).toContain('/intern');
    await expect(page.getByRole('heading', { name: 'Anmeldung' })).toBeVisible();
    await expect(page.locator('body')).not.toContainText('Entwuerfe und Freigaben');

    const api = await request.get('/api/intern/terminfenster');
    expect(api.status()).toBe(401);
  });
});
