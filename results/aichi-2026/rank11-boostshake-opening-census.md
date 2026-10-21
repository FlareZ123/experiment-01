# Rank-11 direct Boost Shake opening census

**Latest 18 October scope correction:** Garbotoxin accepts any Pokémon Tool, including the source's Forest Seal Stone and Muscle Band. The most complete disjoint immediate-tool access census on this page yields **9.66626737%** after the first natural draw. Earlier Float-Stone-only figures are valid restricted subsets, and are not the latest all-Tool calculation. These are structural card-access events, not demonstrated bot decisions or wins.


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


## Second disjoint VSTAR route: held Forest Seal Stone

The source includes **2 Oranguru V plus 1 Crobat V**, both eligible to hold Forest Seal Stone and use its *Star Alchemy* search effect. A first-turn player can use a held Forest Seal Stone and Float Stone to establish a Pokémon V (already in hand or fetched through Battle VIP Pass), obtain Boost Shake with Star Alchemy, put Trubbish in play (held or fetched with the same VIP, whose two-Basic search can fill both needs), attach Float to Trubbish, and evolve from a **deck Garbodor** with Boost Shake. The printed Boost Shake ends the turn after resolving the evolution. This route presumes the VSTAR Power remains available, and no prohibiting lock.

This **held-Seal route** requires Forest Seal Stone already in hand and Boost Shake **absent** from the hand; the direct route requires the opposite Boost Shake condition. Thus the events are disjoint. The existing autonomous v1/v2 opening predicate rejects held Seal, so it covers neither route. A source-locked ten-bucket enumeration now handles three different searchable groups with Prize inclusion-exclusion: remaining Boost Shake, Garbodor, missing Trubbish, and missing Pokémon V (**either Oranguru V or Crobat V**).

| Source-defined viable structural route | Seven-card opening, conditional legal H7 | After one normal first-turn draw, conditional legal H7 |
| --- | ---: | ---: |
| Held Boost Shake and Float Stone, direct evolution | 2.46422799% | 3.67603159% |
| Held Forest Seal Stone and Float Stone, Star Alchemy for Shake | **1.48420977%** | **2.27640153%** |
| **Union of these disjoint hand routes** | **3.94843776%** | **5.95243311%** |

Exact held-Seal numerator: initial seven **102,325,528,271,124** divided by the same legal-opening joint denominator **6,894,276,702,593,280**. With the first normal draw: **7,376,246,746,128,421** / **324,031,005,021,884,160**. The direct numerator in each stratum is documented above. A source inventory with Crobat V omitted from the eligible V group produces a strictly lower number, confirming the group treatment has practical effect. No extra Card actions, forced Active selection, or mulligan bonus draws are counted.

The source-locked regression exercises disjoint group target math and both sample spaces. The isolated `rank11-source-census` job in [manual CI 39093424371](https://github.com/FlareZ123/experiment-01/actions/runs/39093424371) **passed** after introducing the held-Seal route, including all six dedicated tests; the broader benchmark job is a distinct preexisting failing campaign fixture and provides no deck-strength qualification. Exact calculations are validated for these assumptions only.

**Strategic priority:** source-dealt automatic Store decisions selecting at least one *held Boost Shake* opportunity and one *held Forest Seal Stone* opportunity, followed by genuinely consequential candidate counterplay. These numerical events demonstrate missed source-policy coverage, not lock setup actually executed or wins against a skilled player.

## Tool-complete direct lock: Forest Seal Stone or Muscle Band on Trubbish

**Rules refinement.** Source Garbodor BKP 57 Garbotoxin requires a Pokémon Tool attached to it without specifying which Tool. The source list includes **3 Float Stone, 2 Forest Seal Stone and 1 Muscle Band**, all attachable to Trubbish before Boost Shake evolves it. Forest Seal Stone can be attached to a non-V Pokémon; its Star Alchemy VSTAR Power cannot be used by that non-V Pokémon. The Tool remains attached through evolution.

A **held Boost Shake** therefore needs any of six Tools. Separately, **held Forest Seal Stone without Shake** can give Star Alchemy to an established Oranguru V or Crobat V and fetch Shake from deck; Trubbish must hold a *distinct* Tool from Float Stone, Muscle Band or a second held Forest Seal Stone. The two events are mutually exclusive by held Shake.

| Structural source access after random six Prizes | Valid seven-card opener | Legal seven + first normal draw |
| --- | ---: | ---: |
| Held Shake, **any Tool** on Trubbish | **4.44596744%** | **6.45550612%** |
| Held Seal, no Shake, **separate Tool** on Trubbish | **2.12421845%** | **3.21076125%** |
| **Disjoint union, Tool-complete** | **6.57018589%** | **9.66626737%** |

Exact combined numerators: valid opening seven **452,966,795,149,713** / **6,894,276,702,593,280**; seven plus first draw **31,321,703,320,823,661** / **324,031,005,021,884,160**. Individual after-draw direct and held-Seal counts are **20,917,841,360,559,248** and **10,403,861,960,264,413**. Hand must have a Basic in its **initial seven**. Bonus draws, Quick Ball, Oranguru Back Order, Secret Box, other effects and opponent locks are outside this exact sampling model.

The eleven source-locked category counts are 2 Oranguru V, 4 VIP, 3 Float, 2 Seal, 2 Shake, 2 Trubbish, 2 Garbodor, 1 Crobat V, 1 Muscle Band, 6 other Basic and 35 others. The updated CommonJS script and tests enforce exact joint integer controls and verify distinct Tool conditions and group-Prize effects. **Isolated 8-test census job passed** in [manual CI 39093676404](https://github.com/FlareZ123/experiment-01/actions/runs/39093676404). Its companion preexisting benchmark job may fail unrelated source-campaign fixture assertions, which do not invalidate the isolated calculation.

Earlier tables on this page counted Float Stone only as Tool; they are preserved strict-subset scenarios. The **9.66626737%** is the current two-route structural access estimate under the more complete card-text treatment. Actual lock activation remains unobserved in a qualified independent game. Opponent actions, Ability locks and resource sequencing may prevent the line; additional search and card draw may increase access. This is not a competitive win-rate result.

**Next action:** implement and validate the two autonomous source-dealt opponent Tool routes with genuine decision logs, independent starts and meaningful candidate responses. Competitive games qualified: **zero**.


## Exact raw held-hand direct access beyond the opening (Agent 10, 21 October 2026)

This is a **different, narrower event** from the earlier first-turn direct/VIP and Forest Seal Stone search unions. It models a source that has **held** one Boost Shake, one of the six Pokémon Tools attachable to Trubbish, and one Trubbish itself in hand after `d` natural turn draws, while **at least one Garbodor BKP 57 remains in the unprized deck**. The initial seven must contain a Basic. There are no searches, voluntary plays, Supporter draws, extra mulligan draws, deck manipulation, Tool removals, or opposing effects, and it presumes a Trubbish can be brought into play when needed. In particular, this event does **not** credit Battle VIP Pass to find Trubbish or a Forest Seal Stone VSTAR Power to find Shake. It is a raw resource-access indicator, **not** the chance of executing the legal lock or winning.

The exact source 60 collapses to six mutually exclusive categories:

`(Shake, any Tool, Trubbish, Garbodor, other Basic, other) = (2,6,2,2,9,39)`.

Choose the initial seven, condition on at least one of the eleven Basics, set six uniformly random Prizes from the remaining 53, and take `d` normal draws from the remaining deck. Equivalently, marginalize over Prize placement by selecting `d` uniformly from the 53 initially unheld cards and then selecting six Prize cards from the `53-d` others. Enumerate all 378 possible legal category-count starting hands; for each, inclusion-exclusion counts the `d`-draw subsets that supply every still-missing member of Shake/Tool/Trubbish. If `g` Garbodor remain outside the drawn hand before prizes, the chance at least one avoids all six Prizes is 0 for `g=0`, `(47-d)/(53-d)` for `g=1`, and `1-30/((53-d)(52-d))` for `g=2`. Weight each hand by products of binomial counts, and divide by `[C(60,7)-C(49,7)] C(53,d)`. All arithmetic was exact Python integer-binomial and rational arithmetic, with an independent seeded 600,000-physical-deal Monte Carlo sanity check.

| Natural draws `d` since initial seven | Exact conditional held-hand access | Decimal |
| ---: | ---: | ---: |
| 1 | `1354685947 / 39971455836` | **3.389133%** |
| 2 | `16792255737 / 366405011830` | 4.582977% |
| 3 | `1941522290961 / 32643355599400` | **5.947680%** |
| 4 | `30640326108393 / 410373613249600` | 7.466446% |
| 5 | `175890979115021 / 1928755982273120` | 9.119400% |
| 6 | `33799813147533733 / 310529713145972320` | 10.884567% |
| 7 | `5651065146375867 / 44361387592281760` | **12.738702%** |

These are cumulative resource-in-hand probabilities under the **all-unplayed** simplification, and naturally increase as cards accumulate. They neither predict legal board occupancy nor establish actual later-turn source decision quality. The current [first-turn-only direct policy predicate](../../simulation/twinleaf/rank11-direct-opportunity.cjs) rejects all global turns after turn 2 even when owner-visible later-turn hand/Bench conditions could allow Boost Shake. A policy-horizon change must preserve the fact that **Battle VIP Pass is limited to the first turn**, satisfy paper evolution/Tool rules, and be tested with native source decisions and consequential candidate replies. Extending a time gate alone is not progress toward competitive certification.

**Scope note:** the earlier 9.66626737% opening union on this page also credits hand-VIP, broader Tool access, and a separate held-Seal VSTAR search route; direct numerical comparison to this narrower hand-Trubbish-only event is invalid. These fresh calculations are analytical research evidence, with no newly qualified game or decklist.
