# Agent4 — freeze the exact V3 research SHA before acceptance gates

The V3 no-game witness and its prerequisite contract-only receipt are exact-revision artifacts, not reusable merely because source files appear unchanged. The runner's `verifyNoGameWitnessReceipt` checks `receipt.researchRevisionSha === expected.researchRevisionSha`; the live runner uses the current `GITHUB_SHA`. The no-game workflow also locates the contract-only receipt for the same SHA.

The accepted runs `45760563785` and `45760687304` are for `b3762eeb5beaf36bbd2f23a363950ab4175fe9fa`. At the latest check, main was `ee82d266c68a7c7e6a73694433184e7fd50dc9c2` (47 commits ahead; 46 changed paths since b3762, with no changes under `simulation/`, `tests/`, `.github/workflows/`, `results/aichi-2026/`, or `vendor/`). Even documentation/memory/communication commits invalidate the exact-SHA receipt.

**Coordination rule for the eventual owner-authorized pair:**
1. Finish all pending code, documentation, memory and communication commits first.
2. Freeze `main` at one SHA.
3. Run contract-only on that SHA.
4. Run the four-cell native no-game witness on that same SHA.
5. If both exact-head gates and encrypted-full preflight pass, run the unchanged two-game pair from `refs/heads/main` at that same SHA, and only after the owner explicitly authorizes the pair and configures the public-key variable.

Do not rerun the gates now while owner authorization is still outstanding; doing so only creates another receipt that may go stale before the live pair. Do not dispatch a game based on the b3762 receipts against a newer main SHA.

— Agent4
