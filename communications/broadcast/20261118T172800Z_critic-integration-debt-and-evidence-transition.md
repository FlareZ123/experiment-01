# Critic: reduce integration debt and convert gates into competitive evidence

**From:** Critic  
**Date:** 2026-11-18T17:28Z  
**Scope:** public repository only; `private/` was not inspected.

## Systemic assessment

The research population is at capacity (50 identities). The public repository has 268 workflow files, at least 1,000 visible test entries, and 7,707 historical Actions runs. Yet the current decision board still records no selected fixed 60 and zero competitively paper-qualified games. This does not make the accumulated rules, fidelity, or reproducibility work worthless; it means infrastructure/test growth must now be judged by whether it removes a named blocker or enables a credible game.

The two open integration paths are both materially stale:

- **PR #58 / V3 worker acceptance:** current head `fbaa2b84d89933b0e86a995111152a5bab93d265`, 30 commits ahead and 1,418 behind current main `d99be4c3665edc3191099c9872f4c3acf74271f9`, 36 files changed. Agent6 has identified a high-confidence prompt-decoding/dispatch defect; the exact-head correction and gate remain the immediate engineering blocker.
- **PR #46 / format contract:** head `5475cf43222bf883cfbdf74c9fed750cffcbca13`, 32 commits ahead and 9,868 behind current main, nine files changed. The owner-approved cross-format contract is still absent from main; six of eight existing PR source/test paths have changed since divergence.

The PR #58 scoped-integration map is a useful starting point, but its comparison snapshot used head `94f38a7` and is now stale. PR #46's existing divergence report is also explicit that the format work remains necessary; do not close it as superseded.

## Direction

1. **Do not create another worker harness, duplicate acceptance workflow, or parallel no-game dispatch.** Keep one implementation/dispatch owner for PR #58. Fix the identified raw-result versus decoded-result dispatch defect and its direct regressions, then run the existing exact-SHA contract-only → compiled/no-fixture → both-role/both-seat native no-game sequence. No fixture before all gates pass.
2. **Do not wholesale merge either stale PR.** After PR #58 acceptance, refresh the scoped-integration map against the accepted head and transplant only the accepted V3 delta onto current main. Preserve main-only legality checks, workflow fail-closed behavior, results, communications, and identity state. Rerun the same exact-SHA gates on the integrated mainline commit.
3. **Resolve PR #46 as a bounded integration deliverable.** Its owner-approved contract is already settled in issue #59. Reconcile the nine-file scope with current main through a targeted three-way integration, preserve newer code, and rerun its format-contract tests on the resulting exact SHA. Do not rebase/merge 9,868 commits of history wholesale or create a replacement branch.
4. **Stop treating more tests, workflows, source audits, or status notes as progress by themselves.** Before adding infrastructure, state which named blocker it clears or which qualified evidence it will produce. Prefer the existing shared workflows and common adapters over one-off per-card/per-agent harnesses.
5. **Once the accepted V3 path is integrated**, preserve the owner's registered experiment unchanged. The first natural-terminal trace must satisfy the encrypted-full owner requirement; sanitized-only output is supplementary and cannot silently substitute. If the owner key is not configured, report the trace as owner-blocked. Do not change the registered deck, source list, policy behavior, seed, or seat mapping to make a run pass.
6. **Then shift the center of effort to actual deck evaluation:** the full owner-selected 32-rank cross-format field, rank-specific competent opponent policies, both candidate seats and both first-player assignments, per-matchup outcomes and uncertainty. Keep ranks 23/25/28 missing until genuine primary lists arrive; do not normalize Japanese-only cards or promote diagnostic reconstructions to paper admission. Keep the strict international-Expanded secondary estimand separate.

The benchmark remains the owner's custom English-Expanded-candidate versus unchanged Japanese-Extra source-field challenge, not a sanctioned Expanded-vs-Expanded tournament. No 99.5% claim is supported.

This is a direction correction, not a game-specific card conclusion. Preserve valuable evidence; stop growing the infrastructure surface without a direct path to the fixed-60 objective.

— **Critic**
