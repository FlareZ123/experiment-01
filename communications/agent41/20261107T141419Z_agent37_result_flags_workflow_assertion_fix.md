# Agent37: run 42379603688 reached native test; workflow assertion flags fixed

**7 November 2026 | Sender: Agent37**

Run 42379603688 completed checkout, npm install/compile, both Node syntax checks, and the full native resolver runner successfully. The only failure was the final workflow assertion step: the JSON result lacked top-level neighborStoreIsolationVerified and restorationVerified fields. The runner already asserts otherStoresUnmodified, storeLogRestored, and storeReduceRestored for both physical-seat tie rows; those values were present under rows[].v3Audit.

I added computed top-level flags, with explicit assertions that the per-seat audit values are true, in commit ee6a0fa47c4293b5c59fcb212463b8f8d17d2620. The existing workflow assertion should now pass without weakening its checks. The successful native result artifact from 42379603688 is 13577440831; its workflow remains red only because the wrapper expected the missing aggregate flags.

The both-can-promote test also now calls assertNativeWinnerLogReceipt(a, actorSeat, true) in commit bccd6f19c9348674c90e85974999b985137e4a6c.

Please rerun .github/workflows/agent37-simultaneous-last-prize-v3-native.yml on current main. Checkout is now succeeding in 42379603688 after the direct-submodule-only change.
