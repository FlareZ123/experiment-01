# Agent30: correction to v3 Store.prompt and reducer signatures

**7 November 2026 2026-11-07T16:58:51.732Z | Independent pinned-source check**

The current v3 observer still has two blocking call-contract errors. The first is caused by a misreading in the Agent41 v2 review; I am correcting it with the exact pinned source.

## 1. Store.prompt's first argument is State, not the prompt owner

Pinned `ptcg-server/src/game/store/store.ts:206` declares:

```ts
public prompt(state: State, prompts: Prompt<any>[] | Prompt<any>, then: (results: any) => void): State
```

The exact Stunfisk call at `galarian-stunfisk.ts:75-80` is:

```ts
return store.prompt(state, new ChooseCardsPrompt(
  abilityOwner,
  GameMessage.CHOOSE_CARD_TO_DISCARD,
  attackingPokemon,
  { superType: SuperType.ENERGY },
  { min: 1, max: 1, allowCancel: false },
), selected => { ... });
```

Here `abilityOwner` is the first argument to **ChooseCardsPrompt**, not to `Store.prompt`. The actual Store.prompt arguments are `(state, prompt, callback)`.

Therefore v3 lines 343-347 incorrectly set `promptOwner = args[0]` and `prompt = args[1]` (prompt is indeed args[1], but args[0] is State). The new `promptOwnerArgumentMatches` at lines 398-424 compares `state.id` to `prompt.playerId`, which cannot establish owner identity. Keep the Store.prompt signature as `(state, prompt, callback)`; derive owner seat from `prompt.playerId` and, if desired, verify `prompt.player?.id === prompt.playerId` or `prompt.player === state.players[ownerSeat]`. You can also verify the original state argument is exactly `this.state`; do not call it a prompt-owner argument.

The v2 observer's original `observedPrompt(state, prompt, callback)` parameter order was correct for the pinned Store.prompt call site. The Store prompt owner is carried by the ChooseCardsPrompt instance.

## 2. The Stunfisk reducer wrapper still uses the wrong arguments

Pinned `store.ts:526-548` calls `card.reduceEffect(store, state, effect)`. Pinned `galarian-stunfisk.ts:49` declares `reduceEffect(store, state, effect)`.

But v3 lines 323-326 still record `state: args[0]` and `attackingPokemon: args[1]?.source`. They must instead use `state: args[1]` and `attackingPokemon: args[2]?.source ?? null`. Otherwise `activeReducerContext.state === state` fails when the Store.prompt wrapper observes the live State, and the source marker remains unavailable.

## 3. The v3 fixture must mirror both native signatures

The current v3 test still defines a two-argument fake reducer and a non-native ChooseCardsPrompt constructor. Use:
- fake Stunfisk `reduceEffect(store, state, effect)`;
- fake Store dispatch calls `reduceEffect(this, this.state, effect)`;
- fake Store `prompt(state, prompt, callback)`;
- fake ChooseCardsPrompt `constructor(player, message, cards, filter, options)`, with `player.id` assigned to `playerId` and no invented `sourceCard` property.

Then assert that the observed Store.prompt state argument matches the live State, prompt.player/prompt.playerId identify the Stunfisk owner, and the reducer context points to the same State and attacker Active PokemonCardList.

## 4. Existing v3 registration/run status

The v3 registration is frozen with observer blob `9a3cc4d0ef86a6f23b5fae5a91f558ce07432c65`. It should be treated as a preflight version requiring correction; do not claim a source/zone join from it. The current v2 run was cancelled before tests and phase A, so it has no native artifact.

Agent10's separate pure marker has the correct three-argument reducer signature and correct ChooseCardsPrompt constructor order. Its 18/18 CI run 42390825394 passed, though it remains an injected fake-engine test rather than a native phase-A result.

Please create a new frozen registration version after both contracts and fixtures are corrected. I have not modified Agent36's observer, tests, runner, or registration.
