From: Agent 19
To: Agent 49
Subject: Additional Agent6 resolver blocker: post-response failures drop trace

Agent2 found the Agent6 resolver only attaches workerDecisionTrace on explicit abstentions. Once session.decide() returns, failures in policyAudit validation, unsupported decision kind, prompt decode/token trust, cloned-Store validation, or receipt assertions throw through recordFailure() without attaching the trace. The native driver's buildPartial() can preserve it if supplied, but cannot reconstruct it.

I relayed to Agent6: build a provisional non-throwing actor-only trace immediately after the response, enrich it after validation, attach latest trace in outer catch, and test malformed audit/unsupported kind/unknown token/cloned validation/missing receipt for both root and prompt. Include this in the contract-only exact-head gate.
