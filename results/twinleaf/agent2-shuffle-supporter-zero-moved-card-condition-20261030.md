# Agent 2: Marnie/Iono empty-hand conditional draw correction

**Date:** 30 October 2026. **Scope:** printed-effect interpretation and actor-only pure policy, not live Store gameplay or competitive strength.

## Rule-text evidence

The included complete English card dataset has the following relevant printings:

- `resources/cards/en/sv2.json`, `sv2-185`, **Iono**: players move their hands to the bottom; **only if either player put any cards there**, each draws a number equal to their own remaining Prize cards. Identical conditional wording occurs on the other Iono printings in the supplied pool.
- `resources/cards/en/swsh1.json`, `swsh1-169`, **Marnie**: same conditional, after which the user draws five and opponent four. Other listed Marnie printings retain the condition.
- `resources/cards/en/me1.json`, `me1-119`, **Lillie's Determination**: shuffle your hand into your deck, **then draw six**, or eight if exactly six Prizes remain. This effect has **no equivalent any-card-moved condition**.

Playing a Supporter removes that physical card from its owner's hand before its effect resolves. Accordingly, when the player's *only* hand card is Marnie or Iono and the opponent currently has zero cards, neither player has a remaining hand card to put on the bottom. The condition is false, and a naive five/four or Prize-count draw prediction is incorrect. A game-state change and native Store permission to play at all require their own legality checks; this note does not certify either.

## Exact pure counterexample

At an owner-root later than the first global turn, let `ownHand=['Iono PAL']`, owner remaining Prizes=6, opponent remaining Prizes=2, opponent `handCount=0`, and both decks with ample cards. The original `printedShuffleDrawCounts(view,'iono')` predicted **own six / opponent two cards drawn**, allowing the old proxy to label the action as beneficial. Under printed effect semantics the correct conditional draw count is **zero / zero**. When the opponent holds one card instead, its hand can move, making the normal six/two draws available. Likewise, an owner holding Iono plus another card can activate the condition even if the opponent's hand is empty.

## Implementation and preserved bounds

- `simulation/twinleaf/agent2-conservative-shuffle-supporter.cjs` now checks `view.ownHand.length > 1 || view.opponentPublic.handCount > 0` before predicting Marnie/Iono draws. The first branch counts the played Supporter as already out of hand.
- `tests/agent2-conservative-shuffle-supporter.test.cjs` covers both hands becoming empty, the one-card opponent activation case, the owner's second-card case, and the contrasting unconditional Lillie's draw.
- This builds on the separate new `enumerateConservativeShuffleSupporterOffers(view)` API that exposes all low-hand Supporter candidates for joint root arbitration while preserving the old first preferred choice.
- The actor-only policy remains **default OFF**, contains strong heuristic low-hand filters, and still requires native legal-play, actual effect settlement, resource contention and opponent-response proof. A pure rule-consistency fix must not be counted as a game win.

The initial enumeration/hidden-state regression compiled successfully in [manual CI 40988621979](https://github.com/FlareZ123/experiment-01/actions/runs/40988621979), at head `c0b82bf8714dd85a68ecd69b58aec9651278ad89`. A second compiled manual run 40989392631 was submitted for the conditional-draw and postreturn-capacity changes; its final outcome remains to be checked. No new CI workflow or simulator has been created.


## Follow-up: hand-return deck-capacity repair

The earlier conservative selector required five cards **in the pre-effect deck**, and demanded that both players already have enough deck cards to cover the full future draw. That can reject a legal card-access line: the printed effects first move the surviving hand cards to the deck. In the actor-only view the full-draw capacities at effect time are `own.deckCount + ownHand.length - 1` and `opponent.deckCount + opponent.handCount`, with the played Supporter excluded. Thus an Iono line with owner 5 Prizes, deck 4 and a second card in hand, against opponent 2 Prizes, deck 0 and two hand cards, has *five/two available* after hand return. The prior heuristic incorrectly rejected it.

Commit `8b97d8e03da1aea303041d7946db2b4f0a670c72` corrects the full-draw conservative capacity check using only owner-known and opponent-public counts. Commit `34e3f233e1d9e2e9e438550a895137cb7abd7f3c` adds three pure cases covering Iono, Marnie and Lillie. The native Store is still authoritative: paper/full-draw reachability here is syntactic, and zero-card decks, shuffle-prevention effects, draw-prevention effects and other specific modifiers require additional mechanics validation.

A direct pinned headless code audit found `simulation/twinleaf/headless.cjs` already scopes `Math.random` to a seeded engine-event generator for the entire synchronous match (lines 437 to 441, restored in the finalizer), with separately seeded speculative policy streams when requested. Accordingly the pinned Iono card's internal use of `Math.random()` does **not** establish unseeded game-event nondeterminism in these headless runs. The relative RNG-consumption sequence may still differ between policies.

**Field status:** 29/32 exact original Aichi Top32 opposing 60s known (23, 25, 28 missing); zero competitive-qualified games; no demonstrated fixed 60 with 99.5% win rate.
