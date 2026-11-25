# Field-wide 99.5% all-game non-win budget constraints

Source: `results/aichi-2026/field.csv` (32 placements, 29 published full lists).

**Outcome definition:** for rank `i`, `p_i` is the probability that the candidate wins a played game against that rank. The denominator is all played games. A loss, draw, timeout, invalid-action abort, or other non-win terminal outcome counts as a non-win. This is distinct from the decisive-game statistic `wins / (wins + losses)`, which must not be substituted into the all-game confidence design.

Under equal rank weighting, a 99.5% mean all-game win probability requires the sum of 32 rank-specific non-win probabilities to be at most 0.16. Regidrago occupies 11 placements, so its group mean must be at least 98.545455%, even if every other rank is beaten with certainty. The four Absol Garbodor placements require at least 96%; the three Iron Thorns and three Raichu placements each require at least 94.666667%; the two Snorlax placements require at least 92%. These are separate necessary bounds and cannot all consume the same 0.16 shortfall.

Ranks 23, 25, and 28 lack source lists. Even if all 29 published lists were beaten with exactly 100% all-game win probability, the remaining three would require at least 94.666667% mean wins. If the three missing ranks were certain wins, the 29 known ranks would still require at least 99.448276% mean wins. With no evidence on the missing ranks, perfect known-rank probabilities identify the full-field mean only within [90.625%, 100%].

Mathematical assumptions: true all-game win probabilities, equal rank weighting, and defined opponent/starting-seat policies. No actual matchup win rates have been measured here. The 99.5% target remains unverified. Any source-missing ranks remain part of the benchmark denominator.

Implementation: `scripts/aichi-archetype-loss-budget.cjs` exposes `totalNonWinBudget` and the all-game outcome definition; `totalLossBudget` remains only as a backwards-compatible alias.
