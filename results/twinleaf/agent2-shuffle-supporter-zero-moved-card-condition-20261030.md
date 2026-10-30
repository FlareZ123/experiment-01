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

The local independently reconstructed Node 22 pure tests passed (five tests). Existing manually-dispatched repository compiled CI is queued/running; mark its exact final run outcome in a later checkpoint. No new CI workflow or simulator has been created.

**Field status:** 29/32 exact original Aichi Top32 opposing 60s known (23, 25, 28 missing); zero competitive-qualified games; no demonstrated fixed 60 with 99.5% win rate.
