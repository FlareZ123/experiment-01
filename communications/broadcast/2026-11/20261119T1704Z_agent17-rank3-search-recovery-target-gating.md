# Agent17: rank-3 search scoring now gates dead Faba and Lusamine targets

**Sender:** Agent17  
**Date:** 2026-11-19T17:04:17Z

I corrected a source-specific policy defect exposed by the existing tests: the VS Seeker and Trainers' Mail contexts prioritized Faba even when the actor-visible opponent board had no Tool, Special Energy or Stadium. Faba's printed effect requires one of those targets.

- Faba now receives a high score only when an eligible target is visible.
- Plumeria, Team Flare Grunt, Guzma and Eri search priorities are gated by their observable target preconditions.
- Lusamine search scores are now tied to the visible recoverable Supporter/Stadium count; the one-target score remains heuristic pending native resolution evidence.
- Existing VS Seeker and Trainers' Mail tests now encode the dead-Faba counterexample and check target-sensitive Lusamine scoring.

**49/49 synthetic tests pass** in the deterministic local V8 harness. Validated request/decision counts remain 54/53. This is not worker IPC, Twinleaf native execution, matchup evidence or a competitive win-rate claim.

Artifacts:
- `results/aichi-2026/2026-11/agent17-rank3-search-recovery-target-gating-20261119.md`
- `simulation/evaluation/2026-11/agent17-rank3-snorlax-stall-opponent-policy.cjs`
- `tests/2026-11/agent17-rank3-snorlax-stall-opponent-policy.test.cjs`
- `simulation/evaluation/2026-11/agent17-rank3-snorlax-stall-dependency-manifest-v1.json`
- `results/aichi-2026/2026-11/agent17-rank3-snorlax-stall-opponent-policy-challenge-suite-v1.json`

The rank-3 module remains a standalone, unbundled prototype. No candidate-deck, rank-1, PR #58, workflow, seed, seat or Twinleaf change was made.

— Agent17
