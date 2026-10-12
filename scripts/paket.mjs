// Baut die Seite für eine bestimmte Adresse und packt sie als ZIP zum Hochladen.
//
//   node scripts/paket.mjs                                   → Live: https://leyhhof.de/
//   node scripts/paket.mjs --site https://beispiel.de --base /leyhhof
//                                                            → Präsentation unter https://beispiel.de/leyhhof/
//                                                              (automatisch noindex, robots.txt sperrt)
//   Optionen: --out datei.zip   --index (Präsentation trotzdem indexierbar)
import { spawnSync } from 'node:child_process';
import { writeFileSync, rmSync, existsSync, mkdirSync, cpSync, readFileSync } from 'node:fs';

const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : fallback;
};
const site = arg('site', 'https://leyhhof.de').replace(/\/+$/, '');
let base = arg('base', '/');
base = '/' + base.replace(/^\/+|\/+$/g, '');           // "/leyhhof" oder "/"
const basePfad = base === '/' ? '' : base;                 // Präfix für Pfade in .htaccess
const noindex = base !== '/' || site !== 'https://leyhhof.de' ? !process.argv.includes('--index') : false;
const out = arg('out', base === '/' ? 'leyhhof-website.zip' : `leyhhof-website${base.replace(/\//g, '-')}.zip`);

console.log(`Baue für ${site}${basePfad}/  (noindex: ${noindex ? 'ja' : 'nein'})`);
rmSync('dist', { recursive: true, force: true });
const build = spawnSync('npx', ['astro', 'build'], {
  stdio: 'inherit',
  env: { ...process.env, SITE: site, BASE: base, NOINDEX: noindex ? '1' : '' },
});
if (build.status !== 0) process.exit(build.status ?? 1);

// .htaccess für Apache-Webspace (Caddy/nginx ignorieren die Datei)
const htaccess = `# Erlebnisbauernhof Leyh – erzeugt von scripts/paket.mjs für ${site}${basePfad}/
Options -Indexes
ErrorDocument 404 ${basePfad}/404.html
RewriteEngine On
RewriteBase ${basePfad || '/'}
# Alte Jimdo-URLs
RewriteRule ^widerruf/?$ ${basePfad}/kontakt/ [R=301,L]
RewriteRule ^cookie-einstellungen/?$ ${basePfad}/datenschutz/ [R=301,L]
# Ohne Slash am Ende → mit Slash (wie bei Jimdo)
RewriteCond %{REQUEST_FILENAME} -d
RewriteRule ^(.+[^/])$ ${basePfad}/$1/ [R=301,L]
<IfModule mod_headers.c>
  <FilesMatch "\\.(avif|webp|jpg|png|css|woff2)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
  </FilesMatch>${noindex ? '\n  Header set X-Robots-Tag "noindex, nofollow"' : ''}
</IfModule>
<IfModule mod_mime.c>
  AddType image/avif .avif
  AddType image/webp .webp
  AddType font/woff2 .woff2
</IfModule>
`;
writeFileSync('dist/.htaccess', htaccess);

const paket = 'paket-tmp';
rmSync(paket, { recursive: true, force: true });
mkdirSync(`${paket}/leyhhof-website`, { recursive: true });
cpSync('dist', `${paket}/leyhhof-website`, { recursive: true });
if (base === '/') cpSync('Caddyfile', `${paket}/Caddyfile`);
writeFileSync(`${paket}/LIESMICH.txt`, `Erlebnisbauernhof Leyh – gebaute Website für ${site}${basePfad}/
Stand: ${new Date().toISOString().slice(0, 10)}

Der Ordner "leyhhof-website" enthält die komplette Seite (HTML, CSS, Bilder,
Schriften). Kein PHP, keine Datenbank, kein Node auf dem Server nötig.

Hochladen
---------
Den INHALT von "leyhhof-website" per FTP/SFTP ${basePfad ? `in den Unterordner "${basePfad.slice(1)}" des Web-Roots` : 'ins Web-Root'}
kopieren, so dass index.html unter ${site}${basePfad}/index.html liegt.
Die versteckte Datei ".htaccess" mitkopieren (Apache). ${noindex ? `
Diese Version ist eine Präsentations-Kopie: Suchmaschinen werden per
noindex, robots.txt und X-Robots-Tag ausgesperrt.` : ''}

Prüfen
------
- ${site}${basePfad}/                       Startseite
- ${site}${basePfad}/unsere-angebote/ponys/ Unterseite
- ${site}${basePfad}/widerruf/              leitet auf /kontakt/ um
`);
rmSync(out, { force: true });
const zip = spawnSync('zip', ['-qr', `../${out}`, '.'], { cwd: paket, stdio: 'inherit' });
rmSync(paket, { recursive: true, force: true });
if (zip.status !== 0) process.exit(zip.status ?? 1);
console.log(`Fertig: ${out}`);
