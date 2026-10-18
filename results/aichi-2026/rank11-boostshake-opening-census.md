# Rank-11 direct Boost Shake opening census

**Exact calculation, 18 October 2026.** The published rank-11 Absol Garbodor 60 contains 2 Trubbish, 2 Garbodor, 4 Battle VIP Pass, 3 Float Stone, 2 Boost Shake, 2 Oranguru V and 11 Basic Pokemon. The existing `rank11-autonomous-boostshake-v1` policy rejects hands that already contain Boost Shake.

Enumerate uniformly chosen opening hands of seven from 60, followed by six Prizes chosen from the other 53, conditioning on hands with a Basic. An immediate structural Garbotoxin line is present if hand has Float Stone and Boost Shake, has Trubbish in hand or a Battle VIP Pass with at least one Trubbish remaining in deck, and at least one Garbodor remains in deck. A Trubbish in hand can be made Active or Benched and equipped before Boost Shake evolves it. This event covers **2.46422799% of valid seven-card hands with random Prizes** (169890696085236 / 6894276702593280 combined hand-Prize deals). No other draws, mulligan bonus draws or additional search cards are credited.

The v1 opener's necessary hand condition is Oranguru V, Battle VIP Pass and Float Stone present, with neither Forest Seal Stone nor Boost Shake in hand. It covers **1.85070521% of valid hands** before Prize targets, or **1.69847237%** after requiring at least one Trubbish, Forest Seal Stone, Boost Shake and Garbodor remain searchable in deck (117097385243124 / 6894276702593280). This is an *upper bound* on the implementation's trigger: it also requires Oranguru V actually Active and suitable board positioning.

The direct event is disjoint from the v1 predicate because v1 explicitly excludes Boost Shake in hand. Thus the existing v1 policy overlooks a structurally executable direct lock opportunity in at least **2.46422799% of valid opening seven-card configurations** under the stated source-deal model. This is a card-access calculation, not an observed automatic opponent line, a paper-printing certification, a win rate, or a competitive-policy qualification.

Reproduce by classifying the source 60 into counts `(Oranguru V, VIP, Float, Seal, Shake, Trubbish, Garbodor, other Basics, all other)=(2,4,3,2,2,2,2,7,36)`, enumerating all nine-category seven-card hands with products of binomial counts, and for each hand using six-Prize inclusion-exclusion to demand the necessary deck targets. The total sample denominator is `C(60,7) C(53,6)=8866337641761600`; valid-opener numerator `6894276702593280`. The complete target numerators above are exact integers, independently computed with Python arbitrary-precision binomial arithmetic.

**Next falsification:** extend the rank11 policy with an opt-in own-hand direct Trubbish / VIP + Float Stone + Boost Shake sequence, then prove source-dealt real Store actions and opponent responses with both starting turns. Until that validation, retain zero competitively qualified games. Related baseline: [rank11 autonomous opener](rank11-autonomous-opponent-policy.md) and [policy qualification matrix](policy-qualification-matrix.md).


## Refined actual first-turn census: initial seven, Prize six, one normal draw

Both players normally receive a start-of-turn draw. The above seven-card census deliberately excludes it. A second exact model deals **seven cards**, checks that the opener already contains a Basic, sets six Prizes from the other 53, and then draws one more card from the remaining 47. It remains before any voluntary gameplay or mulligan bonus.

An efficient enumeration chooses the unordered **eight-card effective hand** plus a six-card Prize set from the other 52, designating one of the eight hand cards as the normal draw. If the effective hand has one Basic, that Basic **cannot** be designated as the draw: doing so would leave the initial seven invalid. With at least two Basics, any of the eight can be the draw; with none, zero are valid. The physically valid numerator must therefore be exactly **47 times** the previously enumerated seven-card valid numerator.

| Exact event | Seven-card case | Seven plus first normal draw |
| --- | ---: | ---: |
| Valid initial seven, joint hand/Prize(+draw) numerator | 6,894,276,702,593,280 | 324,031,005,021,884,160 |
| Direct Float+Shake with Trubbish and deck Garbodor, numerator | 169,890,696,085,236 | 11,911,482,095,606,528 |
| Direct route conditional on legal initial seven | **2.46422799%** | **3.67603159%** |
| v1 necessary hand with remaining deck targets, numerator | 117,097,385,243,124 | 7,228,094,214,428,032 |
| v1 target-ready upper bound conditional on legal initial seven | **1.69847237%** | **2.23067981%** |

The full unconstrained eight-card/Prize/draw denominator is **416,717,869,162,795,200**, of which **324,031,005,021,884,160** worlds had a valid first seven. Independent seeded 300,000 physical hand/Prize/normal-draw Monte Carlo deals gave 8,543 direct opportunities among 232,994 valid openers (3.6666%), consistent with the exact 3.6760%. The exact numerators are the authoritative values.

The refined **3.67603159%** is the better narrowly specified *actual first-turn* structural-access figure than the opening-seven 2.4642%. Both are lower bounds on direct-line access through hand-draw/Item search effects that were deliberately excluded from this counting model, while still requiring optimal execution of the identified available line. Neither is a bound on genuine wins or the proportion of games in which the bot actually acts. The v1 percentages remain generous policy-trigger upper bounds.

The exact source-locked CJS reproducer now exposes `census()` and `censusAfterFirstDraw()`. Both functions fail closed if printed source quantities or pinned exact integer control counts change. Independent no-engine Node regressions live in `tests/rank11-boostshake-opening-census.test.cjs`. Compiled CI status is separately tracked and **not implied by this analytical derivation**.

## Independent CI execution

[Manual benchmark run 39092828578](https://github.com/FlareZ123/experiment-01/actions/runs/39092828578), triggered at 2026-10-18 03:12 UTC with the `rank11-source-census` job, **passed all 4/4 new Node tests**, and executed the source-locked script. Its runner stdout independently printed **2.46422799% / 1.69847237%** for initial seven and **3.67603159% / 2.23067981%** with the first natural draw (direct opportunity / v1 target-ready upper bound). The same workflow's *separate, pre-existing* `test-benchmark` job failed on shared campaign fixture record-count drift (8 records versus assertions expecting 6), so the overall workflow run is red. The rank11 isolated job was successful. This is runnable combinatorial validation only and certifies zero gameplay.
