// Erzeugt farbige Platzhalter-Bilder (JPEG/PNG) für die Fotos, die noch fehlen
// (Buch-Hero, Buchcover, Anfahrtskarte). Echte Fotos liegen in src/images/. Sobald das echte Foto
// vorliegt, einfach die Datei in src/images/ mit gleichem Namen ersetzen.
//
//   node scripts/platzhalter.mjs           erzeugt nur fehlende Dateien
//   node scripts/platzhalter.mjs --force   überschreibt alle
import sharp from 'sharp';
import { existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';

const FARBEN = {
  wiese: '#3E8E41', wieseDunkel: '#2C6B2F', sonne: '#F5B822', himmel: '#4FA3DD',
  mohn: '#E4572E', creme: '#FFF8EC', stroh: '#F3E6C4', erde: '#3B2F2A',
};

const BILDER = [
  { datei: 'src/images/hero-buch.jpg', b: 1600, h: 1000, titel: 'Buch-Hero', motiv: 'Frau mit Blumenkorb', ton: 'sonne' },
  { datei: 'src/images/buchcover.jpg', b: 800, h: 1200, titel: 'Buchcover', motiv: '„Meine Liebe zum Land“ (Rechte prüfen)', ton: 'stroh' },
  { datei: 'public/karte.png', b: 1200, h: 800, titel: 'Anfahrtskarte', motiv: 'OpenStreetMap-Ausschnitt (scripts/karte.mjs)', ton: 'karte' },
];

const force = process.argv.includes('--force');

function svg({ b, h, titel, motiv, ton, og, datei }) {
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const name = datei.split('/').pop();
  if (ton === 'karte') {
    // Stilisierte Karte: Wege, Wald, Marker
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${b}" height="${h}" viewBox="0 0 ${b} ${h}">
      <rect width="${b}" height="${h}" fill="#EEF3E6"/>
      <path d="M0 ${h * 0.62} Q ${b * 0.3} ${h * 0.5} ${b * 0.55} ${h * 0.58} T ${b} ${h * 0.4}" stroke="#FFFFFF" stroke-width="22" fill="none"/>
      <path d="M${b * 0.42} 0 Q ${b * 0.5} ${h * 0.3} ${b * 0.46} ${h * 0.56} T ${b * 0.6} ${h}" stroke="#FFFFFF" stroke-width="14" fill="none"/>
      <circle cx="${b * 0.18}" cy="${h * 0.25}" r="${h * 0.16}" fill="#CFE3B8"/>
      <circle cx="${b * 0.82}" cy="${h * 0.78}" r="${h * 0.2}" fill="#CFE3B8"/>
      <g transform="translate(${b * 0.5} ${h * 0.5})">
        <path d="M0 -70 C -38 -70 -60 -42 -60 -14 C -60 24 0 70 0 70 C 0 70 60 24 60 -14 C 60 -42 38 -70 0 -70 Z" fill="${FARBEN.mohn}" stroke="${FARBEN.creme}" stroke-width="6"/>
        <circle r="20" cy="-16" fill="${FARBEN.creme}"/>
      </g>
      <rect x="40" y="${h - 120}" width="${b - 80}" height="80" rx="20" fill="#FFFFFF" opacity="0.92"/>
      <text x="${b / 2}" y="${h - 70}" font-family="DejaVu Sans, sans-serif" font-size="30" text-anchor="middle" fill="${FARBEN.erde}">Platzhalter · ${esc(titel)} · ${esc(motiv)}</text>
    </svg>`;
  }
  const himmel = { wiese: '#CFE8FF', sonne: '#FFE9B0', himmel: '#BFE0FA', stroh: '#FFF1D6' }[ton] ?? '#CFE8FF';
  const huegel1 = { wiese: FARBEN.wiese, sonne: '#8CBF4F', himmel: '#6DB36B', stroh: '#A5C77A' }[ton];
  const huegel2 = { wiese: FARBEN.wieseDunkel, sonne: FARBEN.wiese, himmel: FARBEN.wieseDunkel, stroh: FARBEN.wiese }[ton];
  const fs = Math.round(b / 40);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${b}" height="${h}" viewBox="0 0 ${b} ${h}">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${himmel}"/><stop offset="1" stop-color="${FARBEN.creme}"/>
      </linearGradient>
    </defs>
    <rect width="${b}" height="${h}" fill="url(#g)"/>
    <circle cx="${b * 0.78}" cy="${h * 0.3}" r="${h * 0.11}" fill="${FARBEN.sonne}"/>
    <path d="M0 ${h * 0.72} C ${b * 0.25} ${h * 0.55} ${b * 0.45} ${h * 0.85} ${b * 0.7} ${h * 0.66} S ${b} ${h * 0.6} ${b} ${h * 0.62} V ${h} H 0 Z" fill="${huegel1}"/>
    <path d="M0 ${h * 0.86} C ${b * 0.3} ${h * 0.74} ${b * 0.55} ${h * 0.98} ${b} ${h * 0.8} V ${h} H 0 Z" fill="${huegel2}"/>
    ${og ? `<text x="${b / 2}" y="${h * 0.42}" font-family="DejaVu Serif, serif" font-weight="bold" font-size="${fs * 2.6}" text-anchor="middle" fill="${FARBEN.wieseDunkel}">Erlebnisbauernhof Leyh</text>` : ''}
    <rect x="${b * 0.05}" y="${h - fs * 4.2}" width="${b * 0.9}" height="${fs * 3}" rx="${fs}" fill="#FFFFFF" opacity="0.88"/>
    <text x="${b / 2}" y="${h - fs * 2.3}" font-family="DejaVu Sans, sans-serif" font-size="${fs}" text-anchor="middle" fill="${FARBEN.erde}">Platzhalter · ${esc(titel)}: ${esc(motiv)}</text>
    <text x="${b / 2}" y="${h - fs * 1.4}" font-family="DejaVu Sans Mono, monospace" font-size="${fs * 0.7}" text-anchor="middle" fill="${FARBEN.wieseDunkel}">${esc(name)}</text>
  </svg>`;
}

let erzeugt = 0;
for (const bild of BILDER) {
  const ziel = resolve(bild.datei);
  if (existsSync(ziel) && !force) continue;
  mkdirSync(dirname(ziel), { recursive: true });
  const pipeline = sharp(Buffer.from(svg(bild)), { density: 96 });
  if (ziel.endsWith('.png')) await pipeline.png({ compressionLevel: 9, palette: true }).toFile(ziel);
  else await pipeline.jpeg({ quality: 78, mozjpeg: true }).toFile(ziel);
  erzeugt++;
  console.log('erzeugt:', bild.datei);
}
console.log(erzeugt ? `${erzeugt} Platzhalter erzeugt.` : 'Alle Bilder vorhanden, nichts erzeugt.');
