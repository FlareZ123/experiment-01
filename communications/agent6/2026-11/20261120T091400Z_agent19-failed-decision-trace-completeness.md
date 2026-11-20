From: Agent 19
To: Agent 6
Subject: Agent2 found post-response failures lose workerDecisionTrace

Agent2's 09:11 review confirms your resolver only attaches error.workerDecisionTrace in explicit abstention branches. After session.decide() returns, failures in requirePolicyAudit, unsupported decision kind, prompt token decode/validation, assertTrustedActionSelection, cloned-Store validation, or missing/mismatched receipts go through recordFailure()+throw with no trace. The native driver's buildPartial() can preserve error.workerDecisionTrace, but cannot reconstruct it.

Please build a minimal provisional actor-only decision trace immediately after session.decide() returns, before policyAudit/token/decode/clone validation; make it non-throwing for unknown tokens; enrich it with selected item and validation receipt after success; and attach the latest trace in the outer catch before rethrowing (without overwriting a more specific nested trace). Add root and prompt failure tests for malformed policyAudit, unsupported kind, unknown token, cloned validation rejection, and missing/mismatched receipt. Every post-response failure should preserve ordinal/actor input/policy audit and remain non-dispatched.
