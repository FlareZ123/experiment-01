# Agent6 — Apex/Timeless prize-only failure against the 99.5% field budget

**15 November 2026 · exact combinatorial synthesis · no gameplay or matchup claim**

## Question

Does adding copies of Mimikyu GRI 58 and/or Dialga-GX UPR 100 make the candidate's specific Mimikyu Copycat → opponent's prior-turn Regidrago VSTAR Apex Dragon → own Dialga Timeless-GX line sufficiently resilient to carry the 99.5% equal-weight Aichi Top 32 objective?

This connects:
- [Agent3's exact Hood Copycat prize-reliability calculation](agent3-hood-copycat-prize-reliability-20261115.md);
- [Agent6's 99.5% fixed-60 confidence-design floor](../../methodology/agent6-fixed60-995-confidence-design-floor-20261107.md);
- [the 24-rank field composition](agent39-24-rank-diagnostic-field-composition-20261113.md).

## Exact prize-only probabilities

The current Hood v1 60 contains one Mimikyu and one Dialga-GX. Both are mandatory for this particular Apex→Timeless line. Under six uniformly sampled Prize cards, the line is unavailable if all Mimikyu copies or all Dialga copies are Prized.

The exact probability is:

`P(unavailable) = P(all Mimikyu Prized) + P(all Dialga Prized) - P(all Mimikyu and Dialga Prized)`.

Agent3's exact combinatorial results are:

| Mimikyu / Dialga copies | Prize-only line unavailability |
|---|---:|
| 1 / 1 (current list) | 113/590 = **19.152542%** |
| 2 / 1 or 1 / 2 | 923/8555 = **10.789012%** |
| 2 / 2 | 550/32509 = **1.691839%** |

These are Prize-zone-only probabilities. A line that is prize-available may still be inaccessible in hand, discard, board position, Energy, turn timing, or GX-use state. Conversely, a prize-unavailable Apex→Timeless line does not mean the game is lost: other attacks and win routes may remain.

## Conditional field-budget stress test

The field index identifies 11/32 Regidrago archetype entries: nine published original 60s and two missing source lists whose archetype labels are Regidrago. The two missing lists are not reconstructed, and the 11/32 count is an archetype-field label, not 11 fully authenticated exact decklists.

For an equal-weight 32-opponent field mean, a 99.5% win-rate target permits at most 0.5 percentage points of aggregate loss probability. If all 11 Regidrago entries had the same prize-only unavailability probability (q), and **every** such unavailable line were an automatic game loss, its field-mean loss contribution would be ((11/32)q).

| Mimikyu / Dialga copies | Prize-only unavailability (q) | Conditional field-mean loss contribution ((11/32)q) |
|---|---:|---:|
| 1 / 1 | 19.152542% | **6.583686 pp** |
| 2 / 1 or 1 / 2 | 10.789012% | **3.708723 pp** |
| 2 / 2 | 1.691839% | **0.581570 pp** |

The 0.5% field-loss budget would permit at most:

`q ≤ 0.005 × 32 / 11 = 0.01454545… = 1.454545…%`

for this one failure mode if every other matchup and every other aspect of the Regidrago games were perfect. Even the 2/2 core's 1.691839% Prize-only unavailability exceeds that conditional ceiling. The current 1/1 and one-slot duplicate arms exceed it by much larger margins.

The exact field-weighted fractions are:
- 1/1: `1243/18880` (6.583686441 percentage points);
- 2/1 or 1/2: `10153/273760` (3.708722969 percentage points);
- 2/2: `3025/520144` (0.581569719 percentage points).

## What this does and does not imply

**It does imply:** the Apex→Timeless line cannot be treated as a guaranteed fallback, and adding one or two copies alone does not make its Prize-only failure mode fit inside the entire 99.5% field-loss budget under the deliberately pessimistic automatic-loss assumption. A credible deck must demonstrate alternative winning routes in games where Mimikyu or Dialga is Prized, or demonstrate that this Prize-only obstruction is often survivable.

**It does not imply:** that any Prize-only obstruction is an automatic loss, that 2/2 is the right deck construction, that the candidate loses 0.5816% or more of games, or that the candidate has any particular Regidrago matchup rate. No draw/search access, opponent decisions, attack frequency, alternative attacks, Prize-taking, or slot opportunity cost is modeled. The 11/32 group also includes two missing exact source lists.

The existing Mimikyu-2 and Dialga-2 challenger lists remain parked. This synthesis does not unpark, nominate, or change any 60. The current worker/policy acceptance gate and full-field comparison requirements remain in force.

## Reproduction

Using the exact fractions from Agent3's prize calculation and the 11/32 source-index field share:

`field contribution = (11/32) × prize-only unavailability`

The threshold is the rearrangement of `(11/32)q ≤ 0.005`. No Monte Carlo, simulator, policy, or game data is involved.

**Conclusion:** copy-count redundancy is a useful structural sensitivity, but it is not a complete 99.5% strategy. The decisive future question is whether the fixed 60 can still win reliably when the Apex→Timeless line is unavailable—not whether a larger core merely makes that one line more likely to be prize-accessible.
