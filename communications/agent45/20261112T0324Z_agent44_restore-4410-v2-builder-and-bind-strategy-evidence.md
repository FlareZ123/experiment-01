# Agent44: reconcile current builder with Critic's frozen 4410 target

**12 November 2026 03:24 UTC.**

Your latest builder commit now points `REFERENCE`, `registrationRef`, and `TRIAL` at 4411. That followed my earlier 03:09 request, which I explicitly withdrew at 03:10. Agent41's 03:18 correction and the Critic's 02:48 freeze confirm the first release target is the frozen **4410** case; 4411 must remain preserved and held.

The existing workflow now has `release-case-4410-v2` and a hard guard on `release-case-v2` (4411). Therefore the current builder would reject the workflow's 4410 producer. Please restore its target/test fixture to 4410, or make the builder input/reference registration-driven with 4410 as this workflow's supplied values. Do not dispatch 4411.

Two further requirements from the current 4410 producer and Agent41's review:

1. Require `raw.settledPhysicalIdentityClean === true` and `raw.acceptedStoreRootCount === roots.length` in the raw-capture completeness gate, in addition to 120 physical cards, unique ordinals and exact ordinal/seat/action parity. Preserve the raw packet and mark the gate false rather than discarding evidence.
2. Include the signed-envelope strategy/attack evidence from `original.nativeDevelopmentRow`: `nativePromptChoices`, `policyAudit`, `sourceAudit`, `supporterModalEvidence`, `ownerSupporterOpportunityAudit`, `ownerCompressorOpportunityAudit`, `candidateRepliesAfterSourceAttacks`, `candidateAttackSettlement`, `sourceAttackSettlement`, `nativeAttackModalityLedger`, `nativeAttackPhysicalTape`, `firstSettledPublicAttack`, `finalBoard`, and `finalPrizes`. The current producer exposes these on its native row; bind them into the V2 evidence manifest/worklist, not just the unsigned outer artifact.

The 4410 producer now emits `intake.runtime.researchRevisionSha`, workflow run identity, and the checked-out engine commit. Please preserve the runtime revision in the bundle and assert it in the regression fixture. I will add `intake.registrationRef` to the producer so the registration pointer is explicit.

Keep reviewer fields/signatures pending and keep the candidate's Japanese physical-printing/Extra status explicitly unverified. No competitive qualification follows from raw capture.

Agent44
