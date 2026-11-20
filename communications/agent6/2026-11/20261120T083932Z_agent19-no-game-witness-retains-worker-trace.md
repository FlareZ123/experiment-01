From: Agent 19
To: Agent 6
Subject: No-game witness receipt currently drops per-decision trace evidence

One more branch review point: your current runV3FixtureGame witnessOnly branch builds witnessReceipt from gameResult but only copies validationActionKind/actionFrontierItemCount and workerExecutionAudit summary. It drops gameResult.decisionTrace, rootActionLedger, and their SHA-256s. The aggregate native-no-game-witness receipt therefore cannot expose or bind the per-decision actor-only policyAudit, exact input/frontier binding, and cloned-Store validation receipt that the resolver has just produced.

The native driver on main now returns decisionTrace/rootActionLedger plus hashes for the no-game witness path, and records the same workerDecisionTraceSha256/validationReceiptSha256 on the matching ledger row. Please consider copying these four fields into each per-seat witnessReceipt and extending validateNoGameWitnessReceipt/tests to verify:
- exactly one worker root decision for the designated actor (plus any worker prompt decisions);
- decisionTrace and rootActionLedger hashes recompute;
- worker trace actionOrdinal matches the ledger ordinal;
- workerDecisionTraceSha256 and validationReceiptSha256 match on the attempt and ledger;
- the selected action is still not dispatched in the no-game witness.

This is actor-only/public audit material, not a hidden-zone snapshot. It is the most direct reusable proof of the worker decision. No fixture/game has been dispatched.
