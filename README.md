# Erlebnisbauernhof Leyh – Website

Statische Website für leyhhof.de, gebaut mit [Astro](https://astro.build) und Tailwind CSS.
Bauplan: `docs/konzept.md`, Textquelle: `docs/inhalte.md` (alle Texte 1:1 von der Jimdo-Seite).

## Deploy in 5 Zeilen

```sh
npm ci                      # Abhängigkeiten
npm run build               # erzeugt dist/ (HTML, CSS, Bilder – kein Node auf dem Server nötig)
rsync -az --delete dist/ deploy@server:/var/www/leyhhof/
# Caddyfile nach /etc/caddy/Caddyfile kopieren, dann:
sudo systemctl reload caddy  # HTTPS kommt automatisch
```

Automatisch: `.github/workflows/deploy.yml` baut, testet und deployt bei jedem Push auf `main`.
Dafür im Repo die Secrets `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_SSH_KEY` (und optional `DEPLOY_PATH`) anlegen.

## Entwickeln

```sh
npm run dev          # http://localhost:4321 mit Live-Reload
npm run build        # Produktions-Build nach dist/
npm run preview      # dist/ lokal ansehen
npm test             # Playwright + axe-core: alle Seiten, WCAG 2.1 AA, keine externen Requests
npm run lighthouse   # Lighthouse für alle Seiten (Ziel ≥ 95), Reports in lighthouse/
```

Für `npm test` einmalig `npx playwright install chromium` ausführen. Ist bereits ein Chromium
installiert, kann der Pfad per `PW_CHROMIUM_PATH=/pfad/zu/chrome` gesetzt werden
(Lighthouse: `CHROME_PATH`).

## Texte ändern (ohne Code)

| Was | Wo |
|---|---|
| Startseite, Landwirtschaft, Buch, Kontakt, Impressum, Datenschutz | `src/content/seiten/*.md` (Frontmatter + Text) |
| Angebotsseiten Bauernhof / Ponys / Schulklassen | `src/content/angebote/*.json` |
| Adresse, Telefon, E-Mail, Instagram, Navigation, „Was gibt es zu beachten?“ | `src/content/hof.json` |
| Status Eltern-Kind-Gruppe („-alle Termine in 2025 sind ausgebucht-“) | `src/content/angebote/bauernhof.json` → `elternKindGruppeStatus` |

Die Schemas (Pflichtfelder) stehen in `src/content.config.ts`; ein Tippfehler im Feldnamen bricht den Build mit klarer Meldung.

## Bilder einsetzen

Alle Fotos sind aktuell **farbige Platzhalter** (erzeugt von `scripts/platzhalter.mjs`).
Sobald die Originale aus Jimdo exportiert sind: Datei in `src/images/` mit gleichem Namen ersetzen,
`npm run build` – AVIF/WebP und `srcset` entstehen automatisch.

| Datei | Motiv (aus inhalte.md) |
|---|---|
| `src/images/hero-home.jpg` | Home-Hero: Kinder auf dem Trettraktor (laut Konzept nicht das Luftbild) |
| `src/images/kinder-trettraktor.jpg` | Home-Karte „Moderne Landwirtschaft“: Kinder auf Trettraktor |
| `src/images/ute-kaelbchen.jpg` | Home-Karte „Mehr Generationen Betrieb“: Ute Leyh mit Kälbchen im Iglu |
| `src/images/angebot-bauernhof.jpg` | Kachel Bauernhof: Oldtimer-Traktor mit Kindern |
| `src/images/angebot-ponys.jpg` | Kachel Ponys: Kindergruppe auf Strohballen |
| `src/images/angebot-schulklassen.jpg` | Kachel Schulklassen: Kinder im Gemüsegarten |
| `src/images/hero-landwirtschaft.jpg` | Landwirtschaft-Hero: Traktor mit Ladewagen |
| `src/images/luftbild-hof.jpg` | Landwirtschaft, unten: Luftbild des Hofs |
| `src/images/hero-buch.jpg` | Buch-Hero: Frau mit Blumenkorb |
| `src/images/buchcover.jpg` | Buchcover „Meine Liebe zum Land“ (Rechte beim Verlag prüfen) |
| `src/icons/logo.svg` + `public/favicon.svg` | Logo Kuh mit Sonnenblume (aktuell selbst gezeichneter Platzhalter) |
| `public/og.jpg` | Vorschaubild für WhatsApp/Facebook (1200×630), z. B. aus dem Hero-Foto |
| `public/karte.png` | Anfahrtskarte: `node scripts/karte.mjs` holt einen OpenStreetMap-Ausschnitt (braucht Internet) |

Alt-Texte stehen bei den Bildern in den Content-Dateien und sollten zum echten Foto passen.

## Vor dem Launch klären (aus inhalte.md / konzept.md)

- **Widersprüche im Original**, 1:1 übernommen, Familie Leyh entscheidet:
  E-Mail `info@leyhhof.de` (Schulklassen, Footer) vs. `info@leyh-hof.de` (Impressum, Datenschutz) ·
  Telefon `09531 8496` vs. `+49 1512 3370434` (Impressum) · Ortsname Losbergsgereuth vs. „Losbergereuth“ im Navi-Hinweis ·
  Anrede Ihr/Euch vs. Sie.
- **Eltern-Kind-Gruppe**: Status 2026/2027 (Feld `elternKindGruppeStatus`).
- **Impressum**: § 5 DDG statt TMG und „Steuernummer“ statt „USt-ID“ sind umgesetzt. Die Standardtexte
  (Haftung für Inhalte/Links, Urheberrecht) sind der übliche Generator-Wortlaut und sollten mit der Live-Seite verglichen werden
  (die Seite war aus der Build-Umgebung nicht abrufbar).
- **Datenschutzerklärung**: neu und kurz (nur Server-Logs, keine Cookies, keine externen Dienste) – gegenlesen lassen.
  Löschfrist der Logfiles (14 Tage) muss zur Caddy-Konfiguration passen.
- **Geo-Koordinaten** in `src/content/hof.json` (ca. 50.08 N, 10.73 O) mit Karte prüfen, dann `node scripts/karte.mjs`.
- **Schwarzer Block auf der alten Startseite** (Video oder Karte?) im Jimdo-Backend prüfen; ist nicht übernommen.
- **Kanonische Domain**: aktuell `https://leyhhof.de` (www → ohne www). Bei Änderung `SITE` in `astro.config.mjs`,
  `public/robots.txt` und das Caddyfile anpassen.

## Struktur

```
src/content/        Texte (seiten/*.md, angebote/*.json, hof.json)
src/components/     Hero, AngebotKachel, AngebotKarte, Infobox, Kontaktbox, Zahlen, WellenDivider, Nav, Footer, Button, Icon, Preisschild
src/layouts/        Base.astro (Head, SEO, JSON-LD, Nav, Footer), Angebot.astro (Template der drei Angebotsseiten)
src/pages/          spiegelt die URLs (Trailing Slash wie bei Jimdo)
src/icons/          handgezeichnete SVG-Icons (currentColor, 2px Linie)
src/images/         Quellbilder, werden von astro:assets optimiert
src/styles/         global.css – Design-Tokens (Farben, Fraunces) als Tailwind-Theme
public/             robots.txt, favicon.svg, og.jpg, karte.png
tests/              Playwright + axe
scripts/            platzhalter.mjs, karte.mjs, lighthouse.mjs, screenshot.mjs
Caddyfile           Webserver inkl. 301-Weiterleitungen für /widerruf/ und /cookie-einstellungen/
```

Technische Eckpunkte: kein JavaScript außer dem kleinen Mobil-Menü-Helfer, keine externen Requests
(Fraunces self-hosted, keine Google Fonts/Maps/Analytics), daher kein Cookie-Banner.
Kontraste: Primär-Buttons nutzen `--wiese-dunkel` und `--mohn-dunkel`, weil weißer Text auf `--wiese`/`--mohn`
nur ~4:1 bzw. ~3,7:1 erreicht; auf `--sonne` und `--himmel` steht immer dunkler Text.
