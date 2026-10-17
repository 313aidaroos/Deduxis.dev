/**
 * One-time drawing of the official Deduxis kit in public/brand/.
 * The committed PNGs and favicon.ico are the kit. Do not re-run this to
 * redraw or recolor them. Colors: ink #14224b, cobalt #0753ed.
 * No SVG files are written. Banner and Facebook sizes are not part of this pass.
 */
import { createRequire } from "node:module";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

function loadCanvas() {
  try {
    return createRequire(import.meta.url)("canvas");
  } catch {
    return createRequire("/tmp/logo-gen/package.json")("canvas");
  }
}
const { createCanvas, registerFont } = loadCanvas();

const INK = "#14224b";
const COBALT = "#0753ed";
const PAPER = "#fcfcff";
const WHITE = "#ffffff";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "public", "brand");

registerFont("/usr/share/fonts/truetype/noto/NotoSerif-Bold.ttf", {
  family: "Deduxis Serif",
  weight: "700",
});
registerFont("/usr/share/fonts/truetype/noto/NotoSerif-Regular.ttf", {
  family: "Deduxis Serif",
  weight: "400",
});

function canvas(width, height) {
  const c = createCanvas(width, height);
  const ctx = c.getContext("2d");
  ctx.patternQuality = "best";
  ctx.quality = "best";
  ctx.antialias = "subpixel";
  ctx.imageSmoothingEnabled = true;
  return { c, ctx };
}

function receiptPath(ctx, x, y, w, h, radius, fold) {
  const right = x + w;
  const bottom = y + h;
  const r = Math.min(radius, fold * 0.8, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(right - fold, y);
  ctx.lineTo(right, y + fold);
  ctx.lineTo(right, bottom - r);
  ctx.arcTo(right, bottom, right - r, bottom, r);
  ctx.lineTo(x + r, bottom);
  ctx.arcTo(x, bottom, x, bottom - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

/**
 * @param {"color" | "white" | "on-ink"} mode
 * color: ink sheet, cobalt fold and rules, transparent ground.
 * white: white sheet, rules and fold knocked out, transparent ground.
 * on-ink: white sheet with cobalt fold and rules, for a solid ink tile.
 */
function drawReceipt(ctx, x, y, w, h, mode) {
  const fold = w * 0.28;
  const radius = Math.min(w, h) * 0.12;
  const body = mode === "color" ? INK : WHITE;
  ctx.fillStyle = body;
  receiptPath(ctx, x, y, w, h, radius, fold);
  ctx.fill();

  const right = x + w;
  if (mode === "white") {
    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.moveTo(right - fold, y);
    ctx.lineTo(right, y);
    ctx.lineTo(right, y + fold);
    ctx.closePath();
    ctx.fill();
    drawRules(ctx, x, y, w, h);
    ctx.restore();
    return;
  }

  ctx.fillStyle = COBALT;
  ctx.beginPath();
  ctx.moveTo(right - fold, y - 0.5);
  ctx.lineTo(right + 0.5, y - 0.5);
  ctx.lineTo(right + 0.5, y + fold);
  ctx.closePath();
  ctx.fill();
  drawRules(ctx, x, y, w, h);
}

function drawRules(ctx, x, y, w, h) {
  const thickness = Math.max(1, h * 0.055);
  const left = x + w * 0.16;
  const rules = [
    { at: 0.4, width: w * 0.5 },
    { at: 0.56, width: w * 0.32 },
  ];
  for (const rule of rules) {
    const yy = y + h * rule.at;
    roundRect(ctx, left, yy, rule.width, thickness, thickness / 2);
    ctx.fill();
  }
}

function roundRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function measureTracked(ctx, text, size, tracking) {
  ctx.font = `700 ${size}px "Deduxis Serif"`;
  let width = 0;
  for (const ch of text) width += ctx.measureText(ch).width;
  if (text.length > 1) width += tracking * (text.length - 1);
  return width;
}

function drawTracked(ctx, text, x, baseline, size, color, tracking) {
  ctx.font = `700 ${size}px "Deduxis Serif"`;
  ctx.fillStyle = color;
  let cursor = x;
  for (const ch of text) {
    ctx.fillText(ch, cursor, baseline);
    cursor += ctx.measureText(ch).width + tracking;
  }
  return cursor;
}

function lockup(mode) {
  const fontSize = 460;
  const tracking = -fontSize * 0.04;
  const probe = canvas(10, 10).ctx;
  probe.font = `700 ${fontSize}px "Deduxis Serif"`;
  const metrics = probe.measureText("Deduxis");
  const ascent = metrics.actualBoundingBoxAscent;
  const descent = metrics.actualBoundingBoxDescent;
  const nameWidth = measureTracked(probe, "Deduxis", fontSize, tracking);
  const dotWidth = probe.measureText(".").width;
  const markH = ascent * 1.12;
  const markW = markH * 0.78;
  const gap = markH * 0.28;
  const dotGap = fontSize * 0.02;
  const padX = Math.round(markH * 0.08);
  const padY = Math.round(markH * 0.16);
  const width = Math.ceil(padX * 2 + markW + gap + nameWidth + dotGap + dotWidth);
  const height = Math.ceil(padY * 2 + ascent + descent);
  const { c, ctx } = canvas(width, height);
  const baseline = padY + ascent;
  const markY = baseline - ascent + (ascent - markH) / 2;
  drawReceipt(ctx, padX, markY, markW, markH, mode);
  const wordColor = mode === "white" ? WHITE : INK;
  const after = drawTracked(ctx, "Deduxis", padX + markW + gap, baseline, fontSize, wordColor, tracking);
  ctx.font = `700 ${fontSize}px "Deduxis Serif"`;
  ctx.fillStyle = mode === "white" ? WHITE : COBALT;
  ctx.fillText(".", after + dotGap, baseline);
  return c;
}

function markTile(mode, size) {
  const { c, ctx } = canvas(size, size);
  const pad = size * 0.1;
  const inner = size - pad * 2;
  const markW = inner * 0.78;
  const markH = inner;
  const x = (size - markW) / 2;
  const y = pad;
  drawReceipt(ctx, x, y, markW, markH, mode);
  return c;
}

function appIcon(size) {
  const { c, ctx } = canvas(size, size);
  ctx.fillStyle = INK;
  ctx.fillRect(0, 0, size, size);
  const pad = size * 0.18;
  const inner = size - pad * 2;
  const markW = inner * 0.78;
  const markH = inner;
  const x = (size - markW) / 2;
  const y = pad;
  drawReceipt(ctx, x, y, markW, markH, "on-ink");
  return c;
}

function drawImageContain(ctx, image, x, y, w, h) {
  const scale = Math.min(w / image.width, h / image.height);
  const dw = image.width * scale;
  const dh = image.height * scale;
  ctx.drawImage(image, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
}

function ogImage(lockupCanvas) {
  const width = 1200;
  const height = 630;
  const { c, ctx } = canvas(width, height);
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = COBALT;
  ctx.fillRect(0, 0, 14, height);
  drawImageContain(ctx, lockupCanvas, 90, 175, 1020, 200);
  ctx.font = `400 40px "Deduxis Serif"`;
  ctx.fillStyle = INK;
  ctx.textAlign = "center";
  ctx.fillText("Every receipt. Everything in order.", width / 2, 455);
  ctx.textAlign = "start";
  return c;
}

function pngBuffer(c) {
  return c.toBuffer("image/png");
}

function icoFromPngs(images) {
  const count = images.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(count, 4);
  let offset = 6 + 16 * count;
  const entries = images.map(({ size, buffer }) => {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0);
    entry.writeUInt8(size >= 256 ? 0 : size, 1);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(buffer.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += buffer.length;
    return entry;
  });
  return Buffer.concat([header, ...entries, ...images.map((image) => image.buffer)]);
}

function cornerAlpha(c) {
  const { width, height } = c;
  const data = c.getContext("2d").getImageData(0, 0, width, height).data;
  const points = [
    [0, 0],
    [width - 1, 0],
    [0, height - 1],
    [width - 1, height - 1],
  ];
  return points.map(([x, y]) => data[(y * width + x) * 4 + 3]);
}

function opaqueCount(c) {
  const data = c.getContext("2d").getImageData(0, 0, c.width, c.height).data;
  let n = 0;
  for (let i = 3; i < data.length; i += 4) if (data[i] > 16) n += 1;
  return n;
}

function writePng(name, c) {
  const file = join(outDir, name);
  writeFileSync(file, pngBuffer(c));
  return file;
}

mkdirSync(outDir, { recursive: true });

const full = lockup("color");
const fullWhite = lockup("white");
const mark = markTile("color", 1024);
const markWhite = markTile("white", 1024);

for (const [name, image] of [
  ["logo-full.png", full],
  ["logo-full-white.png", fullWhite],
  ["mark.png", mark],
  ["mark-white.png", markWhite],
]) {
  const alphas = cornerAlpha(image);
  if (alphas.some((alpha) => alpha !== 0)) {
    throw new Error(`${name} corners are not transparent: ${alphas.join(",")}`);
  }
  if (image.width < 1024) throw new Error(`${name} is only ${image.width}px wide`);
  if (opaqueCount(image) < 1000) throw new Error(`${name} looks empty`);
  writePng(name, image);
}

const iconSizes = [16, 32, 48, 180, 192, 512];
const icons = {};
for (const size of iconSizes) icons[size] = appIcon(size);

writePng("favicon-32.png", icons[32]);
writePng("apple-touch-icon.png", icons[180]);
writePng("icon-192.png", icons[192]);
writePng("icon-512.png", icons[512]);

const ico = icoFromPngs([16, 32, 48].map((size) => ({ size, buffer: pngBuffer(icons[size]) })));
writeFileSync(join(outDir, "favicon.ico"), ico);

const og = ogImage(full);
if (og.width !== 1200 || og.height !== 630) throw new Error("OG size");
writePng("og-image.png", og);

console.log(
  JSON.stringify(
    {
      "logo-full": [full.width, full.height],
      "logo-full-white": [fullWhite.width, fullWhite.height],
      mark: [mark.width, mark.height],
      "mark-white": [markWhite.width, markWhite.height],
    },
    null,
    2,
  ),
);
