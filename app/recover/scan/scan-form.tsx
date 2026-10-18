"use client";

import { useActionState } from "react";
import {
  ANNUAL_SPEND_BANDS,
  RECOVER_DOCUMENT_KINDS,
  RECOVER_INDUSTRIES,
} from "@/lib/recover-intake";
import { requestRecoverScan, type ScanState } from "../actions";

const initial: ScanState = { ok: false, error: "" };

export function ScanForm({ email }: { email: string }) {
  const [state, action, pending] = useActionState(requestRecoverScan, initial);

  if (state.ok) {
    return (
      <div role="status" className="notice success">
        Your free scan is requested. Reference {state.id}. We will compare the
        bills you named with the agreements behind them. A scan is free. The
        fee applies only when money comes back.
      </div>
    );
  }

  return (
    <form action={action}>
      <p className="price-note">Signed in as {email}</p>
      <div className="field">
        <label htmlFor="organization">Organization name</label>
        <input
          id="organization"
          name="organization"
          required
          minLength={2}
          maxLength={120}
          placeholder="Acme Logistics Inc."
          disabled={pending}
        />
      </div>
      <div className="field">
        <label htmlFor="industry">Industry</label>
        <select id="industry" name="industry" required defaultValue="" disabled={pending}>
          <option value="" disabled>
            Choose an industry
          </option>
          {RECOVER_INDUSTRIES.map((industry) => (
            <option key={industry} value={industry}>
              {industry}
            </option>
          ))}
        </select>
      </div>
      <fieldset className="choice-list" disabled={pending}>
        <legend>Documents you can share</legend>
        {RECOVER_DOCUMENT_KINDS.map((kind) => (
          <label key={kind.id}>
            <input type="checkbox" name="documentKinds" value={kind.id} />
            {kind.label}
          </label>
        ))}
      </fieldset>
      <div className="field">
        <label htmlFor="vendors">Vendor or carrier names</label>
        <input
          id="vendors"
          name="vendors"
          maxLength={500}
          placeholder="Maersk, Hapag-Lloyd, Old Dominion"
          disabled={pending}
        />
      </div>
      <div className="field">
        <label htmlFor="annualSpend">Approximate annual vendor spend</label>
        <select id="annualSpend" name="annualSpend" defaultValue="" disabled={pending}>
          <option value="">Prefer not to say yet</option>
          {ANNUAL_SPEND_BANDS.map((band) => (
            <option key={band} value={band}>
              {band}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="notes">What should we look at first?</label>
        <textarea
          id="notes"
          name="notes"
          maxLength={2000}
          placeholder="A lane, a software vendor, a bill that looks high, or leave this blank for a general scan."
          disabled={pending}
        />
      </div>
      {state.error ? (
        <div role="alert" className="notice error">
          {state.error}
        </div>
      ) : null}
      <button className="button primary full" type="submit" disabled={pending}>
        {pending ? "Sending…" : "Request a free scan"}
      </button>
      <p className="form-help">
        The scan is free. Deduxis keeps 25% of money actually recovered.
        Monitor subscribers pay 15%. No recovery, no charge. A person approves
        anything sent to a vendor.
      </p>
    </form>
  );
}
