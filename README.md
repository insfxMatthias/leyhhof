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

## Bilder

Die Fotos liegen in `src/images/` und werden beim Build automatisch zu AVIF/WebP mit JPEG-Fallback
und `srcset` verarbeitet (Komponente `src/components/Foto.astro`, Breakpoints in `astro.config.mjs`).
Neues Foto: Datei ersetzen oder in der Content-Datei referenzieren, `npm run build`.

| Datei | Verwendung |
|---|---|
| `hero-home.webp` | Home-Hero: Kinder auf dem Trettraktor (auch Quelle für `public/og.jpg`, siehe `scripts/og.mjs`) |
| `kuhstall.webp` | Home-Karte „Moderne Landwirtschaft“ (statt des zweiten Trettraktor-Fotos der alten Seite) |
| `ute-kaelbchen.webp` | Home-Karte „Mehr Generationen Betrieb“ |
| `angebot-bauernhof.webp` | Kachel Bauernhof (Oldtimer-Traktor) |
| `angebot-ponys.webp` | Kachel + Kopfbild Ponys (Kinder auf Strohballen) |
| `angebot-schulklassen.webp` | Kachel Schulklassen (Gemüsegarten) |
| `kuh-streicheln.webp` | Kopfbild Bauernhof-Seite, zweites Bild auf „Moderne Landwirtschaft“ |
| `kinder-stallarbeit.webp` | Kopfbild Schulklassen-Seite |
| `hero-landwirtschaft.webp` | Kopfbild „Moderne Landwirtschaft“ (Kinder am Futtergitter) |
| `kinder-basteln.webp`, `ponyreiten.avif` | Karten Bauernhofgeburtstag / inkl. Ponyreiten |
| `pony.avif`, `indianer-wald.avif`, `einhorn-pony.avif` | Karten Pferde-, Indianer-, Einhorngeburtstag |

Logo: `src/images/leyhlogo-original.webp` ist die Quelle, `node scripts/logo.mjs src/images/leyhlogo-original.webp`
erzeugt daraus `leyhlogo.png` (Header/Footer) sowie `public/favicon.png` und `public/apple-touch-icon.png` (Kuhkopf).

Noch **Platzhalter** (erzeugt von `scripts/platzhalter.mjs`, Ersatz mit gleichem Dateinamen):

| Datei | Motiv |
|---|---|
| `src/images/hero-buch.jpg` | Buch-Hero: Frau mit Blumenkorb |
| `src/images/buchcover.jpg` | Buchcover „Meine Liebe zum Land“ (Rechte beim Verlag prüfen) |
| `public/karte.png` | Anfahrtskarte: `node scripts/karte.mjs` holt einen OpenStreetMap-Ausschnitt (braucht Internet) |

Noch nicht vorhanden, aber im Konzept vorgesehen: Luftbild des Hofs und Traktor mit Ladewagen für
„Moderne Landwirtschaft“. Wenn exportiert, in `src/content/seiten/landwirtschaft.md` eintragen.
Alt-Texte stehen bei den Bildern in den Content-Dateien.

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
src/components/     Hero, Foto, AngebotKachel, AngebotKarte, Infobox, Kontaktbox, Zahlen, WellenDivider, Nav, Footer, Button, Icon, Preisschild
src/layouts/        Base.astro (Head, SEO, JSON-LD, Nav, Footer), Angebot.astro (Template der drei Angebotsseiten)
src/pages/          spiegelt die URLs (Trailing Slash wie bei Jimdo)
src/icons/          handgezeichnete SVG-Icons (currentColor, 2px Linie)
src/images/         Quellbilder, werden von astro:assets optimiert
src/styles/         global.css – Design-Tokens (Farben, Fraunces) als Tailwind-Theme
public/             robots.txt, favicon.svg, og.jpg, karte.png
tests/              Playwright + axe
scripts/            platzhalter.mjs, logo.mjs, og.mjs, karte.mjs, lighthouse.mjs, screenshot.mjs
Caddyfile           Webserver inkl. 301-Weiterleitungen für /widerruf/ und /cookie-einstellungen/
```

Technische Eckpunkte: kein JavaScript außer dem kleinen Mobil-Menü-Helfer, keine externen Requests
(Fraunces self-hosted, keine Google Fonts/Maps/Analytics), daher kein Cookie-Banner.
Kontraste: Primär-Buttons nutzen `--wiese-dunkel` und `--mohn-dunkel`, weil weißer Text auf `--wiese`/`--mohn`
nur ~4:1 bzw. ~3,7:1 erreicht; auf `--sonne` und `--himmel` steht immer dunkler Text.
