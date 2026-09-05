import { expect, test } from '@playwright/test';

test.describe('Header & Navigation Desktop', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('Top Utility Bar zeigt Meister-Status, Ausstellungen, Notdienst und Hilfe-Center', async ({ page }) => {
    await page.goto('/');

    // Top Bar
    const topBar = page.locator('header .bg-\\[\\#0B2559\\]');
    await expect(topBar).toBeVisible();
    await expect(topBar).toContainText('Meisterbetrieb seit 2001');
    await expect(topBar).toContainText('Ausstellungen Wetzlar & Gießen');
    await expect(topBar).toContainText('24/7 Notdienst');
    await expect(topBar).toContainText('Hilfe-Center');
    await expect(topBar).toContainText('06441 20 39 053');

    // Klick auf Hilfe-Center öffnet die HelpSidebar
    const hilfeBtn = topBar.getByRole('button', { name: 'Hilfe-Center' });
    await hilfeBtn.click();
    await expect(page.getByRole('heading', { name: 'Hilfe & Schnellkontakt' })).toBeVisible();

    // Schließen mit ESC
    await page.keyboard.press('Escape');
    await expect(page.getByRole('heading', { name: 'Hilfe & Schnellkontakt' })).toBeHidden();
  });

  test('5 Kernsäulen der Hauptnavigation sind sichtbar und einzeilig', async ({ page }) => {
    await page.goto('/');

    const nav = page.getByRole('navigation', { name: 'Hauptnavigation' });
    await expect(nav).toBeVisible();

    // Die 5 Säulen
    await expect(nav.getByRole('button', { name: /Bad & Wellness/i })).toBeVisible();
    await expect(nav.getByRole('button', { name: /Heizung & Energie/i })).toBeVisible();
    await expect(nav.getByRole('button', { name: /Haustechnik & Klima/i })).toBeVisible();
    await expect(nav.getByRole('button', { name: /Gewerbe/i })).toBeVisible();
    await expect(nav.getByRole('button', { name: /Über uns/i })).toBeVisible();

    // Primär-CTA
    const terminBtn = page.locator('header').getByRole('link', { name: 'Termin vereinbaren' });
    await expect(terminBtn).toBeVisible();
    await expect(terminBtn).toHaveAttribute('href', '/termin');
  });

  test('Mega-Flyout öffnet sich und schließt per Escape', async ({ page }) => {
    await page.goto('/');

    const badButton = page.getByRole('navigation', { name: 'Hauptnavigation' }).getByRole('button', { name: /Bad & Wellness/i });
    await badButton.click();

    // Flyout ist sichtbar
    const flyout = page.locator('#flyout-Bad---Wellness');
    await expect(flyout).toBeVisible();
    await expect(flyout).toContainText('Planung & Kalkulation');
    await expect(flyout).toContainText('Online-Budgetkalkulator Bad');
    await expect(flyout).toContainText('Musterbäder & Kollektionen');

    // Schließen mit Escape
    await page.keyboard.press('Escape');
    await expect(flyout).toBeHidden();
  });
});

test.describe('Header & Navigation Mobile', () => {
  test.use({ viewport: { width: 390, height: 844 } }); // iPhone 14

  test('Top Bar ausgeblendet, Hamburger öffnet sauberen Mobile-Drawer', async ({ page }) => {
    await page.goto('/');

    // Top Bar auf Mobile verborgen
    const topBar = page.locator('header .bg-\\[\\#0B2559\\]');
    await expect(topBar).toBeHidden();

    // Hamburger-Menü öffnen
    const menuBtn = page.getByRole('button', { name: 'Menü öffnen' });
    await expect(menuBtn).toBeVisible();
    await menuBtn.click();

    // Drawer ist sichtbar
    const drawer = page.getByRole('dialog', { name: 'Mobile Navigation' });
    await expect(drawer).toBeVisible();
    await expect(drawer).toContainText('24/7 Notdienst');
    await expect(drawer).toContainText('Anrufen');
    await expect(drawer).toContainText('Bad & Wellness');
    await expect(drawer).toContainText('Heizung & Energie');
    await expect(drawer).toContainText('Hilfe-Center & Notfall-Ratgeber');
    await expect(drawer.getByRole('link', { name: 'Termin online vereinbaren' })).toBeVisible();

    // Untermenü aufklappen
    await drawer.getByRole('button', { name: /Bad & Wellness/i }).click();
    await expect(drawer).toContainText('Online-Budgetkalkulator Bad');

    // Schließen mit X
    await drawer.getByRole('button', { name: 'Navigation schließen' }).click();
    await expect(drawer).toBeHidden();
  });
});
