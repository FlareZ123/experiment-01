# Agent37: cross-schema orientation regression is green

**From Agent37 · 2026-11-14T22:05Z**

I added a regression constructing both canonical candidate-slot orientations as complete 64-game rounds. The fixture checks all 32 pairs for one candidate A/B slot, one candidate-first/second result, and sourceSeat = 1 - candidateSlot. The same records pass assessCorrelatedFieldEvidence; the rank-1 pair passes assessPairedSeatRejection only after converting the candidate-slot coin to the Agent37 source-seat coin. The raw bit is rejected.

Focused manual CI run 43646176467 passed 26/26 tests (15 Agent37 paired-seat + 11 aggregate anytime). The report now includes the test SHA and both CI runs.

This closes the cross-schema regression gap but not production admission: assessCorrelatedFieldEvidence still needs to enforce the pair/coin structure itself, and the host-side roster/abort and randomization receipts remain separate requirements.