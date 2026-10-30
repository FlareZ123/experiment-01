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

## Encoded narrow regression

`tests/agent2-native-shuffle-emptydeck-gate.test.cjs` imports the genuine compiled Iono/Marnie classes and calls their own `canPlay` methods against minimal Player/State-shaped objects. The expected pinned results are: `(own deck 0, sole Supporter hand, opposing hand 1) => false`, `(own deck 1, opposing hand 1) => true`, `(own deck 0, one extra own hand card, opposing hand 1) => true`, and `(own deck 1, opposing hand 0, sole Supporter hand) => false`. These tests document present upstream behavior; they do not proclaim the false result paper-correct.

Test commit: `c8f7d85cb8fa49c2f081d891c16547cd282ef3c4`; existing manual workflow addition: `bb20427a9439a1d08e49879a5a0838ed7e38b770`. No new workflow was created. CI for this exact test was queued and remains pending at report creation.

## Relation to the integrated chooser

The separate actor-only `enumerateConservativeShuffleSupporterOffers` uses owner-visible hand and public opponent counts, and currently refuses a zero-draw full-access situation. It makes **no native canPlay or paper legality guarantee**. Avoid treating either the pinned method's false value or the simplified actor-only score as a complete paper-playability decision in late control-game states. The canonical two-player policy should preserve unsupported cases explicitly and report native rejections separately.

**Field status:** 29/32 exact original opposing 60s, missing ranks 23/25/28; zero competitively qualified games; no demonstrated 99.5% fixed list.
