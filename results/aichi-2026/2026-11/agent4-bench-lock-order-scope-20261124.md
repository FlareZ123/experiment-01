# Bench/global Ability-lock activation order is not covered by the v4 Active-order field

**Checked:** 2026-11-24, against the repository's pinned Twinleaf submodule revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

## Question

Does `actorObservation.visiblePokemon[].abilityLockActivationOrder` represent when a Bench/global Ability suppressor enters play or becomes effective, or only Active-lock activation order?

## Conclusion

**It is Active-entry order for Pokémon whose Power is explicitly marked `abilityLock: true`. It does not represent activation order for Bench/global suppressors such as Alolan Muk's Power of Alchemy or Tool-equipped Garbodor's Garbotoxin.** The field must not be used to infer precedence for those sources. A zero/null value is missing ordering evidence, not a turn-player tie.

## Pinned-source evidence

- `ptcg-server/src/game/store/state/pokemon-card-list.ts:78-84` documents the slot field as the last activation of an `abilityLock` Ability **while Active**; zero means no established ability locker.
- `ptcg-server/src/game/store/prefabs/ability-lock.ts:457-469` documents `STAMP_ABILITY_LOCK_ACTIVATION` as stamping when an `abilityLock` Pokémon becomes Active and returns unless `card.powers.some(p => p.abilityLock)`.
- `ptcg-server/src/game/store/store.ts:140-148` stamps only on `MovedToActiveEffect` and clears on `MovedFromActiveToBenchEffect`.
- `ptcg-server/src/game/store/effect-reducers/game-effect.ts:896-900` resets/restamps only when the evolving slot is the Active slot. `setup-reducer.ts:299,576` stamps starting Active lockers together.
- Basic Pokémon placement from hand, deck, and discard is handled by `play-pokemon-effect.ts:52-56`, `play-pokemon-from-deck-effect.ts:28-35`, and `play-pokemon-from-discard-effect.ts:27-35`; those paths move the Pokémon into the target slot and set `pokemonPlayedTurn`, but do not stamp activation order.
- Alolan Muk SUM's `Power of Alchemy` is a global Basic-Pokémon suppressor that checks for Muk anywhere in play; its Power does not declare `abilityLock: true` (`set-sun-and-moon/alolan-muk.ts:22-25,72-103`).
- Garbodor DRX's `Garbotoxin` is a global suppressor when the Pokémon has a Tool; its Power likewise does not declare `abilityLock: true` (`set-dragons-exalted/garbodor.ts:29-37,57-84`). Its effective-onset event is Tool attachment, not merely Pokémon entry.
- By contrast, Klefki SVI and Flutter Mane TEF declare `abilityLock: true` and their text is Active-Spot scoped.

The v4 observation adapter correctly projects the slot property (not the Pokémon card object). That fixes the Active-lock projection bug, but does not broaden what the pinned engine records.

## Consequence for the candidate resolver

The candidate resolver's Bench/global-source cases cannot obtain a reliable activation order from this v4 field. Do not:
- treat zero as an established order;
- use `turnSeat` as a fallback for a Bench/global source;
- infer first-in-effect precedence between a Bench/global source and an Active locker from the Active-only field.

Keep mixed-source conflicts unknown/fail-closed until the applicable paper precedence is established and the necessary event history is available.

If first-in-effect precedence is confirmed for these mixed sources, the minimal research-side solution is a **separate effective-suppression-source order ledger**, not repurposing `abilityLockActivationOrder`. It would need to capture the moment each source becomes effective across all relevant play-from-hand/deck/discard paths, Tool attachment/removal for Garbotoxin, and source disable/removal/evolution transitions. Keep it in research-owned hooks/adapters; do not modify upstream Twinleaf.

## Limits

This is a pinned-source lifecycle finding, **not** a paper ruling that every mixed Alolan Muk/Garbodor versus Active-lock interaction uses first-in-effect precedence. No code, test, workflow, deck, fixture, or game was changed or run.
