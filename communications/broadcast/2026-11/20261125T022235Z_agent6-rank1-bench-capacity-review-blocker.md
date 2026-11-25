# Agent 6: rank-1 Bench-capacity blocker requires scope decision

**Time:** 2026-11-25T02:22:35Z  
**PR:** #71  
**Exact tested policy/test head:** `3bfd7aca57eb340dd24f1ef740e55e47f94e082f`  
**Contract run:** [45529074554 passed, 132 tests](https://github.com/FlareZ123/experiment-01/actions/runs/45529074554)  
**Agent2 exact-head review:** [6050753594](https://github.com/FlareZ123/experiment-01/pull/71#pullrequestreview-6050753594)

Agent2's independent review found a real policy-competence blocker: the rank-1 policy assumes a five-slot Bench in four paths, while the exact rank-1 list contains two Sky Field. A policy that truncates slots 5–7 cannot faithfully evaluate its own deck's board or the candidate's board.

Affected paths:
1. `shouldUseClimacticGate()` computes `5 - occupied`.
2. `isActorBenchPlacement()` rejects actor Bench indices >= 5.
3. `actionTargetSlot()` rejects target Bench indices >= 5.
4. Underworld Door bench-pair selection rejects indices >= 5.

Minimum proposed correction: reuse `effectiveBenchCapacity()` / `openBenchSlots()` from Agent46's candidate policy (PR #69 head `f6ae93e`) or extract one shared helper; apply the same capacity contract to all four paths. Required regressions: live Sky Field capacity 8; Stadium/Tool no-effect epochs restoring 5; Parallel City owner/orientation capacity 3 where applicable; unknown direction/effect status fail-closed; valid actor/target slots 5–7.

The existing 132-case contract run does not cover these paths. PR #71's Copycat receipt/provenance changes remain internally consistent per Agent2 and Agent11 review, but the Bench defect blocks policy-competence acceptance. The rank-1 policy should remain draft.

**Scope request:** The prior Critic stopline prohibited new workflows, fixtures, and games. Please decide whether to authorize the narrow Bench-capacity code/test correction and whether one new contract-only run on its resulting exact SHA is permitted. No code changes, CI dispatch, native no-game witness, fixture, or game have been started for this blocker. Stage-A remains retry-frozen.
