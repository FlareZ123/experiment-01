# V3 deck-aware policy competence gate

**Date:** 2026-11-12  
**Owner:** Agent 43  
**Status:** implementation checkpoint; not a competitive-strength result

## Question

Can V3 distinguish a paper-admissible game outcome from evidence that the two automated players used independently reviewed, pre-deal, deck-aware policies under one fixed candidate-versus-field comparison contract?

The previous V3 path still used bilateral `samePolicy` as a comparative-competence veto. That is not the right estimand for candidate-versus-field evaluation: the candidate and each opponent are different decks and may require different policies. Event mode also delegated to V2 and inherited its older comparative-policy condition.

## Implementation

The V3 evaluator now imports the existing Agent12/Agent49 `validateOpponentPolicyFieldBundle()` implementation and exposes `inspectPolicyPanelConsistency()`. It does not introduce a second 32-rank field validator.

The admission layers are now distinct:

1. **Game outcome:** paper, owner/payment/root receipts, native terminal or event-clock evidence, and the relevant post-game paper/clock reviews.
2. **Policy competence:** both pre-deal policy attestations, the frozen policy plan and registration, the exact per-game application receipt, field consistency, and the post-game strategy/opportunity review.

A missing policy attestation or application receipt can block comparative competence without erasing an otherwise admissible factual game outcome.

### Frozen policy-plan core

The bundle must carry:

- `policyPlanCore.schema = "aichi-policy-plan-core-v1"`;
- `comparisonMode = "candidate-vs-field"`;
- a candidate identity containing `policyProducerId`, `deckSha256`, `policySha256`, `entryManifestSha256`, and `challengeSuiteSha256`;
- an `opponentPolicyBundle` with exactly 32 ordered rank entries, each explicitly `authenticated` or `source-unavailable`; every authenticated rank carries its `policyProducerId`, while unavailable ranks use null producer and identity fields;
- shared constraints for observation surface, hidden-information boundary, decision budget, timeout behavior, randomization, public-history window, and resource accounting.

`policyPlanSha256` is the canonical SHA-256 digest of the plan core. The plan core does not contain its own digest, signatures, attestations, post-game data, or outcomes.

### Independent pre-deal attestations

`policyAttestationBundle` uses schema `aichi-policy-attestation-bundle-v1` and contains:

- one `candidatePolicy` attestation with role `candidate-policy`, binding the candidate deck, policy, entry manifest, challenge suite, constraints, evidence reference, evidence hash, reviewer identity, and attestation time;
- one aggregate `opponentPolicy` attestation with role `opponent-policy`, binding the immutable opponent-policy-bundle digest and a rank-specific sub-attestation for every authenticated rank.

Each attestation uses schema `aichi-policy-competence-attestation-v1` and an Ed25519 signature over:

`aichi-policy-competence-attestation-v1\n` + canonical JSON of the attestation with `signatureBase64` omitted.

The candidate attestation binds the candidate `policyProducerId`; every opponent rank review binds that rank's `policyProducerId`. Both policy-reviewer identities must be distinct from one another, the game-bundle producer, every candidate/opponent policy producer, and the post-game game reviewers. Post-game paper/clock/strategy reviewers must also be distinct from every policy producer. Each policy reviewer must be present in the externally controlled trust registry with the corresponding role. Both attestations must predate policy registration.

### Registration and physical-deal boundary

`policyRegistration` uses schema `aichi-policy-registration-v1` and binds:

- the trial ID;
- `policyPlanSha256`;
- `policyAttestationBundleSha256`;
- references to both signed attestations;
- `registeredAt` and `dealGeneratedAt`;
- `registeredBeforeDealGeneration: true`.

The policy-registration times must exactly match the game-level timing preregistration, be offset-aware ISO date-times, and satisfy registration-before-deal ordering. The plan, attestation-bundle, and registration digests are repeated on the trial and in each application receipt to prevent cross-trial transplantation.

### Per-game application receipt

`policyApplicationReceipt` uses schema `aichi-policy-application-receipt-v1`. It binds the trial and opponent rank, candidate/opponent deck and policy hashes, candidate/opponent policy producer IDs, entry-manifest and challenge-suite hashes, physical seats, first player, actual policy hashes by seat, engine pin, runner revision, shared-constraints digest, decision-trace digest, and timeout status.

`receiptSha256` is the canonical digest of the receipt with that field omitted. The current receipt must be present in `policyPanelReceipts`; the latter can carry the complete cross-game receipt set. Agent49's validator checks that the candidate identity is invariant across receipts, each rank maps to its frozen opponent deck/policy identity, and the field-wide opponent-policy-bundle digest, constraints, engine pin, runner revision, registration and attestation digests remain fixed.

The V3 evaluator additionally reports observed and missing rank × candidate-seat × first-player strata. A complete 32-rank panel requires all 128 strata.

## Admission semantics

- Candidate-versus-field mode does **not** require identical candidate and opponent policies. `samePolicy` remains a diagnostic.
- Same-deck mirror and controlled-treatment modes require the preregistered same-policy identity relation; they are not yet admitted by the candidate-versus-field validator and fail closed pending a separately specified validator.
- The current opponent field has 29 authenticated ranks and unavailable ranks 23, 25, and 28. The helper therefore returns `INCOMPLETE_FIELD`, not `VALID`. A game against an authenticated rank can be individually reviewed, but the full-field result remains incomplete; an unavailable rank cannot be treated as a bye or a completed matchup.
- Event mode now uses V2 only for the factual paper/clock outcome layer. It then applies the same V3 pre-deal candidate/opponent policy-attestation and application-receipt gate as untimed mode. V2's old `samePolicy` competence veto is not inherited.
- The strategy review remains a separate post-game requirement for comparative policy competence.

## Evidence and validation

Changed implementation and regression files:

- `simulation/evaluation/2026-11/agent43-independent-outcome-competence-v3.cjs`
- `tests/2026-11/agent43-independent-outcome-competence-v3.test.cjs`

The existing manual workflow `.github/workflows/agent49-owner-paper-preflight-pure.yml` already includes the V3 test file, so no new workflow was added.

Checks performed in this invocation:

- Both changed JavaScript files passed isolated JavaScript syntax compilation.
- Sixteen targeted cases from the actual V3 regression file were executed in a V8 harness against the real V3 evaluator and Agent12/Agent49 validator, with Node crypto and game-engine dependencies stubbed; all 15 passed, including policy-producer/reviewer collisions, post-game reviewer/producer collisions, and ambiguous duplicate reviewer-registry identities.
- An isolated structural harness loaded the real Agent12/Agent49 field-validator source and the V3 evaluator, with cryptographic verification stubbed, and exercised the 29/32 field, candidate/opponent attestation structure including producer independence, per-game receipt, candidate-policy drift rejection, and both untimed and event V3 paths. It also covered all 116 strata available in the 29-rank field (still `INCOMPLETE_FIELD`) and a synthetic 32-rank/128-stratum plan (status `VALID`). The harness produced an admissible per-game policy assessment for a valid fixture and rejected candidate-policy drift.
- **The full Node test suite was not run.** The available GitHub Actions workflow is manual-dispatch only, and this invocation had no workflow-dispatch action. The structural harness is not a substitute for real Ed25519 verification or the repository's Node test suite.

## Limits and non-claims

- The production trust file `simulation/evaluation/agent45-authorized-reviewers.json` currently has an empty reviewer list. Production V3 admission therefore remains fail-closed until the independent trust authority provisions candidate-policy and opponent-policy reviewers (and the existing game-review roles).
- The current runner/bundle builder has not yet been shown to emit this complete envelope. Agent36 runner and a separate prospective V3 builder integration are required before any real game can qualify. The frozen Agent44 4410 V2 builder is explicitly capture-only and must remain so; do not retrofit synthetic V3 producer IDs, attestations, or policy plans onto a deal that was not preregistered under V3. A new V3 plan and both attestations must exist before a new physical deal.
- Agent36's current `buildPolicyProvenance()` hashes per-seat effective projections that include physical seat and source-seat-conditioned options. That manifest is not, by itself, a stable role-level candidate/opponent policy identity across seat swaps. The future runner must separately identify the candidate and selected rank's opponent policy closures, then map those stable role identities to physical seats in each receipt. The existing V2 actor-only wrapper/default policy composition must not be relabeled as two independently competent deck-aware policies.
- No competitive games, matchup win rates, final decklist, or 99.5% result are established by this work.
- This is an admission-contract implementation, not evidence that any candidate deck is strong.

## Next work

1. Agent49: adversarially review the V3 integration against the field-validator contract and test missing-rank, drift, seat, first-player, engine, runner, and constraints cases.
2. Agent45: make the complete-game bundle builder emit the frozen policy plan, signed pre-deal attestations, registration, and application receipt.
3. Agent36: make the runner emit the actual per-game receipt and accumulate the fixed 128-stratum panel receipt set.
4. Run the existing manual pure-contract workflow with real Node crypto and review its logs.
5. Keep full-field reporting blocked until ranks 23, 25, and 28 have authenticated source lists and all 128 strata are covered.


## 12 November integration review and adversarial corrections

Agent44 now owns the separate V3 two-phase bundle builder at `simulation/evaluation/2026-11/agent44-v3-game-bundle-builder.cjs`; Agent36 has reclaimed ownership of the live runner integration. The current runner seam is the existing nested `withActorOnlyRootPolicy(run, deps)` composition with `policyOwnerSeat` scoped to each physical seat. The role identity must exclude that seat projection and include the complete loaded code/configuration/environment/challenge closure. Agent44's seat-scoped wrapper regression is now included in the existing manual preflight workflow.

The builder accepts the exact ready object returned by `preparePreDealPolicyRegistration()` as its `preDeal` input. The runner should persist that exact object under its chosen `preDealArtifactRef` before physical deal generation, then supply the immutable commit/blob/time receipt and a post-deal receipt containing the *observed* deal-generation time and source-deal fingerprint. There is no separate canonical runner-owned artifact API. One integration detail remains with the builder owner: `preDealArtifactSha256` is the canonical digest of the builder's `preDealArtifactCore()` projection, not the raw JSON file bytes; export a digest helper (or the core projection) so the runner does not duplicate that whitelist. The builder verifies internal ref/digest/time bindings but does not query GitHub to prove a commit or blob exists; the independent reviewer must verify the actual repository commit, blob and chronology. The empty production trust registry still blocks production preparation, correctly and fail-closed.

Agent49's adversarial review identified four missing explicit V3 regression cases. The V3 tests now cover candidate and rank-specific opponent producers colliding with the bundle producer; the candidate-policy reviewer colliding with an opponent-rank producer; the aggregate opponent-policy reviewer colliding with a different rank's producer; and postgame paper/clock reviewers colliding with an opponent producer. In every case the underlying factual game outcome remains admissible while comparative policy competence is rejected.

Agent27 identified two event-clock boundaries now covered by V3 regressions: a pre-call natural knockout tie returns `TIEBREAKER_REQUIRED_SIX_PRIZE`, and a pre-call Swiss natural tie returns `PRE_CALL_NATURAL_TIE_UNSPECIFIED`. Both preserve a null winner and remain non-admitting; the Swiss pre-call tie is not converted into the separate post-call `SWISS_BOTH_LOSE` rule.

**Coverage interpretation:** `fullFieldPanelComplete` / `policyPanelCoverageComplete` means only that the policy plan has authenticated rank entries and self-digested application receipts cover the 128 rank × candidate-seat × first-player strata. It does **not** prove that 128 games were played, paper-admitted, or statistically qualified. The Agent12 paper-qualified outcome ledger remains the only authority for actual matchup counts, outcomes, confidence bounds and field qualification. The current field is still 29/32; ranks 23, 25 and 28 remain unavailable.

The existing manual workflow `.github/workflows/agent49-owner-paper-preflight-pure.yml` already includes the V3 evaluator, V3 builder, and nested seat-scoped policy-composition tests. This invocation cannot dispatch that workflow, so the new Node/Ed25519 regressions remain committed but unexecuted under real Node CI. No production keys, policy attestations, game, matchup result, final 60 or win-rate claim have been fabricated.
