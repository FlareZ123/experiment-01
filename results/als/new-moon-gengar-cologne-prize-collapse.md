# New Moon structural swap: exact all-Prized access-chain collapse

**Agent 9, 18 October 2026.** Mathematical evidence for the frozen 60 and +1 Gengar & Mimikyu-GX / −1 Canceling Cologne 60. This paper-style opening/Prize calculation is independent of Twinleaf's decision policy. It is not a win-rate result or a certificate of exact Japanese print legality.

## Why the marginal opening metric is incomplete

The [earlier first-eight resource analysis](new-moon-two-gengar-vs-cologne-structural-triage.md) found a better restricted native-Gengar-or-Mewtwo/Cologne opening visibility union after the proposed swap, and greater solo three-Prize Gengar exposure. A separate question is **multi-prized collapse**: how often every copy of a named access channel is in the six face-down Prizes when the player needs that line?

The frozen [English mechanics proxy](new-moon-lockbreak-english-proxy-60.json), exact canonical print-count hash `a693748bc4fc4326142f2dfec26570b9f1e1f7139790d36a089de1137d1cb4c4`, contains **17 Basics, one Gengar, two Mewtwo & Mew-GX, two Canceling Cologne**. The [one-slot proposal](new-moon-two-gengar-one-cologne-english-proxy-60.json), hash `3c1cf2b5fa73a966c23260f3ceb85a5ebd70073cdd805f44b269969bfea2bd33`, has **18 Basics, two Gengar, two Mewtwo, one Cologne**. The same 34 unique proxy printing identities and the other 59 copies are preserved.

## Exact physical model

Shuffle the 60 cards uniformly; accept an initial seven only if it contains at least one Basic Pokémon. Place the next six cards face down as Prizes. No optional mulligan-bonus cards are drawn. This models a game at the start of play; taking a later Prize, Gladion-style retrieval, searching, evolving, opponent interaction and the actual ability to spend the resource are outside the event.

Let `B` be total Basics, `m` the number of designated physical target copies, and `b` the number of those targets that are Basics. The unconditional probability that *all* `m` targets occupy Prize positions is `C(6,m)/C(60,m)`. Given all targets are Prized, the seven-card hand must be selected among the other `60-m` physical cards, including `B-b` eligible Basics. The legal-opening adjustment is therefore

```text
P(all m targets Prized | legal opening)
  = [C(6,m) / C(60,m)]
    * [1 - C(60-m-(B-b),7) / C(60-m,7)]
    / [1 - C(60-B,7) / C(60,7)] .
```

Any impossible `C(n,k)` is zero. This uses the entire six-Prize composition jointly for designated access groups, conditioned on the actual Basic-required opening. **No independence among Prize cards is assumed**. The [source-anchored standalone exact evaluator](../../scripts/new-moon-gengar-cologne-prize-collapse.cjs) reuses the repository's existing `choose` and `mulliganProbability` code. [Pure regressions](../../tests/new-moon-gengar-cologne-prize-collapse.test.cjs) check the printed count identities and both sides of each important result.

## Source-locked comparison

All numbers are percentages **conditional on an initial legal seven**, not per-game observed frequencies.

| Physical event | Frozen: 1 Gengar / 2 Cologne | Structural: 2 Gengar / 1 Cologne |
| --- | ---: | ---: |
| At least one Basic in starting 7 (unconditional) | 91.656257% | 93.014540% |
| **Every Gengar copy Prized** | **9.879768%** | **0.829353%** |
| **Every Cologne copy Prized** | **0.855470%** | **10.042510%** |
| Every Gengar **and both Mewtwo** Prized | 0.055994% | 0.002922% |
| Every Gengar **and every Cologne** Prized | 0.058344% | 0.057492% |
| **At least one of each Gengar and Cologne unprized** | **89.323106%** | **89.185629%** |

The swap reduces total Gengar-all-Prized risk by **9.050415 percentage points**, while raising total Cologne-all-Prized risk by **9.187040 percentage points**. The combined native plus copied Pokémon-payload all-Prized event is about **19 times** less frequent in the two-Gengar structure, though this rare event alone gives no estimate of overall deck performance. The full Gengar-and-Cologne joint all-Prized risk changes very little because the proposed swap still involves three designated physical copies, with one Basic moved between the groups.

Although the individual all-Prized events shift by roughly nine percentage points in opposite directions, the **joint condition that at least one Gengar and one Cologne are unprized** changes only **−0.137477 percentage points**. This follows by inclusion-exclusion: `1 − P(all Gengar Prized) − P(all Cologne Prized) + P(both groups all Prized)`. It is an important limitation of analyzing resource channels individually. The native route and the Item-dependent route are not interchangeable in live matchups, and the joint event requires no hand access or playable card.

These are **physical copy survival** statements. If an unprized Gengar is in hand, the alternative may still need a legal way to Bench/discard it for Mewtwo & Mew-GX's Perfection; an unprized Cologne may be inaccessible through a locked Item window or consumed for another purpose. Being Prized may be recoverable after drawing Prizes or through suitable recovery cards. The one-slot swap reallocates the risk from the native route toward an Item-dependent response precisely when Ability and Item lock make tactical access important.

## Independent stochastic cross-check

An independent Python `random.Random(20261018)` full-60 physical-shuffle census sampled **300,000 deals per candidate**, kept only legal initial sevens, then inspected six subsequent Prize positions. It counted:

| Scenario | Legal openings | All Gengar Prized | All Cologne Prized |
| --- | ---: | ---: | ---: |
| Frozen | 275,157 | 27,225 (9.894351%) | 2,364 (0.859146%) |
| Structural | 279,046 | 2,388 (0.855773%) | 27,656 (9.910911%) |

The observed sampling fluctuations are compatible with the exact model at this sample size. The exact formula is authoritative for the stated assumptions; the simulation is a coding/sampling cross-check rather than evidence of in-game policy.

## Second independent 1,000,000-deal check per variant

A separate `random.Random(2026101809)` sample drew an **ordered 13-card selection from 60 without replacement** for each physical deal, treating positions one through seven as the opening hand and eight through thirteen as the six Prizes. It is distributionally equivalent to a full shuffle and uses a distinct sampling implementation and seed.

| Scenario | Legal sevens | Gengar all-Prized | Cologne all-Prized |
| --- | ---: | ---: | ---: |
| Frozen | 916,535 | 90,392 (9.862362%) | 7,822 (0.853432%) |
| Structural | 929,967 | 7,609 (0.818201%) | 93,387 (10.041969%) |

Against the exact expectations, all four independently sampled rates lie within **1.2 estimated binomial standard errors** (absolute standardized deviations approximately 0.56, 0.21, 1.19 and 0.02, respectively). This further corroborates the conditioning and all-Prized calculation. The independent sample remains solely a physical-card probability check.

## Competitive interpretation and next falsification

This mathematical inversion supplies an important counterweight to the first-eight native attack opportunity gain. Against four-Basic Iron Thorns with Initialization, extra Gengar increases access to native attacks and decreases both-Gengar Prize collapse; losing Cologne makes an Item-based Ability-unlock fallback much more fragile to Prizes. Against rank26 Meloetta, the previously quantified increase in initial sole-Gengar three-Prize liability remains. Which effect matters competitively requires authentic source-dealt actions, printed attacks, full resolving effects, opponent counterplay, both actual starting orders and print-legality checks.

A [failure-inclusive 24-arm compiled gameplay registration](newmoon-gengar2-source-pilot.md) is preserved. Its first CI attempt failed an English print-name normalization regression before any structural match was run; the source loader mapping was corrected. No corrected compiled run is yet verified. **There are still zero independently competitive-qualified games and no demonstrated 99.5% fixed deck.**
