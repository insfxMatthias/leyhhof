// Erzeugt public/og.jpg (1200×630, Vorschaubild für WhatsApp/Facebook/Google)
// aus dem Home-Hero-Foto. Nach Bildwechsel erneut ausführen: node scripts/og.mjs
import sharp from 'sharp';
await sharp('src/images/hero-home.webp')
  .rotate()
  .resize(1200, 630, { fit: 'cover', position: 'attention' })
  .jpeg({ quality: 82, mozjpeg: true })
  .toFile('public/og.jpg');
console.log('public/og.jpg erzeugt.');
