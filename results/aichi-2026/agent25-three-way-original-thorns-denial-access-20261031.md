# Exact original rank-6/24/29 three-family Energy-denial coholding

**Agent 25 | 31 October 2026 | original source-print audit and exact inclusion-exclusion.** This is an early physical card-access calculation for a genuine common-chooser conflict, rather than a simulated match or a paper-legal-action rate.

## New cross-rank distinction

The authenticated final-place 60s in [full-decklists.json](full-decklists.json) have the following *exact English display printings*:

| Source rank | Iron Thorns ex TWM 77 | Plumeria BUS 120 | Team Flare Grunt XY 129 | Crushing Hammer POR 71 |
| --- | ---: | ---: | ---: | ---: |
| 6 | 4 | 4 | 2 | **4** |
| 24 | 4 | 4 | 2 | **0** |
| 29 | 4 | 4 | 2 | **4** |

This is a concrete difference between otherwise similar published lists: rank 24 can have a Plumeria-versus-Team Flare decision, but **cannot** have a *held original Crushing Hammer* as its third competing card. The same-root physical-action and resource-cost comparison from [Agent 4](agent4-plumeria-teamflare-same-root-native-20261031.md) remains mechanically relevant, but a three-family contender should be sought primarily in ranks 6 and 29.

## Exact access probabilities

Condition on a starting seven containing at least one of the four Iron Thorns ex. Observe that seven plus **k ordinary random draws** without searching, extra mulligan cards, card effects or hand expenditure. The six face-down Prize positions are marginalized, not assumed to be favorable. Required groups are disjoint printings: Plumeria P=4, Team Flare F=2 and Crushing Hammer H=4 for ranks 6/29.

| Observed natural cards | Plumeria + Flare, ranks 6/24/29 | All three, ranks 6/29 | All three, rank 24 | P(all three | Plumeria + Flare), ranks 6/29 |
| --- | ---: | ---: | ---: | ---: |
| Valid 7 | 6.35124926% | **1.73595718%** | 0% | 27.33253110% |
| Valid 7 + 1 draw | 8.50820198% | **2.81172391%** | 0% | 33.04721624% |
| Valid 7 + 2 draws | 10.87486724% | **4.17603807%** | 0% | 38.40081882% |

Reduced exact fractions for the triple event at k=0/1/2 are `3720/214291`, `2052896/73012005`, `6165774/147646499`. The two-family k=1 fraction `820454/9643095` independently matches the [earlier two-Supporter result](agent4-source-thorns-plumeria-flare-choices-20261031.md).

## Derivation

For subset S of required categories, let m(S) be its total removed copy count. Inclusion-exclusion applied to the physical labelled deck gives:

```text
favorable(k) =
  sum over S subset {P,F,H} of
  (-1)^|S| *
  [C(60 - m(S), 7) - C(56 - m(S), 7)] *
  C(53 - m(S), k)

total(k) = [C(60, 7) - C(56, 7)] * C(53, k)
probability = favorable(k) / total(k)
```

The subtraction excludes initial hands without a Basic. Sampling the next k positions from the remaining 53, after marginalizing over the six unseen Prize cards, is exact by exchangeability. The result counts coholding in a conceptual known-card collection; it does not assert that the player can or should preserve all those cards after actually playing their opening Basic.

## Reproducibility

- [BigInt exact calculator](../../scripts/agent25-thorns-triple-denial-access.cjs) reads the authenticated original 60s and checks physical count/printing contracts. It explicitly rejects missing final rank 25, altered source counts and invalid combinatorial inputs.
- [Tests](../../tests/agent25-thorns-triple-denial-access.test.cjs) cover exact fractions, each original printing contract, absent rank 24 Hammer, and an independently enumerated small labelled deck for k=0/1/2. **Five local Node tests passed** against a temporary fixture containing the exact four validated category counts and an aggregated 'other' category. The **authentic full-manifest test and the existing field audit suite then passed** in manually dispatched [CI 41162844711](https://github.com/FlareZ123/experiment-01/actions/runs/41162844711), on head `86ff44efd9a4cdb01c50dcedf4f9e9c84b4869e5`. The manual field audit is pure Node and does not compile Twinleaf.

## Policy implication and boundaries

An integrated source chooser can enumerate three-way competing owner root actions in ranks 6 and 29, preserving the physical cost of Plumeria's two-card payment, the zero extra-card payment of Team Flare Grunt and the probabilistic Hammer branch. The ranking requires genuine opponent Active/Bench Energy targets, lock checks, native `canPlay`, and subsequent owner/opponent continuation. Rank 24 warrants two-Supporter arbitration and other actual Item alternatives, without inventing a Crushing Hammer.

The **2.81%** direct 7+1 triple-card event in the rank-6/29 decks is too narrow to assume frequent naturally dealt positives in small original-Store trials. Conversely, a negative early-hand census does not demonstrate that these three cards never compete later after searching/drawing. This result should guide representative opportunity denominators and action-family coverage; it does not justify delaying broad Trainer policy integration for a rare three-card overlap.

**Status:** 29 of 32 original published field 60s authenticated; missing final ranks 23/25/28; zero competitively qualified game results; no validated fixed 60 or demonstrated 99.5% benchmark.
