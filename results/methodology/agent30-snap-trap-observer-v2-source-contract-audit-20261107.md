# Agent30: Snap Trap prompt observer v2 source-contract audit

**7 November 2026 | Agent30 | source audit and cancelled diagnostic | no native v2 receipt**

## Question

Does the Agent36 v2 read-only observer correctly attribute the live `CHOOSE_CARD_TO_DISCARD` prompt to Galarian Stunfisk SSH / Snap Trap, and does its test fixture represent the pinned Twinleaf method contract?

## Fixed vendor and repository provenance

The root repository records the submodule at `vendor/twinleaf` with remote `https://github.com/twinleafgg/twinleafgg.git`. The gitlink in the main tree pins `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. The audit used source files fetched from that exact upstream commit.

Reviewed research blobs:

| File | Blob |
| --- | --- |
| `simulation/twinleaf/agent36-issue25-public-prompt-zone-audit-v2.cjs` | `1f52ed911512b2d6d810eba73b32bed52b857c11` |
| `tests/agent36-issue25-public-prompt-zone-audit-v2.test.cjs` | `d5774ea5aa28a7cc230ca2caac60dd6b12cbf0b2` |
| `simulation/twinleaf/agent10-stunfisk-snap-trap-prompt-marker.cjs` | retrieved current blob during review |
| `tests/2026-11/agent10-stunfisk-snap-trap-prompt-marker.test.cjs` | `adca16dd0ddfe3d5e1765c88441378cd7dd4f359` |

## Pinned source contract

At the pinned revision:

1. `ptcg-server/src/game/store/effects/game-effects.ts:199-218` constructs `AttackEffect` with `source = player.active`.
2. `ptcg-server/src/game/store/effects/attack-effects.ts:33-50,116-124` copies that source reference through `AbstractAttackEffect` into `AfterDamageEffect`.
3. `ptcg-server/src/game/store/effect-reducers/attack-effect.ts:59-61,317-319` creates the `AfterDamageEffect`, assigns its target and calls `store.reduceEffect(state, afterDamageEffect)`.
4. `ptcg-server/src/game/store/store.ts:526-548` invokes card reducers as `card.reduceEffect(store, state, effect)`.
5. `ptcg-server/src/sets/09-sword-and-shield/set-sword-and-shield/galarian-stunfisk.ts:49-90` declares `reduceEffect(store, state, effect)`, assigns `attackingPokemon = effect.source`, checks `attackingPokemon.energies.cards`, and synchronously calls `store.prompt(state, new ChooseCardsPrompt(... attackingPokemon, {superType: ENERGY}, {min:1,max:1,allowCancel:false}), callback)`.
6. `ptcg-server/src/game/store/prompts/choose-cards-prompt.ts:132-171` declares the constructor `(player, message, cards, filter, options?)`, retaining `cards` and `filter` as supplied references. It does not add sourceCard metadata.
7. `ptcg-server/src/game/store/state/pokemon-card-list.ts:70-90` establishes that `PokemonCardList` extends `CardList` and owns a distinct `energies: CardList` sublist.
8. `ptcg-server/src/game/store/store.ts:206-235` pushes the prompt synchronously.

This proves the intended object-identity chain: `AttackEffect.source` is the attacker's original Active `PokemonCardList`; `AfterDamageEffect.source` preserves that reference; Stunfisk's local `attackingPokemon` preserves it; and `ChooseCardsPrompt.cards` receives the same object. The Energy filter makes `attackingPokemon.energies` the eligible subzone. The reducer callback later supplies `sourceCard: this` and `sourceEffect: this.powers[0]` to `MOVE_CARDS`, not to the prompt constructor.

## Blocking v2 defect

The v2 observer wraps `GalarianStunfisk.prototype.reduceEffect` at lines 296-317, but records:

```js
activeReducerContext = {
  state: args[0],
  sourceCard: this,
  attackingPokemon: args[1]?.source ?? null
};
```

The pinned call is `reduceEffect(store, state, effect)`. Thus `args[0]` is the Store, `args[1]` is State, and `args[2]` is the effect. The observer's later `activeReducerContext.state === state` check in `observedPrompt` cannot pass for the live prompt, and the attacker reference is null. The reducer counter can increment while the source marker remains absent.

The v2 test fixture masks this mismatch: its fake reducer is `reduceEffect(state, effect)` and its fake dispatch invokes that two-argument method. Its fake ChooseCardsPrompt constructor also uses `(playerId, cards, sourceCard, options)`, unlike the pinned `(player, message, cards, filter, options)` signature. Those tests do not exercise the native reducer/prompt contract.

**Correction required before a valid v2 run:** capture `state: args[1]` and `attackingPokemon: args[2]?.source ?? null`; make the fake reducer/dispatch use `(store, state, effect)`; and make the fake prompt constructor match the pinned argument order while leaving `prompt.sourceCard` absent.

## Additional scope limitation

The v2 marker finds the Stunfisk source seat only when the source card remains in that player's Active slot. This matches the observed phase-A board (10 damage on Galarian Stunfisk SSH, which has 120 HP). Snap Trap's printed text also triggers even if Stunfisk is Knocked Out, so a future general resolver must not infer that the source is always still Active after damage. Keep the current marker explicitly scoped to the observed active-source witness, or capture source ownership from the damage target before a KO transition.

## Executed workflow evidence

- Agent36 v2 phase-A workflow run [42393413296](https://github.com/FlareZ123/experiment-01/actions/runs/42393413296), head `9c23b11514fd949b98d4046210a018a71c2e4436`, was **cancelled** during native-server installation/compilation at 16:53:50Z.
- Its syntax checks, v2 tests, and frozen v10b phase-A diagnostic were skipped. It produced no observer test result and no live prompt source/zone artifact.
- Agent10's separate pure marker contract suite completed successfully: [run 42390825394](https://github.com/FlareZ123/experiment-01/actions/runs/42390825394), 18/18 tests. This validates the injected marker contract only, not a native source/zone observation or Energy settlement.

## Disposition and next gate

Agent36 owns the v2 observer and its versioned diagnostic; no shared observer or v10b files were changed by this audit. The source/zone design is directionally correct, but the v2 reducer context must be corrected before interpreting any marker result. Agent10's existing `withStunfiskSnapTrapPromptMarker` uses the actual three-argument reducer signature and may be reused or used as a cross-check.

A successful subsequent phase-A artifact must show the exact live prompt object, Stunfisk/Snap Trap reducer origin, attacker Active `PokemonCardList` identity, attached-Energy sublist identity, one mandatory Energy option, correct owner/attacker seats, and no hidden-zone identities. A later, separately scoped native test is required to prove a selected physical Energy leaves that exact `attackingPokemon.energies` list and enters the attacker's discard with the expected `MOVE_CARDS` sourceCard/sourceEffect. Neither phase-A observation nor staged settlement alone qualifies a competitive game.

**No deck selection, matchup rate, qualified game, or 99.5% claim changes from this source audit.**
