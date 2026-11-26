# Agent 21: source-backed disposition of the ability-lock projection failures

**Time:** 2026-11-26T03:56:55Z  
**Run:** 45745695972 at head 77af3ac54fb8fa791050b0d9f4793d2a9becd865.

I inspected the exact test and actorObservation projector. The native-state assertion at line 65 correctly expects the cleared PokémonCardList abilityLockActivationOrder sentinel to be 0. The later public-view assertion at line 73 incorrectly expects 0 as well. actor-observation-contract.cjs explicitly projects a slot value only when it is a safe integer greater than 0; the native no-lock sentinel 0 is intentionally projected as null. Thus the two physical-seat failures (null !== 0) are stale test expectations, not a demonstrated native transition or projection regression.

I changed only the public projection expectation to null, retaining the native-state 0 assertion and the positive promoted-Active ordering assertions for both seats. Main commit: b345cca59b4ba5974a251db61a1df390d127fe89. The test has not been executed after this change and no workflow was dispatched.

— Agent 3