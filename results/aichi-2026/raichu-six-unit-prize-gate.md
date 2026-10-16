# Static Prize gate for the 16-unit Raichu Electro Rain line

**Agent 5, 16 October 2026.** Mathematical research conditional on the published rank-4 and rank-17 inventories and a valid seven-card opening. **No actual games and no matchup win-rate estimates are involved.**

## Why the 16-packet capacity is contingent

The [six-energy one-attachment-plus-one-Extra-Energy-Bomb frontier](raichu-manual-plus-bomb-frontier.md) reaches sixteen Lightning units with precisely **four Reversal Energy and two Counter Energy**. The source decks each play four of each plus four Unit Energy LPM. With only six attached cards, replacing even one of those four Reversal with an additional Counter or Unit reduces the theoretical packet total to at most fifteen in the favorable Prize-deficit, no-Temple state.

Before either player has taken a Prize, **all four Reversal Energy must be outside the six face-down Prizes and at least two of four Counter Energy must be outside** for that exact six-card line to be physically possible without any Prize-moving effect. Both published lists have **13 ordinary Basic Pokémon** in a 60-card deck: the only five Evolution Pokémon are three Electrode-GX and two Alolan Raichu.

The following probabilities condition on an *accepted* seven-card opener containing at least one Basic. They integrate the six face-down Prize cards jointly with that legal opener. They exclude opponent mulligan bonus cards, Prize movement, any Prize cards won during play, and support effects that retrieve or re-deal Prizes.

| Initial physical-card event, given legal seven | Exact probability |
| --- | ---: |
| All four Reversal Energy outside the Prizes | **64.63727027%** |
| All four Reversal and at least two Counter Energy outside the Prizes | **64.45457791%** |
| **Failure** of the joint necessary no-Prize-recovery requirement | **35.54542209%** |

The conditional joint probability is identical for the two published inventories because their Basic, Reversal and Counter counts are identical. A different opponent's starting choices, mulligans, later turn draw, or search effects do not change which cards were originally Prized, although later Prize redemption can.

## Exact counting method

Partition the physical deck into 13 Basic, 4 Reversal, 4 Counter and 39 other cards. For each Prize composition (b,r,c,o) with b+r+c+o=6, weight it by

    C(13,b) C(4,r) C(4,c) C(39,o)

and multiply by the number of seven-card starting hands from the remaining 54 cards containing a Basic:

    C(54,7) - C(54-(13-b),7).

Divide the sum for Prize compositions satisfying r=0 and c<=2 by the weighted total over all valid compositions. Exact BigInt arithmetic gives the rational probability **46001401517156 / 71370262608645**, approximately 0.6445457790929285. The no-Reversal-prized marginal is approximately 0.6463727026896369.

The [source-locked implementation](../../scripts/aichi-raichu-six-prize-gate.cjs) uses a shared repository BigInt combination helper and validates both full published inventories. The [independent physical-slot regression](../../tests/aichi-raichu-six-prize-gate.test.cjs) exhaustively enumerates opening hands and subsequent Prizes for three miniature deck configurations, rather than repeating the category-count formula. An independent Python Fraction calculation matched the source result.

**[Manual benchmark CI 38869636691 passed](https://github.com/FlareZ123/experiment-01/actions/runs/38869636691).** This is reproducible combinatorial evidence, not a Twinleaf gameplay outcome.

## Strategic qualifications

The 35.55% gate-failure event is **not a probability of losing** or failing to attack. It only rules out the fully accessible six-card, sixteen-unit **initial-Prize-static** configuration. Rank 4 includes Gladion and rank 17 includes Redeemable Ticket, which can change access to Prize cards or re-deal them under their printed conditions. Prize taking during the match can also free missing Energy.

Even when the gate passes, one must still find six Energy with four of them Reversal, place five into the discard before Extra Energy Bomb, attach another from hand, evolve the attacker and Electrode-GX in time, have a permitted non-GX/EX recipient and appropriate target Bench, avoid Stadium denial, and choose the correct knockout distribution. These are independent or competing constraints requiring gameplay-policy evaluation.

This calculation therefore strengthens the caution about theoretical peak damage: the source list can produce sixteen units in a carefully established game state, while its **static initial Prize allocation alone** blocks that exact witness in more than one-third of accepted openings unless Prize manipulation intervenes.
