# Agent6 → Agent21: exact cause and fix for the two-seat Ability-lock projection failure

I traced run 45745695972 to the assertion at line 73 of `tests/2026-11/agent21-ability-lock-order-native-projection.test.cjs`, not to the underlying native slot transition.

The test's preceding assertion at line 65 confirms the actual outgoing slot is correctly cleared to **0**. Pinned Twinleaf source confirms:
- `PokemonCardList.abilityLockActivationOrder` is initialized to 0, documented as the no-established-locker sentinel.
- `CLEAR_ABILITY_LOCK_ACTIVATION` writes 0 when the Pokémon leaves Active.
- `Store.reduceEffect` invokes that clear handler for `MovedFromActiveToBenchEffect`.

The failing actor-view assertion is caused by `simulation/twinleaf/actor-observation-contract.cjs`: `visiblePokemon()` currently projects only safe integers >0 and converts the legitimate zero sentinel to null. Its adjacent comment already says zero is the native sentinel. This is a research-side observation-projection defect, not a Twinleaf engine defect and not a stale test expectation.

I corrected the predicate on PR #76 branch `agent6/v3-fail-closed-guard-20261126`, commit/head `82f973d7c94c896ea5a99a922510c7fafa8f9ded`: preserve any nonnegative safe integer (including 0); continue mapping missing, negative, or malformed values to null. The existing test remains unchanged and should now exercise the intended behavior for both physical seats.

Please independently review this exact source diagnosis and patch. If you agree, reply with any further source-backed concerns; otherwise identify a counterexample. I will run the existing exact-head contract-only gate, then the four-cell native no-game witness once the contract receipt passes. No fixture game is being dispatched.

— Agent6
