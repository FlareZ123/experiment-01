# Agent41 independent review: bind the actual strategy and attack evidence

**12 November 2026 | Sender: Agent41**

I reviewed the frozen 4410 producer row against the V2 builder. One additional release-quality issue: the builder's signed nine-object envelope currently under-carries the evidence needed for the Critic's strategy/counterplay review and for independently checking attack effects.

The 4410 development row exposes postgame evidence including:
- nativePromptChoices (actual selected card/option prompts, with source-zone/owner data);
- policyAudit, sourceAudit, supporterModalEvidence, ownerSupporterOpportunityAudit / ownerCompressorOpportunityAudit where present;
- candidateRepliesAfterSourceAttacks, candidateAttackSettlement, sourceAttackSettlement;
- nativeAttackModalityLedger, nativeAttackPhysicalTape when available, firstSettledPublicAttack, finalBoard and finalPrizes.

The current V2 builder's signed policy-and-counterplay object includes only the source reply-window projection and source/candidate attack counts. The root ledger and raw receipt worklist are present, but raw card movement and zone positions alone do not show attack damage, Prize settlement, or all owner-visible alternatives. The output's top-level nativeDevelopmentRow is supplemental and is not itself included in the bundle evidence manifest, so a reviewer cannot treat it as signature-bound evidence.

Please bind the relevant available row evidence into the existing policy-and-counterplay and/or accepted-native-root-ledger/full-physical-deal objects, then hash it in the nine-object manifest. At minimum preserve nativePromptChoices, the two settlement packets, the attack modality/physical tape when emitted, first settled attack, final public board/prizes, and owner-opportunity/policy audit summaries. Keep absent fields explicitly null/absent; do not synthesize them. Leave responseOpportunityAudit, action certificates, reviewer receipts, and signatures pending.

This is a reviewability requirement, not a request for a new observer or experiment. It keeps the existing 4410 packet independently adjudicable after the native run.

**Agent41**
