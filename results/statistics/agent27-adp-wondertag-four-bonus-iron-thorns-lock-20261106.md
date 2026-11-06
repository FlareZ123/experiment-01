# Exact paid Wonder Tag after 0–4 mulligan bonus draws: source-known Iron Thorns lock correction

**Agent 27 | 6 November 2026 | original Aichi 2026 Top 32, paper Expanded, first own turn going second | zero qualified games**

## Decision and source

The source is the unchanged frozen [ADP–Thorton–Regidrago v2 60](../aichi-2026/candidates/agent5-adp-thorton-regidrago-60-v2.json), with canonical `cards` SHA-256 **bab0ff2ea97da8c410e9ca096ec1826a3f5186878de684856c4dd9454b40d19b**. This study combines two previously independent exact pieces: [Agent5's paid first-turn Tapu Lele-GX Wonder Tag model](agent5-adp-paid-wondertag-bridge-20261105.md) and [Agent27's physical opponent-mulligan draw/Prize model](agent27-adp-four-bonus-29field-bounds-20261106.md). It also incorporates one decisive printed source condition: **ranks 6, 24, 29 start only Iron Thorns ex**, with Active **Initialization** disabling the Ability of non-Future Rule Box Pokémon such as Tapu Lele-GX.

This is a **source-access screen** of a single first-turn enhanced Altered Creation-GX line family, under mathematically favorable conditions. It is not a native Store action, entire turn policy, payable native attack, game outcome, recommendation to change the deck, or 99.5% evidence.

## Printed cost and action model

A Basic-valid initial seven selects ADP Active when physically present; otherwise an eligible other Basic starts Active, and a held Switch is required to promote ADP. A forced starting Tapu Lele-GX in the Active Spot does not trigger Wonder Tag. A Tapu Lele held in hand may be played on Bench during the actual turn, or Quick/Ultra Ball may find Lele in the post-Prize deck, with **one/two physical hand-card discard payments** respectively. Its genuine Wonder Tag can find the TAG TEAM Supporter Guzma & Hala. If Double Dragon Energy is missing from hand, Guzma & Hala can search it from the deck after a **two-other-cards** hand discard. Tag Call can find up to two TAG TEAM cards (ADP and/or Guzma & Hala) in one Item resolution. A single held Double Dragon Energy is the manual Energy attachment to the Dragon-type ADP and supplies the two colored units for the enhanced GX cost.

The physical deck is partitioned into thirteen exact classes: `[ADP2, otherBasics4, Lele1, Switch2, TagCall4, QuickBall3, UltraBall4, GuzmaHala3, DDE4, DragonPayload6, GrassFireEnergy7, Compressor4, other16]`. The simulator enumerates a Basic-valid seven, six initially inaccessible Prize cards, **n accepted optional opponent-mulligan bonus draws plus one ordinary T1 draw**, and four discard eligibility sensitivities. Only the payoff line's mechanically reserved cards are protected in the most permissive case. More restrictive cases permit only six Dragons; then add seven basic Energy; then add four Battle Compressor. Safe discard classifications are assumptions, not strategic facts.

The exact weighting for n bonus cards is

```
denominator(n) = (C(60,7) - C(53,7))
                 * (53)_(n+1)
                 * C(52-n,6)
```

where `(x)_k` is the falling factorial. Each unordered additional `n+1`-card draw multiset contributes `(n+1)!` physical draw permutations. Prize partitions use a 16-mask presence vector of ADP, Guzma & Hala, DDE, and Lele with exact BigInt combinatorial multiplicities. No random simulation is used to produce these fractions.

## Exact source rates, conditional on Basic-valid seven

These rows assume **Wonder Tag is enabled** and every offered bonus card is accepted. Percentages are mechanically payable first-turn access in the specified restricted line family.

| Accepted bonus cards | No Wonder Tag, mechanical | With Wonder Tag, mechanical | Wonder Tag marginal | With Lele, Dragons only | With Lele, Dragons+Energy | With Lele, Dragons+Energy+Compressor |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 0 | 37.981531% | **43.747196%** | +5.765665 pp | 20.278994% | 27.915483% | 32.287038% |
| 1 | 42.086115% | **47.421801%** | +5.335686 pp | 24.305447% | 33.627369% | 38.288485% |
| 2 | 45.889741% | **50.625844%** | +4.736103 pp | 28.532856% | 39.127703% | 43.725648% |
| 3 | 49.393462% | **53.419501%** | +4.026040 pp | 32.869409% | 44.252242% | 48.507798% |
| 4 | 52.607766% | **55.975977%** | +3.368212 pp | 37.223778% | 48.900961% | 52.627953% |

For n=4, the exact shared physical denominator is **980665787694443026176000**; the mechanical numerator including Lele is **548937260015761136337000**. The no-Wonder numerator is independently registered as **515906360695127399354280**. The new n=4 run took approximately 659 seconds in one local Node 22 process. Exact n0 source parity with Agent5 and n0–2 source no-Wonder parity with Agent27 passed. All numerators and the three Lele route-attribution channels reside in [source](../../simulation/evaluation/agent27-adp-wondertag-bonus.cjs), with the frozen n0–4 with-Wonder numerators in the [field evaluator](../../simulation/evaluation/agent27-adp-wondertag-29field-lock-bounds.cjs).

**Interesting non-monotone marginal:** the incremental mechanical value of Wonder Tag falls from 5.77 pp at zero extra draws to 3.37 pp at four. A larger hand more often contains DDE or the required non-Lele search directly, making the paid Lele connector redundant. The Dragon-only safe-discard marginal moves in the opposite direction, from 0.253424 pp to 0.443129 pp across these bonus counts. Those differing responses reflect restricted discard access and connector contention; they are not measured gameplay utility.

## Full authentic 29-original field and source-fixed Ability lock

The published [29-original printed-Basic census](agent1-original29-bilateral-mulligan-bonus-20261104.md) supplies exact geometric probabilities of opponent-mulligan bonus cards **offered to this seven-Basic candidate**. Under the policy assumption of accepting all offers, the equal-original-rank field masses are:

| Candidate bonus cards | Field weight |
| --- | ---: |
| 0 | 85.605513% |
| 1 | 9.759563% |
| 2 | 2.543733% |
| 3 | 0.963689% |
| 4 | 0.475642% |
| 5 or more | 0.651861% |

For n≥5, incremental **source-line reachability** is monotone under this model's cost and availability predicates. An access interval uses the exact four-bonus rate as a lower bound and 1 as a conservative upper bound. A Wonder Tag *increment* has a safe tail lower bound of zero and upper bound 1 per such state, since enabling the route cannot delete any originally legal no-Lele route.

The original printed sixties at **ranks 6, 24 and 29 each contain exactly four TWM77 Iron Thorns ex as their entire Pokémon component**. Every legitimate starting Active is Iron Thorns ex. Its passive *Initialization* makes non-Future Rule Box Pokémon in play have no Abilities while Thorns remains Active. Tapu Lele-GX is a non-Future Rule Box Pokémon, so Wonder Tag is unavailable when that lock is active. This source-state veto is verified against the [actual original list records](../aichi-2026/full-decklists.json), [supplied Iron Thorns printing](../../resources/cards/en/sv6.json), [supplied Tapu Lele printing](../../resources/cards/en/sm2.json), and the [source-veto test](../../tests/agent27-adp-iron-thorns-wondertag-veto.test.cjs). A self-canceling or countering effect would need independent demonstration; none is credited in this source screen.

**29-original equal-rank access bounds, with exact n0–4 and the residual n≥5 tail:**

| Hypothetical discard pool | Without Wonder Tag | Wonder Tag unrestricted on all 29 | Disable Wonder Tag for 3 printed Iron Thorns originals |
| --- | ---: | ---: | ---: |
| Any mechanically unreserved card | 38.85817–39.16710% | 44.51189–44.79886% | **43.97379–44.28226%** |
| Six Dragon payloads only | 20.92768–21.33978% | 21.19430–21.60351% | 21.16220–21.57424% |
| Dragons and Grass/Fire Energy | 27.80383–28.14840% | 29.15219–29.48529% | 28.99922–29.34355% |
| Dragons, Energy and Compressor | 31.32401–31.64872% | 33.54938–33.85818% | 33.30716–33.63154% |

The intervals are coupled source probabilities; **do not subtract one interval's lower endpoint from another's upper endpoint** to estimate a route's marginal utility. Instead, direct event nesting with n0–4 exact matched bonus strata gives the marginal contribution with the known Iron Thorns veto applied:

- Mechanical paid source-line access: **+5.115162–5.128648 percentage points**.
- Only Dragon cards safe to discard: **+0.234459–0.247945 pp**.
- Dragons and basic Energy safe: **+1.195154–1.208640 pp**.
- Add Compressor as safe: **+1.982825–1.996310 pp**.

This narrow mechanical marginal interval is a key methodological result: almost all of the 0.651861% unresolved five-plus bonus tail is concentrated in the three **four-Basic Iron Thorns-only sources**, where the printed opening lock already eliminates the Wonder Tag extension. Only about **0.013486% of 29-field sample mass** combines a non-Iron-Thorns original with at least five offered bonus cards. The larger unrestricted all-29 marginal interval **+5.631760–6.283621 pp** is therefore an overoptimistic representation of the card's source-screen value.

**Counterfactual assumptions and limitations:** All optional offered draws are taken. The player is specifically going second; there is no Ability lock beyond the three certain initial Iron Thorns starts, no other Item/Supporter locks, no simultaneous opponent action or time limit, and the owner is assumed to preserve Lele's hand-to-Bench trigger and an open Bench slot. No Wonder Tag is counted if Lele was forced Active. Opponent play, Prize recovery, previous turn state, DDE denial, Thorton evolution and the actual second-turn copied attack remain outside this event. Against additional lock-producing opponents, these figures can still be too generous. The source is not a proof of genuine paper-game legality of every candidate play sequence.

## Reproduction and next game-facing discriminator

- [Main 13-category exact enumerator](../../simulation/evaluation/agent27-adp-wondertag-bonus.cjs) and [locked-field static numerator/interval evaluator](../../simulation/evaluation/agent27-adp-wondertag-29field-lock-bounds.cjs).
- [13-category independent labeled-paper miniature](../../tests/agent27-adp-wondertag-bonus-miniature.test.cjs) exhaustively deals every eligible 4-card opening, 2 Prizes and 2/3 bonus-plus-normal draws on a thirteen-card toy pool. It uses the earlier Agent5 separately implemented line predicate. It matches n1 and n2 with/without BigInt counts and Lele path attribution.
- [Full60 original source parity and n0–2 exact BigInt regression](../../tests/agent27-adp-wondertag-bonus-exact.test.cjs). Compiled GitHub Actions [run 42146018350](https://github.com/FlareZ123/experiment-01/actions/runs/42146018350) **SUCCESS**, both optional math and base audit.
- [29-field source-lock and frozen n0–4 arithmetic regression](../../tests/agent27-adp-wondertag-29field-lock-bounds.test.cjs), plus [source printed Iron Thorns veto regression](../../tests/agent27-adp-iron-thorns-wondertag-veto.test.cjs). A further GitHub Actions [run 42147390622](https://github.com/FlareZ123/experiment-01/actions/runs/42147390622) was requested; confirm its final job conclusion before claiming remote success for this extension. The full 3/4-bonus enumerator computations were executed locally, **not** rerun as expensive remote CI calculations.

**Game-facing next step:** For frozen candidate v2 vs original ranks 6,24,29, require owner-visible native acceptance of a first-turn DDE source path without relying on Wonder Tag and log the earliest actual source-owned Initialization rule that blocks Lele. Compare that with at least one unaffected source original where a real hand-held Lele or genuine Quick/Ultra-to-Lele route pays both discards, resolves Wonder Tag, attaches DDE, and actually attacks. A source-only upward access gradient cannot establish competitiveness.

**Project release status stays unchanged:** all 32 original opponents still require exact authentication (23,25,28 missing), source-qualified games **0**, no elected fixed 60, and no credible 99.5% game win-rate claim.
