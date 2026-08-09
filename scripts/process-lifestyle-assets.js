const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const rawDir = path.join(__dirname, "..", "public", "brand", "_raw");
const outDir = path.join(__dirname, "..", "public", "brand", "lifestyle");
const fleetDir = path.join(__dirname, "..", "public", "brand", "fleet");
fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(fleetDir, { recursive: true });

async function keyWhite(src, dest, threshold = 245) {
  const { data, info } = await sharp(src)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (r >= threshold && g >= threshold && b >= threshold) {
      data[i + 3] = 0;
    } else if (r > 230 && g > 230 && b > 230) {
      const avg = (r + g + b) / 3;
      data[i + 3] = Math.max(0, Math.min(255, Math.round((255 - avg) * 8)));
    }
  }
  await sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .trim({ threshold: 8 })
    .png()
    .toFile(dest);
}

async function optimizePhoto(src, dest, width) {
  await sharp(src)
    .resize({ width, withoutEnlargement: true })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(dest);
}

(async () => {
  // Multimodal India collage → transparent hero
  await keyWhite(
    path.join(rawDir, "img4.png"),
    path.join(outDir, "india-multimodal.png"),
    248,
  );
  await sharp(path.join(outDir, "india-multimodal.png"))
    .resize({ width: 1200, withoutEnlargement: true })
    .png({ compressionLevel: 9 })
    .toFile(path.join(outDir, "india-multimodal-lg.png"));

  // Orange fleet cutout
  await keyWhite(
    path.join(rawDir, "img5.png"),
    path.join(fleetDir, "saffron-truck.png"),
    246,
  );
  await sharp(path.join(fleetDir, "saffron-truck.png"))
    .resize({ width: 900, withoutEnlargement: true })
    .png()
    .toFile(path.join(fleetDir, "saffron-truck-lg.png"));

  // Indian truck-art vector cutout
  await keyWhite(
    path.join(rawDir, "img6.png"),
    path.join(fleetDir, "india-truck-art.png"),
    248,
  );
  await sharp(path.join(fleetDir, "india-truck-art.png"))
    .resize({ width: 800, withoutEnlargement: true })
    .png()
    .toFile(path.join(fleetDir, "india-truck-art-lg.png"));

  // Port photo for atmospheric backgrounds
  await optimizePhoto(
    path.join(rawDir, "img2.png"),
    path.join(outDir, "port-yard.jpg"),
    1400,
  );

  // Bullock cart cultural photo
  await optimizePhoto(
    path.join(rawDir, "img3.png"),
    path.join(outDir, "bullock-cart.jpg"),
    1000,
  );

  // Horse cart lifestyle
  await optimizePhoto(
    path.join(rawDir, "img1.png"),
    path.join(outDir, "horse-cart.jpg"),
    1000,
  );

  // Also copy any courier-like "2-ddce" if present
  const extras = fs.readdirSync(rawDir).filter((f) => f.includes("2-ddce") || f.includes("124402"));
  for (const f of extras) {
    const dest = path.join(outDir, "courier-hero.png");
    try {
      await keyWhite(path.join(rawDir, f), dest, 250);
      console.log("Processed courier", f);
    } catch (e) {
      await sharp(path.join(rawDir, f))
        .resize({ width: 900 })
        .png()
        .toFile(dest);
    }
  }

  console.log("Lifestyle/fleet assets ready");
  for (const dir of [outDir, fleetDir]) {
    console.log(
      dir,
      fs.readdirSync(dir).map((n) => `${n}:${fs.statSync(path.join(dir, n)).size}`),
    );
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
