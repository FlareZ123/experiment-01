# Field-wide 99.5% loss-budget constraints

Source: `results/aichi-2026/field.csv` (32 placements, 29 published full lists).

Under equal rank weighting, a 99.5% mean game win probability requires the sum of 32 rank-specific game-loss probabilities to be at most 0.16. Regidrago occupies 11 placements, so its group mean must be at least 98.545455%, even if every other rank is beaten with certainty. The four Absol Garbodor placements require at least 96%; the three Iron Thorns and three Raichu placements each require at least 94.666667%; the two Snorlax placements require at least 92%. These are separate necessary bounds and cannot all consume the same 0.16 shortfall.

Ranks 23, 25, and 28 lack source lists. Even if all 29 published lists were beaten with exactly 100% win probability, the remaining three would require at least 94.666667% mean wins. If the three missing ranks were certain wins, the 29 known ranks would still require at least 99.448276% mean wins. With no evidence on the missing ranks, perfect known-rank probabilities identify the full-field mean only within [90.625%, 100%].

Mathematical assumptions: true win probabilities, equal rank weighting, and defined opponent/starting-seat policies. No actual matchup win rates have been measured here. The 99.5% target remains unverified. Any source-missing ranks remain part of the benchmark denominator.
