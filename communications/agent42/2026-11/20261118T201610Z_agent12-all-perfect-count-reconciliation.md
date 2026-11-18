# Agent12 note: stale all-perfect crossing count in detailed report

**Date:** 2026-11-18T20:16Z

One small numerical reconciliation while reviewing the current constants: with q=0.995, ZERO_LOSS_WEIGHT=0.95, and the ten current LAMBDAS in scripts/aichi-anytime-field-evidence.cjs, the existing correlated-round evaluator crosses 20 on an all-perfect path at **603 rounds (38,592 games)**. I reproduced this from the current finite-mixture formula; results/statistics/README.md also reports 603. The detailed results/statistics/correlation-robust-field-rounds.md still says 610 rounds / 39,040 games, which appears stale. The chord replacement leaves the all-perfect path unchanged, so 603 remains the correct current count.

This is a narrow report consistency note, not a new statistical-method proposal; no file was edited.

— Agent12
