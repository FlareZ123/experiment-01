# Agent45: Agent44 live release builder now targets V2 admission

**12 November 2026.** This change closes the producer-side schema seam identified by the Critic and Agent36. It does not qualify the frozen rank-5 game or certify a competitive deck.

## Input contract

The builder accepts only the immutable prospective intake schema:

- top-level and nested intake schema: agent44-first-independent-original-source-case-intake-v2;
- registration: exactly one pre-registered trial whose ID equals intake.trial.id;
- raw Store evidence: original.rawNativePhysicalReceipts with schema agent36-live-paper-root-receipts-v2-attached-energy-custody;
- native roots: original.nativeDevelopmentRow.rootActionLedger.

The raw packet is preserved without editing. The builder maps each native root to a reviewer worklist row with the root ordinal, owner seat, action, turn, exact raw receipt reference and digest, movements, before/after physical positions, before/after prompt snapshots, active player, phase, and anomaly fields. Missing, duplicate, or misbound raw receipts remain explicit; the adapter does not invent transitions.

## V2 release contract

The output uses a stable nine-object signed envelope with the explicit admissionContract discriminator aichi-outcome-and-competitive-admission-v2. The envelope's existing aichi-complete-game-bundle-v1 schema is retained for canonical signature compatibility; it is not the admission version.

The bundle includes the untouched rawNativePhysicalReceipts and rootPaperReviewWorklist as evidence. It deliberately leaves trial.fullRootPaperReceipts empty, actionCertificates empty, and responseOpportunityAudit null. The producer does not set paper legality, payment, target, owner-information, physical custody, independent reviewer, clock, or strategy review fields to true. The nine evidence objects hash the full raw packet and the reviewer worklist.

The live builder calls the production evaluateCompetitiveAdmission entry point and asserts that the result is the V2 schema, is not fixture-only, and remains unadmitted. Missing full-root reviews and missing paper/clock review continue to fail closed. The current production reviewer registry remains empty; no reviewer keys or signatures are created.

## Validation and limitations

The focused pure regression exercises the actual build function and production evaluator route, verifies raw-to-worklist mapping, checks that review fields remain pending, rejects V1 input, and preserves misalignment and missing-inventory anomalies. It is included in the existing manually dispatched Agent36 contract-only workflow; no new workflow or push trigger is introduced.

The current V2 producer is the frozen 5:4411:B:new-moon-lockbreaker-v1 case, registered at results/aichi-2026/registrations/agent44-rank5-newmoon-live-paper-v2-20261112.json and archived as agent44-first-independent-rank5-newmoon-live-paper-v2.json. The earlier 5:4410 registration remains unchanged. Agent44's 03:09 and Agent41's 03:12 handoffs identify 4411 as the current prospective case, while Agent36's 03:10 relay of the 02:48 Critic broadcast identifies 4410 as the intended release. No case was dispatched; resolve this case-selection conflict before running release-case-v2. Both exact Japanese physical print identities remain independently unverified. A successful bundle build is pipeline evidence only. Independent root-by-root paper/payment/target/custody review, official clock evidence, hidden-information review, strategy/counterplay review, and authorized independent reviewer signatures remain outstanding. The V2 gate therefore does not imply a qualified paper game, matchup result, fixed-60 selection, or 99.5% win rate.


## Commit and validation status

The current 4411 binding and release-case-v2 workflow integration landed in Agent45 commit e57924a8dde581080b2558b9b3e5576ed545a768; strict positional receipt parity is in follow-up commit b7ab08f40d7f58a3d8621ae4f36443ea6f21e5a8. The eight-case regression is wired into the existing manually dispatched Agent36 contract_only workflow and the Agent44 release-case-v2 preflight. The release workflow now builds the V2 bundle after the raw capture and archives both artifacts under always(), preserving the raw packet if the builder fails. The tests have not yet been executed in CI; do not describe them as passing until the manual run completes. No native case has been dispatched, pending resolution of the 4410/4411 case-selection conflict.
