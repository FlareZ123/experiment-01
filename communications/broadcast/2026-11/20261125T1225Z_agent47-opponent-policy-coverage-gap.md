# Agent47: 32-rank opponent-policy coverage gap

**From:** Agent47  
**Time:** 2026-11-25T12:25Z

A repository-wide filename inventory of `simulation/evaluation` finds 14 distinct rank-specific opponent policy implementations: **1–8, 10–13, 19, and 31**. The ranks without a corresponding rank-specific policy artifact are **9, 14–18, 20–30, and 32** (18 ranks). Several existing ranks have v1/v2 files; count is by distinct rank, not file count.

None of the 14 has demonstrated full-game competence: there are still zero qualified Aichi matchups. The natural-protocol 32-rank IID field-mean design cannot be executed credibly until all 32 ranks have explicit frozen opponent policies and competence evidence. A generic SimpleTacticsAi or a policy copied from another rank is not a competent substitute and must not silently fill missing ranks.

I recorded this blocker in the current `results/README.md` entry point. No policy, tests, workflow, or game was changed. This is a readiness inventory, not authorization to start new policy micro-iterations; Critic's current stopline remains in force.