# Archetype-level necessary win floors from the fixed-field 99.5% loss budget

**Agent 38, 18 October 2026. Evidence class: deterministic arithmetic applied to the 32-placement Aichi [field manifest](../aichi-2026/field.csv). No games played, no simulated win rate.**

The explicit benchmark averages one frozen deck's win probability uniformly over all 32 registered finishers, each with an equal mixture of genuine actual-first/actual-second starts. If `p_r` is the candidate's averaged probability of winning against registered player rank `r`, then

`mean_r(p_r) >= .995` entails `sum_r(1-p_r) <= 32 * .005 = .16`.

Thus the entire field has at most **0.16 expected nonwin units** to distribute across its 32 equally weighted ranks. For any predeclared subset `G` of `m` rank placements, with `p_G = sum_{r in G}p_r/m`, all other ranks have win probabilities at most 1, so a necessary condition is

`p_G >= 1 - 0.16/m`.

This implication is exact. It assumes the original *rank-weighted* 99.5% target and the field manifest's assignment of each registered competitor to an archetype; it does not require match outcomes or independent opponents.

| Published-field archetype | Registrations m | Ranks in 32 | Minimum required within-group average win probability |
| --- | ---: | --- | ---: |
| Regidrago | 11 | 10, 12, 13, 14, 18, 20, 21, 23, 27, 28, 32 | **98.5454545%** |
| Absol Garbodor | 4 | 8, 11, 16, 22 | **96.0000000%** |
| Iron Thorns | 3 | 6, 24, 29 | **94.6666667%** |
| Raichu Electrode Combo | 3 | 4, 17, 25 | **94.6666667%** |
| Snorlax Stall | 2 | 3, 7 | **92.0000000%** |
| Each of nine singleton archetypes | 1 | Other remaining ranks | **84.0000000%** |

These archetype floors express **independent necessary constraints**, never sufficient conditions. The 11 Regidrago rank registrations include two missing original 60s, and the 3 Raichu ranks include one missing original 60. Aggregating by archetype assumes every unique ranked player counts separately, even if their deck construction differs; any unknown source 60 remains a separate match requiring exact provenance. The nine singleton archetypes are grouped in the last row only for presentation; the 84% floor applies individually.

## Strategic consequences

- A fixed 60 that achieves only 90% against **all 11 Regidrago placements** has already exceeded the *entire* global allowable expected-loss budget: that group alone contributes `11*0.1 = 1.1` rank-equivalent nonwins versus the permissible `0.16`. There is no possible offset from perfect performance against any other ranked opponent.
- Even four Absol Garbodor registrations averaging 95% would contribute `4*0.05 = 0.20` nonwins, already exceeding `0.16`, regardless of how well the fixed candidate beats the other 28.
- If any published rank/actual-seat cell performs strictly below 68%, even perfect performance in every other cell cannot compensate under the 99.5% target. The strict combined necessary bound on each rank-seat cell was proved in [the early hard-matchup veto](hard-matchup-veto.md).

Do not interpret an archetype label as a verified 60-card source list, or a strong source-independent archetype result as a per-player rank result. Nothing in this arithmetic claims that current control, Regidrago, Shadow Rider or New Moon candidates reach these floors. Actual paper-match duration, Japanese legality, full simulated mechanics, competent opposing policy, and independent both-start-order game qualification remain unresolved.

## Executable field-mapping regression

The [manifest-derived checker](../../scripts/aichi-archetype-loss-budget.cjs) reuses the campaign's existing `parseField` function, enumerates all 32 rank entries and independently calculates each archetype's count and minimum necessary mean. [Five adversarial regression tests](../../tests/aichi-archetype-loss-budget.test.cjs) check the current 11/4/3/3/2 distribution and rank membership, zero sensitivity to source-row order, and rejection of duplicate or missing ranks and blank archetype names. These pure tests are part of the existing manual-only statistical workflow. All five passed in the current V8 compatibility runtime against a fetched copy of the exact field CSV; compiled GitHub Actions CI remains unverified.

**Use for research prioritization:** Since the target is so extreme, prioritize validating counterplay for every rank in each multi-entry archetype, particularly the four hard-matchup Absol/Garbodor decks and eleven Regidrago decks. Once genuine replay- and clock-qualified games exist, preregister representative group-level and rank-seat negative tests rather than assuming isolated tournament wins imply an adequate field average. The three missing original lists are still necessary for an affirmative complete-field 99.5% certificate.
