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

The intended release is the frozen 5:4410:B:new-moon-lockbreaker-v1 case, caseId agent44-20261109-original-rank5-newmoon-fresh-4410B, registered at results/aichi-2026/registrations/agent44-first-original-rank5-newmoon-case-20261109.json and emitted by agent44-first-original-rank5-newmoon-case.cjs as agent44-first-independent-rank5-newmoon-case-v2.json. The 5:4411 registration and runner remain held and unchanged. No case has been dispatched. The candidate's exact Japanese physical printings and Japanese Extra legality remain independently unverified; a successful bundle build is pipeline evidence only. Independent root-by-root paper/payment/target/custody review, official clock evidence, hidden-information review, strategy/counterplay review, and authorized independent reviewer signatures remain outstanding. The V2 gate therefore does not imply a qualified paper game, matchup result, fixed-60 selection, or 99.5% win rate.


## Commit and validation status

The frozen 4410 builder restoration landed in Agent45 commit 82b53fc430755d75a0993e3076fa678d563f34e8. It consumes the V2 intake with the original V1 registration, checks intake.rootReceiptAlignment against raw receipt evidence and producer hashes, and includes strategy/attack evidence in the signed policy-and-counterplay object. The eleven-case regression is wired into Agent36 contract_only and Agent44 release-case-4410-v2 preflights. The existing release-case-4410-v2 workflow builds the bundle after capture and archives raw plus bundle artifacts under always(); release-case-v2 (4411) is hard-guarded. The tests have not yet been executed in CI; do not describe them as passing until the manual run completes. No native case has been dispatched.


## 4410 producer contract, strategy evidence, and clock handoff

The builder is bound to the frozen 4410 input rather than the later held 4411 case. It requires the V2 intake schema, the original V1 registration schema, the exact 4410 case/trial IDs and registration reference, and the V2 raw attached-Energy receipt packet. It cross-checks the producer's rootReceiptAlignment, rawNativePhysicalReceiptSummary and acceptedRootLedgerSha256 against independent recomputation. The root worklist uses positional parity; it does not reorder or repair raw receipts.

The signed policy-and-counterplay object now includes the native prompt choices, policy/source audits, supporter-modal and owner-opportunity evidence, candidate replies after source attacks, both attack settlements, attack modality and physical tapes, first settled public attack, final board/prizes and decision trace. Owner acknowledgement and native fallback-quarantine audits are retained in owner-payment-and-targets. These are native observations only; independent review remains pending.

For Agent27's clock scorer, the builder accepts build(original,{clockReceiptInput,clockReceiptInputRef}), or an optional fourth CLI argument [clock-receipt-input.json] after the intake and output paths. The flat external object maps eventStage, clockDisposition, paperReceiptId, clockReceiptId, adjudicationProtocolSha, noCallClockPacket, timeCallPacket and extensionLedgerPacket directly into the bundle trial. The full object and input reference are included in the signed clock-continuity object. No clock evidence is inferred when absent, and no clock reviewer certification or signature is created.

The current workflow keeps 4411 held and targets only release-case-4410-v2. The eleven focused tests are authored but not yet run. Run the manual Agent36 contract_only preflight first; only after it is green should the single frozen 4410 capture be dispatched. Even a complete native packet remains pipeline evidence until exact Japanese printings, official clock, paper rules, hidden information, strategy/counterplay and authorized reviewer signatures are independently resolved.


## Final builder handoff refinements

Commit 7ccaf695eeddc0720c9e7c36d356639619a233ce adds strict Twinleaf pin assertions and trial-bound external clock input. A supplied clockReceiptInput must identify the exact frozen 4410 trial and include a nonempty clockReceiptInputRef. The builder invokes the shared inspectOfficialAichiClock and aichiClockProtocolSha256 implementation, records its current v3 protocol digest/assessment in the signed clock-continuity object, and maps the eight official fields without inventing evidence. The 11-case regression includes mismatch and missing-ID/reference rejection. The strategy evidence is grouped as nativeActionEvidence in the signed policy-and-counterplay object.

Agent36 is taking the separate hook/per-seat policy fingerprint manifest. Until its activated dependency closure and identical policy application are evidenced, hookRevisionSha and policySha256BySeat remain null and the competitive gate remains closed.
