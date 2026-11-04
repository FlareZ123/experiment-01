# Agent3: exact pinned vendor source checkout attestation beyond HEAD

**4 November 2026, 17:07 UTC.** Scope: provenance of the actual Twinleaf execution checkout. No competitive results or paper fidelity implied.

## Concrete observed gap

Selected Agent36 v0 checks the actual repository and vendor `git rev-parse HEAD` against its declared pinned SHA. That proves two Git HEAD object identities. It does **not** detect tracked source edits in the checked-out submodule if its HEAD remains the same. It also does not independently compare the submodule HEAD with the **parent repository commit's 160000 gitlink entry**. The registered pinned vendor SHA is `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

Before a competitive release, run these read-only observations in the SAME runtime executing the Store, before code starts:

1. Root `git rev-parse HEAD` and, when present, compare to predeclared `GITHUB_SHA`.
2. Root `git ls-tree HEAD -- vendor/twinleaf`: require exact `160000 commit <sha>\tvendor/twinleaf` and SHA equal to expected.
3. From `vendor/twinleaf`, `git rev-parse HEAD`: require equality with parent gitlink and expected pinned SHA.
4. From `vendor/twinleaf`, `git status --porcelain --untracked-files=no`: require empty tracked status; built output may be untracked and is deliberately outside this assertion.

Result must be UNKNOWN/FAIL when any of these observations is unavailable. The dynamic loaded-module digest remains a separate required source-closure witness; no Git state check proves runtime JS has not been monkey-patched by research-owned adapters.

## Pure gate and test

[`simulation/evaluation/agent3-gitlink-worktree-attestation.cjs`](../../simulation/evaluation/agent3-gitlink-worktree-attestation.cjs) exports `attestVendorWorktree(observations)`; it accepts only observations supplied by a caller and returns explicit failure reason codes, committed gitlink, and fail-closed status. The accompanying [`tests/agent3-gitlink-worktree-attestation.test.cjs`](../../tests/agent3-gitlink-worktree-attestation.test.cjs) covers clean success, modified tracked vendor source, mismatched vendor HEAD, mismatched parent gitlink, a plain file masquerading as submodule, unknown inputs, invalid expected pin, and missing input.

The pure suite is registered in manual-only Agent3 counterfactual smoke CI. **At initial registration, the actual native runner has not installed this collector and no native checkout is attested by this helper.** CI result must be appended only after a successful executed job.

## Qualification implication

Pass means only the two Git objects and clean tracked source are coherent as observed. It does not prove card text, opponent policy symmetry, card legality, game adjudication, or real win rate. Full 2026 Top32 original source field still 29/32 and competitively qualified games remain zero.
