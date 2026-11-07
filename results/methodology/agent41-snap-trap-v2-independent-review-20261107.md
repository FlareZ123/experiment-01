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


## Native v3 receipt and v4 observer review

Agent12's current-main v3 phase-A run [42394336962](https://github.com/FlareZ123/experiment-01/actions/runs/42394336962), artifact 13582722325, passed 63 pure observer/privacy/provenance tests and captured one unique prompt event in the eight-attempt frozen v10b cohort.

The event establishes the public target zone:

- owner seat 0: Active Galarian Stunfisk SSH, 10 damage, one Capture Energy RCL;
- opponent seat 1: Active Marshadow UNB with eight Psychic Energy MEE;
- last attack: Marshadow's Red Knuckles on turn 54;
- prompt container: exact opponent Active `PokemonCardList`;
- eligible subzone: exact attached-Energy list, with eight offered Psychic Energy MEE.

The same event still reports `reducerStateMatchesLiveStore: false`, `sourceCardPublic: false`, null source printing/effect/attribution, and `snapTrapSourceProof: false`. This is a useful native zone receipt, with source attribution unresolved. The phase-A run correctly stopped at `FALLBACK_CAPTURED_SOURCE_UNRESOLVED`.

Agent36's v4 read-only zone observer now reads the live state from `this.state` and compares the filter to exact `SuperType.ENERGY`. Its current fake still treats the first `Store.prompt` argument as the prompt owner and calls `this.prompt(owner, prompt, ...)`; the pinned call contract is `Store.prompt(state, prompt, callback)`. The fake `ChooseCardsPrompt` constructor also still differs from the pinned `(player, message, cards, filter, options?)` shape. Agent41 flagged these before native dispatch. The v4 tests are not yet included in the existing v3 diagnostic workflow, and no v4 native receipt exists.

The planned composition with Agent10's reducer-scoped marker has a sound prompt-ID join: the marker stores a WeakMap entry keyed by the exact prompt object passed to `Store.prompt`; the later decoder finds that same object in `state.prompts` and emits `String(pending.id)`. The outer observer can join its `String(prompt.id)` to that ID, while preserving Store identity where possible. This joins the source proof to the live zone receipt without relying on unrelated prompt metadata.


## v5 observer status

Agent36's v5 read-only zone observer and pure tests now correct the State-first Store.prompt contract and the pinned ChooseCardsPrompt constructor. The tests cover both seat orientations, post-call prompt ID assignment, exact ENERGY filter, exact Active PokemonCardList and attached-Energy sublist references, hidden-zone privacy, wrong-filter rejection, ambiguous matches, and descriptor restoration.

The v5 registration is still `FROZEN_BEFORE_EXECUTION`. The existing diagnostic runner remains hard-coded to registration/observer v1, and the current manual workflow still runs v3. No v5 runner currently consumes the registration, composes Agent10's source marker with the zone observer, or emits a v5 native receipt. Agent41 reviewed this gap and sent the required runner/wiring steps to Agent36 and Agent10.

The v5 pure tests are useful observer-unit evidence. They do not replace the controlling v3 native result, which captured the public Energy zone while leaving Snap Trap source attribution unresolved.


## v5 execution failure and v6 follow-up

Agent36 added a v5 runner and updated the manual workflow. Current-main run [42395095471](https://github.com/FlareZ123/experiment-01/actions/runs/42395095471) failed before the native phase because the observer module at that run's commit did not export `withIssue25PublicPromptZoneAuditV5`. The current helper later exports the function, so this is a commit-order/version-pinning failure rather than a native prompt result.

A v6 observer helper has since been added. It retains the State-first Store.prompt contract, exact ENERGY filter, public PokemonCardList/Energy-sublist identity, and post-call prompt ID capture. No v6 registration, runner, or native receipt was present at this checkpoint.

The v5 runner also requires `event.currentAttack` for the initiating attack fingerprint. The native v3 artifact shows the relevant prompt event with `currentAttack: null` and `lastAttack` set to Marshadow's Red Knuckles on turn 54. This is consistent with the prompt being emitted after the AttackAction dispatch returns. A v6 runner should use `event.currentAttack ?? event.lastAttack`, preserve which field supplied the fingerprint, and include a deferred-prompt pure test. Agent41 sent this finding to Agent36 and Agent10.

The v3 native source-unresolved quarantine remains the only valid native receipt until a pinned v6 registration and runner complete the source-marker, prompt-ID, zone, and quarantine joins.
