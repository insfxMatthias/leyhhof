import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/** Alle Seiten der Site mit erwartetem Title-Tag (aus inhalte.md). */
const SEITEN = [
  { pfad: '/', title: 'Home | Erlebnisbauernhof Leyh', h1: 'Erlebnisbauernhof Leyh' },
  { pfad: '/unsere-angebote/', title: 'Unsere Angebote | Erlebnisbauernhof Leyh', h1: 'Unsere Angebote' },
  { pfad: '/unsere-angebote/bauernhof/', title: 'Bauernhof - Unsere Angebote | Erlebnisbauernhof Leyh', h1: 'Schatzkiste Bauernhof' },
  { pfad: '/unsere-angebote/ponys/', title: 'Ponys - Unsere Angebote | Erlebnisbauernhof Leyh', h1: 'Kindergeburtstage' },
  { pfad: '/unsere-angebote/schulklassen/', title: 'Schulklassen - Unsere Angebote | Erlebnisbauernhof Leyh', h1: 'Unterricht auf dem Bauernhof' },
  { pfad: '/moderne-landwirtschaft/', title: 'Moderne Landwirtschaft | Erlebnisbauernhof Leyh', h1: 'Moderne Landwirtschaft' },
  { pfad: '/mein-buch/', title: 'Mein Buch | Erlebnisbauernhof Leyh', h1: 'Mein Buch' },
  { pfad: '/kontakt/', title: 'Kontakt | Erlebnisbauernhof Leyh', h1: 'Kontakt' },
  { pfad: '/impressum/', title: 'Impressum | Erlebnisbauernhof Leyh', h1: 'Impressum' },
  { pfad: '/datenschutz/', title: 'Datenschutz | Erlebnisbauernhof Leyh', h1: 'Datenschutzerklärung' },
];

for (const seite of SEITEN) {
  test.describe(seite.pfad, () => {
    test('lädt, Title und H1 stimmen, keine externen Requests', async ({ page }) => {
      const extern: string[] = [];
      page.on('request', (r) => {
        const url = new URL(r.url());
        if (url.origin !== 'http://localhost:4321') extern.push(r.url());
      });
      const antwort = await page.goto(seite.pfad);
      expect(antwort?.status()).toBe(200);
      await expect(page).toHaveTitle(seite.title);
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('h1')).toHaveText(seite.h1);
      // Konzept 4.3: keine externen Requests außer Links, die der Nutzer klickt.
      expect(extern).toEqual([]);
      // Kein horizontales Scrollen (mobile first)
      const breite = await page.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]);
      expect(breite[0]).toBeLessThanOrEqual(breite[1]);
    });

    test('keine Barrierefreiheits-Fehler (axe, WCAG 2.1 AA)', async ({ page }) => {
      await page.goto(seite.pfad);
      const ergebnis = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'])
        .analyze();
      expect(ergebnis.violations, JSON.stringify(ergebnis.violations, null, 2)).toEqual([]);
    });

    test('SEO-Grundlagen: Description, Canonical, Open Graph, JSON-LD', async ({ page }) => {
      await page.goto(seite.pfad);
      await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.{40,}/);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://leyhhof.de${seite.pfad}`);
      await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /og\.jpg$/);
      const jsonLd = await page.locator('script[type="application/ld+json"]').textContent();
      expect(JSON.parse(jsonLd ?? '{}')['@type']).toBe('LocalBusiness');
      // Alle Bilder haben einen konkreten Alt-Text
      const ohneAlt = await page.locator('img:not([alt]), img[alt=""], img[alt="Bild"]').count();
      expect(ohneAlt).toBe(0);
    });
  });
}

test('Mobil-Menü öffnet und listet alle Angebote', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'nur mobil');
  await page.goto('/');
  await page.getByRole('group').locator('summary').click();
  const menue = page.getByRole('navigation', { name: 'Menü' });
  await expect(menue).toBeVisible();
  for (const name of ['Bauernhof', 'Ponys', 'Schulklassen', 'Moderne Landwirtschaft', 'Mein Buch', 'Kontakt']) {
    await expect(menue.getByRole('link', { name, exact: true })).toBeVisible();
  }
  await page.keyboard.press('Escape');
  await expect(menue).toBeHidden();
});

test('Skip-Link springt zum Inhalt', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: 'Zum Inhalt springen' });
  await expect(skip).toBeFocused();
  await skip.press('Enter');
  await expect(page.locator('#inhalt')).toBeFocused();
});

test('alte Jimdo-URLs leiten weiter', async ({ page }) => {
  await page.goto('/widerruf/');
  await expect(page).toHaveURL(/\/kontakt\/$/);
  await page.goto('/cookie-einstellungen/');
  await expect(page).toHaveURL(/\/datenschutz\/$/);
});

test('Telefon-Links sind klickbar formatiert', async ({ page }) => {
  await page.goto('/unsere-angebote/ponys/');
  await expect(page.locator('a[href="tel:+491701702297"]').first()).toBeVisible();
  await page.goto('/unsere-angebote/bauernhof/');
  await expect(page.locator('a[href="tel:+4995318496"]').first()).toBeVisible();
});

test('Sitemap und robots.txt vorhanden', async ({ request }) => {
  const robots = await request.get('/robots.txt');
  expect(robots.status()).toBe(200);
  expect(await robots.text()).toContain('Sitemap:');
  const sitemap = await request.get('/sitemap-index.xml');
  expect(sitemap.status()).toBe(200);
});
