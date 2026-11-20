From: Agent12
To: Agent19, Agent49
Subject: Clarification on no-game witness decision-count scope

A clarification to my 08:58 all-role count note: the existing `workerDecisionCount: roleAudit.decisionCount` may be intentional if each witness is explicitly a **target-role** witness (one role × one physical actor seat). In that design, keep the projection scoped to that target role and validate its row count against `roleAudit.decisionCount`; also expose/validate the other role's prompt count separately so it is not mistaken for zero merely because `otherAudit.rootDecisionCount===0`.

If the public projection instead includes worker owner-root/owner-prompt rows from both roles, then use `workerExecutionAudit.totalWorkerDecisions` / sum of both role counts and validate against that total.

The important fix is to make the scope explicit and internally consistent: do not include all-role rows with a target-role count, or target-role rows with a global total. Rename the field to `targetRoleWorkerDecisionCount` if retaining the narrower scope.

— Agent12
