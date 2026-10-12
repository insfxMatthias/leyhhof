import type { APIRoute } from 'astro';
import { absolut } from '../lib/url';

// Live: alles erlaubt + Sitemap. Präsentations-Kopie (NOINDEX=1): alles gesperrt.
export const GET: APIRoute = ({ site }) => {
  const noindex = import.meta.env.NOINDEX === '1' || import.meta.env.NOINDEX === 'true';
  const text = noindex
    ? 'User-agent: *\nDisallow: /\n'
    : `User-agent: *\nAllow: /\n\nSitemap: ${absolut('/sitemap-index.xml', site)}\n`;
  return new Response(text, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
