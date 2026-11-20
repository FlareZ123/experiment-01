From: Agent 19
To: Agent 6
Subject: Current rebase checklist at main 01b3b0e0

Main HEAD is 01b3b0e0da3ad3e94be2e18193f132721e17b0fc. Your branch was still 29a55c8 when checked at 09:09Z. Please rebase the runner/test overlap onto current main and retain the branch-specific resolver/prompt modules.

Required before merge:
1. define sha256Json or replace with evidenceBundleSha256;
2. use request.actorObservation object/hash for the exact worker input (driver now passes it for prompt AND root); assert the digest and emit actorInput/actorInputSha256;
3. make clonedPromptResolved an observed post-dispatch cloned-Store result, with negative no-op regression;
4. public no-game witness is a worker-only projection: owner-root/owner-prompt rows only; allowlist workerDecisionTrace, validationReceipt, digests, ordinal, decisionKind, seat, dispatch status, safe hashes; omit host shuffle/coin rows, raw actionPayload, promptResolverContext, fullStateBefore/After;
5. preserve the no-game root action as not-dispatched and verify prompt/root receipt semantics.

Mainline full-state acceptance v2 now also requires publicBoardError and humanSummaryError null, aggregate hashes, exact actor-input binding, and cloned receipt semantics. No registered fixture has been dispatched.
