# Agent 5: physical starting-Basic setup and paid ADP first-eight policy contrast (5 November 2026)

**Status:** exact arithmetic, source-specific research, **six local Node22 tests PASS**, all attempts hypothetical physical opening-line screens. Fixed [ADP–Thorton–Regidrago v2 60](../aichi-2026/candidates/agent5-adp-thorton-regidrago-60-v2.json), paper Expanded going second, no native game, competitive result, selected best 60, or deck promotion.

## Two precisely specified setup policies, same fixed deck

The earlier [paid Lele source screen](agent5-adp-paid-wondertag-bridge-20261105.md) deliberately chose **ADP Active whenever the initial hand contains ADP**, chose another Basic ahead of Lele otherwise, and left all optional other Basics in hand. This retained held Lele for turn-time Wonder Tag and minimized initial Bench consumption.

The new model evaluates **a second actual feasible behavior**: first eligible Basic encountered in a uniformly shuffled physical seven becomes Active, and subsequent eligible Basics go to the Bench, up to five occupied Bench spots. Every one of the possible category orders of initial Basics is weighted exactly. If a seventh Basic exists, it remains in hand. Initially Benched Lele cannot trigger Wonder Tag that turn. Initially Benched ADP can be promoted by Switch, whereas a drawn/searched ADP requires an empty Bench spot first. Discard payments under the greedy setup count *only the actual remaining hand*: pregame played Basics are no longer valid discard fodder. The paper rules on starting setup, Bench, and hand-to-Bench Wonder Tag require these distinctions.

The comparison uses an identical fixed 60, 7 initial cards, 6 Prize cards, first draw, same exact source physical distribution, and all mandatory Quick/Ultra/G&H payments. One Supporter and one Energy attachment per turn remain constrained. Both policy variants are evaluated with or without a legal turn-time Lele Wonder Tag. Opponent hand, turns, locks, additional drawn cards, tactical play, and finish conditions remain outside this screen.

## Exact results, conditional on Basic-valid opening and going second

The weighted denominator is **105166843059427968000**, the earlier **250397245379590400** times **420**. The 420 factor exactly represents every possible initial Basic-category order, with up to seven initial Basics. Every initial hand category state is weighted by the multivariate hypergeometric number of physical copies; every Prize configuration and first draw are enumerated. Source counts remain exactly ADP2, other Basics4, Lele1, Switch2, Tag4, Quick3, Ultra4, G&H3, DDE4, Dragons6, basic Energy7, Compressor4, other16.

| Hypothetical DCI discard model | Deliberate, with Lele | Greedy, with Lele | Loss of paid opening opportunity |
|---|---:|---:|---:|
| Any nonessential hand card mechanically eligible | **43.747196%** | **36.651988%** | **7.095207 pp** |
| Only Dragon attack payloads | **20.278994%** | **17.290576%** | **2.988418 pp** |
| Dragons and basic Grass/Fire Energy | **27.915483%** | **23.678226%** | **4.237257 pp** |
| Those plus Battle Compressor | **32.287038%** | **27.319041%** | **4.967997 pp** |

**Without Wonder Tag**: deliberate 37.981531% vs greedy 32.862317% under mechanical payment; Dragon-only 20.025570% vs 17.213354%; Dragon+Energy 26.612382% vs 23.022251%; Dragon+Energy+Compressor 30.110197% vs 26.076317%.

**Wonder Tag incremental effect conditional on the setup policy:** for mechanically permissible payments, deliberate setup has **+5.765665 pp** while greedy prebenching has **+3.789672 pp**. Under the strict Dragon-only payment group, those increments are **+0.253424 pp** versus **+0.077222 pp**. These are exact counts for the defined line family, strongly affected by setup selection, hand payments and Bench space.

The modest difference between the historical Agent5 first-Basic gross **32.961644%** optimistic source-access figure and this newly paid/Bench-constrained greedy/no-Lele **32.862317%** is explained by the added actual hand/Bench restrictions in the latter, not by a different 60-card deck.

## Source and adversarial verification

- [Exact 13-category physical starting-order and setup-occupancy model](../../simulation/evaluation/agent5-adp-setup-paid-policy.cjs), tested byte-identical Git blob SHA-1 **147bb6c54cabe19c4420284409caf48755a0f44d**.
- [Six regression tests](../../tests/agent5-adp-setup-paid-policy.test.cjs), tested byte-identical Git blob SHA-1 **5eed4cc2f27e2ddb7bb630914baa8102e43d5faf**. Real local Node22 **6/6 PASS** including all categories of a physically seven-Basic initial hand, exact rational greedy Active category weights, preserved versus prebenched Lele, Switch to prebenched ADP, full Bench negative controls, exact independent reproduction of all previous deliberate-policy numerators, and **an independent labeled physical-card toy enumeration of every ordered initial hand, physical Prize pair, normal draw and setup placement**.
- Exact source count returns 29,358 valid *category configurations* and 56,192 setup category-order configurations, each multiplied by its correct physical weight. Source uses the frozen v2 card identity IDs and printed rules; no randomized Monte Carlo approximations.
- Three Agent5 local test suites now registered in the **existing manually dispatched** aichi-benchmark-stats.yml; **no new workflow, remote CI success claim or native Twinleaf match**. Tests are source-level computation and paper-fidelity regression only.

## Next shared-policy test

For a genuine native both-seat candidate-independent source policy, register the **same original physical seven and genuine setup order** before the setup intervention. Compare owner-selected Active, every originally Benched physical card, cards still in hand, open Bench positions, existing ADP Bench targets, and Lele's eligibility for a turn-time Wonder Tag. For any actual paid G&H/Ultra/Quick route, verify native physical discard custody, source deck-to-hand search, attempted ADP promotion, DDE attachment, source attack, and meaningful opponent response. A changed post-setup first-stable SHA is an **outcome of a setup-changing policy**, so reject conditioning a primary natural-game comparison on identical post-treatment board digests (Agent48's 5 Nov warning).

No valid comparison of full game win probabilities arises from these percentages alone; candidate v2 remains unqualified and the field remains 29/32 original inventories.


## Follow-up mediation screen: separate starting Active choice from automatic Benching

A third *counterfactual setup policy* isolates the starting-Active component: it selects the **first eligible Basic in the physical hand's shuffled order**, exactly as the greedy policy does, but **retains every other Basic in hand** rather than automatically Benching them during initial setup. The source enumerates physical Basic-category order using integer 420-scaled weights; the independent labeled physical toy test additionally checks these third-policy statistics for all four DCI profiles.

| Payment assumption | Deliberate ADP Active and no optional Bench | First-eligible Active, no optional Bench | First-eligible Active, automatically Bench more Basics |
|---|---:|---:|---:|
| Mechanical and turn-played Lele | **43.747196%** | **37.381955%** | **36.651988%** |
| Dragon-only DCI | **20.278994%** | **17.368593%** | **17.290576%** |
| Dragon+Energy | **27.915483%** | **23.939411%** | **23.678226%** |
| Dragon+Energy+Compressor | **32.287038%** | **27.672625%** | **27.319041%** |

For the **mechanical-payment model with legal Lele**, the total deliberate-to-greedy gap **7.095207 pp** decomposes along this specific sequential policy intervention into **6.365240 pp from choosing the first eligible Active rather than prioritizing ADP** and **0.729967 pp more from pregame Benching**. With only six Dragons eligible for discard, the corresponding gap **2.988418 pp** splits **2.910401 pp versus 0.078017 pp**. Other DCI profiles give **3.976071 and 0.261185 pp**, and **4.614412 and 0.353585 pp**, respectively. This is a *path-specific decomposition*; changing the order of interventions could yield a different attribution.

As a strong independent cross-check, when Wonder Tag is disabled the first-eligible-Active/no-extra-Bench model returns exactly **32.96164378282613%** with unrestricted mechanical payments. This reproduces the already published Agent5 **32.961644%** first-Basic optimistic switch/search result from a separate earlier model. Prebenching then reduces the new mechanical/no-Lele screen to **32.86231651958380%** by removing hand discard cards and sometimes filling Bench spaces. With restrictive Dragon-only discards and no Lele, prebenching has **exactly zero effect on the enumerated paid first-eight event**, since it removes no eligible discard group and there is no simultaneously achievable new-ADP/full-Bench rescue in this limited line family.

These are strictly within-source policy screens, do not imply a 6.36pp win-rate change, and do not justify hardcoding an ADP preference in the candidate-independent selected bilateral policy. To compare policies in an actual registered experiment, randomization must occur before setup and post-setup first-stable board hashes must be treated as policy outcomes.
