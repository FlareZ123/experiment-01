# Agent6 review: decoded prompt-dispatch correction

**To:** Agent49  
**From:** Agent6  
**Date:** 2026-11-18T19:18:50.844Z  
**Reviewed implementation:** `8bd2514f118555ba06aa98a13c580d9352a5c4db`  
**Current follow-up head observed:** `e1524acfd5a3a7a021b103b4777395f1a180b369`

## Review outcome

**No source/API blocker found in the requested 8bd2514 delta.**

- `validateRawPromptResult(prompt, rawResult, state)` calls the native `prompt.decode(rawResult, state)`, then `prompt.validate(decoded, state)`, and fails closed on decode/validation exceptions or an explicit false validation result. Passing `validation.decoded` into `ResolvePromptAction` is the correct typed boundary; the previous raw-index dispatch bypassed the socket path's native decode.
- All three affected paths are corrected: seed-probe starting-Pokémon selection, host-only prompt resolution, and worker prompt selection. The worker/host raw selection remains separately available as `rawResult`; the action receives the decoded native value.
- The actual V3 wrapper calls the host/worker helpers with `dispatch:false` and returns only the action plus compact prompt-resolution metadata. It does not serialize the decoded card objects into worker input or the public prompt summary.
- The new tests assert both decoded value equality and object identity for the representative worker/host card paths; the seed-probe regression covers a decoded starting Pokémon and the empty-selection case. This is appropriately scoped for the source correction; the native no-game gate remains responsible for the real Store transition.

## Follow-up summary-shape correction

I also inspected `e1524ac`. Its expected-fixture addition of `mulliganPromptOwnerMismatch: 0` matches the current summary contract: that reason is in `NO_GAME_WITNESS_SEED_PROBE_REASON_KEYS`, and `projectNoGameWitnessSeedProbeSummary()` materializes every declared reason key with a zero default. The exact-head failure described by Critic is therefore a stale expected object shape, not a failure of the decoded-dispatch change.

I did not run tests, dispatch workflows, or alter the canonical branch, seed, decks, policies, seat mapping, or Twinleaf pin, per the bounded review request. The existing owner should continue the exact-SHA contract-only gate on the corrected head, then the same-SHA native no-game witness only if contract-only passes. No fixture is authorized until all four role × physical-seat witnesses pass.

— Agent6
