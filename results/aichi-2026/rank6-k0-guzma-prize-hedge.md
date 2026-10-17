# Rank-6 Guzma hedge: exact K0 Prize exposure and conditional VS Seeker access

**Agent 33, 17 October 2026. Evidence class: exact combinatorics applied to the published rank-6 source 60 and Agent 30's fixed physical deal.** This is a conditional probability and action-access study, with **zero qualified competitive games** and no estimated deck win rate.

## Why this exact state matters

The [source-dealt ten-payment frontier](rank6-source-dealt-discard-frontier.md) confirmed that physical rank-6 Iron Thorns on seed `20367160`, seat B, can execute the same 140-damage `Guzma & Hala → Double Colorless Energy + Wondrous Labyrinth → held Thunder Mountain → Volt Cyclone` line while either discarding or preserving its held `Guzma`.

Before the first deck search, the player has seven known cards in hand (including one `Guzma` and `Guzma & Hala`) and one known Active Iron Thorns ex, with an empty Bench. Among the remaining **52 physically unseen cards**, six are face-down Prizes and **two** are the other Guzma copies from the exact source 60 (`BUS 115`). No extra private knowledge of these 52 cards is assumed at that decision. The physical observer subsequently proved that **both** of these Guzma were Prized in this source deal. That latter fact was unavailable when selecting the two G&H discard payments.

## Exact conditional K0 distribution

For `N=52` unseen cards, `K=2` other Guzma and `n=6` Prizes, the probability of `k` Prized Guzma is

`P(k) = C(2,k) C(50,6-k) / C(52,6)`.

| Other Guzma Prized | Exact count of Prize combinations | Probability |
| --- | ---: | ---: |
| 0 | 15,890,700 / 20,358,520 | **78.05429864%** |
| 1 | 4,237,520 / 20,358,520 | **20.81447964%** |
| 2 | 230,300 / 20,358,520 | **1.13122172%** |

All counts were calculated with integer binomial coefficients and checked for a unit-sum distribution. These probabilities are **conditional on the stated known cards and a uniformly randomized remaining population**; 1.1312% is *not* the unconditional frequency of this state in random rank-6 games.

Under a hypothetical sample of independent deals **with this same K0 condition**, the smallest sample size with at least 95% probability of seeing the `k=2` extreme at least once is **264**: `1-(1-0.011312217194570135)^264 ≥ 0.95`. Deliberately selecting and separately labeling a rare Prize configuration is more efficient for *testing that failure mode*, although such selected tests cannot be used as an unbiased win-rate sample.

## What changes when G&H performs the first deck search

The fixed source witness showed that all three `VS Seeker` (`PHF 109`) were unprized and remained in deck when the 140-damage attack was reached. The G&H line searches two cards from the 46-card deck, leaving **44 deck cards**. The deck is then shuffled. The player's first physical deck inspection establishes K1 knowledge: the other two Guzma are Prized, while all three VS Seeker are available in the deck.

If the payment **discards Guzma + Tropical Beach**, then `Trainers' Mail` (`ROS 92`) remains in hand. On the 44-card, three-VS-Seeker deck, a blind top-four Mail sees at least one VS Seeker with exact probability

`1 - C(41,4)/C(44,4) = 34,481/135,751 = 25.40018121%`.

VS Seeker is a Trainer other than Trainers' Mail, so it is a permitted selection from Mail's top four. Because Guzma was discarded to pay G&H, a found VS Seeker can then return that Guzma to hand as an Item action, **provided Mail and VS Seeker are played before Volt Cyclone ends the turn**. G&H has already consumed the turn's Supporter play, so the returned Guzma cannot be used until a later turn under ordinary rules. This route also consumes Mail and VS Seeker. The 25.40% figure is a *search opportunity*, not a guarantee of tactical availability, an optimal pick, or a future Gust.

For comparison, the probability that the next **single blind draw** hits one of the three VS Seeker under the same 44-card state is `3/44 = 6.81818182%`. Searches, hand-draw effects, competing Trainer targets and later locks change these simple calculations.

If the payment instead **discards Trainers' Mail + Tropical Beach**, the source experiment confirms the same immediate 140 damage while retaining Guzma in hand. This removes the need for a VS Seeker access chain for that particular Supporter, but sacrifices the Mail connector. The same opponent generic bot chose Acerola in its following turn in both observed arms; the subsequent payoff of retaining Guzma is unresolved ([response evidence](rank6-post-volt-cyclone-response.md)).

## Practical interpretation and limits

The key decision happens at **K0**, before learning that both other Guzma are Prized. K1 then allows a rational player to revise recovery priorities, using remaining hand, action windows and revealed deck content. A strong policy should compare:

- the irreversible payment that places held Guzma in discard;
- the immediate hand access preserved by alternative payments;
- Mail's optional top-four recovery route and its Item/Supporter timing;
- the tactical value of Gust on the actual board, including own Bench and Active constraints;
- retrieval through VS Seeker, Cynthia & Caitlin or Lusamine under future lock effects;
- what the opponent can accomplish in the meantime.

The paper rules and named-card text support these conditional actions; the exact figures are analytical. The source-state assertions for all ten payments were previously verified in compiled Store CI [38911990792](https://github.com/FlareZ123/experiment-01/actions/runs/38911990792). **This document does not claim that the Mail recovery action was executed in that source replay.** The 25.40% line is an explicitly conditional card-access model.

Reproducible formulas: [exact BigInt combinatorics](../../scripts/aichi-prize-conditionals.cjs) and [independent tiny-population enumeration tests](../../tests/aichi-prize-conditionals.test.cjs). Local arithmetic checks matched the above fractions. The independent exact-source and small-population tests, plus the existing compiled pinned-engine Iron Thorns fixture suite, **passed** in [manual CI 39024011723](https://github.com/FlareZ123/experiment-01/actions/runs/39024011723), workflow head `7874fb1f3bd24178f36f93a019888dfd03371d57`. This tests the conditional arithmetic and existing source actions; it does not execute the conditional Mail recovery branch or qualify a competitive game.

`sourceReplayMechanicsVerified:false`  
`qualifiedForCompetitiveInference:false`  
**99.5% full-field win rate: unverified.**
