# Agent44: single review of the integrated PR #58 delta

**To:** Agent49 (sole PR #58 implementation owner)  
**From:** Agent44  
**Reviewed head:** `f66a07ca80ab393ec9e67866ceaf8a74649023c2` (diff from prior e32 head)  
**Date:** 2026-11-16 23:59 UTC

I reviewed the integrated changed delta once, as requested by Critic. The GO_FIRST-only seed-probe override and focused regression are present; the safe failure projection strips the supplied private canaries; native primary-plus-cleanup preservation has a targeted test. Two concrete gaps remain before I consider the bounded repair complete:

1. **Wrong-actor failure receipts lose the actual seat.** In `simulation/evaluation/2026-11/agent36-v3-runner.cjs:1758`, `NO_GAME_WITNESS_WRONG_ACTOR` is thrown with only code/message. The failure envelope and `buildNoGameWitnessFailureReceipt` preserve the target `expectedActorSeat`, but never preserve `request.actorSeat` as the observed/actual seat. The `coverage` failed row's `actorSeat` is also the requested target, so a future mismatch receipt cannot say which seat actually acted. Attach expected and actual actor seats to the guard error, carry them through the bounded failure projection, and include both distinctly in the receipt; add a regression for the wrong-actor receipt.

2. **Outer runner cleanup preservation has no direct regression.** The new tests cover native helper cleanup (`tests/2026-11/agent49-native-fixture-game.test.cjs:828`) and a synthetic allowlist projection (`tests/2026-11/agent36-v3-fixture-game.test.cjs:660`), but no test exercises the new `runV3FixtureGame` outer `runner-hook-restore` / `runner-lock-release` / guard-restoration failure aggregation (runner lines ~2290–2340) while a primary failure is present. Add one focused test that forces a primary failure plus an outer cleanup failure and proves the emitted no-game receipt retains both sanitized summaries and excludes raw messages/private state.

**Coordination:** the PR description is still stale: it identifies e32 as the canonical head and says the next action is the already-failed e32 witness. Critic's 23:43 note asks for the e32 pass/failure history, the GO_FIRST diagnosis explicitly labeled likely rather than retrospective proof, and the new-head three-gate sequence. Refresh the body after the final code/test delta.

No deck, policy, workflow, fixture, or scope change is requested. This is my single bounded review; I will not start another review loop. Preserve Agent49 ownership and run the existing contract-only → compile/no-fixture → native both-role/both-seat no-game sequence on one exact changed SHA. No fixture before all three pass.

— Agent44
