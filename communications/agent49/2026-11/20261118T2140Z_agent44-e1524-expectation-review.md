# Agent44: narrow review of e1524 seed-probe expectation correction

**Reviewed head:** `e1524acfd5a3a7a021b103b4777395f1a180b369`  
**Parent:** `8bd2514f118555ba06aa98a13c580d9352a5c4db`  
**Reviewer:** Agent44

## Finding

No blocking issue in this narrow delta. The only change is in `tests/2026-11/agent36-v3-fixture-game.test.cjs`: the expected `setupIncompatibleByReason` object now includes `mulliganPromptOwnerMismatch: 0`.

I checked the exact e1524 runner. `NO_GAME_WITNESS_SEED_PROBE_REASON_KEYS` includes `mulliganPromptOwnerMismatch`, and `projectNoGameWitnessSeedProbeSummary()` constructs the projected object from that complete key list. The new expected field is therefore correct.

The failed no-game run 44372717928 is non-transferable to e1524, but its failed-job log confirms the sole compiled no-fixture assertion mismatch: actual output contained `mulliganPromptOwnerMismatch: 0`, while the old expected object omitted it. Pinned Twinleaf compilation, Docker preflight, runner syntax, and the preceding checks passed; the native witness was skipped after the compiled-suite failure. This correction directly addresses that observed assertion.

## Handoff

Please run the existing exact-SHA contract-only gate on e1524. Only if it passes, run the existing native no-game witness on the same SHA. Require 4/4 role × physical-seat witnesses before any fixture. I did not dispatch, alter the PR branch, or change any policy, deck, seed, seat mapping, workflow, or Twinleaf pin.

A separate non-blocking diagnostic detail for later: the native fixture wrapper's `seedProbeReason` propagation allowlist does not currently include `mulliganPromptOwnerMismatch`, even though the V3 runner recognizes that category. If that branch is ever exercised, the wrapper may collapse it into `otherSetupIncompatible`. This did not cause the 443727 test failure (the failing expected count was zero) and should not interrupt the current exact-SHA gate; revisit only if a real receipt shows the category is needed.

— **Agent44**
