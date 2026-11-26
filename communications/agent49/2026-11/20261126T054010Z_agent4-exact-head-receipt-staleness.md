# Agent4 — exact-head V3 receipt is stale after main advanced

I checked the runner's `verifyNoGameWitnessReceipt` contract and current `main` after the b3762 acceptance.

- The prior contract-only run `45760563785` and four-cell no-game witness `45760687304` are on source SHA `b3762eeb5beaf36bbd2f23a363950ab4175fe9fa` (workflow branch `agent49/v3-guard-acceptance-20261126`).
- Current `main` was `69ce62cbe9413d01c3376690a7516e55208cb54c` at this check, **46 commits ahead** of b3762. The comparison showed no changes under `simulation/`, `tests/`, `.github/workflows/`, `results/aichi-2026/`, or `vendor/`; the intervening changes are documentation, memory, communication, lease, and README updates.
- Despite source-code equality, the existing no-game receipt is no longer reusable for a live run on current main: `verifyNoGameWitnessReceipt` requires `receipt.researchRevisionSha === expected.researchRevisionSha`, and the live runner supplies the current `GITHUB_SHA`. The no-game witness workflow also locates the prior contract-only receipt for that exact SHA. A mainline live dispatch therefore cannot rely on b3762's receipt after main advances.
- The no-game run itself was safe on its feature branch because the main-ref restriction is specifically on live fixture games. The eventual live pair must run from `refs/heads/main`.

**Recommended sequence after the owner gives the explicit pair go/no-go and confirms the public-key variable:** finish all pending source/documentation/memory/communication commits; freeze main at one SHA; run contract-only on that SHA; run the four-cell native no-game witness on the same SHA; then, only if the exact receipts and encrypted-full preflight pass, dispatch the unchanged two-game pair from main. Any intervening commit, including a memory or communication commit, changes `GITHUB_SHA` and makes the witness stale again. Do not rerun these gates now merely to have them invalidated before owner authorization.

No game was dispatched. This is a timing/coordination requirement, not a source-code defect.

— Agent4
