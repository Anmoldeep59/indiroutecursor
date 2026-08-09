/**
 * Viewport audit: CTA contrast samples + horizontal overflow checks.
 * Requires a running server on localhost:3000.
 */
import { chromium } from "playwright";

const widths = [375, 430, 768, 1024, 1440];
const pages = ["/", "/how-it-works", "/shipping-calculator", "/login", "/signup"];

function luminance(r, g, b) {
  const f = (c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

function contrast(a, b) {
  const L1 = luminance(...a);
  const L2 = luminance(...b);
  const hi = Math.max(L1, L2);
  const lo = Math.min(L1, L2);
  return (hi + 0.05) / (lo + 0.05);
}

function parseRgb(str) {
  const m = str.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (!m) return null;
  return [Number(m[1]), Number(m[2]), Number(m[3])];
}

const browser = await chromium.launch({ headless: true });
const results = [];

for (const width of widths) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  for (const path of pages) {
    const url = `http://localhost:3000${path}`;
    await page.goto(url, { waitUntil: "networkidle", timeout: 45000 });
    const metrics = await page.evaluate(() => {
      const doc = document.documentElement;
      const scrollWidth = doc.scrollWidth;
      const clientWidth = doc.clientWidth;
      const overflowX = scrollWidth > clientWidth + 1;

      const ctas = [
        ...document.querySelectorAll(
          "a.sp-btn-navy, button.sp-btn-navy, a.sp-btn-orange, button.sp-btn-orange, a.sp-btn-outline-white, .sp-btn-green",
        ),
      ];
      const samples = ctas.slice(0, 12).map((el) => {
        const cs = getComputedStyle(el);
        return {
          text: (el.textContent || "").trim().slice(0, 40),
          color: cs.color,
          bg: cs.backgroundColor,
          cls: el.className,
        };
      });

      const band = document.querySelector(".ir-band-title");
      let bandCut = false;
      if (band) {
        bandCut = band.scrollWidth > band.clientWidth + 2;
      }

      return { overflowX, scrollWidth, clientWidth, samples, bandCut };
    });

    const contrastIssues = [];
    for (const s of metrics.samples) {
      const fg = parseRgb(s.color);
      const bg = parseRgb(s.bg);
      if (!fg || !bg) continue;
      // transparent bg → skip precise ratio
      if (s.bg.includes("0)") || s.bg === "rgba(0, 0, 0, 0)") continue;
      const ratio = contrast(fg, bg);
      if (ratio < 3) {
        contrastIssues.push({
          text: s.text,
          ratio: Number(ratio.toFixed(2)),
          color: s.color,
          bg: s.bg,
        });
      }
    }

    results.push({
      width,
      path,
      overflowX: metrics.overflowX,
      bandCut: metrics.bandCut,
      contrastIssues,
      sampleCount: metrics.samples.length,
    });
  }
  await page.close();
}

await browser.close();

let failed = false;
for (const r of results) {
  const bad =
    r.overflowX || r.bandCut || (r.contrastIssues && r.contrastIssues.length);
  if (bad) failed = true;
  console.log(
    `${bad ? "FAIL" : "PASS"}  ${r.width}px ${r.path}  overflow=${r.overflowX} bandCut=${r.bandCut} contrastIssues=${r.contrastIssues.length} ctas=${r.sampleCount}`,
  );
  for (const c of r.contrastIssues) {
    console.log(`       contrast ${c.ratio}:1 "${c.text}" fg=${c.color} bg=${c.bg}`);
  }
}

process.exit(failed ? 1 : 0);
