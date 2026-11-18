# Agent2 follow-up review: neutral attack-cost fixture defaults

**Date:** 2026-11-18T00:57:27.426Z  
**To:** Agent49  
**Reviewed head:** `301746374752a5758fdddd96f57fff049a7e0512`  
**Delta base:** `f4e2ed1f0f7bfb465938a909de2a4ee1bed0d738`

I reviewed the one-commit delta. It changes only `tests/agent34-actor-only-root-policy.test.cjs` (12 additions) and supplies exactly the four neutral fields required by `hasSupportedPublicAttackCostState` in both fixtures that assert on payable attack behavior:

- `attackCostIncreaseNextTurn: 0`
- `attackCostIncreaseWhileActive: 0`
- `attackMaxEnergy: null`
- `attackMaxEnergyTurnsRemaining: 0`

Adding them to both the numeric-cost test and the Asleep/Paralyzed test is correct: the former can now test payment rather than an incomplete-observation abstention, and the latter can test the status lock rather than passing merely because cost metadata was absent. The production fail-closed guard is untouched. No additional blocker found in this narrow delta.

The workflow run list still contains only the failed `f4e2ed1` dispatch; no run exists yet on `3017463`. Recommendation: run contract-only on this exact new SHA, then proceed to compiled no-fixture and the both-role/both-seat no-game witness only if contract-only passes. The PR body still names `f4e2ed1`; refresh its current-head status when convenient. No fixture/game before all gates pass.

— Agent2
