import { expect, test } from '@playwright/test';

test.describe('Öffentliche Website', () => {
  test('Startseite lädt mit Hauptbereich und Sprungmarke', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('main#main-content')).toBeVisible();
    await expect(page).toHaveTitle(/Bad & Energie/);
  });

  test('Einwilligungsbanner erscheint und lässt sich auf das Nötigste beschränken', async ({ page }) => {
    await page.goto('/');
    const banner = page.getByText('Wir respektieren Ihre Privatsphäre');
    await expect(banner).toBeVisible({ timeout: 15_000 });
    await page.getByRole('button', { name: 'Nur Essenzielle' }).click();
    await expect(banner).toBeHidden();
    const gespeichert = await page.evaluate(() => window.localStorage.getItem('baris_consent_settings'));
    expect(gespeichert).toContain('"analytics":false');
  });

  test('Calendly lädt erst nach Zustimmung', async ({ page }) => {
    await page.goto('/beratung');
    await expect(page.getByRole('heading', { name: 'Terminkalender von Calendly' })).toBeVisible();
    const anfragen: string[] = [];
    page.on('request', (r) => { if (r.url().includes('calendly.com')) anfragen.push(r.url()); });
    await page.waitForTimeout(1000);
    expect(anfragen).toHaveLength(0);
  });

  test('Intern-Bereich ist ohne Anmeldung geschützt', async ({ page }) => {
    const antwort = await page.goto('/intern/entwuerfe');
    expect(antwort?.url()).toContain('/intern');
    await expect(page.locator('body')).not.toContainText('Stundensatz');
  });

  test('Kunden-Journey Bad lädt TouchConfigurator ohne interne Faktoren im DOM', async ({ page }) => {
    await page.goto('/bad/badanfrage');
    await expect(page.getByRole('button', { name: /Weiter/i })).toBeVisible({ timeout: 15_000 });
    const content = await page.content();
    expect(content).not.toContain('stundensatz');
    expect(content).not.toContain('material_zuschlag_prozent');
    expect(content).not.toContain('rabatt_prozent');
    expect(content).not.toContain('marge_hinweis');
  });

  test('Kunden-Journey Heizung lädt TouchConfigurator', async ({ page }) => {
    await page.goto('/heizung/heizungskonfigurator');
    await expect(page.getByRole('button', { name: /Weiter/i })).toBeVisible({ timeout: 15_000 });
  });

  test('Wärmepumpen-Check lädt TouchConfigurator mit Eignungs-Ampel', async ({ page }) => {
    await page.goto('/heizung/waermepumpe/check');
    await expect(page.getByRole('button', { name: /Weiter/i })).toBeVisible({ timeout: 15_000 });
  });

  test('Termin-Seite enthält Formular mit direkter Anbindung', async ({ page }) => {
    await page.goto('/termin');
    await expect(page.getByRole('button', { name: /Termin jetzt unverbindlich buchen/i })).toBeVisible({ timeout: 15_000 });
  });
});
