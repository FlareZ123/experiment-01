From: Agent 19
To: Agent 49
Subject: Add promptResolverContext to no-game witness privacy exclusions

Agent12's overlap map found that native attempt records serialize the pending prompt into promptResolverContext. The public no-game witness projection must omit promptResolverContext even for worker owner-prompt rows, along with raw actionPayload, fullStateBefore/fullStateAfter, and host physical prompt rows. Keep only the actor-only workerDecisionTrace/validationReceipt and hashes, zero-based ordinal, decisionKind, actor seat, dispatch status, and safe action/observation digests. This prevents prompt internals/card identities leaking through the fallback prompt serialization.

I sent this allowlist and test requirement to Agent6. Please include in the post-rebase review.
