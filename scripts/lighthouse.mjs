// Lighthouse-Lauf gegen das gebaute dist/ (mobil, 3G-ähnliche Drosselung).
// Ziel laut Konzept: ≥ 95 in allen Kategorien.
//   npm run build && npm run lighthouse            (alle Seiten)
//   node scripts/lighthouse.mjs /kontakt/            (eine Seite)
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';

const SEITEN = process.argv[2]
  ? [process.argv[2]]
  : ['/', '/unsere-angebote/', '/unsere-angebote/bauernhof/', '/unsere-angebote/ponys/', '/unsere-angebote/schulklassen/', '/moderne-landwirtschaft/', '/mein-buch/', '/kontakt/', '/impressum/', '/datenschutz/'];
const ZIEL = 95;

const srv = spawn('npx', ['astro', 'preview', '--port', '4321'], { stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 2500));

const lighthouse = (await import('lighthouse')).default;
const { launch } = await import('chrome-launcher');
const chrome = await launch({ chromePath: process.env.CHROME_PATH, chromeFlags: ['--headless=new', '--no-sandbox', '--disable-gpu'] });
mkdirSync('lighthouse', { recursive: true });

let ok = true;
const zeilen = [];
try {
  for (const pfad of SEITEN) {
    const ergebnis = await lighthouse(`http://localhost:4321${pfad}`, {
      port: chrome.port,
      output: 'html',
      logLevel: 'error',
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    });
    const lhr = ergebnis.lhr;
    const werte = Object.fromEntries(Object.entries(lhr.categories).map(([k, v]) => [k, Math.round(v.score * 100)]));
    const lcp = Math.round(lhr.audits['largest-contentful-paint'].numericValue);
    const bytes = Math.round(lhr.audits['total-byte-weight'].numericValue / 1024);
    const bestanden = Object.values(werte).every((w) => w >= ZIEL);
    ok &&= bestanden;
    zeilen.push(`${bestanden ? '✓' : '✗'} ${pfad.padEnd(32)} Perf ${werte.performance}  A11y ${werte.accessibility}  BP ${werte['best-practices']}  SEO ${werte.seo}  LCP ${lcp} ms  ${bytes} KB`);
    writeFileSync(`lighthouse/${pfad.replace(/\//g, '_') || 'home'}.html`, ergebnis.report);
  }
} finally {
  await chrome.kill();
  srv.kill();
}
console.log(zeilen.join('\n'));
console.log(ok ? `\nAlle Seiten ≥ ${ZIEL}.` : `\nMindestens eine Seite unter ${ZIEL} – Reports in lighthouse/.`);
process.exit(ok ? 0 : 1);
