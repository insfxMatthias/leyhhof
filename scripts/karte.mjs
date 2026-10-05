// Erzeugt public/karte.png als statischen OpenStreetMap-Ausschnitt (kein Live-Embed,
// kein Cookie-Banner). Holt 3×3 Kacheln vom OSM-Tileserver, setzt einen Marker
// und die Pflicht-Attribution. Einmal lokal ausführen, Ergebnis einchecken:
//
//   node scripts/karte.mjs
//
// Koordinaten kommen aus src/content/hof.json (geo.lat / geo.lon).
// Nutzungsbedingungen: https://operations.osmfoundation.org/policies/tiles/
import sharp from 'sharp';
import { readFileSync } from 'node:fs';

const hof = JSON.parse(readFileSync(new URL('../src/content/hof.json', import.meta.url), 'utf8'));
const { lat, lon } = hof.geo;
const ZOOM = 14;
const N = 3; // Kacheln pro Seite (3×3 = 768×768 px)

const toTile = (lat, lon, z) => {
  const n = 2 ** z;
  const x = ((lon + 180) / 360) * n;
  const latRad = (lat * Math.PI) / 180;
  const y = ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n;
  return { x, y };
};

const mitte = toTile(lat, lon, ZOOM);
const x0 = Math.floor(mitte.x) - Math.floor(N / 2);
const y0 = Math.floor(mitte.y) - Math.floor(N / 2);

const kacheln = [];
for (let dy = 0; dy < N; dy++) {
  for (let dx = 0; dx < N; dx++) {
    const url = `https://tile.openstreetmap.org/${ZOOM}/${x0 + dx}/${y0 + dy}.png`;
    const res = await fetch(url, { headers: { 'User-Agent': 'leyhhof.de Kartenbild-Generator (einmalig, Kontakt: info@leyhhof.de)' } });
    if (!res.ok) throw new Error(`${url}: ${res.status}`);
    kacheln.push({ input: Buffer.from(await res.arrayBuffer()), left: dx * 256, top: dy * 256 });
    await new Promise((r) => setTimeout(r, 250));
  }
}

const B = N * 256;
const mx = Math.round((mitte.x - x0) * 256);
const my = Math.round((mitte.y - y0) * 256);
const overlay = `<svg xmlns="http://www.w3.org/2000/svg" width="${B}" height="${B}">
  <g transform="translate(${mx} ${my - 36})">
    <path d="M0 -34 C -19 -34 -30 -21 -30 -8 C -30 12 0 36 0 36 C 0 36 30 12 30 -8 C 30 -21 19 -34 0 -34 Z" fill="#C2431E" stroke="#FFF8EC" stroke-width="3"/>
    <circle r="9" cy="-9" fill="#FFF8EC"/>
  </g>
  <rect x="0" y="${B - 22}" width="${B}" height="22" fill="#FFFFFF" opacity="0.85"/>
  <text x="${B - 6}" y="${B - 7}" font-family="DejaVu Sans, Arial, sans-serif" font-size="12" text-anchor="end" fill="#3B2F2A">© OpenStreetMap-Mitwirkende</text>
</svg>`;

await sharp({ create: { width: B, height: B, channels: 3, background: '#EEF3E6' } })
  .composite([...kacheln, { input: Buffer.from(overlay), left: 0, top: 0 }])
  .resize(1200, 800, { fit: 'cover' })
  .png({ compressionLevel: 9 })
  .toFile(new URL('../public/karte.png', import.meta.url));

console.log(`public/karte.png erzeugt (Zoom ${ZOOM}, Mitte ${lat}, ${lon}).`);
