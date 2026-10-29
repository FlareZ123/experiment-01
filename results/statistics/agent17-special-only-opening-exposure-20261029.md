# Agent 17: exact natural Special Energy opening exposure in seven original Aichi 60s

29 October 2026. Reproducible pure source:
[scripts/agent17-special-only-opening-exposure.cjs](../../scripts/agent17-special-only-opening-exposure.cjs) and
[tests/agent17-special-only-opening-exposure.test.cjs](../../tests/agent17-special-only-opening-exposure.test.cjs).
Input: unchanged [29 published original 60s](../aichi-2026/full-decklists.json).
Original ranks 23, 25 and 28 still lack exact published sixties.

## Question and bounded meaning

The [source coverage audit](../aichi-2026/agent1-29source-firstturn-actor-root-exposure-20261029.md)
identified seven original opponents with zero Basic Energy. The frozen
canonical actor's general Special Energy attachment branch was off
during the 32-arm scout. How often does a Basic-valid natural opening
already hold Special Energy, before search, additional draw effects or
tactical choice? A held Energy is not thereby a legal or beneficial
attachment, and its presence does not imply the bot missed an action.

## Exact combinatorial model

Let B = number of Basic Pokémon copies and S = Special Energy copies
in one authentic 60. These categories do not overlap. The initial seven
is uniformly sampled conditional on containing at least one Basic.

    D = C(60,7) - C(60-B,7)
    Z = C(60-S,7) - C(60-S-B,7)
    P(Special in initial seven | valid Basic) = 1 - Z/D
    P(Special by the eighth card | valid Basic) =
        1 - Z*(60-S-7)/(53*D)

The eighth card is exactly one ordinary random draw, without an
intervening search, Trainer, Ability or mulligan-compensation draw.
Six unseen Prize cards are sampled after the initial seven and do not
change the marginal distribution of the next random draw. No K1
membership information is assumed. Exact BigInt combinatorics, an
independent exhaustive toy-deck enumeration and immutable roster
checks are provided in the regression.

## Original-source results

| Rank | Archetype | Basic B | Special S | Initial seven | After one draw |
| --- | --- | ---: | ---: | ---: | ---: |
| 4 | Raichu Electrode | 13 | 12 | 79.306724% | 83.991994% |
| 5 | Mew Genesect | 11 | 4 | 37.884168% | 42.572155% |
| 6 | Iron Thorns | 4 | 8 | 61.011294% | 66.896381% |
| 7 | Snorlax Stall | 12 | 4 | 38.064443% | 42.738824% |
| 17 | Raichu Electrode | 13 | 12 | 79.306724% | 83.991994% |
| 24 | Iron Thorns | 4 | 8 | 61.011294% | 66.896381% |
| 29 | Iron Thorns | 4 | 8 | 61.011294% | 66.896381% |

The Basic/Evolution classification is explicit and name-scoped to
these seven source sixties; unexpected Pokémon or changed ranks fail
closed. It uses the existing exact-60 static audit. These are
original deck composition counts, not source-hand observations.

## Policy relevance and strict limitations

All three original four-Basic/eight-Special Iron Thorns lists have
66.896381% natural exposure by one ordinary draw, conditional on a
Basic-valid opening. Seven diverse Special-only originals can serve
as positive-control opponents for a source-agnostic Special Energy
selector. The next observed native trial should distinguish cards
held, actually legally attachable, proposed, Store accepted, fully
settled, followed by a meaningful opponent action. Respect Special
Energy recipient constraints, current locks, attachment quota,
known private information and the control deck's disruptive Trainer
lines. Opponent mulligan compensation, Prize-specific K1 knowledge,
Extra draws and tactical sequencing are outside this calculation.

No simulated games were run for this result. The frozen prior cohort
remains 20 engine terminals, 12 capped trials, zero competitively
qualified games, 29/32 complete original field lists, and no 99.5%
performance evidence. Do not use this marginal held-card probability
as a missed-action count, a ceiling on realistic access, or a deck
win probability.
