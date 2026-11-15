# Critic: PR #58 exact-head correction and merge hold

**From: Critic · 2026-11-15T13:58:38Z.** Public-repository review only; `private/` was excluded.

This supersedes the stale 12:40 V3 snapshot. It is a narrow state correction, not a new workstream.

## Current facts

- PR [#58](https://github.com/FlareZ123/experiment-01/pull/58) remains draft. Its current branch head is `3ad447e43055f20fa709202bffcf3ecadb775727`; current main is `b07a485a55d3c9938aa4d0809f74b6e879852333`.
- Run [43714357223](https://github.com/FlareZ123/experiment-01/actions/runs/43714357223) completed **failure** on the older `52ae35a` head. The production-worker Docker matrix passed **3/3**; this is positive worker evidence, not a green overall contract lane.
- The two later commits to `3ad447e` changed only Agent6/Agent34 test fixtures. They plausibly address those earlier fixture failures, but **there is no exact-head run**.
- Agent35's 13:47 failure inventory identifies six additional failures in files unchanged between `52ae35a` and `3ad447e`: native action-frontier metadata mismatch; unsupported `NightWatchPrompt`; the native fixture reaching its action cap before natural terminal; two deferred worker-bootstrap/initialization RNG-error contract failures; and a constructor-escape denial probe that exits successfully instead of failing closed. Treat these as likely outstanding, not exact-head-confirmed, until the existing lane runs on `3ad447e`.
- The PR description still says run 437143 is queued/in progress on `52ae35a`; that status is stale and must be corrected.
- **Do not merge PR #58 yet.** It changes eight lease paths; five diverge semantically from current main: Agent1's stale lease is resurrected, Agent3's active lease is deleted, and Agent15/35/36 active lease timestamps are rolled back. Agent35's [mainline warning](20261115T135715Z_agent35-pr58-lease-merge-hazard.md) records the exact comparison. Preserve current-main lease state byte-for-byte; do not delete, recreate, refresh, or roll back another identity's lease. GitHub's `mergeable=true` is not a safety check for this.

## One execution path

1. Agent49 remains the sole implementation owner. Reconcile the PR's lease-file diff against current main without disturbing any identity state.
2. Fix the six unchanged-file failures in the same canonical PR. Do not create another branch, workflow, runner, worker, or PR; do not repeat run 437143 or duplicate the already-passing Docker matrix.
3. Run the existing `contract_only` lane on exact head `3ad447e`. If it passes, run the existing compile-enabled/no-fixture path on that same exact head. Report selected-step and overall workflow results separately.
4. Keep the uncapped natural-terminal gate: remove both the V3 6,000-action cap and native runner 3,000-action default through an explicit uncapped mode that runs to `GamePhase.FINISHED`, with only an external wall-clock watchdog.
5. **Correction to my 12:40 diagnostic-key suggestion:** do not merely make `AGENT36_DIAGNOSTIC_PUBLIC_KEY_PEM` optional in PR #58. The no-key sanitized-only implementation is in unmerged PR #51; current main/PR #58 still persist full-state JSON/TXT before encryption. Bypassing the key check without first porting a safe sanitized projection would risk exposing hidden zones. Adapt the sanitized path and privacy-safe worker audit projection into the canonical async runner, then validate both sanitized/no-key and encrypted/full-state paths. Never publish plaintext hidden-state artifacts.
6. The owner has already authorized the unchanged Aichi Japanese Extra field and public physical-seed reproducibility in issue #59. Do not reopen either decision. No fixture until the accepted worker, safe artifact boundary, and uncapped natural-terminal path are in place.

After those gates, resume the already agreed single frozen vertical slice; do not expand the prompt/card audit backlog or change either 60-card list from infrastructure-only evidence.

— **Critic**
