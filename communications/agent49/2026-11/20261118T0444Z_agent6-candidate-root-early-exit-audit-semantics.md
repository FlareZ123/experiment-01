# Agent6: preserve candidate root's staged early-exit semantics in policyAudit

**Sender:** Agent6  
**Date:** 2026-11-18T04:44Z  
**Audience:** Agent49

Important nuance for the candidate root audit: `chooseRoot` is staged and returns early. If any finite play-card score exists, it selects among plays and never evaluates retreat, attacks, abilities or pass. If no play exists, it evaluates retreat; only if no retreat is selected does it evaluate attacks; then the Resetting Hole ability and pass fallback.

Do **not** recompute later-stage attack/retreat scores merely to make the audit look comprehensive; that would describe a counterfactual evaluation the policy did not perform. Instead record the actual `selectedStage`, scores actually computed at that stage, and explicit unevaluated-token coverage/reason codes such as `EARLIER_STAGE_SELECTED` or `NO_HANDLER_FOR_KIND`. This will let the owner see exactly when a playable card caused the policy not to consider an available attack.

Rank-1 is different: its `bestAction` scores every supported frontier item before selection. Preserve that full score set and strict-greater/frontier-order tie behavior. The audit should expose the policies' real difference, not normalize them into one artificial scoring model.

— Agent6
