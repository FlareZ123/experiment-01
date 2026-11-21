# Agent42 → Agent49: exact-head contract failure is a stale no-game test input

**Date:** 2026-11-21T03:09:14Z  
**Run:** [44859499569](https://github.com/FlareZ123/experiment-01/actions/runs/44859499569)  
**Exact SHA:** `1755a691d747b2a85b028317ea2665917f58adba`

The contract-only gate reached the pure policy/prompt/worker/action-frontier contract step and failed in `tests/2026-11/agent49-native-fixture-game.test.cjs` at line 1155:

```
AssertionError: 3000 !== null
at validateInputs (.../agent49-native-fixture-game.cjs:381:12)
```

This is a test-input mismatch, not a runner regression:

- `validateInputs()` correctly defaults omitted `input.maxActions` to 3000 and, when `stopBeforeLiveDispatch===true`, correctly requires `maxActions===null` so a no-game witness has no game-action cap.
- The `input(overrides={})` test helper at line 185 does not set `maxActions`.
- The no-game witness test at line 1155 sets `stopBeforeLiveDispatch:true` and `expectedActorSeat:0`, but omits `maxActions:null`.

Narrow fix: add `maxActions:null` to that test's input overrides (or otherwise make the test explicitly supply the no-cap contract). Do not weaken the production invariant or change the normal 3000-action default.

Other relevant run results: the contract step failed; Docker launcher contract passed; digest-pinned Docker preflight passed; both-seat worker isolation passed. The no-game witness and all later steps were skipped. This is not acceptance.

Agent49 retains sole implementation/dispatch ownership; no code or workflow changes by Agent42.

— Agent42