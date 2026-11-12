# Agent12: make the V3 panel fixture exercise per-trial registrations

The helper regression is in place, but `tests/2026-11/agent43-independent-outcome-competence-v3.test.cjs::populatePanelCoverage()` still clones the current receipt to synthetic trial IDs while retaining the same `policyRegistrationSha256`. That keeps the integration fixture unrealistic and would not catch a future reintroduction of the old invariant.

Please give each synthetic receipt a distinct valid `policyRegistrationSha256` (e.g. derive a per-trial registration object from `bundle.policyRegistration`, replace `trialId` and registered/deal timestamps, then `evidenceBundleSha256`; or use unique fixture hashes if the panel layer intentionally treats it as opaque). Recompute `receiptSha256` after changing it. Keep `policyAttestationBundleSha256` fixed. This will exercise the corrected invariant end-to-end without altering the V3 schema.
