# Agent11: exact Trainers' Mail contribution to original Iron Thorns turn-one Tag Call attack access

**5 November 2026.** Pure combinatorial calculation, source-printed inventories. **No native-game qualification, no attack observation, and no matchup win estimate.**

## Question and scope

The earlier [source-locked Tag Call first-attack study](agent11-original-thorns-tagcall-volt-firstturn-20261102.md) quantified the held-Guzma & Hala / held-Tag Call connector leading to **Thunder Mountain Prism Star + Double Colorless Energy**. Its original source rank 6/24/29 deck inventories also contain respectively **3/4/2 Trainers' Mail ROS 92**, each of which may inspect the top four deck cards and select a Trainer other than another Trainers' Mail.

This calculation extends that **named connector route only**. It counts a deliberately restricted, paper-readable attempt: after opening seven, six Prizes and the owner's first ordinary draw, if Mountain and DCE are both in the deck and no immediate held G&H/Tag connector exists, play each held Trainers' Mail until the top four contains G&H or Tag Call, and select that connector. A retrieved Tag Call must still be able to find a G&H in the remaining deck. If a Mail sees neither useful card, take no card, shuffle all four back into the deck, and proceed to the next held Mail. Otherwise use G&H to search Mountain and, with the optional two-other-card payment, DCE. This conditional route presumes going second, no opponent lock or setup compensation and the ability to pay the two-card discard. It does not evaluate preservation value, alternate actions, or opponent decisions.

The original [Aichi printed 60s](full-decklists.json) contain exactly four Iron Thorns ex, two G&H, two Tag Call, one Mountain, 1/3/1 DCE and 3/4/2 Trainers' Mail at ranks 6/24/29. The card-printing inventory is the authenticated published transcription; it is not independently certified as the event-day physical card art/printing inventory.

## Exact conditional probabilities

| Source rank | DCE / Mail | Prior strict both-resources-in-deck | Added Mail-only disjoint probability | Strict with Mail | Prior broader held-or-deck connector | Broader plus disjoint Mail route |
|---|---|---:|---:|---:|---:|---:|
| **6** | 1 / 3 | 25.37731070% | **3.76996025 pp** | **29.14727095%** | 33.78150571% | **37.55146596%** |
| **24** | 3 / 4 | 32.07036627% | **6.29984592 pp** | **38.37021219%** | 39.10785063% | **45.40769655%** |
| **29** | 1 / 2 | 25.37731070% | **2.55667509 pp** | **27.93398579%** | 33.78150571% | **36.33818080%** |

**Disjointness:** the new Mail-only successful event has *both* Mountain and DCE still in deck and **no held G&H or Tag-into-deck-G&H connector**. Consequently it does not overlap either direct event from the prior report and can be added to its strict or broader probability without double counting. The resulting figures are probabilities of the specifically named physical access opportunity under the stated restrictions. They are lower bounds on the broader opportunity when other legal routes are possible and neither lower bounds nor estimates for successfully attacking against arbitrary opponent boards.

## Exact method

Seven disjoint card-count classes are: **Iron Thorns Basic, G&H, Tag Call, Mountain, DCE, Trainers' Mail, all remaining cards**. For each seven-card opening containing a Basic, each six-Prize allocation, and the first draw, the program computes the exact physical-deal multiplicity

```text
w = product_j C(count_j, hand7_j)
  * product_j C(count_j - hand7_j, prize6_j)
  * remaining_count_of_drawn_category
```

For this timeline the pre-draw pool is **47** cards, whereas the surviving deck **after** the ordinary first draw is **46** cards. The conditional total physical-deal denominator remains

```text
[C(60,7) - C(56,7)] * C(53,6) * 47
  = 166478632771651200.
```

For an otherwise unconnected qualifying physical state with **m** held Mail, **g** deck-resident G&H and **t** deck-resident Tag Calls, and g greater than zero, each Mail has exactly **46** cards available in the deck. The failure probability from looking at four is `C(46-g-t,4)/C(46,4)`. Because every unsuccessful Mail shuffles the four unselected cards back into the remaining deck, each subsequent look is newly randomized over the same 46 cards. With no deck alteration on a miss, the chance of at least one eligible connector in m attempts is exactly

```text
1 - [ C(46-g-t,4) / C(46,4) ]^m.
```

The computation sums those conditional rational probabilities against every corresponding physical-deal multiplicity using **BigInt**, scaling by `C(46,4)^(Mail copies in the original 60)` to avoid floating-point accumulation. Floating point is used only when formatting the final ratio. The direct/broader numerators exactly reproduce the earlier four independent reference constants.

## Validation and paper limitations

- [Executable BigInt enumeration](../../scripts/agent11-thorns-mail-access.cjs), [exhaustive toy and source-fixture regression](../../tests/agent11-thorns-mail-access.test.cjs). In the independently enumerated nine-card toy, all valid physical openings, Prize identities, first-draw identities, and every ordered combination of repeated top-four Mail inspections are tested. **Local toy exhaustive test passed**; repository CI execution has not yet been observed.
- **Source text:** Trainers' Mail ROS 92 explicitly excludes another Trainers' Mail from selection and shuffles the unselected cards back; G&H CEC 193 can search a Stadium and, upon discarding two other hand cards, a Tool and Special Energy; Tag Call CEC 206 can select G&H as a TAG TEAM card. The [Advanced Player's Rulebook](../../resources/manual/EN_advanced_manual-2025-transcription-structured.md) governs partial attacks/effect costs; attached files and [Limitless ROS 92](https://limitlesstcg.com/cards/ros/92) corroborate Mail text. The sample does not test actual native Item/prompt settlement.
- The new Mail route **does not count a Mail revealing Mountain directly**, a Mail revealing other useful Trainers, Trainers' Mail newly accessed through a separate search, Trainers' Mail finding a connector when the resources are held/prized in other configurations, other draw/search Items, or turn-dependent board interactions.
- Strategic discardability and AMR are not inferred from the physical availability of two discard cards. Opponent Trainer locks, actions taken before the first ordinary draw, mulligan compensation, contingent Stadium states, and official paper clock are outside the model.
- These source numbers are **not** a policy test: no selected shared Issue #25 bilateral adapter has demonstrated the Mail→Tag/G&H→Mountain+DCE→physically settled Volt Cyclone→meaningful opposing response sequence on these exact cases. The selected v4 and controlled v5 both remain developmental.

## Consequence for shared policy release

In rank-6 and rank-24 original Iron Thorns, a bot that only checks direct hand G&H/Tag Call omits a paper-available **3.77 / 6.30 percentage-point** strict Mail-discovered connector opportunity, respectively, under the stated first-turn model. The Aichi source playing policy should be checked against **owner-held Mail and visible/top-four actual selection**, then require proof of exact G&H two-card payment, Stadium/DCE access, correct Energy attachment, an actual native attack settlement, and meaningful opponent continuation. This is a concrete **owner-state eligibility canary**, with zero permission to promote action caps or unqualified native terminals to competitive wins.

**Global benchmark unchanged:** 29/32 original 60-card name/count inventories authenticated; ranks 23/25/28 missing, no fixed final deck selected, zero competitively qualified games, no demonstrated 99.5% field win rate.
