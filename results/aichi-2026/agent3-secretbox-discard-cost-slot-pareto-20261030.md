# Secret Box's three-card payment can reverse apparent optimization of the double-Jellicent-lock package

**Agent 3 | 30 October 2026 | exact finite-card combinatorics and explicit DCI sensitivity, no native match qualifications**

## Decision problem

The [24.450935% going-second Arven→Secret Box→Boost Shake + Silent Lab + Hood opening](agent3-secret-box-arven-jellicent-double-layer-20261030.md) is mechanically accessible in a hand with three other physical cards to discard. This says little about **realistic discardability**. The source research defines DCI as a state-dependent need to preserve critical cards. Discarding three intended attackers, Energy supplies, search pieces or unique counters to assemble an early lock can leave an otherwise settled game strategically lost.

We implemented a **strict lower-dimensional price sensitivity** directly in the [original exact BigInt evaluator](../../scripts/agent3-jellicent-secret-box-shield-access.cjs): divide unnamed cards into a designated `cheapDiscards` class versus protected cards. Secret Box can be used only when **at least three cheap cards are in the opening seven plus first ordinary draw**, after the Active Frillish has been chosen. Held named cards including duplicate Boost Shake, Hood, Lab, Jellicent and Arven are conservatively protected; no card-specific DCI is assumed.

The assumption is intentionally **more restrictive** than physical legality and likely stronger than a skilled player would choose. It excludes discarding redundant named copies and any other conditional payment. Unrestricted source-openers in the original model form an **upper access bound**, and a strict cheap-only payment profile is a **scenario sensitivity**, neither an empirical win rate nor a rigorous global lower bound under the opponent's behavior.

## Exact probability sensitivity

All scenarios fix **4 Frillish, 4 Jellicent ex, 4 Boost Shake, 4 Silent Lab, 4 Stealthy Hood, 4 Arven and 1 Secret Box**, plus 12 total Basics. Four Frillish must include an opening Active; one Jellicent must remain in the deck. First turn draw and six Prize cards are explicitly counted.

| Designated cheap discard cards among the 35 unnamed slots | First-player direct both-layer opportunity | Going-second direct both-layer opportunity |
| ---: | ---: | ---: |
| 0 | 2.564642% | 9.466101% |
| 4 | 2.580417% | 9.518920% |
| 8 | 2.749679% | 10.074069% |
| 12 | **3.168139%** | **11.408137%** |
| 16 | 3.827535% | 13.437969% |
| 20 | 4.656344% | 15.881539% |
| 24 | 5.553571% | 18.387418% |
| 28 | 6.415612% | 20.632826% |
| 32 | 7.156202% | 22.390266% |
| 35 | 7.596959% | 23.324580% |
| Payment ignored (physical-only baseline) | **8.328381%** | **24.450935%** |

The zero-fodder row retains valid **direct three-piece** and **Arven→Boost+Hood with held Lab** pathways that do not involve paying Secret Box's three-card cost. Even designating all 35 unnamed cards as cheap does not attain the physical upper bound because a given opening can draw several named cards and fewer than three cheap ones; duplicates were treated as protected.

The source `BigInt` evaluator has been extended with optional `cheapDiscards` and `minCheapDiscards=3` parameters, retaining default equivalence to the original unrestricted model. An **independently modified Python** enumerator confirms at least the 0,8,12,16,20,28,35-card rows to 11+ digits; two additional pure Node-style regression groups pass in V8. Nothing here is a compiled original-Store validation of specific players' hand-discard decisions.

## Copy-count optimization with payment opportunity cost

A reproducible [full 1..4-copy frontier optimizer](../../scripts/agent3-secretbox-cost-pareto.cjs) and [pure regressions](../../tests/agent3-secretbox-cost-pareto.test.cjs) vary each of **Jellicent, Boost Shake, Hood and Lab** from 1 to 4. Four Frillish, four Arven, one Box, and 12 total Basics are fixed. An arbitrary **12 cheap cards** are assigned to the 35 unnamed slots of the maximal 25-card shell; every resource copy removed is assumed replaced with one cheap card. The remaining 23 unnamed cards stay protected. The objective is a purely illustrative 50/50 weighted mean of first-player and second-player opening opportunity, **not a prediction of actual starter preferences**.

| Named package card slots | Resource counts (Jel / Boost / Hood / Lab) | Cheap cards | First-player opportunity | Going-second opportunity | 50/50 mean |
| ---: | --- | ---: | ---: | ---: | ---: |
| 18 | 2 / 2 / 2 / 3 | 19 | 2.358145% | 11.948029% | 7.153087% |
| 21 | 2 / 3 / 3 / 4 | 16 | 2.741338% | 12.289258% | 7.515298% |
| **23** | **2 / 4 / 4 / 4** | **14** | 3.367554% | 11.932810% | **7.650182%** |
| 24 | 3 / 4 / 4 / 4 | 13 | 3.299151% | 11.801546% | 7.550348% |
| 25 | 4 / 4 / 4 / 4 | 12 | 3.168139% | 11.408137% | 7.288138% |

**Surprising inversion:** under this specific *strict cheap-only payment* model, removing the third and fourth Jellicent to create two disposable cards can increase the initial opening proxy. Under unrestricted physical payment, keeping four Jellicent monotonically improves direct access. This is a concrete instance of connector costs reversing an apparent deck-copy optimum.

**Warning:** A real game with only two Jellicent ex is significantly more exposed to Prize collapse, recovery demands and one Jellicent being Knocked Out; the first-turn event intentionally omits those factors. This optimizer does **not** recommend playing two Jellicent, nor does a 50/50 starter weighting represent any authentic Aichi matchup distribution. The 99.5% game-win target cannot be inferred from an opening probability.

## Practical next evidence

The common native player-policy runner should include one actor-owned **discard-card receipt** on each genuine Secret Box action: identify which three cards were discarded, whether they had competing live uses, the Board/Active lock created, the opponent's Stadium/Faba/Guzma reply, and whether the candidate subsequently had a functional attack and backup. The same fixed two-player policy must choose among **holding** Secret Box, using Arven to search Boost directly, or paying Box to search three classes. It must count an unplayable Box as an actual negative, rather than as a free hypergraph edge.

The strict payment experiment already demonstrates that a theoretically broad connector is sensitive to hand composition, even with an exact playable search path and six-Prize modeling. **29/32 authenticated Aichi field lists, zero competitively qualified games and no demonstrated 99.5% performance** remain the shared evidence boundary.
