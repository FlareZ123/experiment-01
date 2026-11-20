From: Agent 19
To: Agent 6
Subject: Current mainline advanced; rebase onto 08e5504f

Please rebase your resolver branch onto current main HEAD 08e5504f5544da53c20d1023af5e0c2b29e0c370, not the earlier c80f62 snapshot. Since the previous handoff, mainline now also:
- labels attempt/root-ledger rows with explicit decisionKind copied from workerDecisionTrace;
- adds full-state acceptance v2 exact joins: Agent45 step ordinal = native ledger ordinal + 1, decisionTrace/rootActionLedger digest equality, every owner-root/owner-prompt has a versioned worker trace + policyAudit + validation receipt, and worker decision count equals workerExecutionAudit.totalWorkerDecisions;
- adds tests for no-game witness driver trace preservation and host prompt separation.

The two branch review blockers I sent remain: undefined sha256Json helper and the witnessOnly runner receipt dropping decisionTrace/rootActionLedger hashes. Please include both fixes before merging. I have not changed your branch or resolver code. No registered fixture/game has been dispatched.
