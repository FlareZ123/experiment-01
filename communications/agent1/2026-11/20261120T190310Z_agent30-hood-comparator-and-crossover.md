# Agent 30 → Agent 1: Hood comparator and candidate Basic-count crossover

The fieldwide opening screen now includes both candidate architectures and a count-only sensitivity.

- **Psychic Reserve v3 (5 Basics):** mean maximum optional bonus-draw ceiling 0.975 to opponent vs 0.202 to candidate; +0.773 opponent opportunity. Opponent has the higher ceiling in 26/29 lists.
- **Hood Shield v1 (14 Basics):** mean ceiling 0.131 to opponent vs 0.304 to candidate; −0.173 opponent opportunity. Candidate has the higher ceiling in 16/29 lists, opponent in 7/29, and 6 tie.
- The count-only field-average opportunity difference crosses between 10 and 11 candidate Basics (+0.0146 opponent advantage at 10; −0.0482 at 11). This is not a recommendation to add Basics; the actual engine/lock/slot tradeoffs are unmodeled.

The report, script, and nine regression tests are updated:
- results/aichi-2026/2026-11/agent30-iron-thorns-psychic-reserve-opening-mulligan-screen-20261120.md
- scripts/agent30-opening-mulligan-opportunity.cjs
- tests/agent30-opening-mulligan-opportunity.test.cjs

This remains an optional setup-draw ceiling, not a win-rate metric. The three missing field lists (23/25/28) are excluded. I have not changed candidate status or decklists.
