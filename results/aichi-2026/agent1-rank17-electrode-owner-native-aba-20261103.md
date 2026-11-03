# Original rank17 Electrode-GX owner opportunity: fresh native read-only A/B/A

**Agent 1 | 3 November 2026 | preregistered exact original rank17 vs exact original champion rank1 | four physical source deals, twelve native arms | zero competitive-qualified games**

## Question and precommitted design

The original Yuya Yamano rank17 Alolan Raichu/Electrode 60 had produced zero Extra Energy Bomb Ability actions in earlier native replay, despite Stage1 development in some arms. Before treating this as an ability-choosing policy deficiency, determine whether the owner actually reached the **Electrode-GX + Alolan Raichu + discarded Energy** line in real owner-visible turns. The exact physical discard count must admit partial 1–4-card attachments under the supplied official rulebook §II-A and §II-E-20.

The [registration](registrations/agent1-rank17-electrode-owner-census-native-20261103.json) was committed **before the first native run**, frozen at source printed 60 SHA256 `331861e47dd979a8d206bb3a7cdfb07768fa28a080fd1b11e4b01c1611ea61ae`, champion printed 60 `159019c3e714677433e87bbdaf6789922ba33491549864d3a7ab17b4f7db3090`, and pinned Twinleaf commit `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. The four independently specified source physical group seeds are **3536421031**, **728459147**, **1920663973**, **2066611947**, with source seats **0, 1, 0, 1**.

Every group executed **control → observer enabled → repeated control** using the *same* resolved original source/candidate 60s, seed, action cap **140**, original Store, symmetric `naturalEvolutionRoot:true` and `specialEnergyRoot:true` owner actors, strict prompt validation, isolated policy randomness and captured initial full physical deal and complete decision trace. Both policy variants were subject to the existing research-owned Electro Rain paper-damage and Electrode attachment hooks. The observer merely inspects the same detached `actorObservation` after the ordinary root intent has been chosen, and cannot alter it.

This is a **read-only source setup census**, not a deck-optimization trial. The policy includes unqualified generic prompt fallbacks; the original source field still has three unpublished opponents; and authentic 25-minute tournament adjudication and competent opposing play are not established.

## Successful pinned native result

[Manual compiled native run 41664568394](https://github.com/FlareZ123/experiment-01/actions/runs/41664568394), execution head `5e426b7a77845fd23e441f2bf2a00c4b45f5dbb7`, **all jobs passed**, artifact [13246635670](https://github.com/FlareZ123/experiment-01/actions/runs/41664568394/artifacts/13246635670). Full raw JSON archived as `agent1-rank17-electrode-owner-aba-native.json`; uploaded ZIP SHA256 **`b472fcbf1dbcf0b3e7fd305b3b4aec0e157401bc470a342a524353e881e3ed24`**, from the workflow upload log.

| Actual observed metric | Result |
| --- | ---: |
| Different precommitted source physical deals | **4** |
| Native arms actually attempted | **12** |
| Native errors | **0** |
| Groups with identical initial full physical deal across control/observe/repeat | **4/4** |
| Groups with identical complete gameplay witness/action trace across all three arms | **4/4** |
| Actual owner-root decisions in the four **observer** arms (both seats combined) | **161** |
| Roots with original source Electrode-GX CES48 in play | **19** |
| Roots with original source Alolan Raichu UNM57 in play | **0** |
| Roots where the two source Pokémon co-occurred | **0** |
| Raichu-line roots with 1–4 discarded special Energy cards | **0** |
| Raichu-line roots with 5+ discarded special Energy cards | **0** |
| Roots satisfying every **physical Raichu-line prerequisite** under the read-only check | **0** |
| Selected Extra Energy Bomb Ability roots | **0** |
| Competitively qualified paper games | **0** |

The raw artifact's complete observer samples show the **19 Electrode-visible roots occur in 18 distinct owner turns across two of the four deals**. Every one of those 19 roots had **zero physical discarded Energy cards**, and none had Alolan Raichu. The actor selected **Pass** at 18 of the 19 roots and **Bench Basic** at the other. The source root-action ledger shows **zero Battle Compressor plays** across all four observer arms, despite the original roster holding four copies. This precisely identifies a disconnected discard/recipient/setup policy in the tested implementation, rather than evidence about a playable rank17 deck's ultimate strength. Source-roster Compressor membership was verified independently against the original printed 60.

| Physical-deal group | Rank17 physical seat | Owner roots (both players) | Electrode-visible roots | Alolan Raichu-visible roots |
| --- | ---: | ---: | ---: | ---: |
| 0 | 0 | 52 | 0 | 0 |
| 1 | 1 | 45 | 6 | 0 |
| 2 | 0 | 45 | 13 | 0 |
| 3 | 1 | 19 | 0 | 0 |

The 161 owner-root decisions are repeated **within-game decision points**, not 161 independent turns or games. The actual independent physical-deal denominator here is **four**. An observed Electrode-GX state on 19 roots does not establish legal Ability use or a complete Raichu attack line. Because **no Alolan Raichu was in play in these four observer arms**, zero selected Extra Energy Bomb actions cannot be attributed to a missed mechanically available *Raichu-line* opportunity in this particular experiment. The possibility of a different eligible recipient for the Ability is deliberately outside this source-line screen.

The result is compatible with the previous eight-arm native natural-evolution experiment, which did observe original Stage1 Alolan Raichu in some **different** source deals. It is also consistent with ongoing source-development weakness. It provides **no evidence that the Ability is universally unavailable** or that the current root policy is competent.

## Code and verification

- [Pure printed-source owner prerequisite](../../simulation/twinleaf/agent1-rank17-electrode-owner-necessity.cjs) and [root census with bounded examples](../../simulation/twinleaf/agent1-rank17-electrode-census.cjs).
- [Pinned native A/B/A runner](../../simulation/evaluation/agent1-rank17-electrode-owner-native-aba.cjs), [frozen registration tests](../../tests/agent1-rank17-electrode-native-registration.test.cjs) and [actor noninterference tests](../../tests/agent1-rank17-electrode-actor-integration.test.cjs).
- Existing actor policy `simulation/twinleaf/agent34-actor-only-root-policy.cjs` accepts default-off `rank17ElectrodeBombCensus:true`; canonical composer `simulation/evaluation/agent7-canonical-actor-composition.cjs` accepts default-off `ownerElectrodeBombCensus:true`.
- [Manual CJS/observer tests successful in 41663448428](https://github.com/FlareZ123/experiment-01/actions/runs/41663448428). The rank17 compiled workload uses an existing **workflow_dispatch-only** [native workflow](../../.github/workflows/agent1-rank17-ditto-prism-prospective.yml) choice `electrode-opportunity`.

The observer returned `paperLegality:'UNVERIFIED'` and no native Ability transfer/KO/Prize proof. A **zero** count of potential root actions is a result about these original source-game states and their current *developmental* actor, not a negative verdict on the card's printed effectiveness.

## Next useful experiment

Use a **prospectively registered broader source-development policy** capable of accessing Alolan Raichu, discarding at least one energy, and sequencing an Electrode-GX. The existing rank17 Compressor and actor-bench work is available as an integration starting point. Maintain an A/B/A or both-seat physical-deal parity gate to verify the observer remains neutral. Once a genuinely favorable owner board is observed, validate a **source-owned** `UseAbilityAction`, card-by-card Energy transfer, Electrode's two-Prize self-KO, any type-conditional multi-Energy changes, actual subsequent attack and a consequential opponent response. Avoid interpreting read-only opportunities as guaranteed legal or strategically optimal.

**Final status:** Four source physical deals under a specific unqualified actor, 12 reproducible native attempts, exact read-only action parity, and **zero full Raichu-line prerequisites**, **zero competitive-qualified games** and no improvement yet to the fixed-deck 99.5% objective.
