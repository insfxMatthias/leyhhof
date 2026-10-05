import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
// Screenshots einer Seite (Desktop + Mobil) aus dem gebauten dist/.
//   OUT=./screenshots node scripts/screenshot.mjs /kontakt/ kontakt
// MENUE=1 fotografiert zusätzlich das geöffnete Mobil-Menü.
const [,, pfad = '/', name = 'home'] = process.argv;
const out = process.env.OUT ?? 'screenshots';
import { mkdirSync } from 'node:fs';
mkdirSync(out, { recursive: true });
const srv = spawn('npx', ['astro', 'preview', '--port', '4321'], { stdio: 'ignore' });
await new Promise(r => setTimeout(r, 2500));
const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM_PATH });
for (const [vp, suffix] of [[{ width: 1440, height: 900 }, 'desktop'], [{ width: 390, height: 844 }, 'mobil']]) {
  const page = await browser.newPage({ viewport: vp, deviceScaleFactor: 1 });
  await page.goto('http://localhost:4321' + pfad, { waitUntil: 'networkidle' });
  // Lazy-Bilder laden: einmal durchscrollen
  await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 150)); } window.scrollTo(0, 0); await new Promise(r => setTimeout(r, 800)); });
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: `${out}/${name}-${suffix}.png`, fullPage: true });
  if (suffix === 'mobil' && process.env.MENUE) {
    await page.click('#menue summary');
    await page.waitForTimeout(200);
    await page.screenshot({ path: `${out}/${name}-menue.png` });
  }
  await page.close();
}
await browser.close();
srv.kill();
