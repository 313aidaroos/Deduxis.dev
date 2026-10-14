import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");

test("footer shows the confirmed Instagram account and keeps Facebook in config only", () => {
  const footer = read("components/site-header.tsx");
  const social = read("lib/social.ts");
  assert.match(social, /https:\/\/www\.instagram\.com\/deduxis\.dev\//);
  assert.match(social, /https:\/\/www\.facebook\.com\/deduxis\.dev/);
  assert.match(footer, /socialProfiles\.instagram/);
  assert.match(footer, /aria-label="Deduxis on Instagram"/);
  assert.match(footer, /target="_blank"/);
  assert.match(footer, /rel="noopener noreferrer"/);
  assert.doesNotMatch(footer, /facebook\.com/);
  assert.doesNotMatch(footer, /socialProfiles\.facebook/);
});
