// Bereitet das Logo (leyhlogo, transparentes WebP) für die Website auf:
//   src/images/leyhlogo.png      beschnittenes Logo für Header/Footer (astro:assets)
//   public/favicon.png           Kuhkopf, 96×96
//   public/apple-touch-icon.png  Kuhkopf, 180×180
//   node scripts/logo.mjs <quelle.webp>
import sharp from 'sharp';
const quelle = process.argv[2] ?? 'src/images/leyhlogo-original.webp';

const logo = sharp(quelle).trim({ threshold: 10 });
const { width, height } = await logo.clone().png().toBuffer().then((b) => sharp(b).metadata());
await logo.clone().png({ compressionLevel: 9, palette: false }).toFile('src/images/leyhlogo.png');
console.log(`src/images/leyhlogo.png ${width}×${height}`);

// Favicon: quadratischer Ausschnitt um den Kuhkopf (Anteile am beschnittenen Logo)
const kopf = { left: Math.round(width * 0.18), top: Math.round(height * 0.23), size: Math.round(width * 0.64) };
for (const [datei, px] of [['public/favicon.png', 96], ['public/apple-touch-icon.png', 180]]) {
  await sharp(await logo.clone().png().toBuffer())
    .extract({ left: kopf.left, top: kopf.top, width: kopf.size, height: kopf.size })
    .resize(px, px)
    .png({ compressionLevel: 9 })
    .toFile(datei);
  console.log(datei);
}
