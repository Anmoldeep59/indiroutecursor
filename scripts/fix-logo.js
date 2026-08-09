const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const brandDir = path.join(__dirname, "..", "public", "brand");

async function loadSource() {
  // Prefer original baked logo if present (has black plate)
  const candidates = [
    path.join(brandDir, "indiroute-logo.png"),
    path.join(brandDir, "logo.png"),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error("No logo source found");
}

async function processLogo(srcPath) {
  const { data, info } = await sharp(srcPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const outDark = Buffer.alloc(data.length);
  const outLight = Buffer.alloc(data.length);
  let keyed = 0;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    let a = data[i + 3];
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const chroma = max - min;
    const brightness = (r + g + b) / 3;

    // Key out black / charcoal plate
    if (a > 0 && brightness < 48 && chroma < 30) {
      a = 0;
      keyed++;
    } else if (a > 0 && brightness < 72 && chroma < 36) {
      // Soft fringe
      a = Math.max(0, Math.min(a, Math.round(((brightness - 28) / 44) * 255)));
      if (a < 16) keyed++;
    }

    outDark[i] = r;
    outDark[i + 1] = g;
    outDark[i + 2] = b;
    outDark[i + 3] = a;

    // Light-surface variant: recolor white/light-grey mark → deep navy
    let lr = r;
    let lg = g;
    let lb = b;
    if (a > 40 && brightness > 170 && chroma < 60) {
      lr = 15;
      lg = 39;
      lb = 68;
    }
    outLight[i] = lr;
    outLight[i + 1] = lg;
    outLight[i + 2] = lb;
    outLight[i + 3] = a;
  }

  const meta = { raw: { width: info.width, height: info.height, channels: 4 } };

  async function writeTrimmed(buf, filename) {
    const tmp = path.join(brandDir, `${filename}.raw.png`);
    const out = path.join(brandDir, filename);
    await sharp(buf, meta).png().toFile(tmp);
    await sharp(tmp).trim({ threshold: 10 }).png().toFile(out);
    fs.unlinkSync(tmp);
  }

  await writeTrimmed(outDark, "logo-on-dark.png");
  await writeTrimmed(outDark, "logo.png");
  await writeTrimmed(outLight, "logo-on-light.png");
  await writeTrimmed(outDark, "indiroute-logo-transparent.png");

  // Verify corners are transparent
  const check = await sharp(path.join(brandDir, "logo.png"))
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const c = check.data;
  const w = check.info.width;
  const h = check.info.height;
  const corners = [
    [0, 0],
    [w - 1, 0],
    [0, h - 1],
    [w - 1, h - 1],
  ];
  console.log("Source:", srcPath);
  console.log("Keyed pixels:", keyed);
  console.log(
    "Corner alphas:",
    corners.map(([x, y]) => c[(y * w + x) * 4 + 3]),
  );
}

loadSource()
  .then(processLogo)
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
