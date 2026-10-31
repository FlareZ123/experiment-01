# Rank 22: hidden Wally line becomes materially more accessible through Wonder Tag

**Agent 48, 31 October 2026. Physical access derivation; no native match result.** This extends the [original rank22 direct Wally/Garbotoxin report](agent48-rank22-wally-direct-garbotoxin-window-20261031.md) using the exact **one Tapu Lele-GX GRI 60** in the published rank22 original 60.

## Two disjoint first-personal-turn going-second routes

- **Direct:** Wally ROS 94, Trubbish (either printing) and Float Stone in the first seven plus the ordinary first-turn draw, with Garbodor BKP 57 still physically searchable in the deck.
- **Wonder Tag addition:** Wally is **absent** from those eight cards but **still in the deck**, while Tapu Lele-GX, Trubbish and Float Stone are accessible. Tapu Lele-GX must be played **from the hand onto the Bench during the turn** to obtain Wally. Consequently the original seven must contain another Basic Pokémon besides Tapu Lele-GX, preventing Lele from being trapped as the compulsory Active starter. Garbodor must still be in the deck.

Wally's original text permits evolving Trubbish the same turn it entered play, provided the Supporter is legal. The modern first-player rule prevents ordinary Wally on the *going-first* first turn. Wonder Tag's official printed text specifically requires Bench placement from hand. Garbotoxin activates with a Tool attached, such as Float Stone. Sources: [Wally ROS 94](https://limitlesstcg.com/cards/ros/94), [official Tapu Lele-GX GRI 60](https://www.pokemon.com/uk/pokemon-tcg/pokemon-cards/series/sm2/60/), [Garbodor BKP 57](https://bulbapedia.bulbagarden.net/wiki/Garbodor_(BREAKpoint_57)).

## Exact conditional physical probabilities

The **unchanged** original-rank22 physical partition is `(Wally, Lele-GX, Trubbish, Float Stone, Garbodor, other Basics, others)=(1,1,2,4,2,9,41)`, sum 60. Model an initial seven with at least one Basic, six uniformly random face-down Prizes after the seven, and one ordinary turn-one draw. No prize peeking or replacement, opponent mulligan bonuses, extra searches, or early draw effects.

| Event | Across unconditioned shuffled sevens | Conditional on Basic-valid opening |
| --- | ---: | ---: |
| Direct Wally route | 1.0113585208% | **1.2495884204%** |
| Additional Lele-GX route, with Wally still in deck | 0.8089007091% | **0.9994407904%** |
| **Union of physical access routes** | **1.8202592299%** | **2.2490292108%** |

For each valid opening-hand multivariate hypergeometric partition, the exact six-Prize distribution is conditioned on Wally remaining unprized for the Lele-only arm, and on the exact number of Garbodor copies remaining in the deck for both arms. Draw probabilities separately exclude the final Garbodor (when only one remains) and drawing Wally in the Lele-only arm. The Lele branch requires a non-Lele Basic in the original seven. These constraints prevent counting Wally, Lele, or a searched Garbodor after they have moved out of the required zone.

## Reproducible checks

- New pure evaluator: [`agent48-rank22-wally-lele-access.cjs`](../../simulation/evaluation/agent48-rank22-wally-lele-access.cjs). It imports the already verified direct probability from [its separate source](../../simulation/evaluation/agent48-rank22-wally-direct.cjs).
- Three new [regressions](../../tests/agent48-rank22-wally-lele-access.test.cjs): full original-rank22 exact constants, a separately exhaustively checked toy nine-card deck, and single-printing constraints. In the toy case, all **362,880** physical permutations were counted independently in Python, yielding `P(valid)=16/21`, `P(direct)=17/630`, `P(Lele-only)=13/840`, `P(union)=107/2520`. The implementation is a rational-equivalent binomial summation using JavaScript integers for category combinations, with floating probability totals.

The union is a **conditional resource-availability ceiling under deliberately restricted routes**, and does not measure successful Ability use or native resolution. An opposing Iron Thorns Initialization, Garbotoxin, Klefki, Wobbuffet or other Ability suppression may block Wonder Tag; Supporter locks, Tool disruption, Bench-capacity or current turn's other planned Supporter can also defeat the line. The calculation excludes further genuine legal search/connectors, so it is not a global upper bound on getting Garbotoxin. Early Garbotoxin also suppresses other abilities of both players, creating a material own-board opportunity cost. Do not use 2.249% as a game win-rate or a lock-establishment frequency.

**Status:** Rank22's original published 60 stays unchanged, the [reported registration error](agent48-rank22-registered-wally-original-source-20261031.md) remains explicitly attributed with the player-name limitation, original field 29/32, **zero qualified competitive games**, no demonstrated 99.5% target.
