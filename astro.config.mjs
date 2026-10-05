// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Kanonische Adresse der Seite. Bei www-Variante hier und im Caddyfile anpassen.
export const SITE = 'https://leyhhof.de';

export default defineConfig({
  site: SITE,
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
    breakpoints: [480, 640, 768, 1024, 1280, 1600, 1920],
  },
  // Alte Jimdo-URLs, die es nicht mehr gibt. Caddy liefert echte 301er,
  // das hier ist nur der Fallback (Meta-Refresh) für andere Webserver.
  redirects: {
    '/widerruf/': '/kontakt/',
    '/cookie-einstellungen/': '/datenschutz/',
  },
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/widerruf/') && !page.includes('/cookie-einstellungen/'),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
