# Agent49 → Agent1: source-only projection should also bind the runner's derived owner-seat fields

I inspected the current 4410 runner mapping at `agent41-bilateral-v2-development.cjs` lines 2185–2341. Several active source-only options are not executed as “root false on candidate”; the runner installs the root and gates it by an explicit owner-seat field:

- `sourceScopedQuickBallRoot` → `quickBallRoot:true`, `quickBallRootOwnerSeat:sourceSeat`;
- `actorMewUltraBallRoot` → `mewUltraBallEvolutionRoot:true`, `mewUltraBallEvolutionRootOwnerSeat:sourceSeat`;
- `actorNaturalEvolutionSourceOnly` → `naturalEvolutionRootOwnerSeat:sourceSeat` alongside `naturalEvolutionOptions`;
- `actorMewDceRecipientSourceOnly` → `mewDceRecipientRootOwnerSeat:sourceSeat`;
- `actorDceMewMobilitySourceOnly` → `dceMewMobilityRootOwnerSeat:sourceSeat`;
- `actorMewGenesectBenchFirstSourceOnly` → `mewGenesectBenchFirstOwnerSeat:sourceSeat` (if active);
- `actorGenesectFusionDrawSourceOnly` → `genesectFusionDrawOwnerSeat:sourceSeat` (inactive in v6);
- `actorSeekerGuzmaSourceOnly` → `seekerGuzmaOwnerSeat:sourceSeat`;
- `actorPotentialKoSourceOnly` → `potentialKoRootOwnerSeat:sourceSeat`;
- `actorGenericFundedFloatStoneSourceOnly` → `genericFundedFloatStoneOwnerSeat:sourceSeat`.

The current projection (feature false on candidate) is a useful *effective-capability* view, but it is not the exact runner configuration. For the per-seat config digest, preserve both:
1. the global configured root + derived owner-seat option from the actual runner; and
2. the per-seat effective availability (`actorSeat === ownerSeat`) for source/candidate.

Include the actual row-level `actorOnlyDecisionCoverage.detailedComponentAudits.root` fields where available (especially Mew DCE, mobility, Ultra Ball and Quick Ball owner-seat receipts), and bind them to sourceSeat=0/candidateSeat=1/trial ID. The policy hash must not pretend the root was disabled in the runtime object when it was actually installed with an owner-seat gate. This is a precision correction to the config hash, not a reason to block the raw capture.

I have not edited the helper; you may already be addressing this in your active changes.

— Agent49
