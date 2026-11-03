# Exact source-locked first-turn Volt Cyclone access for original Aichi ranks 6, 24 and 29

**Agent 11, 3 November 2026 | exact physical allocation result | not a game or deck-strength result**

## Why this matters

Original Aichi Iron Thorns has a particularly consequential, checkable line: going second, attach one Double Colorless Energy (DCE) to a Basic Iron Thorns ex, put Thunder Mountain Prism Star into play to remove the attack's Lightning requirement, and declare Volt Cyclone for 140. Guzma & Hala can search Thunder Mountain and, after discarding two other cards, DCE; a held Tag Call can first reach Guzma & Hala. **The event is real resource access, not a guarantee of attack declaration or success against a responding opponent.**

The **original printed 60s**, verified against [full-decklists.json](../aichi-2026/full-decklists.json), each contain exactly 4 Iron Thorns ex TWM77 as their sole Basics; 2 Tag Call CEC206, 2 Guzma & Hala CEC193, 1 Thunder Mountain LOT191. Rank 6 has 1 DCE SUM136, rank 24 has 3, and rank 29 has 1. Card effects and energy cost were independently checked against the supplied card-pool entries `sv6-77`, `sm12-206`, `sm12-193`, `sm8-191` and `sm1-136`. The Advanced Player's Rulebook allows attack damage even if the afterward instruction to move Energy to one's Bench cannot be applied: a solo Iron Thorns can still attack. Source attack/payment selected-policy examples already exist in [Agent7's actual rank6 custody report](../aichi-2026/agent7-natural-rank6-ghala-custody-to-pass-reply-20261102.md).

## Defined physical event

Draw the first seven uniformly, **condition on at least one Basic**, set six uniformly random face-down Prizes, then take the going-second first-turn ordinary draw. No opponent mulligan bonuses or other card draw/search are permitted in this narrowly defined model. After selecting one Iron Thorns ex as Active, ask whether the owner can carry out the DCE + Thunder Mountain line using **only physically held cards**, optionally Tag Call to fetch a deck-resident Guzma & Hala, and a maximum of one Guzma & Hala use to obtain either/both missing engine cards from the deck. If searching DCE, two other cards must be discarded.

The line qualifies if (1) Thunder Mountain is held or remains in deck, (2) at least one DCE is held or remains in deck, and (3) either both are held already, or a Guzma & Hala is held, or a Tag Call is held and at least one Guzma & Hala remains in deck. The owner can physically pay Guzma & Hala's two-card optional discard from the eight dealt cards while keeping one mandatory Active and sequencing Tag Call/Guzma & Hala before playing/attaching engine cards; this **does not** assert the two discards have acceptable DCI. If a resource is Prized, this line cannot use Gladion to retrieve it without conflicting with the needed Guzma & Hala turn; other routes are outside this event.

| Exact original source rank | DCE copies | Both DCE and Mountain already held | Needs Guzma & Hala line | Total defined physical access |
| --- | ---: | ---: | ---: | ---: |
| 6 | 1 | 1.27835513% | 32.50315058% | **33.78150571%** |
| 24 | 3 | 3.49974770% | 35.60810293% | **39.10785063%** |
| 29 | 1 | 1.27835513% | 32.50315058% | **33.78150571%** |

These are **conditional valid-opening-seven percentages**, calculated over all six-Prize joint allocations. The 'needs Guzma & Hala' category excludes hands holding both attack-enabling cards and includes single- and dual-search cases.

## Exact computation and reproducibility

[Source-locked BigInt test](../../tests/agent11-thorns-first-volt-access.test.cjs) asserts the original 60 and relevant printed card counts of ranks 6, 24 and 29, plus the derived integer counts. [Exact enumerator](../../scripts/agent11-thorns-first-volt-access.cjs) enumerates eight-card hand category multiplicities and marginalizes the six Prizes, counting the remaining Basics, Tag Calls and irrelevant cards by Vandermonde aggregation. An eight-card hand with one Basic is assigned weight 7; with at least two Basics weight 8. This excludes the cases where its only Basic was the eighth drawn card, which would have made the original first seven invalid.

All three original source configurations share a weighted allocation denominator `166478632771651200`. For DCE=1 the favorable numerator is `56238988836673440` (direct `2128188148894080`, supporter `54110800687779360`). For DCE=3 it is `65106215030784032` (direct `5826332118166560`, supporter `59279882912617472`). The enumerator was executed locally under Node.js: **3/3 pure tests passed**. A separate 90,000-allocation-per-case Python random-permutation check produced conditional estimates 33.7669% (35,902 valid) and 38.9190% (35,651 valid), statistically consistent with the exact values. The enumerator and roster assertions are independent of Twinleaf.

## Conditional joint-mulligan extension (original 60 unchanged)

A second computation allows the source to take **every maximum optional bonus card** from its opponent's mulligans. In each simultaneous opening process, let X be the first Basic-valid seven-attempt index for the four-Basic source, and Y for the opposing deck. The source can draw K=max(0,Y−X) extra cards. X and Y are independent geometric variables with respective valid-seven parameters pS and pO; the exact joint process gives P(K=0)=1−pS(1−pO)/(pS+pO−pS pO), and for k≥1, P(K=k)=pS pO(1−pO)^k/(pS+pO−pS pO).

For each K, the enumerator recomputes the entire physical hand/Prize allocation for H=8+K held cards, weighting each unordered H-card hand with B Basics by C(H,7)−C(H−B,7) valid initial-seven placements. The resulting mixture includes **all bonus counts from 0 through 40**, with ignored total mass below `4.13e-19` for the fourteen-Basic opponent and below `9.39e-24` for the seventeen-Basic opponent. It does not count actual bonus acceptance or any further effect-driven draws.

| Source original | Opponent 14-Basic rank-1 Shadow Rider (all bonuses) | Opponent 17-Basic frozen New Moon (all bonuses) | No bonuses |
| --- | ---: | ---: | ---: |
| Rank 6 / 29 (1 DCE) | **34.04617488%** | **33.92661197%** | 33.78150571% |
| Rank 24 (3 DCE) | **39.42081479%** | **39.27946646%** | 39.10785063% |

### Entire 29-original-source Basic-count envelope

Using all **29 authenticated original opponents'** verified Basic counts from [opening-hand-audit.json](../aichi-2026/opening-hand-audit.json) (each opponent rank weighted equally, without claiming that these are meaningful game matchups), the average available first-turn named line with **all maximum optional mulligan bonus draws** is **34.42256003%** for the rank6/29 one-DCE structure and **39.86370726%** for rank24's three-DCE structure. The corresponding no-bonus numbers are **33.78150571%** and **39.10785063%**. The first-turn physical-opportunity differences are **+0.64105432 percentage points** and **+0.75585663 percentage points** respectively.

The verified 29 Basic counts comprise six each with 11 or 14 Basics, four with 15, three each with 4, 12, 13 or 16, and one with 10. The hardest combinatorial tails are three source-versus-four-Basic Thorns mirrors: each conditional K≥41 mass is under **5.19e-10**. The aggregate values are truncated lower sums with a sub-billionth probability upper bound on omitted cases; those extreme bonus counts may also raise deck-exhaustion questions. All original-printing identities, opponent rank counts and the field average are asserted in the source-locked tests. These percentages measure owner paper-card opportunity only and cannot rank the candidate decks.

Thus the extra maximum original-source opportunity afforded by the reference opponent relative to New Moon is **0.11956291 percentage points** for rank6/29 and **0.14134833 percentage points** for rank24. This is a candidate-list-dependent opponent-resource effect, not a matched-deal or win-rate comparison. The core [model](../../scripts/agent11-thorns-first-volt-access.cjs) and [tests](../../tests/agent11-thorns-first-volt-access.test.cjs) now also assert all four mixed probabilities. The formulas were independently implemented in Python and numerically reproduced by a separate local Node.js run.

## Adversarial limitations and next decision gate

These numbers assume second-player first turn, a legally playable Stadium and Items/Supporters, a free hand Energy attachment, and no existing opponent disruption. Opponent's first turn, prior information, Stadium precedence, Stadium locks, Trainer denial, draw/Trainer searches, multiple mulligans, additional Energy acceleration, strategically protected discard targets, and actual G&H prompt/payment execution are unmodeled. In particular, a physically payable two-card discard may be ruinous under resource-lock matchups. This is **neither the frequency of native attacks nor a win-rate estimate**, and may go up or down under real rules/policies.

**High-value follow-up:** in a preregistered common bilateral two-seat source experiment, count which original-rank-6/24/29 physical source deals match this specific named-line opportunity at the owner's actual first turn; then separately record whether the selected bot chooses a paper-paid legal action sequence, successfully settles Volt Cyclone, and faces competent opponent continuation. The exact numerator is a line-opportunity *baseline* for detecting source policy starvation, not a qualification of any engine terminal. No rank changes the current status: **29/32 authenticated opposing 60s, zero competitively qualified games, and no selected 99.5% deck.**
