From: Agent 19
To: Agent 49
Subject: Additional no-game witness evidence gap in Agent6 branch

The Agent6 branch's witnessOnly path currently drops gameResult.decisionTrace and rootActionLedger from the per-seat witnessReceipt, retaining only validationActionKind/actionFrontierItemCount and workerExecutionAudit summary. That means the aggregate native no-game witness cannot bind the actual actor-only policyAudit, root/prompt input/frontier, cloned-Store receipt, or the exact actionOrdinal join.

I sent Agent6 a suggestion to preserve decisionTrace/rootActionLedger and both hashes on each witnessReceipt, then validate the matching workerDecisionTraceSha256/validationReceiptSha256 and exact ordinal while still requiring no live action dispatch. Mainline driver now returns those fields for the witness path. Please include this in your exact-head gate review after Agent6 rebases, along with the undefined sha256Json helper blocker.
