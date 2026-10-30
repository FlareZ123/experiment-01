# Agent 2: pinned Iono/Marnie sole-card, empty-owner-deck legality diagnostic

**30 October 2026 | Bounded pinned engine-method discrepancy hypothesis.** This is a card-text and compiled-method analysis, with a queued non-game canPlay test. It is neither a completed native Store encounter nor a validated paper ruling or game win.

## Reproducible inputs

Pin: `vendor/twinleaf` at `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

- Pinned `ptcg-server/src/sets/10-scarlet-and-violet/set-paldea-evolved/iono.ts` and `ptcg-server/src/sets/09-sword-and-shield/set-sword-and-shield/marnie.ts` define the actual printed Supporter clauses.
- Both texts return **each player's remaining hand to the bottom of its own deck** and conditionally draw if **either** player returned any cards.
- Both pinned classes contain the same independent owner-only veto in `canPlay` and `reduceEffect`: if `playerCards.length === 0 && player.deck.cards.length === 0`, return false or throw, respectively. This runs **before** the separate valid test of whether both remaining hands are empty.
- Pinned `DRAW_CARDS` in `ptcg-server/src/game/store/prefabs/prefabs.ts` draws `Math.min(requestedCount, deck.cards.length)`. A count-zero owner draw is tolerated by this helper.

Consider a player mid-turn after a sequence that has emptied their deck, holding **only Iono** (or **only Marnie**), with Supporter quota available. Their opponent has **one card** in hand. The opponent's card is eligible to move to its deck, satisfying the card's “either player” condition and changing the game state. The pinned class's first owner-only guard nevertheless refuses the Supporter because the owner's own deck and surviving hand are both empty. By contrast, adding one owner deck card permits the method to return true, even with the same opponent hand, and adding another owner hand card also permits it. Empty own deck is reachable *mid-turn* without violating the start-of-turn deck-out loss condition.

This is a **potential paper-versus-engine legality discrepancy** requiring confirmation against the relevant paper playability ruling, any shuffle/return-prevention effects and a genuine native Store state before a compatibility hook is justified. A card’s printed permission for a surviving opponent hand to move supports the concern but is not a substitute for that confirmation.

## Independent official-rule cross-check

The [official Japanese Pokémon Card Game Iono Q&A](https://www.pokemon-card.com/rules/faq/search.php?freeword=%E3%83%8A%E3%83%B3%E3%82%B8%E3%83%A3%E3%83%A2&regulation_faq_main_item1=all) explicitly confirms all of the following:

1. Iono as the owner's **only hand card** is playable when the opponent has one or more cards in hand; the owner needs no card of their own to return.
2. Iono as the owner's **only hand card** is not playable when the opponent's hand is also empty.
3. Iono is playable with **both players' decks empty** when the owner has Iono plus at least one more card and the opponent has a card.

The [official Japanese basic-rule explanation](https://www.pokemon-card.com/howtoplay/) further states that a deck becoming empty during a turn does not end the game immediately; failure to draw at the *beginning of one's turn* is the loss condition. These directly rebut a general claim that the owner's empty deck alone forbids Iono. They do not contain an exact published Q&A joining the *sole-card owner hand* and *zero owner deck* in the same question, so this combined edge case remains a highly supported deduction rather than a quoted exact ruling. The pinned Iono/Marnie owner-only `canPlay` guard is inconsistent with these principles for the opponent-hand-positive case.

The English Marnie text has the same “either player” hand-return trigger, although an equivalent official Marnie-specific Q&A for this precise state has not been located. Keep the Marnie gap as a card-text-based inference until independently confirmed. The current conservative full-draw frontiers do not propose this zero-owner-draw scenario; any future native hook or root-vs-hold arbiter must first stage an actual legal Store continuation and paper-check unexpected on-move-prevention effects.

## Marnie and Milotic Dew Guard: independently established exception

The [official Japanese Marnie Q&A](https://www.pokemon-card.com/rules/faq/search.php?freeword=%E3%83%9E%E3%83%AA%E3%82%A3&regulation_faq_main_item1=all) supplies additional precise checks of the same conditional mechanism:

- When the only owner card is Marnie and the opponent has no hand cards, Marnie is unplayable.
- With **both decks empty**, the owner holding Marnie *plus another card*, and the opponent holding at least one card, Marnie is playable.
- If the owner holds only Marnie, the opponent holds at least one card, **one player's deck contains at least one card**, and the opponent has **Milotic EVS 38** with unblocked **Dew Guard**, Marnie can be played. The Supporter gets discarded and the effect ends because the opponent's protected hand cannot move.
- If both players have multiple hand cards and opposing Dew Guard applies, the Supporter can still affect its owner while the opponent's hand is protected.

The [official English Milotic text](https://asia.pokemon-card.com/sg/card-search/detail/1612/) confirms that Dew Guard prevents effects of an opponent's Supporter done to its controller or its controller's hand. The pinned `ptcg-server/src/sets/09-sword-and-shield/set-evolving-skies/milotic.ts` detects a `MoveCardsEffect` from the protected player's hand with a Supporter source and prevents that move if its Ability remains unblocked. Consequently a hand-count-only `printedShuffleDrawCounts` heuristic may **overestimate opponent effects in a Dew Guard state**, even if the nominal “either player returned cards” clause looks satisfied before applying prevention. The new opt-in bridge deliberately leaves `onMovePrevented` without an owner draw when the opponent was its sole possible return; this still needs a genuine native Store test.

The hook does not independently prove that a Supporter could be played when the opponent's hand is protected and *both* original decks are empty. This precise combined situation is absent from the retrieved published Marnie rulings. Keep it outside demonstrated paper legality until verified.

## Encoded narrow regression

`tests/agent2-native-shuffle-emptydeck-gate.test.cjs` imports the genuine compiled Iono/Marnie classes and calls their own `canPlay` methods against minimal Player/State-shaped objects. The expected pinned results are: `(own deck 0, sole Supporter hand, opposing hand 1) => false`, `(own deck 1, opposing hand 1) => true`, `(own deck 0, one extra own hand card, opposing hand 1) => true`, and `(own deck 1, opposing hand 0, sole Supporter hand) => false`. These tests document present upstream behavior; they do not proclaim the false result paper-correct.

Test commit: `c8f7d85cb8fa49c2f081d891c16547cd282ef3c4`; existing manual workflow addition: `bb20427a9439a1d08e49879a5a0838ed7e38b770`. No new workflow was created. CI for this exact test was queued and remains pending at report creation.


## Research-owned opt-in bridge (not part of the qualified play policy)

`simulation/twinleaf/agent2-sole-shuffle-deckzero-hook.cjs` adds a synchronous, reversible and default-OFF `withSoleShuffleDeckZeroCorrection(execute, deps)` wrapper. It preserves the pinned Iono/Marnie class methods outside exactly this state:

- the owner has used no Supporter this turn;
- its deck currently contains zero cards;
- its surviving hand has zero cards besides the Iono/Marnie being played;
- the opponent has at least one card in hand.

Only under this condition does the wrapper allow the named Supporter and delegate its opponent-only hand-return effect to the pinned `MOVE_HAND_TO_DECK_THEN_DRAW` prefab, with the printed draw counts and native `this.shuffleCards`. All other situations delegate to the original class. It restores both prototypes even after an exception. The deferred owner draw is deliberately skipped when the opponent's sole eligible hand return was prevented; printed conditional draw requires a card to have moved. This is a narrow test-bound interpretation, and its behaviour under hand-protection Abilities still requires whole-game verification.

Pure test `tests/agent2-sole-shuffle-deckzero-hook.test.cjs` covers both physical seats, Iono/Marnie printed draw quantities, untouched normal cases, cleanup and the prevented-move branch. Pinned compiled card callback smoke was added to `tests/agent2-native-shuffle-emptydeck-gate.test.cjs`. Synthetic original Store sequencing uses `tests/agent2-sole-shuffle-deckzero-native-store.test.cjs` with actual `Store`, `Player`, `TrainerEffect`, `WaitPrompt` and `ResolvePromptAction`; it does **not** simulate a normal 60-card match. The existing manual CI workflow runs these tests, with compiled outcome pending at this writing. The bridge has not been added to normal match defaults, nor credited as a win-rate improvement.

## Relation to the integrated chooser

The separate actor-only `enumerateConservativeShuffleSupporterOffers` uses owner-visible hand and public opponent counts, and currently refuses a zero-draw full-access situation. It makes **no native canPlay or paper legality guarantee**. Avoid treating either the pinned method's false value or the simplified actor-only score as a complete paper-playability decision in late control-game states. The canonical two-player policy should preserve unsupported cases explicitly and report native rejections separately.

**Field status:** 29/32 exact original opposing 60s, missing ranks 23/25/28; zero competitively qualified games; no demonstrated 99.5% fixed list.
