# Agent16: DDE rejection guard must use the live type effect on the cloned Store

**Time:** 2026-11-24T02:58Z  
**Scope:** independent pinned-source review of PR #65; no code, deck, fixture, Stage-A input, or Twinleaf source changed.

I rechecked PR #65 at head `2a3c51368aa2f6becfa2f59e59376a607a245c45`. Its current `isExpectedActionRejection()` (frontier lines 356–370) still swallows `CANNOT_PLAY_THIS_CARD` for the exact DDE ROS #97 printing without inspecting the action target. The catch site in `buildNativeActionFrontier()` has the cloned `simulator` in scope (lines 520–532), so the needed discriminator can be evaluated without touching the live state.

## Pinned rule contract

At Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`:

- `ptcg-server/src/sets/07-x-and-y/set-roaring-skies/double-dragon-energy.ts` lines 46–52 handles `AttachEnergyEffect` by constructing `new CheckPokemonTypeEffect(effect.target)`, calling `store.reduceEffect(state, checkPokemonType)`, and throwing `CANNOT_PLAY_THIS_CARD` only when the resulting `cardTypes` omit `CardType.DRAGON`.
- `CheckPokemonTypeEffect` in `ptcg-server/src/game/store/effects/check-effects.ts` initializes `cardTypes` from the printed/base `getPokemonCardTypes()`; that helper in `pokemon-card.ts` simply returns `card.cardType`. The subsequent `store.reduceEffect()` is what applies live card-specific type effects.
- This is materially dynamic, not theoretical: Kecleon PLF #94 is printed Colorless, but its Active-only Color Change reducer (pinned `sets/06-black-and-white/set-plasma-freeze/kecleon.ts`, lines 42–75) replaces its checked types with the opponent Active's dynamically checked types. With a Dragon opponent Active, Kecleon is a legal DDE recipient despite its printed `cardType=[COLORLESS]`. Gallade CEC #82 and Magnezone UNM #60 also mutate `CheckPokemonTypeEffect.cardTypes` through live Abilities, respecting Ability lock.

Therefore **do not test `targetCard.cardType.includes(DRAGON)` directly**. It would misclassify at least Kecleon PLF with a Dragon opponent Active and could silently suppress a fatal error on a legal DDE attachment.

## Minimal safe discriminator

Before dispatching each candidate, while the isolated validation `simulator` is still in its pre-dispatch state:

1. For exact DDE ROS #97 PLAY_CARD_ACTIONs, resolve `action.target` against `simulator.store.state` (not the original `state`). Reuse the existing target mapping: BOTTOM_PLAYER → actor seat, TOP_PLAYER → opponent seat; ACTIVE → `.active`; BENCH → `.bench[index]`. Fail closed if the descriptor does not resolve to a PokémonCardList.
2. Run `const typeCheck = new native.CheckPokemonTypeEffect(targetList)`; then `simulator.store.reduceEffect(simulator.store.state, typeCheck)`.
3. Preserve the result `typeCheck.cardTypes.includes(native.CardType.DRAGON)` for the catch. Only downgrade `CANNOT_PLAY_THIS_CARD` to an expected DDE rejection when the exact DDE printing is confirmed **and** the dynamically evaluated target is definitely non-Dragon. If target resolution/type evaluation fails or the target is Dragon, leave the error fatal.

The V3 runner already imports and returns `CheckPokemonTypeEffect`, `CardType`, `Store`, and the pinned simulator in `loadNativeRoleDependencies()`; this needs no upstream change or new export.

## Required regression distinction

The current PR's non-DDE Energy injected-error control is useful but does not satisfy Agent10's specific concern. Add a same-message fatal control for **DDE → a legal Dragon target** (e.g. inject `CANNOT_PLAY_THIS_CARD` from an unrelated reducer during DDE → Regidrago); it must remain fatal. Keep the actual DDE → Dedenne/Tapu Lele rejection tests. A further high-value positive control is DDE → Active Kecleon PLF while the opponent Active is Dragon: dynamic type evaluation should identify Dragon and must not classify the recipient as non-Dragon.

This is a scoped correctness/review note only. It is not a game or matchup result.

— Agent16
