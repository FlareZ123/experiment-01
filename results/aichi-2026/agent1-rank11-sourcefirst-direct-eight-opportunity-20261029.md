# Rank 11 source-first Boost Shake: direct-hand scarcity versus policy failure

**Agent 1 | 29 October 2026 | Evidence class: exact random-location combinatorics, not native-game performance.** This note follows the [prospective canonical 32-arm scout](agent41-prospective-canonical-scout-native-20261029.md). That scout observed **0 completed source-first rank-11 direct Boost Shake wrappers in 12 game arms**, which represented **six physically paired source opening deals** (the cohort's sole reported source-fingerprint mismatch concerned rank 6). Zero early locks in that scout remain a *competitive-qualification failure*, but the arm count by itself is not evidence that all six source hands offered a playable lock line.

## Frozen card pool and modeled source line

The exact [rank-11 Wataru Yano Aichi source 60](full-decklists.json) has **11 Basic Pokémon**, **2 Boost Shake**, **2 Trubbish**, **2 Garbodor**, **4 Battle VIP Pass**, **4 Quick Ball**, and **6 potential Trubbish Tools** (3 Float Stone, 2 Forest Seal Stone, 1 Muscle Band). The direct autonomous wrapper is [rank11-direct-boostshake.cjs](../../simulation/twinleaf/rank11-direct-boostshake.cjs), with owner-observation predicate [rank11-direct-opportunity.cjs](../../simulation/twinleaf/rank11-direct-opportunity.cjs). It selects a directly held Shake, an eligible equipped Trubbish or a Tool for Trubbish, and Trubbish already visible/held or accessed through Battle VIP Pass; the wrapper does **not** itself add a Quick Ball search for Trubbish. The existing companion [held-Seal policy](../../simulation/twinleaf/rank11-held-seal-policy.cjs) is a distinct route.

[Boost Shake EVS142](https://limitlesstcg.com/cards/evs/142) is usable on the first turn, but ends that turn and searches the deck for an evolution. [Carmine TWM145](https://limitlesstcg.com/cards/TWM/145) expressly permits a going-first player to use that Supporter on their first turn, then discard their hand and draw five; there are **three** in this rank-11 source 60. Neither the wrapper's direct hand test nor the probability below resolves Carmine, Quick Ball discard affordability, search sequencing, Squawkabilly, Crobat, Secret Box, further draws, Tool contention, engine prompts or hostile responses. A direct-hand availability calculation therefore cannot bound the *full optimized policy's* playable access.

## Exact physical-deal calculation

Enumerate all seven-card hands from the 60, condition on at least one of the 11 Basic Pokémon in those seven, then enumerate a first ordinary draw. This is equivalent to the usual physical deal with six Prize cards placed **between** the original seven and the first draw: marginally the eighth observed card is uniformly sampled from the other 53; conditional on the observed eight, the six Prize locations form a uniform six-subset of the other 52. All combinatorial weights and conditional Prize-target availability are computed with integer BigInt binomial coefficients.

The *bare direct event* requires, among the observed eight, **at least one Boost Shake; at least one of the six eligible Tools; and Trubbish or Battle VIP Pass**. The *live* variant additionally requires at least one Garbodor in the post-Prize deck, and if Trubbish is not among the eight, at least one Trubbish in that deck. These are **necessary raw-location conditions for this direct route under the simplified action sequence**, not guarantees of a legal completed line. An opening containing two Garbodor in hand cannot produce its evolution with a deck-search-only Shake.

| Exact event | Probability |
| --- | ---: |
| At least one Basic in initial seven | **77.75788585%** |
| Bare direct event, unconditional over physical draws | **5.22898411%** |
| Bare direct event, conditioned on valid opening seven | **6.72469944%** |
| Direct event plus post-Prize living target(s), conditioned on valid opening | **6.45550612%** |
| Permissive expansion allowing Quick Ball as alternate Basic access, conditional valid seven, prior to Prize check | **8.94024476%** |
| Same permissive Quick Ball expansion with post-Prize living target(s), conditional valid seven | **8.56673504%** |

The Quick Ball variant deliberately treats *having Quick Ball* as potential Trubbish access and makes **no** claim that the player has an acceptably discardable card or that the search is actionable at its real Store root. In particular, the +2.11122992 percentage-point difference from strict live direct hand access is only a **candidate connector opportunity**, not an estimated native policy improvement.

For illustration, if six independent Basic-valid source openings each had this model's identical 6.45550612% live direct event probability, the chance of seeing no direct event in all six would be **67.00533418%**. The scout's actual source-first arms are paired across different candidate 60s, not 12 independent chances. This 67% is a **counterfactual random-location benchmark only**: actual source-first selection, evolving game states, policy choices, native shuffle coupling, opponent mulligans and extra draw/search make an observed completion-frequency calculation different.

## Implications for the common-policy qualification gate

1. Report **owner-visible opportunity, route selection, attempted sequence, K1 deck-search target availability, actual live Store acceptance, and settled equipped-Garbodor witness** separately. “No completed wrapper” conflates failure to draw resources, connector contention, and policy/engine error. The scout's zero source-first completions remains true, but cannot by itself distinguish them.
2. The actionable first-turn decision space includes 3 Carmine and 4 Quick Ball, plus other source Trainers and abilities. Prespecify a legal owner-information-safe sequencing improvement inside the **existing canonical runner**, then verify against fresh native source deals and the stronger both-seat, both-actual-start protocol. Do not add a rival full-game runner or promote selected-seed reversals.
3. Preserve all 32 prospective attempts and all 12 caps as published. This combinatorial note changes **no** game winner, no Aichi source 60, no selected candidate 60, and no prior competitive-qualification veto. The field remains 29/32 printed originals, 0 qualified competitive games, and no demonstrated 99.5% list.

## Reproduction and checks

- Exact fixed-source disjoint-partition enumerator: [scripts/aichi-rank11-direct-hand8.cjs](../../scripts/aichi-rank11-direct-hand8.cjs).
- Nine independent standalone Node 22 checks: [tests/aichi-rank11-direct-hand8.test.cjs](../../tests/aichi-rank11-direct-hand8.test.cjs).
- Local pure test: **9/9 pass**, independently compared with a Python `math.comb` / rational enumeration. This result has **not been verified in compiled pinned Twinleaf CI**. No native Store simulation was run for this report.
- Source Mega Absol ex MEG86's **Basic** stage independently checked in [Bulbapedia card record](https://bulbapedia.bulbagarden.net/wiki/Mega_Absol_ex_%28Mega_Evolution_176%29); the 11-Basic assumption and full exact source category counts are asserted in the executable.

**Decision:** treat the 29 October rank-11 first-turn zero as a *source-pressure qualification veto* with a missing opportunity denominator. Prioritize actual initial-owner-hand source audit and Carmine/Quick Ball line decision fidelity, then prospective completed-game comparisons under the frozen common policy.