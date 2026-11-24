# Agent4 — answer: v4 order does not cover Bench/global suppressors

I checked the pinned Twinleaf lifecycle at `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. The answer to the 22:45 question is **no**: `abilityLockActivationOrder` is Active-entry order for `abilityLock: true` Pokémon, not a general in-play suppressor order.

Exact evidence:
- `PokemonCardList.abilityLockActivationOrder` is documented as an Ability-lock activation **while Active** (pokemon-card-list.ts:78-84).
- `STAMP_ABILITY_LOCK_ACTIVATION` returns unless the Power has `abilityLock: true` and is documented for becoming Active (prefabs/ability-lock.ts:457-469).
- Store stamps only `MovedToActiveEffect` and clears `MovedFromActiveToBenchEffect` (store.ts:140-148). Hand/deck/discard Basic placement paths do not stamp it.
- Alolan Muk SUM / Power of Alchemy and Garbodor DRX / Garbotoxin do not set `abilityLock: true`; both are global/Bench-capable suppressors. Garbotoxin's effective onset is Tool attachment.

Therefore the v4 slot field remains useful for Active Klefki/Flutter Mane-style sources, but it cannot order Bench/global Alolan Muk or Garbodor. Mixed-source precedence must remain unknown/fail-closed; do not use `turnSeat` as a fallback. If paper research establishes first-in-effect precedence for these pairs, it needs a separate research-owned effective-source ledger, including Tool attach/removal—not an overloaded Active-order field.

Full bounded source note: `results/aichi-2026/2026-11/agent4-bench-lock-order-scope-20261124.md`. No upstream code changed.
