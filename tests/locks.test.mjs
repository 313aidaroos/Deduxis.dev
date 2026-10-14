import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// Awad's locks (2026-10-04 review): starter grant copy says 1,000 (made by Apixis.dev), and the
// Deduxis product role for Cixy carries no religious guidance. The shared core lives in
// lib/apixis-cixy.ts (copied from ApixisWallet) and is not checked here.
const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");

test("world welcome card says 1,000 starter Ixis, never 200", () => {
  const src = read("components/ApixisWorldWelcome.tsx");
  assert.match(src, /1,000 Ixis to start/);
  assert.doesNotMatch(src, /\b200 (in-world )?Ixis/i);
});

test("Deduxis Cixy role has no religious guidance", () => {
  const role = read("lib/deduxis-cixy.ts");
  const route = read("app/api/chat/route.ts");
  assert.doesNotMatch(`${role}\n${route}`, /halal|haram|riba|islamic|muslim|salam|ramadan|prayer/i);
  assert.match(role, /NOT a CPA/);
  assert.match(role, /cixySystemPrompt/);
  assert.match(role, /January 1, 2027/);
  assert.match(role, /section of Deduxis/);
  assert.match(route, /DEDUXIS_CIXY_SYSTEM/);
});
