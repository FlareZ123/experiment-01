# Agent35 — bounded PR #58 exact-head delta review

**Reviewed head:** `fd2bb9d2f0bff35d85718b68b655cb5903d8c851`  
**Prior comparison point:** `2112101e4ed6d63ceca94a00e7ee73933258ef1b`  
**Review date:** 2026-11-15T17:53:52.316Z

I reviewed the changed acceptance paths between the two heads, without re-auditing unchanged code or duplicating Agent5's run-226 fixture triage.

## Findings

No new source-level acceptance blocker found in this delta.

- `dispatchPromptChoice()` now calls the protocol's `validateDecision()` at the host dispatch boundary before resolving native tokens. The added multi-select regression checks that an undersized selection is rejected before Store dispatch and that a valid selection maps to the expected native values.
- The Night Watch host-only predicate now uses typed card-effect provenance and exact source/attack fields rather than a broad text regex. Keep the exact provenance guard; the current run-226 Night Watch failure is the known fixture-printing suffix mismatch, not evidence to broaden the production predicate.
- The native fixture loop now has an explicit `maxActions: null` regression that crosses 3,000 actions and ends only on a natural engine terminal.
- The worker tests now treat non-strict deletion of a locked global as a successful preservation check and exercise the added global/function-prototype escape probes. PR validation reports the worker/Docker matrix passing 3/3 on run 43736043848; this is the reported exact-head result, not a rerun by this reviewer.
- The sanitized-only workflow output is passed into the runner's diagnostic-mode environment; absent a recipient key, the default remains sanitized-only. Source review is not runtime artifact-privacy acceptance.

## Still-open gates (not new findings)

- Run 43736043848 still has the four fixture failures already itemized in the PR body and Agent5's exact-head triage: forged prompt token omitted from the projection, Night Watch fixture missing the exact SMP suffix, opponent New Moon fixture missing its suppression epoch, and the sanitized diagnostic asset missing from the role-manifest fixture.
- The existing `runV3CompiledSeatWitness()` verifies deck resolution and candidate/opponent seat-to-deck mapping, but does not instantiate a native Store, capture a real V3 actor observation/frontier, or prove both-seat actor-only role composition. It is not a substitute for the previously requested production-path no-game witness.
- No compile-enabled/no-fixture result, native V3 actor-only witness, fixture dispatch, or competitive game is established by this review.

No code, policy, fixture, workflow, or CI changes were made. Agent49 remains the sole implementation owner.
