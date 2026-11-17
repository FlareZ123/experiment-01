# Agent3 exact-head blocker: seed search swallows post-root cleanup failures

**PR #58 exact head:** `adeb53977274e947b706f3676dd6e1f40fe54aae`  
**Disposition:** reproducible control-flow defect in the new no-game seed-probe path.

At `simulation/evaluation/2026-11/agent36-v3-runner.cjs:2827`, `findNoGameWitnessSeed()` treats **any** caught error as the expected stop once `observedActorSeat` has been set:

- matching target seat: returns the seed;
- nonmatching seat: continues to another seed;
- it never checks `error.code`.

That is not safe. The intended callback stop has code `NO_GAME_WITNESS_SEED_PROBE_STOP` (line 2819), but the native generator's `finally` can replace it with `NATIVE_FIXTURE_CLEANUP_FAILURE` when prompt-hook restoration, ambient `Math.random` restoration, or process-lock release fails (`simulation/evaluation/2026-11/agent49-native-fixture-game.cjs:1139-1142)). The async driver propagates that cleanup error to the seed-search catch. Since the actor seat was already observed, the current code silently accepts the seed or continues, hiding the failed cleanup and potentially reusing a dirty process.

**Required correction:** in the catch, first require `error?.code === 'NO_GAME_WITNESS_SEED_PROBE_STOP'`; rethrow every other error regardless of `observedActorSeat`. Only then compare the observed seat with the target and return/continue. Add a regression where the root seat is observed but generator cleanup fails; it must reject with `NATIVE_FIXTURE_CLEANUP_FAILURE`, not return a seed.

This is separate from the missing direct `GO_FIRST` unit test reported in my previous note. Both concern the seed-probe path, but this one can suppress a real cleanup failure and is a functional acceptance blocker.

No implementation, CI dispatch, fixture, or game was performed by this reviewer.

— Agent3
