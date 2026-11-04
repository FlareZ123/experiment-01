# Agent 2: Forest Seal Stone first-Tool starvation in the common bilateral policy

**4 November 2026. Source-code audit and exact original-field opening combinatorics.** This is a developmental policy-competence finding, without a native counterfactual or win-rate estimate.

## Mechanism and source-locked concern

The shared [Forest Seal Stone V-recipient policy](../../simulation/twinleaf/forest-stone-v-recipient-policy.cjs) selects the **first Tool in physical hand order**, using the JS Array.find method. If that first Tool is Forest Seal Stone SIT, it returns the **hold** decision when the VSTAR power is spent or there is no free Pokémon V recipient. Its wrapper returns undefined rather than asking the underlying Tool tactic to assess another held Tool.

The pinned upstream [AttachToolTactic](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/simple-bot/simple-tactics/attach-tool-tactic.ts) also examines only the first filtered Tool. Merely delegating to native cannot be assumed to rescue another Tool. The same hand may hold a strategically relevant Float Stone, Stealthy Hood, Muscle Band or other Tool that never receives a proposal. This is a **choice-set omission**, and it is not yet evidence that the second Tool is playable, valuable, or would be the competent best action.

The existing [bilateral common policy](../../simulation/evaluation/agent41-bilateral-common-policy.cjs) installs this V-recipient wrapper on both seats, making the concern relevant to evaluating opponents as well as the candidate deck.

## Original-field source counts and exact opening condition

The new [pure executable](../../simulation/evaluation/agent2-original29-fss-first-tool-collision.cjs) reads [29 authenticated original printed sixties](../aichi-2026/full-decklists.json), bundled English set metadata, and card database subtypes Pokémon Tool, Basic and V. It requires exact source set, number and normalized card name. SM/XY promo ID notation and Prism glyphs have explicit normalization. The three missing original source ranks 23, 25 and 28 remain excluded.

**Twelve of the 29 authenticated original decks carry Forest Seal Stone and at least one other Tool:** ranks **1, 3, 4, 5, 8, 9, 11, 16, 19, 22, 26, 30**.

Define event E in a random physical opening seven:

1. At least one Forest Seal Stone and at least one other Pokémon Tool are held.
2. At least one non-V Basic is held and zero Basic Pokémon V are held, so the opening seven is a valid nonmulligan hand.
3. In that physical hand order, Forest Seal Stone is the earliest held Tool.

The exact valid-seven denominator for a deck with b Basic Pokémon is **C(60,7) minus C(60-b,7)**. The numerator enumerates counts F of Stones, T of other Tools, N of non-V Basics, excludes V Basics, and weights each unordered hand by **F/(F+T)** for the Stone being the earliest ordered Tool. Implementation uses exact binomial integers and a 420-scaled integer numerator for ordered-first weights. No Monte Carlo approximation was used.

| Source rank | FSS | Other Tools | Basic | Basic V | P(E given valid seven) |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 1 | 1 | 14 | 3 | 0.3596% |
| 3 | 1 | 3 | 11 | 1 | 1.1923% |
| 4 | 1 | 2 | 13 | 3 | 0.6609% |
| 5 | 1 | 4 | 11 | 9 | 0.2086% |
| 8 | 1 | 5 | 10 | 1 | 1.7493% |
| 9 | 1 | 2 | 11 | 1 | 0.8382% |
| 11 | 2 | 4 | 11 | 3 | **2.1419%** |
| 16 | 1 | 5 | 11 | 2 | 1.5340% |
| 19 | 1 | 1 | 16 | 2 | 0.4267% |
| 22 | 1 | 5 | 12 | 3 | 1.3532% |
| 26 | 1 | 3 | 12 | 1 | 1.2150% |
| 30 | 1 | 1 | 16 | 2 | 0.4267% |

Equal-weight mean for those 12 source decks is **1.008863% of valid opening hands**. Equal-weight mean across all 29 authenticated source decks, treating the 17 with no FSS as zero, is **0.417460%**. These figures measure a specific physical *starting-hand* condition, which may no longer hold by the time the Tool tactic runs because prior search may establish a V. They are not rates of lost opportunities, failed games or win-rate changes. Actual Tool target availability and alternative value remain unmeasured.

## Tests and evidence custody

- [Reproducible evaluator](../../simulation/evaluation/agent2-original29-fss-first-tool-collision.cjs), version agent2-original29-first-tool-fss-collision-exact-v1.
- [Node regression tests](../../tests/agent2-original29-fss-first-tool-collision.test.cjs) check an independently derived elementary conditional probability and the registered original-field rank, Tool count and Basic stage expectations.
- [Bounded manual-only workflow](../../.github/workflows/agent2-original29-fss-collision-pure.yml) runs Node 22 tests and uploads a complete machine-readable 29-row JSON plus SHA-256.
- Actual [GitHub Actions CI 41894745676](https://github.com/FlareZ123/experiment-01/actions/runs/41894745676) **SUCCEEDED** at research checkout **978839fbccf70521f8c98d4b8de84c4ebbb5e652**. The archived [artifact 13355495980](https://github.com/FlareZ123/experiment-01/actions/runs/41894745676/artifacts/13355495980) has provider ZIP digest **sha256:13786635d008997b37d168ba0615e86294637d99c9b449ce70f8cee8e16fdc3a**; this is distinct from the included raw JSON SHA-256.
- An independent local Python calculation cross-checked all 12 opening distributions and resolved the affected Pokémon stages from the provided card-list archive.

## Targeted follow-up to enable Issue #25

Pre-register a physical original-source hand, genuine current Store board, actual available Tool slots, both players' visible boards, and every available Tool before comparing current wrapper against an owner-information-only alternative **enumerating all legal Tool/recipient pairs**. Require real Store validation and a consequential next turn; keep negative actions and remaining hands in the denominator. Rank 11 offers the highest modeled initial-seven frequency, while rank 3 offers three distinct alternate Tools.

The native first-Tool tactic itself shares this limitation, so fallback delegation alone does not solve it. Retain the current wrapper until a better alternate-Tool policy is tested against real Store receipts and exact printed interactions.

**Release remains FAIL/UNRESOLVED:** 29/32 authenticated original inventories, zero competitively qualified games, no final fixed 60, no demonstrated 99.5% win rate.
