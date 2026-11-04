# Agent30: source-29 opening-board divergence from the two competing native setup choices

**4 November 2026 | exact physical opening-hand mathematics | source-reported strategy impact, no game-win evidence**

## Question

The shared Issue #25 release has two competing owner-safe handlers for native `CHOOSE_STARTING_POKEMONS`. [Agent4](../../simulation/twinleaf/agent4-owner-setup-starting-pokemon.cjs) chooses only the first eligible Pokémon; [Agent50](../../simulation/twinleaf/agent50-owner-starting-basic-choice.cjs) greedily selects all eligible Pokémon up to native max 6, using `prompt.validate`. The [untouched pinned upstream setup reducer](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/reducers/setup-reducer.ts) places the first chosen Pokémon Active and the rest Bench, then deals six Prizes. The source-path distinction for optional `min0` mulligan-bonus Bench-only prompts appears in [my prior source review](agent30-opening-setup-message-overload-and-cardinality-20261104.md).

This model asks: **How frequently must the original field begin with at least two printed Basics, so that choosing one versus all produces physically different initial boards?**

## Exact combinatorial model

Use seven uniformly dealt physical cards from a registered 60. The relevant event conditions on **at least one printed Basic Pokémon**, with `b` Basics in the 60. The chance of exactly `k` Basics in the opening seven is `C(b,k) C(60-b,7-k)/C(60,7)`. Define `D=C(60,7)-C(60-b,7)`. Then:

- Different initial physical board: `P(K >= 2 | K >= 1) = [D - b*C(60-b,6)]/D`.
- Additional greedily Benched Basics: `E[min(K-1,5) | K >= 1] = sum_{k=1..min(b,7)} min(k-1,5)*C(b,k)*C(60-b,7-k)/D`.

The formulas count true Basic Pokémon only. Additional `PLAY_DURING_SETUP` printings, optional mulligan-bonus extra draws, future search, strategic Active choice, opponent action, Bench-locked cards and win rate are outside the exact model. `K=7` has a six-card native selection cap; five Bench slots are honored.

The [new reproducible script](../../scripts/agent30-owner-setup-bench-cardinality.cjs) consumes all 29 authenticated original source 60s in [`full-decklists.json`](../aichi-2026/full-decklists.json), using [Agent18's independently audited exact stage classifier](../../scripts/agent18-original-source-supporter-opening.cjs) to classify printings by source set/number/name. [SFT](../../tests/agent30-owner-setup-bench-cardinality.test.cjs) verifies exact numerators and denominators for four- and sixteen-Basic source decks, 29 source counts and the aggregate. Missing original ranks **23/25/28** are excluded.

## Findings

| True Basic count `b` | Representative original ranks | P(different board) | Expected extra greedy Bench |
| ---: | --- | ---: | ---: |
| 4 | 6, 24, 29 | **15.82465%** | 0.16813 |
| 11 | 3, 5, 9, 11, 13, 16 | **48.77831%** | 0.65042 |
| 12 | 7, 22, 26 | **52.88913%** | 0.72977 |
| 14 | 1, 2, 14, 15, 20, 21 | **60.58237%** | 0.89611 |
| 16 | 18, 19, 30 | **67.53399%** | 1.07225 |

Equal weight across the **29 authenticated original lists** gives **52.98270% different initial boards** and **0.76311 additional greedy Bench Basics per Basic-valid opening**. These are **exact expectations for the stipulated source-deal model**, without statistical sampling error. They make no claim about which setup policy is strategically preferable.

For four immutable developmental challengers, using the Basic-card inventory recorded in [Agent45's candidate gate](../aichi-2026/agent45-fixed60-candidate-intake-stage-gate-20261104.md):

| Frozen candidate | Basics | P(different board) | Expected extra greedy Bench |
| --- | ---: | ---: | ---: |
| Apex Alchemy v0 | 12 | 52.88913% | 0.72977 |
| ADP–Thorton–Regidrago v2 | 7 | 30.75080% | 0.35912 |
| Sentinel Lopunny/Vileplume v1 | 14 | 60.58237% | 0.89611 |
| Arven–Boost Shake Absol v1 | 12 | 52.88913% | 0.72977 |

## Release implication

The initial one-card-vs-greedy disagreement affects **a majority** of Basic-valid original source openings. A single selected bilateral policy must pin the choice cardinality, Active/Bench order, min1 initial versus min0 bonus-Bench prompt, wrapper precedence and actual post-Store board for both seats. The same physical seven and Prize six should be preserved for a registered same-deal A/B witness. Both start configurations can be valid under the attached Advanced Player's Rulebook's optional Bench rule; whether another Bench Pokémon helps or hinders must be determined by later opponent actions, payment and game-state value.

**Boundary:** 29/32 original name/count 60s authenticated, three unavailable, **0 competitively qualified games**, no final fixed 60, no demonstrated 99.5% rate.
