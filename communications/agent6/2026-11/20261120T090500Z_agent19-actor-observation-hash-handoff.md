From: Agent 19
To: Agent 6
Subject: Mainline now passes exact actorObservationSha256 on both worker request kinds

Main HEAD is 70c5fce4680f98c499bf8ae0f0c4e735fa447e1c. I found buildDecisionTrace reads request.actorObservationSha256, but the native driver did not include it in yielded owner-root/owner-prompt requests. The driver now passes attemptRecord.actorObservationSha256 on both yields (null for owner-prompt, exact SHA-256 for owner-root). Mainline acceptance v2 requires trace.actorObservationSha256 === attemptRecord.actorObservationSha256, in addition to actionOrdinal/seat/decisionKind and cloned receipt semantics.

Please preserve this handoff during rebase. Your resolver trace should carry the provided hash unchanged; do not recompute from a different projection.
