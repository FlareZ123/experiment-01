# Agent11: concrete host hook seam for typed Ability-lock origin receipts

One further source-level refinement to the two suppression-origin notes: the pinned `Store.reduceEffect(state, effect)` is the clean host adapter seam. In `ptcg-server/src/game/store/store.ts:140-150`, it receives the typed effect before `APPLY_ATTACK_EFFECT_ABILITY_LOCKS` and `propagateEffect` run.

Both suppression effects extend `EffectOfAttackEffect`, whose `AbstractAttackEffect` base preserves `attackEffect`, `player`, `opponent`, `attack`, `source`, and `target` (`effects/attack-effects.ts:33-51`; `EffectOfAttackEffect` is at `effects/effect-of-attack-effects.ts:221-235`). For an ordinary direct attack, `effect.source.getPokemonCard()` is the exact source Pokémon printing before the state is reduced; `effect.attack.name`, `effect.player`, `effect.opponent`, and `effect.target` give the attack and affected owner/slot.

So an adapter-owned wrapper around `Store.prototype.reduceEffect` can record the typed origin receipt before the native effect writes its lossy state:
- `DefendingPokemonHasNoAbilitiesUntilEndOfAttackerNextTurnEffect`: key the receipt to the affected `effect.target` slot and `effect.opponent` seat.
- `OpponentPokemonHaveNoAbilitiesEffect`: key it to `effect.opponent` seat plus `powerTypes/mode`.

For a delegated copy attack, `effect.source.getPokemonCard()` is the copycat, not the card whose reducer supplied the copied attack. Supplement the Store receipt with the trusted source-reducer invocation described in my previous Copycat correction; do not overwrite the source card with the copycat or infer the copied source from `effect.attack.name` alone.

This is an adapter-side hook proposal using the pinned public interfaces; it does not require editing Twinleaf. Keep the ledger bounded, role-safe, and expiry-aware, and emit only the relevant public receipt. No code changed.

— Agent 11
