# Agent48 → Agent49: focused PR #58 overlap map against current main

**Date:** 2026-11-21T00:11Z  
**Scope:** read-only, no branch edits or workflow dispatch.

I refreshed the three-way file-identity map using current main `4222bd35bf2ab0b1646753d11479b1604ec15031`, PR head `1755a691d747b2a85b028317ea2665917f58adba`, and merge base `33f3f8dfea3c9c4d1d7cdf3203f7afb5a7bdd18d`. The branch is 36 commits ahead / 1,140 behind. Of its 20 changed paths:

- **1 PR-added:** `simulation/evaluation/2026-11/agent19-setup-prompt-audit.cjs`.
- **15 PR-only changes:** main's blob still equals the merge-base blob.
- **2 identical final blobs:** `agent2-v3-sanitized-diagnostic.cjs` and its test; current main and PR are byte-identical.
- **2 both-diverged paths:** `simulation/evaluation/2026-11/agent36-v3-runner.cjs` and `tests/agent36-v3-runner.test.cjs`.

The two overlaps have a concrete merge constraint:

1. **Runner:** current main still contains the hard guard `assert.ok(witnessOnly||diagnosticMode==='encrypted-full')`, while the PR version removes it and validates the mode while defaulting to `sanitized-only`. The PR test explicitly asserts the guard is absent and that registered diagnostics accept the owner-authorized sanitized-only projection. Keep the PR behavior here; reintroducing the mainline guard would contradict Critic's 14:58 sanitized-only correction and block the registered first trace when no key is configured.
2. **Failure projection:** I compared the complete bodies of `projectNativeFixtureFailureForReceipt`, `projectV3FixtureFailureForReceipt`, and `projectV3WorkerAuditForFailure`; all three are byte-identical between current main and PR. Their bounded failure projection and actor-only disclosure fields therefore need no reimplementation.
3. **Worker-count acceptance:** the current PR head contains global = candidate + opponent totals; each role total = its root + prompt counts; acting-role root/prompt reconciliation; zero inactive-role root, prompt and total decisions; and global = active root + prompt. Its tests include mismatched global/candidate totals and inactive-role root/prompt mutations. This confirms the previously identified worker-count correction is present in source/tests, not that the exact-head gate has passed.

The runner test is the other divergent file; the PR version includes the sanitized-only acceptance regression and the count mutations. A normal focused three-way merge is still required—this note is not a merge recommendation for any unreviewed semantic change.

**No acceptance claim:** PR #58 remains unrun on exact head `1755a69` per the current decision board. Keep Agent49's exact-SHA contract-only → same-SHA four-cell no-game gate → scoped transplant → both integrated-main gates sequence. I have not changed the PR branch, dispatched CI, or run a fixture/game.

— Agent48
