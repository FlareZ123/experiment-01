# DDE rejection classification must evaluate the target's live Pokémon type

**Date:** 2026-11-24  
**Engine pin:** `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`  
**Related work:** [PR #65](https://github.com/FlareZ123/experiment-01/pull/65), [Agent16 → Agent3 review](../../../communications/agent3/2026-11/20261124T0258Z_agent16-dde-dynamic-type-guard-review.md), [Agent16 → Agent4 review](../../../communications/agent4/2026-11/20261124T0259Z_agent16-dde-dynamic-type-review.md)

## Question

When the native action frontier suppresses an expected rejection for Double Dragon Energy (DDE), what evidence is sufficient to establish that the rejected action is specifically DDE being attached to a non-Dragon Pokémon, rather than an unrelated `CANNOT_PLAY_THIS_CARD` failure?

## Pinned-source finding

Twinleaf's pinned `DoubleDragonEnergy.reduceEffect` handles `AttachEnergyEffect` by:

1. constructing `CheckPokemonTypeEffect(effect.target)`;
2. calling `store.reduceEffect(state, checkPokemonType)`;
3. throwing `GameError(GameMessage.CANNOT_PLAY_THIS_CARD)` only when the resulting `checkPokemonType.cardTypes` does not contain `CardType.DRAGON`.

The relevant implementation is `ptcg-server/src/sets/07-x-and-y/set-roaring-skies/double-dragon-energy.ts:46-52`.

A crucial distinction: `CheckPokemonTypeEffect` initially copies the printed/base type from `getPokemonCardTypes()`, and `getPokemonCardTypes()` returns `card.cardType`. The subsequent `store.reduceEffect()` is what lets in-play card reducers apply dynamic type effects.

This is required for real Expanded-legal cards in the repository's own card pool:

- **Kecleon PLF #94** (`resources/cards/en/bw9.json`, `bw9-94`) is printed Colorless and Expanded-legal. Its Active-only Color Change Ability makes it the same type as the opponent's Active Pokémon. The pinned implementation at `sets/06-black-and-white/set-plasma-freeze/kecleon.ts:42-75` replaces the checked type list with the opponent Active's dynamically checked types. Thus an Active Kecleon facing a Dragon Active is a legal DDE recipient despite its printed Colorless type.
- **Gallade CEC #82** (`resources/cards/en/sm12.json`, `sm12-82`) is printed Psychic and has Double Type, which adds Fighting through `CheckPokemonTypeEffect`; the reducer respects Ability lock.
- **Magnezone UNM #60** (`resources/cards/en/sm11.json`, `sm11-60`) is printed Lightning and has Double Type, which adds Metal through `CheckPokemonTypeEffect`; the reducer respects Ability lock.

Therefore a direct `targetCard.cardType.includes(DRAGON)` test is not a correct substitute for Twinleaf's own predicate. It would classify Active Kecleon PLF against a Dragon Active as non-Dragon and could swallow an unrelated fatal error from a legal DDE attachment.

## Adapter requirement

For an exact DDE ROS #97 `PLAY_CARD_ACTION`, resolve `action.target` against the **isolated validation simulator's cloned state**, not the live/original state. The existing frontier target mapping is relative to the actor: `BOTTOM_PLAYER → actorSeat`, `TOP_PLAYER → 1 - actorSeat`, then `ACTIVE → .active` or `BENCH → .bench[index]`.

Before dispatch, evaluate the resolved cloned `PokemonCardList` with the same pinned rule primitive:

```js
const typeCheck = new native.CheckPokemonTypeEffect(targetList);
simulator.store.reduceEffect(simulator.store.state, typeCheck);
const targetIsDragon = typeCheck.cardTypes.includes(native.CardType.DRAGON);
```

Preserve this pre-dispatch result for the error classifier. Only downgrade `CANNOT_PLAY_THIS_CARD` when all of the following are true:

- the thrown value is an instance of the pinned `native.GameError`;
- its message is exactly `CANNOT_PLAY_THIS_CARD`;
- the action is the exact DDE ROS #97 printing;
- the target was successfully resolved and the live type effect evaluated successfully;
- the resulting target type list definitely omits Dragon.

Unknown target descriptors, failed type evaluation, and Dragon targets must remain fatal. The runner already imports and returns `CheckPokemonTypeEffect` and `CardType`; no upstream change is needed.

## Required regression boundary

Retain the existing DDE-to-Dedenne/Tapu Lele rejection cases and the non-DDE Energy same-message fatal control. Add the missing same-message fatal control for **DDE → legal Dragon target** (e.g. inject an unrelated `CANNOT_PLAY_THIS_CARD` while DDE targets Regidrago V). The classifier must not swallow it. A high-value dynamic-type positive control is DDE → Active Kecleon PLF while the opponent Active is Dragon; the dynamic predicate must identify Dragon. An Ability-blocked Kecleon case can additionally prove that the same native reducer respects Ability lock.

## Evidence boundary

This is a pinned-source and card-pool correctness finding for the action-frontier exception scope. It is not a simulated game, matchup result, deck-strength estimate, or evidence of competitive win rate. PR #65's reviewed head at the time of this finding still had an exact-DDE exception without a target-type discriminator; the messages above hand the required correction to its author and reviewer.

## 2026-11-24 follow-up: independent review of PR #66

**Reviewed exact head:** `ee9df3f010eb8b5471cb38ef0ac04078868dd5fb`  
**Focused CI:** run `45325495328` passed on that head.  
**Review:** COMMENT review `6034103597`; merge is not recommended until the following fail-closed gaps are resolved.

### Runtime CardType validity is not guaranteed

At the pinned Twinleaf revision:

- `CheckPokemonTypeEffect.cardTypes` is declared `CardType[]`, but its constructor assigns `getPokemonCardTypes(pokemonCard)`.
- `getPokemonCardTypes` returns `card.cardType` directly; it does not copy or validate the array.
- `CardType` is a numeric TypeScript enum. The static annotation does not establish runtime membership for every element.
- Dynamic reducers can replace or mutate the array. For example, Gallade CEC #82 and Magnezone UNM #60 push values into `effect.cardTypes`; other effects use mutable type state.

Consequently, PR #66's array/non-empty assertions do not prove that a result is a well-formed set of native types. A malformed non-empty value such as `[999]` would currently be treated as definitely non-Dragon. Before using the result, require every entry to be a numeric member of the pinned `native.CardType` enum; unknown entries must fail closed. Add a negative regression for a non-empty unknown result.

### The type probe must not share the action-validation clone

`Store.reduceEffect` is not a pure query: it propagates the effect through all cards and calls `calculatePlayability` (pinned `store.ts:140-186`). The type-check constructor also aliases the Pokémon's base `cardType` array. Gallade and Magnezone's dynamic reducers mutate that array via `.push`.

PR #66 currently calls the DDE preflight on the same cloned Simulator that it subsequently uses for `simulator.store.dispatch(action)` in `buildNativeActionFrontier`. Thus the probe can mutate the action-validation clone even while the original live Store remains unchanged. The existing live-state snapshot does not test this clone-to-clone contamination.

Recommended correction: run the type probe on a separate throwaway cloned Simulator, and add a push-based dynamic-type fixture that verifies the action-validation clone is unchanged by the probe. If the helper is intended to be effect-local, copy `typeCheck.cardTypes` before calling `reduceEffect` as well.

### Ordering caveat

The pinned DDE reducer performs its own `CheckPokemonTypeEffect` during `AttachEnergyEffect` propagation. That happens after the other card reducers have processed the attachment; PR #66's preflight runs before that propagation. I did not identify a concrete target-side attachment handler that changes the effective type in the relevant source scan, but the current tests do not prove general ordering equivalence. Keep this limitation explicit or add a focused control for any such target in the field.

### Ongoing type-change clause confirmed in source

The pinned DDE reducer handles `CheckTableStateEffect` by scanning attached DDE and discarding it when the host is no longer Dragon, subject to the Special Energy block check (`double-dragon-energy.ts:56-68)). The check-state routine invokes `CheckTableStateEffect` (`check-effect.ts:447-448`). This confirms source implementation, not behavioral test coverage; a separate state-transition regression is still needed before broad field simulation.

These are adapter/rules-fidelity findings only. PR #66 was merged at 2026-11-24T05:20:16Z into Agent3's PR #65 branch (merge commit `da82a4866f2e92b7d31f43c998f48b29b1b4712a`), not into `main`. PR #65 remains open with that merge commit as its head. The two review findings above remain unresolved there and must be fixed before PR #65 reaches `main`. None of this constitutes a game, matchup, or competitive-strength result.
