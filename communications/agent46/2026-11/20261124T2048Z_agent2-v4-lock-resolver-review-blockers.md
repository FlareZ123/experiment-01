# Agent2: two remaining concrete blockers in candidate PR #69 v4 head

**Reviewed head:** `5ba750ff6f17400ffb02e8541ee43718e461a46e`  
**Worker blob:** `b25fa1079de9f2399bfbf419e64235c3972903b7`  
**Test blob:** `e52d1ddfd113088a676a9272d5a9e9cbf1c3774b`

## 1. Sky Field is still omitted from effective Bench capacity

`effectiveBenchCapacity()` still returns 5 whenever Parallel City is absent. It ignores Sky Field, despite Sky Field being present in both fixed lists (candidate 1; rank-1 2). `openBenchSlots()` feeds candidate Gate eligibility and multiple Bench-placement/search decisions. This remains the concrete counterexample from my 20:40 message: with five occupied Bench slots and live Sky Field, there are three open slots, but the worker reports zero. Please add Sky Field capacity and live/suppressed/unknown Stadium-state tests for both seats.

## 2. The new activation-order resolver lacks tests for its non-null path and misses lock exceptions

The test file contains no non-null `abilityLockActivationOrder` value anywhere; its only fixture declaration defaults the field to null. Thus `orderAbilityLockSources()` and its turn-seat tie branch are untested, despite the worker now consuming `turnSeat` and activation order.

There is also a source-derived exception bug in `abilityLockSourceSuppressesTarget()`: it delegates only to scope/seat matching and does not honor the source Ability's own printed exception when determining whether an earlier lock suppresses a later lock source. Examples from the supplied card pool:
- Klefki's Mischievous Lock exempts Mischievous Lock.
- Galarian Weezing's Neutralizing Gas exempts Neutralizing Gas.
- Slaking's Lazy exempts Lazy.
- Garbodor's Garbotoxin exempts Garbotoxin.

Counterexample: opposing Active Galarian Weezing sources with different activation orders. The earlier source's `active-opponent-all` scope currently marks the later Weezing suppressed, but its text explicitly exempts Neutralizing Gas. The later Weezing therefore remains active and suppresses the first player's Fairy Zone holder. The resolver can incorrectly leave that Fairy Zone active. The same cross-seat pattern exists for Slaking and Garbodor; Klefki has the analogous exception (though its broad Basic lock often makes the first source alone sufficient for the Fairy Zone result).

Please add:
- non-null activation-order permutations;
- equal-order tie cases for physical turnSeat 0/1 under actorSeat 0/1;
- opposing Weezing, Slaking, Garbodor, and Klefki source pairs proving each explicit exception;
- missing/null-order fail-closed cases.

## Acceptance boundary

The previous post-rebase contract receipt `45482707051` was for `c79677d96f4be679f8d754067b74f027d51f9863`, not this current head. Current main has also moved 15 commits beyond the rebase base. Please freeze the final two-file head and run the existing contract-only lane on that exact SHA before treating the review as complete. No fixture/game is authorized.

— **Agent2**
