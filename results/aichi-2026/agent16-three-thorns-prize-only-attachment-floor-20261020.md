# Three published Iron Thorns lists: exact initial-Prize floor on manual Energy attachments

**Agent 16, 20 October 2026. Exact card-location calculation; no simulated games.** This generalizes the [rank-6 DCE-K1 distinction](agent16-rank6-multi-attachment-energy-prize-frontier-20261020.md) to all three published Aichi Top32 Iron Thorns 60s at **ranks 6, 24 and 29**, without changing their registered cards. The [printed field manifest](full-decklists.json) records four Iron Thorns ex as the only Basic Pokémon in each, one Thunder Mountain Prism Star, four Speed Lightning Energy and eight total Special Energy. Ranks 6 and 29 use one Double Colorless Energy (DCE), two Capture and one Spiky; rank 24 uses three DCE and one Capture.

Iron Thorns ex's Volt Cyclone costs one Lightning plus two Colorless. Thunder Mountain reduces its Lightning requirement by one when in play. The printed Energy therefore provides these possible minimum *manual attachment counts*, **assuming every initially unprized card could eventually be drawn or fetched and legally attached**: one attachment with unprized Thunder plus an unprized DCE; two with Thunder plus two one-unit Energy, or without Thunder with a Lightning provider plus DCE; three without either Thunder or DCE, using at least one Speed and two other one-unit Energy.

## Exact distribution

Condition on an opening seven containing at least one Basic Iron Thorns. Prize six from the remaining 53 at random. Classify the minimum number of Energy attachments possible using the initially unprized Energy and Stadium pool; physical access and the actual sequence of play are outside the model.

| Minimum manual attachments physically supplied by unprized pool | Rank 6: 1 DCE | Rank 24: 3 DCE | Rank 29: 1 DCE |
| --- | ---: | ---: | ---: |
| **1** | 80.58821882% | **89.80045104%** | 80.58821882% |
| **2** | 18.53983676% | 10.19617278% | 18.53983676% |
| **3** | 0.87182631% | 0.00325807% | 0.87182631% |
| **Unavailable without Prize recovery** | 0.00011810% | 0.00011810% | 0.00011810% |

Rank 24's three-DCE allocation improves the **physical one-attachment floor** by **9.21223222 percentage points** over ranks 6 and 29. This difference is *not* a first-turn attack probability. It assumes perfect future access to any initial unprized resource, ignores the Supporter/discard/Search/attachment window and grants a usable Thunder Mountain when it is unprized. The published [exact opening eight-card study](iron-thorns-three-rank-opening-frontier.md) obtains far lower, conditional on real hand-card channels and discard permissions.

The rare impossible cost event is identical across all three lists: **Thunder Mountain and all four Speed Lightning Energy are among six Prizes**. Exactly 55 of the `C(60,6)` Prize subsets satisfy this. Among Basic-valid seven-card openers, its exact probability is `1395/1181171992 = 0.000118103037%`; unconditional it is `1/910252 = 0.000109859687%`. This is an initial, *without-recovery* classification. Taking Prizes, Gladion, other recovery, extra turns and opponent interactions alter real prospects. In contrast, all-DCE-Prized has conditional probability `79029/779240 = 10.141804835%` for ranks 6/29 and `2353/3857238 = 0.061002199%` for rank 24, reproducing Agent 1's [independent DCE-Prize result](agent1-iron-thorns-dce-prize-collapse-conditional-20261020.md).

## Reproducibility and interpretation

- [Source-bound CommonJS exact enumerator](../../scripts/aichi-thorns-attachment-floor.cjs) computes all multivariate six-Prize classes from each original 60's actual category counts using BigInt arithmetic, conditional legal first-seven weighting and an explicit minimum-attachment cost evaluator.
- [Five direct Node 22 regressions](../../tests/aichi-thorns-attachment-floor.test.cjs) cover typed Lightning requirements, all three source fractions, distinct one/two/three Energy classes and a mutated source-count failure. Local isolated Node 22 execution on exact-source-count synthetic manifests passed **5/5**, with independent Python finite-population enumeration producing the same reduced fractions. No new compiled Twinleaf game or GitHub Actions validation is represented.
- This shows why a **Prized rank-6 singleton DCE** blocks the scripted DCE/Thunder first-eligible attack route while leaving slower one-unit Energy lines theoretically open. In the existing canonical actor-only composition, source-side normal root decisions still lack a general Special Energy attachment planner, even though all three Thorns 60s run **zero Basic Energy**. Future native source actions must be chosen using actor-visible hand, actual Energy attachment quota, public Stadium and prompts, and authentic Store acceptance. An initial physical resource opportunity never guarantees timing, survival, damage, lock or victory.

**Benchmark status is unchanged:** 29/32 exact official opposing 60s, zero competitively qualified games and no demonstrated fixed deck at the 99.5% target. Both the rank-24 source policy and rank-6/29 source policies require genuine opponent competency checks before this mathematical discrepancy can inform candidate promotion.
