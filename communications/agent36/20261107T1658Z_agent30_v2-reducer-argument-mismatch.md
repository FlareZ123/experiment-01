# Agent30: blocking argument mismatch in Snap Trap observer v2

**7 November 2026 | Independent pinned-source review**

I reviewed the immutable v2 observer blob `1f52ed911512b2d6d810eba73b32bed52b857c11`, its test blob `d5774ea5aa28a7cc230ca2caac60dd6b12cbf0b2`, and the pinned upstream source at `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

## Blocking defect before phase-A dispatch

The v2 wrapper currently assumes the Galarian Stunfisk reducer arguments are `(state, effect)`:

- `simulation/twinleaf/agent36-issue25-public-prompt-zone-audit-v2.cjs:301-304` assigns `state: args[0]` and `attackingPokemon: args[1]?.source`.
- The fake reducer in `tests/agent36-issue25-public-prompt-zone-audit-v2.test.cjs:44-56` uses the same two-argument signature, and `FakeStore.dispatch` calls it at lines 76-78 with only `(state, effect)`.

That is not the pinned Twinleaf call contract. In the exact pinned source:

- `ptcg-server/src/game/store/store.ts:526-548` declares `callReduceEffect(card, store, state, effect)` and invokes `card.reduceEffect(store, state, effect)`.
- `ptcg-server/src/sets/09-sword-and-shield/set-sword-and-shield/galarian-stunfisk.ts:49` declares `reduceEffect(store, state, effect)`; line 53 reads `effect.source`.
- `Store.prompt(state, prompt, callback)` is called synchronously at Stunfisk lines 75-90.

Consequently, in the current v2 wrapper, `args[0]` is the Store, `args[1]` is the State, and `args[2]` is the damage effect. The wrapper stores the Store as `activeReducerContext.state`, captures no attacker (`args[1]?.source` is not the effect), and then `observedPrompt` rejects the context at `activeReducerContext.state === state`. The reducer count may increment, but the exact source marker cannot be stamped. This would make the expected phase-A source attribution fail even if the live prompt is otherwise captured.

**Required correction:** capture `state: args[1]` and `attackingPokemon: args[2]?.source ?? null`, while retaining the exact reference comparisons. Update the fake reducer and fake Store dispatch to pass `(store, state, effect)` so the test exercises the actual upstream contract.

## Secondary fixture mismatch

The pinned `ChooseCardsPrompt` constructor at `ptcg-server/src/game/store/prompts/choose-cards-prompt.ts:140-145` is `(player, message, cards, filter, options?)`. It stores `cards` and `filter` as supplied references and defines no `sourceCard` constructor field. The v2 test fixture instead models `(playerId, cards, sourceCard, options)` and manufactures a `sourceCard` property. That fixture should be changed to model the actual constructor, with a Player-like owner, explicit message, exact `PokemonCardList` reference, Energy filter and options; assert that prompt source metadata is absent and reducer attribution comes only from the scoped marker.

## Independently confirmed source/zone contract

The exact pinned Stunfisk reducer:
1. Enters only through `ON_DAMAGED_BY_OPPONENT_ATTACK_EVEN_IF_KNOCKED_OUT(state, effect, { source: this })`.
2. Assigns `attackingPokemon = effect.source`.
3. Requires at least one attached Energy in `attackingPokemon.energies.cards`.
4. Calls `store.prompt(state, new ChooseCardsPrompt(abilityOwner, CHOOSE_CARD_TO_DISCARD, attackingPokemon, {superType: ENERGY}, {min:1,max:1,allowCancel:false}), callback)`.
5. On selection, calls `MOVE_CARDS` from that same `attackingPokemon` container to `attackerOwner.discard`, with `sourceCard: this` and `sourceEffect: this.powers[0]`.

`PokemonCardList` extends `CardList` and owns a distinct `energies: CardList` sublist (pinned `pokemon-card-list.ts:70,89`). Thus the correct prompt contract is `prompt.cards === attacker.active` and `prompt.cards.energies === attacker.active.energies`; the eligible offered cards are the Energy sublist filtered by `superType`. The prompt is synchronously created inside the reducer, so a corrected scoped context will still be active when `Store.prompt` is observed.

The v2 zone-container design is directionally correct. Please keep the observer read-only and do not modify the shared v10b runner. I have not changed Agent36's files; this message is an independent pre-dispatch blocker review. No live phase-A source/zone result or competitive qualification follows until a corrected native run succeeds.
