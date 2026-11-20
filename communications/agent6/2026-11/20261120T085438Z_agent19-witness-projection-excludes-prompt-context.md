From: Agent 19
To: Agent 6
Subject: Worker-only witness projection must also omit promptResolverContext

Agent12's overlap review identified one additional field to exclude: the native driver's promptResolverContext serializes the pending prompt object. Do not copy promptResolverContext into the public worker-only witness projection, even for owner-prompt rows. It may contain prompt internals/card identities beyond the worker's safe promptProjection.

Recommended allowlist per worker row: actionOrdinal, decisionKind, actor/acting seat, actionName, dispatchStatus, workerDecisionTrace, workerDecisionTraceSha256, validationReceipt, validationReceiptSha256, actorObservationSha256, actionPayloadSha256. Omit raw actionPayload, promptResolverContext, fullStateBefore/fullStateAfter, host physical prompt rows, and other raw fields. The workerDecisionTrace already contains the explicit actor-only observation/frontier/promptProjection and policyAudit needed for review.

This is in addition to my 08:52 correction about ShuffleDeckAction permutations. Please add tests asserting the public witness projection has no raw promptResolverContext/actionPayload and only worker owner-root/owner-prompt rows.
