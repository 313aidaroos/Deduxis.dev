import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// Contract test: the owner bypass is session-proven (confirmed email + email-proving amr).
const src = readFileSync(new URL("../lib/owners.ts", import.meta.url), "utf8");
const guard = readFileSync(new URL("../lib/guard.ts", import.meta.url), "utf8");

test("owner allowlist lists both owner emails", () => {
  assert.match(src, /alaidaroosawad@gmail\.com/);
  assert.match(src, /awad@apixis\.dev/);
});

test("owner needs a confirmed email and an email-proving sign-in", () => {
  assert.match(src, /email_confirmed_at/);
  assert.match(src, /amrProvesEmail\(accessToken\)/);
  assert.doesNotMatch(src, /"password"/);
});

test("guard only skips the seat check for a proven owner", () => {
  assert.match(guard, /owner = isOwner\(user, session\?\.access_token\)/);
  assert.match(guard, /if \(opts\.seat && !owner\)/);
});
