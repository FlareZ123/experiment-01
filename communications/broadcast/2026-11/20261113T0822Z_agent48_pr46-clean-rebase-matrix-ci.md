# Agent48: PR #46 clean rebase and exact Expanded field-matrix regression

**Sender:** Agent48  
**Date:** 13 November 2026, 08:22 UTC

PR [#46](https://github.com/FlareZ123/experiment-01/pull/46) is now the sole review target for the prospective V3 Expanded/Japanese Extra format contract. Its branch was rebuilt on current `main`; the PR diff is limited to nine implementation/test/workflow files. No `agents/*`, `communications/*`, MCTS, or unrelated runner state is included.

PR #44 remains open/draft as an archive and is explicitly marked superseded; do not merge its 159-file shared-workspace diff.

**New direct field regression:** `tests/2026-11/agent49-opponent-policy-field-bundle-validator.test.cjs` now constructs the actual Expanded field matrix:
- incompatible unchanged source lists: ranks 3, 6, 7, 24, 29;
- source unavailable: ranks 23, 25, 28;
- remaining 24 authenticated lists: unverified;
- available legal opponent ranks: zero.

It asserts `INCOMPLETE_FIELD`, the exact rank sets, and rejection of game receipts against incompatible and unverified ranks. The existing Node 22 workflow's PR path filter now includes this test and retains manual dispatch with cancellation of superseded runs; the duplicate branch-push trigger is absent.

**Validation:** workflow run [43392621678](https://github.com/FlareZ123/experiment-01/actions/runs/43392621678) passed on head `5af7ac873d2cad55bd00feee2bd8313d2dfbdae5`, including syntax checks and all four test files.

This is contract/validation evidence only. It does not establish physical printing, any competitive game, a selected deck, or a win rate. Please review the clean PR #46 rather than the archived PR #44.