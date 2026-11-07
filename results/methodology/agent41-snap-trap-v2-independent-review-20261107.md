# Agent41 independent review: Snap Trap prompt-zone observer v2

**Date:** 7 November 2026  
**Owner:** Agent41  
**Status:** Pre-dispatch blocker identified and communicated; no native v2 evidence.

## Scope

Review the frozen Agent36 v2 read-only observer and its tests against the pinned Twinleaf Snap Trap reducer and prompt API. This review covers only the source/zone attribution mechanism for the observed mandatory Energy-discard prompt.

## Pinned call contract

Agent30 independently inspected the pinned Twinleaf revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` and established:

- `Store.callReduceEffect` invokes `card.reduceEffect(store, state, effect)`.
- Galarian Stunfisk's reducer signature is `reduceEffect(store, state, effect)`.
- The reducer reads `effect.source` as the attacking PokemonCardList.
- The reducer calls `store.prompt(state, new ChooseCardsPrompt(abilityOwner, message, attackingPokemon, {superType: ENERGY}, {min:1,max:1,allowCancel:false}), callback)`.
- `ChooseCardsPrompt` constructor shape is `(player, message, cards, filter, options?)`.
- `PokemonCardList` owns a distinct `energies` CardList sublist.

The source identity chain is preserved: AttackEffect sets `source` to the attacker's Active PokemonCardList; AfterDamageEffect copies the same source reference; Stunfisk reads it as `attackingPokemon`; and the prompt receives that exact reference as `cards`. Its `.energies` sublist is the same physical Energy container used by the reducer.

## Blocking v2 mismatch

The frozen v2 observer's reducer wrapper currently captures:

- `args[0]` as state;
- `args[1]?.source` as the attacking PokemonCardList.

Under the pinned three-argument reducer contract, those are the Store and State. The observer therefore stores the wrong state object, captures no attacker, and fails the exact state comparison when the nested `Store.prompt(state, ...)` call is observed.

The fake reducer and fake Store dispatch reproduce the same incorrect two-argument contract, so the tests mask the mismatch. The fake `ChooseCardsPrompt` constructor also differs from the pinned constructor and manufactures a `sourceCard` property that the actual prompt does not have.

**Required correction:** capture `state: args[1]` and `attackingPokemon: args[2]?.source ?? null`; update the fake to invoke `reduceEffect(store, state, effect)`; construct the prompt using the real `(player, message, cards, filter, options?)` shape; and assert the source metadata is absent from the prompt. Keep source attribution in the scoped reducer marker.

I initially sent an incorrect review claiming that the first `Store.prompt` argument was the ability owner. Agent30's pinned-source review shows that the prompt wrapper's existing `(state, prompt, callback)` signature is correct. I retracted that claim and sent the corrected reducer-argument diagnosis to Agent36 and Agent10.

## Scope caveats

The current observed 10-damage/120-HP prompt occurs while Stunfisk remains Active, so the current active-source seat lookup is valid for that witness. The printed trigger also covers the Knocked Out case. Any generalized source attribution must preserve the source owner before the KO transition or locate the source in a public zone after movement; the current active-only lookup should remain explicitly scoped to the observed surviving source.

The observer should compare `filter.superType` to the exact runtime `SuperType.ENERGY` value, rather than accepting any defined filter. The current read-only container/subzone design is directionally correct: require exact prompt-container identity with the attacker's Active PokemonCardList and exact Energy-sublist identity, then report only eligible Energy printings.

## Run status

Agent30 reports v2 phase-A workflow [run 42393413296](https://github.com/FlareZ123/experiment-01/actions/runs/42393413296) was cancelled during dependency installation/compile. Syntax checks, v2 observer tests, and the frozen v10b runner were skipped. It produced no observer test result and no live source/zone receipt.

Do not promote or integrate the frozen v2 helper. A versioned correction needs pure tests matching the pinned signatures, then a fresh native positive and negative before the quarantine can be reconsidered. No paper-effect, competitive-game, or deck-strength claim follows from this review.
