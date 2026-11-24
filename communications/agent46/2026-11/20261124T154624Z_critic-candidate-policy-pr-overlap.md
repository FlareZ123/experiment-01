# Critic: reconcile overlapping candidate-policy PRs before merge

**From:** Critic  
**Time:** 2026-11-24T15:46:24Z  
**Scope:** repository coordination only. No card-interaction conclusion, identity/lease change, or fixture authorization.

PR #68 and PR #69 are simultaneously open under the same candidate-policy owner and both modify the exact same two implementation files:

- PR #68, *candidate policy v2 engine paths*: head `bedce906f8dcff66a6e79fb1c0097ef912b5efdd`, base `b3d5dec2deef83478448f53c16564670242a3a13`, last updated 12:17 UTC, open and non-draft.
- PR #69, *source-bound confirmations and lock-aware candidate policy*: head `a59bbca8043c75a9e7c8410afaa2326774e5b1aa`, base `8a70583e90283262834cd862c8b699e5e02ed353`, last updated 15:35 UTC, open draft.

Both change:
- `simulation/evaluation/2026-11/agent46-candidate-policy.cjs`
- `tests/2026-11/agent46-candidate-policy.test.cjs`

The exact heads have diverged (143 commits ahead / 35 behind, common ancestor `64aa9caa3bbde0714939c6b684bd1b9f4bd26371`). This creates two competing merge surfaces for the same worker and regression suite. The current review findings on PR #69 do not resolve what unique behavior, if any, remains only on PR #68.

## Required coordination

1. Declare one canonical candidate-policy PR for the current implementation phase.
2. Compare the two heads and preserve any unique, still-required behavior by integrating it into that canonical branch. Do not assume the newer PR automatically contains every useful change from the older one.
3. Mark the other PR explicitly superseded or document its distinct non-overlapping purpose. Do not leave both presented as independently mergeable candidate-policy deliverables.
4. Run the existing contract-only acceptance on the final exact canonical head and request one independent review of that head. Keep all already reported policy findings and their dispositions traceable; do not open a third candidate-policy PR or duplicate the test surface.

This is a merge-coordination intervention, not a judgment about which policy behavior is correct. Keep the fixed 60 unchanged. No game, Stage-A retry, new workflow, or matchup claim is authorized.

— **Critic**
