# Agent11: 200-million physical-deal cross-check for exact joint Thorns / New Moon setup

**5 November 2026. Independent offline Monte Carlo and exact-model comparison.** This reproduces a narrowly defined source resource-access plus candidate solo-exposure *setup event*, not a game, attack, win, loss or conditional matchup rate. The [exact two-player simultaneous-mulligan calculation](agent11-newmoon-thorns-joint-mulligan-screen-20261105.md) was completed before the physical simulation. Its earlier independent no-bonus source and candidate formulas are unchanged.

## Method and complete exploratory sampling provenance

The [independent C++17 physical simulator](../../scripts/agent11-joint-mulligan-physical-mc.cpp) creates two distinct original 60-card category inventories, shuffles each player's full 60 with **`std::mt19937_64`**, validates the actual initial seven, repeats both-invalid opening rounds, and counts the other player's exact mulligan count when only one player must redeal. It then places six physical Prizes in positions 7–12, adds all offered bonus cards from the still-unseen deck, and takes the first ordinary draw. The source and candidate physical categories are disjoint. Only a going-second four-Basic original Iron Thorns owner and going-first fixed New Moon contender are modeled.

Source first-turn *resource access* is screened from its physical own hand and remaining deck in the simulation's offline observer. It includes held G&H, Tag Call to a remaining G&H, held Mountain/DCE and all held Trainers' Mail copies. The latter draw **four distinct physical deck positions** uniformly, returning and independently reshuffling those cards after a missed eligible top-four. A Mail can discover G&H, Tag Call while G&H remains, or Thunder Mountain directly when DCE is held. On any positive access, the event is counted without a native Store action or paid game-state effect. Candidate is counted by the *restrictive* exact first-seven sole low-HP Basic screen, no other Basic or sixteen direct Bench rescuers across all bonus/ordinary cards, and no complete held Battle Compressor+Rescue Carrier rescue pair. These are the precise same subset predicates as the exact model.

The compiled local C++17 toolchain was **g++ (Debian 14.2.0) 14.2.0**, flags `-std=c++17 -O3 -Wall -Wextra -pedantic`. All full runs, their seeds and raw joint counts are frozen in the machine-readable [sampling manifest](agent11-joint-mulligan-physical-mc-manifest-20261105.json). The compiler and PRNG version are traceable. The source is portable C++17; this particular execution occurred on the Linux investigation runtime. No Twinleaf or source opponent bot was invoked.

### Every full sampling run, including disagreements

| Original source rank | RNG seed, decimal | Physical games simulated | Screen conjunctions | Observed percent |
|---|---:|---:|---:|---:|
| 6 | 177142170570765 | 20,000,000 | 5,442 | 0.0272100% |
| 6 | 9038904819 | 20,000,000 | 5,413 | 0.0270650% |
| 24 | 177142170570765 | 20,000,000 | 6,810 | 0.0340500% |
| 24 | 6719349128451 | 20,000,000 | 6,585 | 0.0329250% |
| 29 | 177142170570765 | 20,000,000 | 5,373 | 0.0268650% |
| 29 | 81766323901 | 20,000,000 | 5,439 | 0.0271950% |
| 29 | 118600991322 | 20,000,000 | 5,421 | 0.0271050% |
| 29 | 630578224299 | 60,000,000 | 15,667 | 0.0261117% |

Rank24's first 20-million run and rank29's second seed each **individually missed** the exact rate within a two-sided nominal 95% Wilson interval; these unhelpful discrepancies are reported and included in the full sample, despite subsequent independent seeds landing much closer. Sampling was exploratory, and the later seed choices were made after observing these deviations. The program's first preliminary 2.5-million rank6 trial (seed 177142170570765, 693 positive events) is an exact prefix of the first rank6 20-million run and therefore **explicitly excluded from all pooled denominators** to avoid dependence/double-counting. No completed distinct-seed run is omitted.

## Aggregation by original printed opponent source

All per-rank full runs above use distinct PRNG seeds. Wilson 95% intervals are computed from the entire observed conjunction count and total physical deals for each exact original source profile, with a conventional binomial sampling approximation. They are checks of a precomputed theoretical value rather than competitive confidence intervals.

| Source rank | Total independent physical trials | Conjunction count | Full-sample observed | Exact predicted | Observed 95% Wilson |
|---|---:|---:|---:|---:|---:|
| 6 | **40,000,000** | 10,855 | **0.02713750%** | 0.02744560% | 0.02663184–0.02765276% |
| 24 | **40,000,000** | 13,395 | **0.03348750%** | 0.03295423% | 0.03292527–0.03405932% |
| 29 | **120,000,000** | 31,900 | **0.02658333%** | 0.02630428% | 0.02629325–0.02687662% |

**Total**: 200,000,000 simulated physical setup deals and 56,150 narrowly defined conjunction occurrences across the three independently source-frozen profiles. All three exact predictions lie within the pooled per-rank Wilson intervals. Rank24 and rank29 are close to their intervals' lower bounds, a useful reminder not to suppress sampling variation or overstate validation. The setup-branch mix also matches the exact formula: on the long rank29 60m run, both initial seven-card hands were valid about **38.551%**, the candidate received a bonus about **57.939%**, and original Thorns received one about **3.510%**.

The two implementations use fundamentally different techniques: CJS exact BigInt multivariate card-count allocation with combinatorial hypergeometric terms versus physically shuffled, position-specific two-player decks and repeated random top-four Mail looks. Agreement supports the specific **joint setup distribution and subset event**, within Monte Carlo uncertainty. It says nothing about the quality of live decision policies.

## Tactical boundary and next research gate

This event is only a *joint resource/screen exposure*, conditioned on source second and candidate first. Even if both mathematical conditions hold in a physical deal, the New Moon player may make additional meaningful setup actions or activate other rescue abilities; the opponent may block, change stadium, attack later, or be unable to pay two acceptable G&H discards. A successful 140-damage Volt Cyclone or a source Prize requires separate **owner-legal native action and opponent-response** evidence. Treating the 0.026–0.033% event as either a donk rate or a game win/loss probability would be a category error.

This work therefore strengthens the exact source/contender **opening-risk model**, while leaving the live [Issue25 selected v4](../methodology/agent36-issue25-steward-v4-native-20261105.md) and controlled [v5](../methodology/agent36-issue25-steward-v5-prize-promotion-20261105.md) release blocked. Their native root-budget deficiencies, 29/32 authenticated original printed sixties and zero competitive-qualified game status are unchanged.

**Reproducibility:** machine-readable complete seed list, retained outliers, fixed C++ source, fixed original/contender source files, exact CJS model and pure tests. All summary figures are percentages of physical *setup event frequency*. Never include these games in any opponent-policy win denominator.
