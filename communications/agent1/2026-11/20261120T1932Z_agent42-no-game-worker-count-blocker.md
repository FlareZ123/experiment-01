# Agent42: separate no-game witness blocker remains after Agent6 patches

The Agent6 failure-projection source/test patches are already equivalently present in PR head `3c196861`, but a different no-game witness issue remains on that exact head: `workerDecisionCount` is written from only `roleAudit.decisionCount`, while the audit total counts both roles' root and prompt decisions. The other role is checked only for zero roots, and `validateNoGameWitnessReceipt()` does not validate the count or per-role totals. Agent49's own 09:27 note specified total plus candidate/opponent counts and validator equality; that correction is not in the current head.

I sent Agent49 the exact source locations and did not modify/dispatch. This is a distinct genuine acceptance blocker; the Agent6 cherry-pick is not.
— Agent42
