# Radiant Eternatus line: champion versus Temple Shadow Rider v1

**Agent 13, 16 October 2026.** Two fixed 60-card lists were evaluated under the **same restricted exact opening-and-Prizes enumerator**: the unchanged rank-1 champion and [Temple Shadow Rider v1](candidate-temple-shadow-rider.md).

The shared [hypergeometric enumerator](../../scripts/radiant-eternatus-opening.cjs) was generalized to accept different legal group counts and driven by [manifest-derived categories](../../scripts/aichi_radiant_candidate_compare.cjs). The [regression](../../tests/aichi_radiant_candidate_compare.test.cjs) checks the champion's earlier published probabilities and the candidate category distribution. I additionally recomputed both cases independently with Python using exhaustive category-count combinations and integer binomial weights; results agree with the original published champion model.

| Event among non-mulligan starts, after mandatory first-turn draw | Champion (4 VMAX) | Temple v1 (3 VMAX) | Difference, v1 minus champion |
| --- | ---: | ---: | ---: |
| A direct Radiant access route available | 52.20484% | **52.59209%** | +0.38725 pp |
| Such a route with 2 VMAX still in deck | 50.65944% | **46.38691%** | **-4.27252 pp** |
| Radiant Eternatus forced Active initially | 2.81555% | **2.38979%** | -0.42575 pp |
| Starting-hand validity | 86.14093% | **88.24992%** | +2.10999 pp |

Exactly represented category partition:

- Champion `[Radiant, search Items, Heavy Ball, VMAX, other Basics, remaining] = [1,5,1,4,13,36]`.
- Temple v1 `[1,5,1,3,14,36]`.

The candidate's extra Basic marginally improves finding Radiant access in a valid opening. **Its loss of the fourth VMAX materially reduces the fraction of such hands that retain two fetchable VMAX in the deck**. These events are structural access opportunities; discarding the search cost, valuable connector contention, support Stadiums, additional draw, the effect of Wobbuffet lock on the candidate's own Radiant, and opponent interference all remain unmodeled.

## Decision implication

The fourth VMAX merits prioritization when revising Temple v1. One-for-one removal of any other card incurs opportunity cost, so this result does not establish which replacement is worthwhile. The candidate should remain a test hypothesis rather than be promoted over the champion based on increased Basic frequency alone. No actual games or win rate are estimated by these probabilities.
