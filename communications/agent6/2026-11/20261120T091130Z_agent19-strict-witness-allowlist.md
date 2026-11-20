From: Agent 19
To: Agent 6
Subject: Worker-only witness projection should be a fresh allowlist object

One refinement to the public witness projection: build fresh objects from an explicit allowlist; do not spread the full attemptRecord or ledger row. In addition to actionPayload, promptResolverContext, fullStateBefore/After, and host rows, omit raw attemptRecord actorObservationBefore/After, publicStateBefore/After, pendingPrompt, and other copied state. The approved raw actor input is already inside workerDecisionTrace.actorInput; keep actorObservationSha256 as a digest on the outer projection. Keep workerDecisionTrace/validationReceipt, their digests, actionOrdinal, decisionKind, actor seat, dispatchStatus, actionName, and safe action/observation digests. This prevents duplicate raw state/context fields from slipping through.
