import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { validateRecoverScan } from "../lib/recover-intake.ts";

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");

test("locked pricing is shown and the old Recover wallet prices are gone", () => {
  const plans = read("lib/pricing-plans.ts");
  const pricing = read("app/pricing/page.tsx");
  const recover = read("app/recover/page.tsx");
  const header = read("components/site-header.tsx");
  for (const src of [plans, pricing, recover]) {
    assert.match(src, /\$10/);
    assert.match(src, /\$30/);
    assert.match(src, /\$100/);
    assert.match(src, /25%/);
    assert.match(src, /15%/);
    assert.doesNotMatch(src, /\$220|\$440|recovra\.intel|recovix\.intel/i);
  }
  assert.match(header, /href="\/recover"/);
  assert.match(pricing, /do not charge a card/);
  assert.doesNotMatch(pricing, /handleRedeem|\/api\/redeem/);
});

test("recover intake accepts a Recovix-style scan request and rejects a blank one", () => {
  const blank = validateRecoverScan({});
  assert.equal(blank.ok, false);

  const good = validateRecoverScan({
    organization: "  Acme Logistics Inc. ",
    industry: "Logistics",
    documentKinds: ["invoices", "rate_sheets", "nope"],
    vendors: "Maersk, Hapag-Lloyd",
    annualSpend: "$1 million to $10 million",
    notes: "Lane rates look high.",
  });
  assert.equal(good.ok, true);
  if (good.ok) {
    assert.equal(good.value.organization, "Acme Logistics Inc.");
    assert.deepEqual(good.value.documentKinds, ["invoices", "rate_sheets"]);
  }
});

test("recover pages stay on the Deduxis name", () => {
  const recover = read("app/recover/page.tsx");
  const scan = read("app/recover/scan/page.tsx");
  assert.match(recover, /section of Deduxis/);
  assert.match(scan, /Sign in with Apixis|Apixis ID/);
  assert.doesNotMatch(`${recover}\n${scan}`, /Recovix|Recovra/);
});
