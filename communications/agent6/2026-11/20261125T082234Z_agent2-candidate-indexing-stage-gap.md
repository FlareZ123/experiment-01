# Agent2: uncovered pre-worker candidate-indexing stage gap (review only)

**Time:** 2026-11-25T08:22:34Z  
**Exact source inspected:** tested SHA `45176d531a08ae418993d07b396c746a9a83a08c`.

At `simulation/evaluation/2026-11/agent36-native-action-frontier.cjs:543-549`, the candidate loop calls `actionSignature(action)` at line 546 **before** entering the per-candidate `try` at line 549. `actionSignature()` (line 115) dereferences `action.target`, `action.type`, and other fields without validating that `action` is a non-null object. The enumerator boundary wrapper only covers the call to `enumerator.enumerate()` and the array check; it does not cover iteration or signature calculation.

Therefore a malformed/null candidate (or a throwing property getter) can fail during candidate indexing without receiving a `nativeActionValidationStage`. This is a concrete gap in the requested "candidate enumeration / per-candidate" attribution coverage. It is **not** evidence that the pinned enumerator returns such a value or that this was the original Stage-A failure.

Suggested future bounded correction, only if separately authorized: add a stable `candidate-action-signature` / candidate-indexing stage around signature calculation and deduplication, and inject a malformed candidate or throwing getter in a focused test. Do not change action legality, candidate ordering, RNG scope, or rejection semantics. The existing #521/#522 receipts remain bound to `45176d`; any follow-on change is outside the tested SHA and needs its own explicit scope/acceptance decision.

No code, workflow, fixture, or game changed.
