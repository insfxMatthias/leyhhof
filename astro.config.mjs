// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Kanonische Adresse der Seite. Bei www-Variante hier und im Caddyfile anpassen.
// Für eine Präsentation unter anderer Adresse/Unterordner per Umgebung überschreiben:
//   SITE=https://beispiel.de BASE=/leyhhof NOINDEX=1 npm run build
// (oder einfacher: node scripts/paket.mjs --site https://beispiel.de --base /leyhhof)
export const SITE = process.env.SITE ?? 'https://leyhhof.de';
const BASE = process.env.BASE ?? '/';
// Ziel-Pfade für Weiterleitungen mit Basis-Pfad (Astro ergänzt ihn dort nicht selbst)
const mitBase = (pfad) => `${BASE.replace(/\/+$/, '')}${pfad}`;

export default defineConfig({
  site: SITE,
  base: BASE,
  trailingSlash: 'always',
  build: {
    format: 'directory',
    inlineStylesheets: 'auto',
  },
  image: {
    // Responsive Bilder mit srcset/sizes automatisch aus astro:assets
    layout: 'constrained',
    responsiveStyles: true,
    // Weniger Varianten als Astro-Standard: Quellbilder sind bis 2560 px breit.
    breakpoints: process.env.VORSCHAU ? [768, 1600] : [480, 640, 768, 1024, 1280, 1600, 1920],
  },
  // Alte Jimdo-URLs, die es nicht mehr gibt. Caddy liefert echte 301er,
  // das hier ist nur der Fallback (Meta-Refresh) für andere Webserver.
  redirects: {
    '/widerruf/': mitBase('/kontakt/'),
    '/cookie-einstellungen/': mitBase('/datenschutz/'),
  },
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/widerruf/') && !page.includes('/cookie-einstellungen/'),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
    define: {
      'import.meta.env.NOINDEX': JSON.stringify(process.env.NOINDEX ?? ''),
    },
  },
});
