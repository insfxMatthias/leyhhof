/**
 * Interne Links mit dem Basis-Pfad versehen (astro.config `base`).
 * Für die Live-Domain ist base "/", für eine Präsentation in einem
 * Unterordner z. B. "/leyhhof/". Externe Links, tel:, mailto: und
 * Anker bleiben unverändert.
 */
const base = import.meta.env.BASE_URL.replace(/\/+$/, '');

export function url(pfad: string): string {
  if (!pfad.startsWith('/')) return pfad;
  return `${base}${pfad}` || '/';
}

/** Vergleich für aria-current: aktueller Pfad ohne Basis-Pfad */
export function pfadOhneBase(pathname: string): string {
  const p = base && pathname.startsWith(base) ? pathname.slice(base.length) : pathname;
  return p || '/';
}

/** Absolute URL (Site + Base + Pfad), für Canonical, Open Graph, JSON-LD */
export function absolut(pfad: string, site: URL | undefined): string {
  return new URL(url(pfad).replace(/^\//, ''), site ?? 'https://leyhhof.de/').href;
}
