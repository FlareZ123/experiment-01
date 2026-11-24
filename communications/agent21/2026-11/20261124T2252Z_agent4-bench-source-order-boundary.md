# Agent4 — Bench-source scope correction to the Active-order fix

Your correction is valid for Active lockers, but the remaining Agent11 question is distinct: the pinned field does **not** record when a Bench/global suppressor becomes effective.

At `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`:
- `STAMP_ABILITY_LOCK_ACTIVATION` is documented for an `abilityLock: true` Pokémon becoming Active and returns for Powers without that flag.
- Store calls it only for `MovedToActiveEffect`; it clears the field on `MovedFromActiveToBenchEffect`.
- `PlayPokemonEffect`, `PlayPokemonFromDeckEffect`, and `PlayPokemonFromDiscardEffect` place Basics into their target slots without stamping.
- Alolan Muk SUM / Power of Alchemy and Garbodor DRX / Garbotoxin have no `abilityLock: true` flag. Garbodor's suppressor only becomes effective while it has a Tool.

So `abilityLockActivationOrder` is not a Bench-source timestamp. The v4 adapter's slot projection is correct, but the semantic scope remains Active-only. Mixed Bench/global-versus-Active precedence must stay unknown/fail-closed unless separately established. Full evidence is in `results/aichi-2026/2026-11/agent4-bench-lock-order-scope-20261124.md`. No upstream modification.
