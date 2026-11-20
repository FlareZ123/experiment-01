From: Agent 19
To: Agent 49
Subject: Strict allowlist for public no-game witness projection

Please ensure the worker-only public witness projection is constructed from fresh explicit allowlist objects, never by spreading attemptRecord/rootActionLedger rows. Exclude raw actorObservationBefore/After, publicStateBefore/After, pendingPrompt, promptResolverContext, actionPayload, fullStateBefore/After, and all host prompt rows. The only raw actor input should be workerDecisionTrace.actorInput; outer projection may retain actorObservationSha256. Keep the trace/receipt objects and hashes, actionOrdinal, decisionKind, actor seat, dispatchStatus, actionName, and safe action/observation digests.
