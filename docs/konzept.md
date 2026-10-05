# Konzept: Neue Website Erlebnisbauernhof Leyh

Stand: 2026-10-05 · Auftraggeber: Familie Leyh, Losbergsgereuth · Umsetzung: Claude Code
Begleitdatei: `inhalte.md` (alle Texte 1:1 von der bestehenden Seite)

---

## 0. Auftrag in drei Sätzen

Die bestehende Jimdo-Seite leyhhof.de zieht auf einen eigenen Webserver um. Schritt 1: alle Inhalte 1:1 übernehmen, aber Design, Technik und Struktur komplett neu – moderner, lebensfroher, schneller. Schritt 2 (später, nicht Teil dieses Konzepts): Texte überarbeiten, neue Funktionen.

**Für Claude Code:** Dieses Dokument ist der Bauplan. `inhalte.md` ist die Textquelle – nichts umformulieren, nichts weglassen, nichts dazuerfinden. Nur die `[!]`-Hinweise sind Arbeitsanweisungen.

---

## 1. Ausgangslage

Die aktuelle Seite ist ein Jimdo-Template von ca. 2019: Serifen-Headlines (Cinzel-artig), erdiges Oliv/Beige, dunkle Hero-Overlays, schwarze Buttons. Inhaltlich gut, optisch müde. Technisch: Google Analytics, Google Fonts, Google Maps, Cookie-Banner, Jimdo-Widerrufsformular ohne Shop.

Was die Seite leisten muss:

| Besucher | Will | Muss in 10 Sekunden finden |
|---|---|---|
| Eltern (Kindergeburtstag) | Angebot verstehen, buchen | Geburtstagsvarianten, Dauer, Telefonnummer |
| Lehrkräfte / Kita / Lebenshilfe | Unterricht buchen, Kosten | „160 € / 4 Std., Grundschule 2.–4. kostenlos", Kontakt |
| Familien (Tagesausflug) | Was gibt's, wo ist das | Anfahrt mit Navi-Hinweis |
| Leser der Landfrauenküche | Utes Buch | Kauflink |

Alle Zielgruppen kommen überwiegend über das Handy. **Mobile first ist keine Option, sondern Pflicht.**

---

## 2. Gestaltungsidee: „Ein Tag auf dem Hof"

Die Seite soll sich anfühlen wie ein Sommertag auf dem Hof: hell, warm, viel Luft, kräftige Farben aus Wiese, Himmel und Sonne. Keine dunklen Overlays, keine schwarzen Flächen. Fotos sind der Star – sie werden groß und unbearbeitet gezeigt, nicht abgedunkelt.

### 2.1 Farben

| Token | Hex | Rolle |
|---|---|---|
| `--wiese` | `#3E8E41` | Primärfarbe: Buttons, Links, Akzente |
| `--wiese-dunkel` | `#2C6B2F` | Hover, Headline-Farbe auf hellem Grund |
| `--sonne` | `#F5B822` | Sekundär: Highlights, Badges, Hover-Flächen, Icons |
| `--himmel` | `#4FA3DD` | Tertiär: Info-Boxen, Schulklassen-Bereich |
| `--mohn` | `#E4572E` | Akzent (sparsam): Call-to-Action „Anrufen", Hinweise |
| `--creme` | `#FFF8EC` | Seitenhintergrund (kein reines Weiß) |
| `--stroh` | `#F3E6C4` | Abgesetzte Sektionen, Karten-Hintergrund |
| `--erde` | `#3B2F2A` | Fließtext, Footer-Hintergrund |

Kontraste: Fließtext `--erde` auf `--creme` ≥ 12:1. Weißer Text auf `--wiese` ≥ 4.5:1. Weißer Text auf `--sonne` reicht **nicht** – dort immer `--erde` als Textfarbe. Claude Code prüft alle Kombinationen mit einem Kontrast-Check im Build (z. B. `axe-core` in Playwright).

Pro Angebotsbereich eine Leitfarbe, damit man sich orientiert: Bauernhof = Wiese, Ponys = Sonne, Schulklassen = Himmel.

### 2.2 Typografie

- **Headlines:** „Fraunces" (variable, Soft-Serif mit Charakter, wirkt handgemacht ohne kitschig zu sein) – self-hosted, kein Google-Fonts-Aufruf.
- **Fließtext/UI:** „Inter" oder System-Stack (`system-ui, -apple-system, Segoe UI, Roboto, sans-serif`). Empfehlung: System-Stack. Spart 100 KB und ist auf dem Hof mit schlechtem Netz spürbar.
- Größen: Fließtext 18px mobil / 19px Desktop, Zeilenlänge max. 70 Zeichen. H1 `clamp(2.2rem, 6vw, 4rem)`.

### 2.3 Formensprache

- Abgerundete Ecken (16–24px) auf Karten und Bildern, Buttons als Pille.
- Sektionen mit leicht gewellten Übergängen (SVG-Divider) statt harter Kanten – zitiert Hügel/Haßberge, aber dezent: maximal 2 pro Seite.
- Handgezeichnete Icons (Kuh, Pony, Traktor, Schulranzen, Sonnenblume) als SVG, einfarbig in `--erde`, Linienstärke 2px. Claude Code erstellt die SVGs selbst, keine Icon-Libraries mit 1.000 Icons einbinden.
- Microinteractions: Karten heben sich beim Hover leicht an, Buttons bekommen einen Farbwechsel, sonst nichts. Keine Parallax-Effekte, keine Scroll-Animationen, die auf dem Handy ruckeln. `prefers-reduced-motion` respektieren.

### 2.4 Bildsprache

Die vorhandenen Fotos (Liste in `inhalte.md`) sind gut und authentisch. Regeln:
- Nie abdunkeln. Text steht neben oder unter dem Bild, nicht drauf. Ausnahme: Hero mit Text in einer hellen Karte über dem Bild (nicht Overlay über dem ganzen Bild).
- Hero-Bild Home: nicht das Luftbild (Bagger, Silos, Parkplatz – das verkauft nicht). Nehmen: Kinder auf dem Traktor oder Ute mit Kälbchen. Luftbild wandert zu „Moderne Landwirtschaft".
- Formate: AVIF + WebP mit JPEG-Fallback, responsive `srcset`, `loading="lazy"` außer Hero.

---

## 3. Seitenstruktur

URLs bleiben identisch zur alten Seite (SEO, bestehende Links, Google-Eintrag).

```
/                               Home
/unsere-angebote/               Übersicht (3 Bereiche)
/unsere-angebote/bauernhof/     Bauernhofgeburtstage, Eltern-Kind-Gruppe
/unsere-angebote/ponys/         Ponygeburtstage
/unsere-angebote/schulklassen/  Unterricht auf dem Bauernhof
/moderne-landwirtschaft/
/mein-buch/
/kontakt/
/impressum/
/datenschutz/
```

Entfällt: `/widerruf/`, `/cookie-einstellungen/` → 301 auf `/kontakt/` bzw. `/datenschutz/`.

### 3.1 Home – Sektionen von oben nach unten

1. **Hero:** großes Foto, daneben/darüber helle Karte mit H1 „Erlebnisbauernhof Leyh", Unterzeile „Wir freuen uns auf Euren Besuch!" (Originaltext), zwei Buttons: „Unsere Angebote" (primär, Wiese) und „Anrufen: 09531 8496" (`tel:`-Link, Mohn).
2. **Intro:** der Willkommensabsatz 1:1.
3. **Angebote in drei Kacheln** (Bauernhof / Ponys / Schulklassen) mit Foto, Leitfarbe, Ein-Satz-Teaser aus dem jeweiligen Originaltext, Link. Das ist neu auf der Home – die alte Seite versteckt die Angebote hinter einem Dropdown.
4. **Hof in Zahlen** (neu, nur aus vorhandenen Fakten): „300+ Jahre Familienbesitz · 3 Generationen · 140 Milchkühe · 200 ha · Wärme fürs halbe Dorf". Große Zahlen in Fraunces, Sonne-Akzent.
5. **„Was zeichnet uns aus?"** – zwei Karten wie im Original (Moderne Landwirtschaft / Mehr Generationen Betrieb), Texte 1:1, Buttons wie Original.
6. **Instagram-Hinweis:** kein eingebetteter Feed (Tracking, Ladezeit), sondern eine Kachel „Folgt uns auf Instagram: @erlebnisbauernhof_leyh" mit Link.
7. **Anfahrt kurz:** Adresse + Navi-Hinweis + Button zur Kontaktseite.

### 3.2 Angebotsseiten – gemeinsames Muster

Jede der drei Seiten hat denselben Aufbau, damit Claude Code ein Template bauen kann:

1. Kopf mit Leitfarbe, H1, Foto
2. Einleitungstext (1:1)
3. **Angebotskarten:** jedes Angebot (Bauernhofgeburtstag, Pferdegeburtstag, Zirkus…) als Karte mit Icon, Titel, Text 1:1
4. **Infobox „Was gibt es zu beachten?"** – die fünf Punkte als Checkliste mit Icons (Uhr, Brotzeit, T-Shirt, Helm, Eltern). Steht auf Bauernhof und Ponys; als wiederverwendbare Komponente.
5. **Kontaktbox „Anmeldung bitte bei:"** mit Name, Telefonnummer als `tel:`-Link, großer Button. Bauernhof + Schulklassen → Familie Leyh; Ponys → Christine Dumsky. Satz „Um eine rechtzeitige Anmeldung wird gebeten…" 1:1.
6. Preis (Schulklassen/Unterricht): „160,- € für 4 Std." als sichtbares Preisschild in Sonne; Kostenübernahme-Text 1:1 direkt darunter in Himmel-Infobox.

Hinweis Eltern-Kind-Gruppe: Zeile „-alle Termine in 2025 sind ausgebucht-" als Badge (Mohn) darstellen und als **einzelne Variable** in den Content-Daten halten, damit sie ohne Code-Änderung aktualisiert werden kann.

### 3.3 Kontakt

Adresse, Navi-Hinweis 1:1, Telefon, E-Mail. Karte: **OpenStreetMap als statisches Bild** (Leaflet-Tile-Screenshot im Repo) mit Link „Route in Google Maps / Apple Karten öffnen". Keine Live-Einbettung → kein Cookie-Banner nötig. Zusätzlich: „Mit dem Handy anrufen"-Button.

Kein Kontaktformular in Schritt 1. Die Familie arbeitet mit Telefon, das funktioniert. Ein Formular braucht Mailserver, Spam-Schutz, DSGVO-Text – Schritt 2.

### 3.4 Impressum / Datenschutz

Impressum aus `inhalte.md` mit den `[!]`-Korrekturen (DDG statt TMG, Steuernummer-Bezeichnung). Datenschutzerklärung neu und kurz: Hosting (Server-Logs), keine Cookies, keine externen Dienste, Links zu Instagram/genialokal. Claude Code legt eine Vorlage an, Matthias lässt sie gegenlesen.

---

## 4. Technik

### 4.1 Stack

| Ebene | Entscheidung | Warum |
|---|---|---|
| Framework | **Astro** (aktuelle Major-Version) | Statisches HTML, null JS by default, Content Collections für die Texte, Bildoptimierung eingebaut |
| Styling | Tailwind CSS mit den Tokens aus 2.1 als Theme | schnell, konsistent, keine CSS-Dateien pflegen |
| Inhalte | Markdown/JSON in `src/content/` – ein File pro Seite, Angebote als Array | Familie Leyh oder Matthias ändern Texte ohne Code |
| Bilder | `astro:assets`, Quellbilder in `src/images/` | automatische AVIF/WebP + srcset |
| Icons | eigene SVGs in `src/icons/`, als Astro-Komponente | kein Icon-Font |
| Fonts | Fraunces self-hosted (`@fontsource-variable/fraunces`) | kein Google-Aufruf |
| Tests | Playwright + axe-core: alle Seiten laden, keine A11y-Fehler, Lighthouse ≥ 95 in allen Kategorien | Qualitätssicherung automatisiert |
| Deploy | `astro build` → `dist/` → per rsync/GitHub Action auf den Server; **Caddy** als Webserver (automatisches HTTPS) | einfachste Lösung für statische Seite |
| Analytics | keine in Schritt 1. Optional später: Plausible/Umami self-hosted, cookiefrei | kein Banner |

Kein CMS, keine Datenbank, kein Node auf dem Server. Was auf dem Server liegt, ist ein Ordner mit HTML, CSS und Bildern.

### 4.2 Repo-Struktur

```
leyhhof/
├── src/
│   ├── content/
│   │   ├── seiten/        home.md, landwirtschaft.md, buch.md, kontakt.md, impressum.md, datenschutz.md
│   │   └── angebote/      bauernhof.json, ponys.json, schulklassen.json
│   ├── components/        Hero, AngebotKarte, Infobox, Kontaktbox, Zahlen, WellenDivider, Nav, Footer
│   ├── layouts/           Base.astro, Angebot.astro
│   ├── pages/             spiegelt die URL-Struktur aus 3.
│   ├── icons/             kuh.svg, pony.svg, traktor.svg, schule.svg, sonnenblume.svg, uhr.svg, helm.svg …
│   └── images/
├── public/                favicon, robots.txt, karte.png
├── tests/                 playwright
├── Caddyfile
└── README.md              Deploy-Anleitung in 5 Zeilen
```

### 4.3 Pflichtanforderungen

- **Barrierefreiheit:** WCAG 2.1 AA. Semantisches HTML, sichtbarer Fokus, Skip-Link, Alt-Texte für alle Fotos (konkret, nicht „Bild"), Kontraste wie oben. Das ist bei uns Standard, nicht Feature.
- **Performance:** Startseite < 300 KB inkl. Hero-Bild mobil, LCP < 1,5 s auf 3G-Simulation.
- **SEO:** Title/Description je Seite, Open-Graph-Bild, `LocalBusiness`-JSON-LD mit Adresse, Telefon, Öffnungszeiten „nach Vereinbarung", Geo-Koordinaten (Losbergsgereuth: ca. 50.08 N, 10.73 O – vor Launch mit Karte prüfen). Sitemap, robots.txt, canonical.
- **Navigation:** Angebote direkt sichtbar, kein Dropdown mobil – auf dem Handy ein Vollbild-Menü mit den 7 Einträgen. Sticky Header mit Telefon-Button rechts.
- **Konsequente Anrede:** Du/Ihr wie im Original-Willkommenstext. Die zwei „Sie"-Sätze (Ponys, Schulklassen) bleiben in Schritt 1 wörtlich stehen – wird in Schritt 2 vereinheitlicht.
- **Keine externen Requests** außer Links, die der Nutzer aktiv klickt.

---

## 5. Umzug von Jimdo

Reihenfolge, Verantwortliche in Klammern:

1. **Bilder und Logo aus Jimdo exportieren** (Matthias/Familie Leyh) – Jimdo bietet keinen Export; Bilder einzeln in Originalauflösung aus dem Backend herunterladen. Liste in `inhalte.md`.
2. **Widersprüche klären** (Familie Leyh) – Tabelle am Ende von `inhalte.md`: welche E-Mail, welche Telefonnummer, Status Eltern-Kind-Gruppe 2026.
3. **Build + Review** (Claude Code → Matthias) – Vorschau-Link auf dem neuen Server unter Subdomain, z. B. `neu.leyhhof.de`.
4. **Server vorbereiten** (Matthias) – VPS mit Caddy, Nutzer für Deploy, GitHub Action mit rsync.
5. **Domain umziehen** (Matthias) – Domain bei Jimdo registriert? Dann Auth-Code anfordern, zu eigenem Registrar transferieren; Transfer dauert bis 5 Tage. Vorher TTL auf 300 s senken. Mail-Adresse `info@leyhhof.de`: läuft die über Jimdo? Dann vor dem Umzug MX-Einträge und neuen Mail-Anbieter klären, sonst ist die Adresse tot.
6. **DNS umstellen, Jimdo kündigen** – erst kündigen, wenn die neue Seite 2 Wochen stabil läuft.
7. **Google Business Profile** aktualisieren (Website-URL bleibt, Fotos ggf. neu).

---

## 6. Was in Schritt 1 bewusst nicht drin ist

Damit es nicht aus dem Ruder läuft:

- Textüberarbeitung (Tippfehler, Sie/Du, „Indianergeburtstag" ist 2026 ein Thema, das die Familie entscheiden muss)
- Kontakt-/Buchungsformular, Online-Terminkalender
- Instagram-Feed-Einbettung
- Blog / Aktuelles / Jahreszeiten-Kalender
- Mehrsprachigkeit
- Analytics

Alles davon ist mit dem gewählten Stack später in Stunden nachrüstbar. Ideen für Schritt 2, die aus den vorhandenen Inhalten naheliegen: „Jahreszeiten auf dem Hof" (passt zum Buch und zur Eltern-Kind-Gruppe), Angebotsfinder („Wie alt sind die Kinder? Was mögen sie?"), Buchungsanfrage mit Wunschtermin.

---

## 7. Prompt für Claude Code

Wörtlich übergeben:

> Baue die Website für den Erlebnisbauernhof Leyh nach `konzept.md`. Alle Texte kommen 1:1 aus `inhalte.md` – nicht umformulieren, nicht ergänzen; nur `[!]`-Hinweise umsetzen. Stack: Astro + Tailwind, statisch, keine externen Requests, self-hosted Fraunces. Farben, Typo und Komponenten aus Abschnitt 2 und 3. Lege das Repo wie in 4.2 an. Bilder liegen noch nicht vor: verwende benannte Platzhalter (`src/images/hero-home.jpg` usw.) mit der Liste aus `inhalte.md` und einem farbigen SVG-Platzhalter, damit die Seite baut. Schreibe Playwright-Tests mit axe-core für alle Seiten. Ziel: Lighthouse ≥ 95 in allen Kategorien. Erstelle ein Caddyfile und eine README mit Deploy-Anleitung. Fang mit dem Home-Layout an und zeig mir einen Screenshot, bevor du die Unterseiten baust.
