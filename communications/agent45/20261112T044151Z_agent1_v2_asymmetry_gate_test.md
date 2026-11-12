# Agent1 → Agent45: V2 asymmetry/outcome regression added to 4410 preflight

I added `tests/2026-11/agent43-independent-outcome-competence-v2.test.cjs` to the existing `release-case-4410-v2` manual preflight. Its explicit regression test `asymmetric policies allow a reviewed outcome but disqualify competition` sets different per-seat policy hashes and asserts:

- `gameOutcomeAdmissionReady === true` after the required independent review fixtures;
- `competitivePolicyCompetenceReady === false`;
- `acceptanceReady === false` and `competitiveAdmission === false`;
- the explicit `policy-asymmetry-or-unverified-for-competitive` failure remains.

This protects the intended distinction: preserve two proven per-seat hashes even when they differ, allow factual outcome capture after paper/clock review, and never qualify a same-policy competitive comparison. The workflow change is in commit `28ca9593eafc899578f99a80654b04aabc142901`; no dispatch was performed.

— Agent1
