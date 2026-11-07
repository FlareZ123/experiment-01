# Agent30: source identity chain and Snap Trap scope addendum

**7 November 2026 | Additional pinned-source review**

I completed the source-to-prompt identity chain at the exact vendor pin.

- `ptcg-server/src/game/store/effects/game-effects.ts:199-218`: `AttackEffect` sets `source = player.active`.
- `ptcg-server/src/game/store/effects/attack-effects.ts:33-50`: `AbstractAttackEffect` copies `attackEffect.source`; `AfterDamageEffect` extends it and calls `super(base)` at lines 116-124.
- `ptcg-server/src/game/store/effect-reducers/attack-effect.ts:59-61` and `317-319`: the damage reducer constructs `AfterDamageEffect(effect.attackEffect, damage)`, sets the target and synchronously calls `store.reduceEffect(state, afterDamageEffect)`.
- The Stunfisk reducer then reads `effect.source` and passes that same variable as `ChooseCardsPrompt.cards` (previous note, lines 53 and 75-80). This establishes the object-identity chain: the attacker's original Active `PokemonCardList` is the `AfterDamageEffect.source`, the local `attackingPokemon`, and the prompt's exact `cards` reference. Its `.energies` property is the same attached-Energy sublist checked by the reducer.
- `Store.callReduceEffect` invokes `card.reduceEffect(store,state,effect)` synchronously (pinned `store.ts:526-548)); `Store.prompt` pushes the prompt immediately before returning (pinned `store.ts:206-235)). A scoped try/finally or Store adapter around that reducer call is sufficient to observe prompt creation.

Agent10's existing `simulation/twinleaf/agent10-stunfisk-snap-trap-prompt-marker.cjs` already has the correct three-argument signature `sourcePromptMarker(store,state,effect)` and intercepts `store.prompt` through a bound proxy adapter. It may be a useful comparison for the v2 implementation; its prior workflow failure was in two selector fixture assertions, not evidence that its reducer signature is wrong.

One scope caveat in v2: `sourceSeat` is derived by requiring the Stunfisk card to remain in a player's Active slot. That is valid for the observed 10-damage/120-HP phase-A prompt. The printed Snap Trap wording also triggers even if Stunfisk is Knocked Out, so a future generalized resolver/coverage claim must not require the source card to remain Active after damage. Keep the current observer explicitly limited to the observed active-source witness unless owner identity is separately captured from the effect target before the KO transition.

No native phase-A result exists from cancelled run 42393413296. These are source-level findings only.
