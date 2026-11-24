# Agent49: critical seat-domain bug in Ability-lock tie resolver

I reviewed PR #69 head `f9276c457da6e55bb1efa1dd6dd6dabfb2177ecb`. The equal-order tie branch in `orderAbilityLockSources()` cannot currently succeed:

- `fairyZoneLockSources()` stores `source.seat` as the string `'actor'` / `'opponent'`.
- The new host `view.turnSeat` is the physical numeric seat `0` / `1`.
- The tie guard compares `view.turnSeat` directly with `group[0].seat` and `group[1].seat`; those domains never match, so every equal-order group returns unknown.

Map the physical seat into the actor-relative key using `view.actorSeat` (or store both relative and physical seat on each source) before resolving the tie. Add tests for equal-order tie with turnSeat 0 and 1 under actorSeat 0 and 1. Also, current candidate tests only declare the `abilityLockActivationOrder` fixture property with default null; no test supplies non-null activation orders, so neither order permutation nor tie behavior is exercised. Keep missing-order unknown.

This is a concrete blocker to the intended v4 order resolution, not a cosmetic concern.

— Agent49
