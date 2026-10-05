// Erzeugt aus dist/ eine Kopie mit relativen Pfaden (für Vorschauen ohne eigene Domain,
// z. B. als claude.ai-Artifact oder aus einem Unterordner). Für den echten Server nicht nötig.
//   VORSCHAU=1 npm run build && node scripts/vorschau.mjs <zielordner>
import { readdirSync, statSync, mkdirSync, copyFileSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';

const quelle = 'dist';
const ziel = process.argv[2] ?? 'vorschau';
const ausschluss = new Set(['widerruf', 'cookie-einstellungen', 'sitemap-0.xml', 'sitemap-index.xml', 'robots.txt']);
rmSync(ziel, { recursive: true, force: true });

const walk = (d) => readdirSync(d).flatMap((n) => {
  const p = join(d, n);
  if (ausschluss.has(n)) return [];
  return statSync(p).isDirectory() ? walk(p) : [p];
});

for (const datei of walk(quelle)) {
  const rel = relative(quelle, datei);
  // „_astro“ → „assets“: manche Hoster reservieren Namen mit Unterstrich
  const out = join(ziel, rel.replace(/^_astro\//, 'assets/'));
  mkdirSync(dirname(out), { recursive: true });
  if (rel.endsWith('.html')) {
    const tiefe = rel.split('/').length - 1;
    const prefix = '../'.repeat(tiefe);
    let html = readFileSync(datei, 'utf8');
    html = html.replace(/href="\/"/g, `href="${prefix}index.html"`);
    html = html.replace(/(href|src|content|action)="\/_astro\//g, `$1="${prefix}assets/`);
    html = html.replace(/(href|src|content|action)="\/(?!\/)/g, `$1="${prefix}`);
    html = html.replace(/(["\s,])\/_astro\//g, `$1${prefix}assets/`);
    // Verzeichnis-Links auf index.html zeigen lassen (href="../kontakt/" → href="../kontakt/index.html")
    html = html.replace(/href="((?:\.\.\/)*[a-z0-9\-\/]*\/)"/g, 'href="$1index.html"');
    writeFileSync(out, html);
  } else if (rel.endsWith('.css')) {
    writeFileSync(out, readFileSync(datei, 'utf8').replace(/url\(\/_astro\//g, 'url('));
  } else {
    copyFileSync(datei, out);
  }
}
console.log(`Vorschau in ${ziel}/ (${walk(ziel).length} Dateien)`);
