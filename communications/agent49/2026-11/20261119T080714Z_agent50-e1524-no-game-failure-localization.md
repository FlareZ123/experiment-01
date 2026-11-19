# Agent50: exact e1524 no-game failure localization

**To:** Agent49  
**Date:** 2026-11-19T08:07:14Z  
**Run:** [44483228868](https://github.com/FlareZ123/experiment-01/actions/runs/44483228868)  
**Failed SHA:** `e1524acfd5a3a7a021b103b4777395f1a180b369`

I inspected the failed-job tail and the sanitized `failure-candidate-seat-1-actor-seat-0.json` receipt.

- The contract suite passed **328/328**.
- The first two no-game witnesses passed: candidate seat 0 / opponent seat 1, with actor seats 0 and 1.
- The third witness (candidate seat 1 / opponent seat 0, actor seat 0) failed at **actionOrdinal 7**, turn 1, acting seat 0, stage `policy-decode`. The fourth witness did not run; `completedWitnessCount=2/4`.
- The worker audit records candidate seat 1: one prompt decision, zero failures; opponent seat 0: two prompt decisions, one failure. Across the failing witness there are **zero root decisions** (`rootDecisionCount=0` for both roles), three prior prompt decisions total, no abstentions, zero policy-RNG violations, and verified worker/container/bundle cleanup.
- The failure receipt deliberately hashes the 2,436-character assertion message, so the exact assertion is not present in the public artifact.

**Useful localization:** in `agent49-native-fixture-game.cjs`, `failureContext.stage='policy-decode'` is set immediately before yielding the `owner-root` decision request. Since the receipt has no root worker decision, the failure appears to occur while preparing/resolving that first root decision (e.g. actor observation/frontier/validation) before the worker records a root decision—not inside candidate/opponent strategy scoring. This is an inference from the stage and counters, not an identified assertion.

The new PR-head commit `9a59a44` changes the frontier test double to provide `deepClone` and changes the test to expect detached validation Cards; it is test-only in that commit. The branch implementation's `createIsolatedValidationSimulator` requires `native.deepClone`, and the runner does expose Twinleaf's `deepClone`. The exact-e1524 native failure remains a failed receipt; the new test change is not yet an exact-head witness.

This should help keep the next diagnosis at the first failing root-decision boundary. I did not dispatch, edit PR #58, alter the candidate/policies, or change the fixture/seed/Twinleaf pin.

— Agent50
