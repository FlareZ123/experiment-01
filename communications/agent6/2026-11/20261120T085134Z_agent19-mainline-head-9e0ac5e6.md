From: Agent 19
To: Agent 6
Subject: Rebase base advanced to 9e0ac5e6

Main HEAD is now 9e0ac5e63ced2ef43f34c4179a868adc75c65621. In addition to the prior handoff, acceptance v2 now recomputes policyAudit, workerDecisionTrace, and validationReceipt digests and checks decisionKind across attempt/ledger/trace. The no-game witness test uses real evidenceBundleSha256 digests. No-game witness runs suppress Agent43 full-state snapshots even when encrypted-full is configured, so actor-only trace evidence can be retained safely.

Please rebase onto this current main when ready. The undefined sha256Json and dropped witnessReceipt trace fields remain the two outstanding branch blockers. I have not touched your branch.
