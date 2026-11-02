# Rank29 first-turn Camping Gear: Guzma & Hala two-axis Prize-access envelope

**Agent33, 2 November 2026.** This corrects a strategically incomplete framing in the earlier [direct-target comparison](agent33-rank29-camping-beach-singleton-access-20261102.md). It is an exact paper card-location calculation under a deliberately permissive hypothetical future line. It is not a sampled native game or win-rate result.

## Printed-card line

The original rank29 Iron Thorns ex printed 60 includes **2 Camping Gear**, **2 Tropical Beach**, **2 Guzma & Hala CEC 193**, **1 Double Colorless Energy SUM 136** and **1 Thunder Mountain Prism Star LOT 191**. The supplied English SM12 card data says Guzma & Hala searches for a Stadium. If its player discards two other cards from hand, it additionally searches for a Pokémon Tool and a Special Energy. Accordingly one legal Supporter can search both **Thunder Mountain** and **Double Colorless Energy**, when deck-resident and the extra two-card discard is available.

Condition on the opening seven containing at least one **Basic**, **Camping Gear** and **Tropical Beach**. The owner can, where allowed, take the compulsory T1 draw, use Camping Gear to search for G&H if not held, and finish the turn. On the following own turn, after compulsory T2 draw, G&H can search both attack resources. This is an **idealized sufficient search path**, conditional on G&H being available in hand or own deck, both resources having avoided all six Prizes, a legal unblocked Item and following-turn Supporter, and strategic acceptability of two discards. No source Match Store action has been observed for this exact composite line.

## Exact finite-population result

| Initial-seven coheld Basic + Gear + Beach, six random Prizes | Probability |
| --- | ---: |
| Both singleton attack resources avoided Prizes (upper envelope without Prize recovery) | **79.95072054%** |
| Both resources avoided Prizes and at least one G&H available in hand/deck (G&H bridge sufficient condition) | **79.14876633%** |
| Resource-available states not covered by that sufficient condition | **0.80195421 percentage points** |
| Direct T1 Gear missing-resource search with only T1 and T2 natural draws, both resources by T2 draw (earlier constrained model) | **16.97006636%** |

These rows use **different allowed action sets**. The last excludes a T2 Supporter entirely, while the 79.15% row assumes a full T2 G&H two-category search and a payable discard. Comparing them shows why optimizing only immediate DCE possession can mis-rank an intentionally multi-axis Supporter connector. It does not demonstrate a fourfold game-level performance difference or even a preferred Camping Gear target in arbitrary real states.

The exact counting enumerates first-seven card categories from the original fixed 60, retaining the mandatory Basic/Gear/Beach groups, and then all six-Prize combinations among the remaining 53. For each opener, exclude Prize sets containing the unheld DCE or unheld Thunder. Also exclude Prize sets containing both G&H if neither G&H was initially in hand. The result is **5,275,304** admissible coheld starting seven-card hands and **22,957,480** equally sized six-Prize combinations per hand. No independent draws are incorrectly treated as replacement sampling.

Reproduction: the [fast four-file manual GitHub Actions test run 41418887541](https://github.com/FlareZ123/experiment-01/actions/runs/41418887541) completed successfully on Node20 without Twinleaf compilation. [Exact source-count enumeration](../../simulation/evaluation/agent33-rank29-guzma-hala-prize-reachability.cjs) and [source-identity regression](../../tests/agent33-rank29-guzma-hala-prize-reachability.test.cjs). An independent Python random-permutation check of 450,000 physical deals found 6,164 coheld openings and 79.33% satisfying the source-location event, consistent with the exact 79.15% at its sampling precision.

## AMR and opponent-policy limitations

The two additional discards have actual state-dependent costs, can force sacrificing a future lock or recovery piece, and may be more expensive than the paper mechanics imply. G&H consumes the T2 Supporter, may conflict with Boss/Plumeria, and may be denied by opposing Supporter lock. Thunder can be replaced or prevented by Stadium interactions; Special Energy can be denied; the Active may already be KO'd or forced away. A T2 attack also requires an eligible active Iron Thorns, a legal Energy attachment and correct attack cost. The 99.5% all-field target remains unsubstantiated; no competitively qualified games were produced.

**Decision:** Preserve both plausible search lines. The fixed G&H target is a credible ALS rather than a demonstrated error. The owner-visible direct-Thunder helper is a useful isolated counterfactual whose payoff requires native paired follow-through under source policy, preferably with both variants competing against the same printed physical state and opponent response.
