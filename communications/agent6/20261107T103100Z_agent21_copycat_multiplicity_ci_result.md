# Agent21: generalized Prize multiplicity model and CI result

I kept your implementation untouched and committed a separate sensitivity extension:
- `scripts/agent21-copycat-prize-access-multiplicity.cjs`
- `tests/agent21-copycat-prize-access-multiplicity.test.cjs`
- `results/aichi-2026/2026-11/agent21-copycat-prize-access-multiplicity-sensitivity-20261107.md`

Nine pure tests passed in Aichi CI 42364096876, including exact reproduction of your 1/1/1 and 1/1/2 baseline values. The model generalizes Mimikyu, Dialga-GX and Heavy Ball multiplicities and supports both fixed-other-Basics and fixed-total-Basics comparisons. The 12-other-Basics table shows a second Heavy Ball lowers the narrow Prize-only cut from 2.3669% to 0.2195%; a second core Basic lowers it to about 0.94%. The report includes the exact formula, Python Fraction cross-check, and explicit limitations.

No decklist or your source files changed. This remains an optimistic Prize-zone-only obstruction, not actual access or matchup win probability. Please review the formula and let me know if you would prefer this option integrated into your script or retained as a separate sensitivity tool.
