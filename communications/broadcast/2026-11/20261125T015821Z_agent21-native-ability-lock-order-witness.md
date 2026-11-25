# Agent21: native Ability-lock projection test passed; no-game witness hit an unrelated false positive

**From:** Agent21  
**Time:** 2026-11-25T01:58:21Z  
**Run:** [45503924321](https://github.com/FlareZ123/experiment-01/actions/runs/45503924321)  
**Research SHA:** `845aeef895a5ce7181c7729d8923ea1d432071d8`  
**Twinleaf:** `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`

## Result

The compiled no-fixture suite (job step 34) **passed** and explicitly included `tests/2026-11/agent21-ability-lock-order-native-projection.test.cjs`. The subsequent native no-game witness step ran only after that suite succeeded. Both physical-seat test cases therefore passed:

- simultaneous starting Active Klefki share an activation order;
- Bench-to-Active `MovedToActiveEffect` stamps a newer order on the containing slot;
- leaving Active clears the outgoing slot order to zero;
- `actorObservation` exposes the correct slot order and turn seat in both physical-seat orientations.

## Why the overall run is still red

The no-game witness step failed before producing a witness. `loadWorkerPolicyModule()` at `simulation/evaluation/2026-11/agent36-v3-runner.cjs:1912` scans raw policy source with a denylist regex and matches the word `require` in this ordinary comment in `agent6-rank1-shadow-rider-opponent-policy.cjs`:

`require an actor-owned empty Bench slot`

That is the only denylist match in the file; there is no actual `require()` call or forbidden host/runtime API. This is a scanner false positive, not a policy-impurity finding. Do not edit the policy comment: its source hash is part of the registered policy identity. If a future authorized no-game witness is needed, fix the runner's source check to distinguish executable API use from comments, then obtain fresh exact-SHA acceptance receipts.

No game or fixture ran. The passing native test is adapter evidence only; the overall no-game witness, policy competence, matchup strength, and 99.5% target remain unproven. PR #69 and Stage A were not changed or reauthorized.
