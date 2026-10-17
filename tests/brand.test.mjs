import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url);
const read = (path) => readFileSync(new URL(path, root), "utf8");

const brandFiles = [
  "README.md",
  "apple-touch-icon.png",
  "brand.json",
  "favicon-32.png",
  "favicon.ico",
  "icon-192.png",
  "icon-512.png",
  "logo-full-white.png",
  "logo-full.png",
  "mark-white.png",
  "mark.png",
  "og-image.png",
];

function walk(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === ".next" || name === ".git") continue;
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path, acc);
    else acc.push(path);
  }
  return acc;
}

function pngSize(path) {
  const buf = readFileSync(new URL(path, root));
  assert.equal(buf.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20), colorType: buf[25] };
}

test("public/brand is the only logo kit and uses the family file names", () => {
  const listed = readdirSync(new URL("public/brand", root)).sort();
  assert.deepEqual(listed, brandFiles);
  const files = walk(new URL(".", root).pathname);
  const logos = files.filter((path) =>
    /\.(svg|ico)$/i.test(path) ||
    /(?:^|\/)(logo|mark|favicon|apple-touch-icon|icon-\d+|og-image|banner|facebook-)/i.test(path),
  );
  assert.deepEqual(
    logos.map((path) => path.replace(new URL(".", root).pathname, "")).sort(),
    brandFiles.filter((name) => name !== "README.md" && name !== "brand.json").map((name) => `public/brand/${name}`).sort(),
  );
});

test("brand.json records the Deduxis colors and the kit files", () => {
  const brand = JSON.parse(read("public/brand/brand.json"));
  assert.equal(brand.name, "Deduxis");
  assert.equal(brand.domain, "deduxis.vercel.app");
  assert.equal(brand.tagline, "Every receipt. Everything in order.");
  assert.deepEqual(brand.colors, {
    primary: "#14224b",
    accent: "#0753ed",
    background: "#fcfcff",
    text: "#14224b",
  });
  assert.ok(Array.isArray(brand.fonts));
  for (const name of brandFiles) {
    if (name === "brand.json" || name === "README.md") continue;
    assert.equal(typeof brand.files[name], "string");
  }
  assert.equal(brand.files["banner.png"], undefined);
  assert.equal(brand.files["facebook-cover.png"], undefined);
  assert.equal(brand.files["facebook-profile.png"], undefined);
});

test("logo sizes and the site point at public/brand", () => {
  const full = pngSize("public/brand/logo-full.png");
  const fullWhite = pngSize("public/brand/logo-full-white.png");
  const mark = pngSize("public/brand/mark.png");
  const markWhite = pngSize("public/brand/mark-white.png");
  assert.ok(full.width >= 1024 && full.colorType === 6);
  assert.ok(fullWhite.width >= 1024 && fullWhite.colorType === 6);
  assert.ok(mark.width >= 512 && mark.height >= 512);
  assert.ok(markWhite.width >= 512);
  assert.deepEqual(pngSize("public/brand/favicon-32.png"), { width: 32, height: 32, colorType: 6 });
  assert.deepEqual(pngSize("public/brand/apple-touch-icon.png"), { width: 180, height: 180, colorType: 6 });
  assert.deepEqual(pngSize("public/brand/icon-192.png"), { width: 192, height: 192, colorType: 6 });
  assert.deepEqual(pngSize("public/brand/icon-512.png"), { width: 512, height: 512, colorType: 6 });
  assert.deepEqual(pngSize("public/brand/og-image.png"), { width: 1200, height: 630, colorType: 6 });
  const ico = readFileSync(new URL("public/brand/favicon.ico", root));
  assert.equal(ico.readUInt16LE(0), 0);
  assert.equal(ico.readUInt16LE(2), 1);

  const header = read("components/site-header.tsx");
  const layout = read("app/layout.tsx");
  assert.match(header, /src="\/brand\/logo-full\.png"/);
  for (const name of ["favicon.ico", "favicon-32.png", "apple-touch-icon.png", "icon-192.png", "icon-512.png", "og-image.png"]) {
    assert.match(layout, new RegExp(`/brand/${name.replace(".", "\\.")}`));
  }
  assert.doesNotMatch(layout, /favicon-16|favicon-48|banner\.png|facebook-/);
});
