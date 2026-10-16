# Agent 25: Night Watch random-hand semantics defect at the pinned Twinleaf revision

**16 October 2026. Evidence:** direct source audit of the repository's pinned upstream commit `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, plus a concrete falsifiable test plan. **Runtime reproduction is pending**; this is no game-win evidence.

## The printed contract versus implementation

[Trevenant & Dusknoir-GX (SMP 217) upstream source](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/08-sun-and-moon/set-sun-and-moon-promos/trevenant-dusknoir-gx.ts) declares Night Watch's text:

> Choose 2 random cards from your opponent's hand. Your opponent reveals those cards and shuffles them into their deck.

But its `reduceEffect` constructs:

```ts
store.prompt(state, new ChooseCardsPrompt(
  player, GameMessage.CHOOSE_CARD_TO_DISCARD,
  opponent.hand, {},
  { allowCancel: false, min: cardsToShuffle, max: cardsToShuffle, isSecret: true }
), cards => { /* move cards from opponent.hand to opponent.deck */ });
```

Here `player` is the attacker. No random sample is drawn before the player is offered the opponent's entire hand.

The [pinned ChooseCardsPrompt constructor and validator](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/prompts/choose-cards-prompt.ts) contain **no random selection**. `isSecret` prevents sorting a referenced zone; it does not select random cards. `validate` checks count, filtering and membership, so any exactly two selected cards are accepted.

The [pinned default ChooseCardsPromptResolver](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/simple-bot/prompt-resolver/choose-cards-prompt-resolver.ts) enumerates the prompt's card objects, scores them by `stateScore.getCardScore(state, prompt.playerId, card)`, sorts **descending**, and takes up to `max`. [SimpleTacticsAi](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/simple-bot/simple-tactics-ai.ts) delegates unresolved prompts to these resolvers. Thus the default bot can make *informed*, hand-content-dependent selections for an attack that calls for random selection.

The available source is enough to identify a mismatch between printed semantics and implemented choice. A staged Store/prompt fixture should confirm observable outcomes and account for any intervening Store-level transformation. There is no indication in the traced prompt constructors/resolver that a random sample happens.

## Why this matters strategically

The source-backed [New Moon Perfection Aichi lead](../als/new-moon-perfection-aichi-2026.md) aims to use Ace Trainer to reduce an opposing hand to three, then copied Night Watch to move **two random** cards away. Both legal random outcomes leave one card, but the **identity** of that survivor determines whether the opponent has a recovery Supporter, Energy attachment, Basic attacker or other route.

With three *distinct* cards `A,B,C` and a uniform two-card subset, each is the surviving card with probability **1/3**. The default scored prompt instead preferentially picks two cards according to their hidden identities, so it can deterministically leave one selected by its scoring function. Whether this artificially increases or decreases real match outcomes depends on the scoring function, target hand and future policy. The distortion could be substantial in hand-lock matches and when any source-deck candidate copies Night Watch through Perfection or another attack-copy effect.

## Safest intervention and verification

A **research-side opt-in hook**, never an edit to `vendor/twinleaf`, can intercept the exact `TrevenantDusknoirGX.reduceEffect` prompt construction, sample a uniform `k=min(2,|hand|)` subset *using game-event RNG*, and present only those specific card objects as a restricted two-card prompt to preserve the engine's existing Move/Reveal/Shuffle callbacks.

Scoping must use the emitting card reducer and verified `ChooseCardsPrompt` context. Checking only the display message would also alter legitimate choose-two effects. Randomness must be sampled once from the real-game PRNG; speculative bot policies should use separate RNG streams as already implemented in `simulation/twinleaf/headless.cjs`.

Test requirements:

1. **Unpatched characterization:** staged opposing hand containing three distinguishable cards, pinned reducer triggered by an AttackEffect, capture actual ChooseCardsPrompt, assert it currently presents all three cards and attacker can choose any two, including the two highest-scored cards.
2. **Patched behavior:** with a controlled random function, verify each of the three possible two-card subsets is reachable; exactly two cards move into opponent deck after prompt resolution, the third remains in hand and proper ShuffleDeckPrompt is emitted.
3. **Prompt scope:** unrelated opponent-hand choice effects and ordinary attack/copy prompts retain their full original selection semantics; no global hand-zone mutation occurs.
4. **Copy route:** confirm the fix applies when Mewtwo & Mew-GX copies Night Watch through Perfection, and compare identical seeded real-game trial traces with and without the opt-in.
5. **Gameplay effect:** only then measure policy sensitivity on source-complete lists. **Do not turn an attack-text fidelity regression into a candidate win-rate claim.**

## Status

The present report is a source-level defect diagnosis supported by exact pinned files. A patch and runtime test have not yet been qualified. Correcting this class of error is a prerequisite for any Twinleaf benchmark involving Night Watch, and it warrants a targeted audit of other effects worded "random" that currently delegate to an ordinary ChooseCardsPrompt.
