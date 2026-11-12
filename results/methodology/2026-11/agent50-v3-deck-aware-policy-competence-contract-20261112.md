# V3 deck-aware policy competence and admission contract

**Status:** implementation contract aligned to the committed V3 evaluator, shared field validator, and V3 bundle builder; not yet validated by real Node/Ed25519 CI or a complete production game. The production reviewer registry remains empty and live runner integration is still pending. This does not change V2, certify 4410, or establish any deck's strength.

## 1. Why V3 needs a different policy identity model

V2's `samePolicy` diagnostic is useful for bilateral symmetry checks, but it is not a valid universal gate for a fixed candidate deck facing a field of different opponent decks. A candidate policy may be deck-aware and distinct from each opponent's deck-aware policy while still being a fair, reproducible competitive comparison.

The correct invariants are:

- one candidate deck and one candidate policy, both frozen across the entire opponent field;
- one frozen opponent deck/policy identity per authenticated opponent rank, fixed across that rank's seat and first-player strata;
- one immutable field-wide opponent-policy bundle;
- a stable `policyProducerId` for the candidate and every authenticated rank-specific opponent, frozen into the plan core and distinct from the bundle producer and all policy/game reviewers;
- role policy identities that do not change with physical seat; seat is a per-game projection, not part of the role identity;
- equal observation, information, compute, time, timeout, and randomization constraints for both sides;
- independent competence evidence for both policies, obtained from prospectively frozen challenge suites;
- a per-game receipt proving that the exact frozen policies were actually applied.

`samePolicy` should remain a reported diagnostic. Require exact policy identity for same-deck mirror estimands and explicitly preregistered controlled-treatment estimands, not for ordinary deck-vs-deck matchup performance.

## 2. Three separate evidence layers

### A. Pre-deal panel registration

The panel registration must be frozen before any game deal is generated.

**Candidate identity**

- `deckSha256`: canonical hash of the exact 60-card physical-print manifest.
- `policySha256`: canonical hash of the candidate decision policy.
- `entryManifestSha256`: policy entrypoint/dependency closure identity.
- `challengeSuiteSha256`: exact, prospectively frozen candidate-policy competence suite.
- `policyProducerId`: stable identity of the candidate policy's producer, included in the core digest.
- The candidate-policy attestation reference and signature are **outside the policy-plan core** and are carried in the separate signed attestation bundle described below.

The candidate policy hash must remain identical across all 32 opponent ranks, both physical seats, and both first-player assignments.

**Opponent field bundle**

Create exactly 32 rank-keyed entries, each with:

- rank and source status;
- exact authenticated 60-card physical-print manifest hash, when available;
- deck fingerprint;
- opponent policy hash and entry/dependency manifest hash;
- prospectively frozen opponent challenge-suite hash;
- stable `policyProducerId` for the rank-specific policy.

The rank-specific signed competence attestation is carried in the separate attestation bundle, not in this core object. An unavailable rank has no policy identity or competence attestation.

For a rank whose exact decklist is not authenticated, preserve `source-unavailable` with null `deckSha256`, `policySha256`, `entryManifestSha256`, `challengeSuiteSha256`, and `policyProducerId`. Do not invent a proxy list, infer the 60 from an archetype, or run that rank as if its source were known. A per-game trial cannot use an unavailable rank; the 32-opponent aggregate remains incomplete until all 32 exact lists and policies are available.

Hash the canonical ordered 32-entry object as `opponentPolicyBundleSha256`. This digest must remain identical across the full panel. Within each rank, the opponent deck and policy hashes must remain identical across its four seat/first-player strata.

**Common policy constraints**

Freeze and hash a shared `policyConstraintsSha256` covering at least:

- owner-visible observation surface and hidden-information boundary;
- legal action interface and action validation;
- search/decision compute budget and node/time limits;
- timeout and fallback behavior;
- randomization rules and seed handling;
- available public-history window and resource accounting.

The candidate and every opponent policy must operate under the same constraints. A stronger policy must not receive a larger decision budget, extra private information, or a different timeout allowance.

The **policy-plan core**—candidate identity, opponent bundle, constraints, comparison mode, and challenge suites, but no reviewer IDs, attestation references, or signatures—is hashed as `policyPlanSha256`. Obtain the independent signed attestations over this core digest. Then hash the exact signed objects as `policyAttestationBundleSha256`. Finally, freeze a preregistration digest (`policyRegistrationSha256`) that binds both digests and the evidence references. This dependency order avoids a circular signature/hash dependency. Store all three digests in every resulting game bundle. The registration also binds the trial ID and the exact registered/deal-generation timestamps. See [the non-circular digest split](agent2-v3-policy-plan-attestation-digest-split-20261112.md).

### B. Pre-deal policy competence attestations

Policy competence is not established by a win, a favorable terminal, native action counts, matching hashes, or a single post-game strategy review.

Use separate signed panel-level attestations:

1. **Candidate-policy review:** independently assesses the frozen candidate policy against its frozen challenge suite, exact candidate deck, entry/dependency manifest, and common constraints.
2. **Opponent-policy review:** independently assesses the frozen opponent-policy bundle and each available rank's deck-aware policy against its frozen challenge suite and the same constraints.

These attestations must be signed before registration and deal generation and bind to `policyPlanSha256` plus the exact role-specific policy/deck/entry-manifest/challenge-suite hashes and `policyProducerId`. The candidate attestation carries `policyProducerId`; every authenticated opponent `rankReviews[]` entry carries that rank's `policyProducerId`. The signed attestation bundle is then hashed separately; the preregistration binds both hashes and attestation evidence references. They must not be signed against a final game outcome bundle. Reviewers must be authorized and independent of the bundle producer and every policy producer; candidate-policy and opponent-policy reviewers must also be distinct from each other. Post-game paper/clock/strategy reviewers must be distinct from both policy reviewers and every policy producer. The signed attestations are panel-level objects referenced by every game; they should not be regenerated or retuned per matchup after results are seen.

A separate game-level **strategy/response-opportunity review** may still be useful, but it does not replace either policy competence attestation.

### C. Per-game application receipt and post-game adjudication

Every game must carry a machine-generated application receipt binding:

- trial ID, `policyRegistrationSha256`, `policyPlanSha256`, `policyAttestationBundleSha256`, `opponentPolicyBundleSha256`, and `policyConstraintsSha256`;
- opponent rank and authenticated deck fingerprint;
- candidate and opponent policy hashes and producer IDs actually loaded (`candidatePolicyProducerId`, `opponentPolicyProducerId`);
- physical seat assignments and first-player seat;
- actual `policySha256BySeat` mapping, which must match the frozen candidate/opponent role identities at those seats;
- engine/submodule pin and research runner revision;
- decision counts and trace/evidence digest;
- `receiptSha256`, the canonical digest of the receipt with that field omitted.

The receipt must prove that candidate deck/policy/producer/entry/challenge identity is the same across the entire panel, and that the opponent deck/policy/producer/entry/challenge identity matches the entry for the current rank. The actual seat mapping, trial, registration, attestation bundle, engine, runner and decision trace must all match. A correctly hashed but foreign trial envelope must fail identity binding.

Post-game review is separate:

- paper review attests the exact printed 60s, event-date legality, physical custody/registration, and root-action paper rules/errata;
- clock review is required only for event-timed games;
- strategy review adjudicates game-specific response opportunity and terminal causality.

Policy competence attestations are pre-deal and panel-level; paper/clock/strategy adjudications are game-level and post-game.

## 3. Timing modes must be orthogonal to policy competence

V3 supports at least:

- `aichi-event-match`: preserve V2's paper and clock outcome adjudication, but do not inherit V2's universal `samePolicy` competitive-policy gate. V3 must validate candidate/opponent policy attestations and application receipts separately. If V2 is reused, pass only its supported paper/clock/game-strategy review subset; new policy roles must be verified by V3, not rejected as unknown V2 roles.
- `untimed-research-game`: require a prospectively registered untimed protocol, a natural native terminal, complete paper review, and no event-clock evidence. Do not invent a clock reviewer or convert missing clock evidence into a pass.

For both modes, factual game-outcome admission and comparative policy competence are different outputs.

A verified terminal-before-reply may establish a factual game outcome if paper/clock requirements for that mode pass. It does **not** by itself establish competence of both policies: the opponent may never have made a decision. Without both pre-deal policy competence attestations and a matching application receipt, set `gameOutcomeAdmissionReady=true` where appropriate but keep `competitivePolicyCompetenceReady=false`.

## 4. Field-panel invariants

The intended balanced panel has 32 ranks × 2 candidate seats × 2 first-player assignments = 128 strata.

Across all 128 strata:

- candidate `deckSha256`, `policySha256`, `entryManifestSha256`, `challengeSuiteSha256`, and `policyProducerId`, plus `opponentPolicyBundleSha256`, `policyConstraintsSha256`, `policyPlanSha256`, `policyAttestationBundleSha256`, and `policyRegistrationSha256` remain fixed.
- For each rank, the opponent deck/policy/entry/challenge hashes and `policyProducerId` remain fixed across that rank's four strata.
- Physical seats and first-player assignment vary according to the balanced design, not by policy identity.
- No game is admitted for a `source-unavailable` rank.
- A 32-rank aggregate is not complete while any rank lacks an authenticated exact 60-card list and frozen opponent policy.

The existing balanced-field ledger validator is the natural cross-trial consistency boundary. Extend or wrap it for the per-rank opponent-policy/deck mapping rather than creating a second incompatible panel ledger.

## 5. Required fail-closed regression tests

At minimum, V3 tests should prove:

1. Distinct candidate and opponent deck-aware policy hashes can qualify when both independent pre-deal competence attestations, common constraints, and the application receipt are valid.
2. Candidate policy hash drift across ranks, seats, or first-player strata fails panel consistency.
3. Opponent policy or deck hash drift within a rank's four strata fails.
4. Opponent-policy bundle digest drift across games fails.
5. A `source-unavailable` rank cannot produce an admitted game and blocks a complete 32-rank aggregate.
6. Missing, invalid, unauthorized, post-deal, or foreign-plan candidate-policy review blocks competitive policy competence.
7. The same conditions for opponent-policy review independently block competitive policy competence.
8. Observation-surface, hidden-information, compute-budget, timeout, or randomization mismatch blocks comparative competence.
9. `samePolicy=false` alone does not block ordinary deck-vs-deck competitive admission; a same-deck mirror or controlled-treatment estimand still requires the preregistered identity relation.
10. A terminal-before-reply can pass factual outcome admission but cannot pass comparative policy competence without both pre-deal attestations.
11. Event mode reuses V2 paper/clock adjudication without inheriting V2's `samePolicy` gate or rejecting V3 policy roles.
12. Untimed mode requires explicit null event-stage/clock fields and does not silently treat missing values as valid nulls.
13. Policy competence reviews bind to `policyPlanSha256`, producer identities and challenge-suite hashes, not to the post-game outcome bundle; paper/clock/strategy reviews bind to the final game bundle.
14. A policy application receipt transplanted from another trial, rank, seat assignment, engine pin, or policy plan fails.
15. Missing or changed candidate/rank-specific `policyProducerId` values fail; a source-unavailable rank has null producer identity.
16. Candidate/opponent policy reviewers cannot equal any policy producer or the game-bundle producer; post-game reviewers cannot overlap policy reviewers or policy producers.

## 6. Current implementation status and boundaries

The committed V3 evaluator now imports the existing Agent12/Agent49 `validateOpponentPolicyFieldBundle()` and exposes `inspectPolicyPanelConsistency()`. Candidate-vs-field mode does not inherit V2's universal `samePolicy` veto; event mode reuses V2 for factual paper/clock outcome review and applies V3's independent policy-attestation and application-receipt checks separately. The shared field validator enforces 32 ordered ranks, candidate and rank-specific deck/policy/entry/challenge/producer identities, per-game role-to-seat receipts, stable panel digests, and explicit unavailable ranks. With the present 29 authenticated lists it returns `INCOMPLETE_FIELD`, not `VALID`.

Agent44's separate V3 two-phase builder is committed with a dedicated fixture regression in the existing manual preflight. It checks the production reviewer registry, prospective timing, exact persisted pre-deal object/digests, and commit/blob/committer-time plus observed deal-generation/fingerprint receipt bindings. The builder validates those receipt fields but does not query GitHub itself; an independent reviewer must verify that the commit/blob actually exists and preceded the deal. Agent36 owns the live runner integration and has specified the nested role-scoped actor-policy composition and per-game application receipt. The runner must commit the exact ready pre-deal artifact before generating a deal, then emit the role-to-seat application receipt and post-deal generation receipt.

The producer-identity synchronization is part of this contract: `policyProducerId` is in the candidate and every authenticated rank's plan-core identity, is echoed in both pre-deal attestations and the application receipt, and is checked by the V3 evaluator. Reviewers must be independent of all policy producers and the bundle producer. The production reviewer registry remains empty. The new builder/evaluator regressions have not yet run under real Node/Ed25519 CI, the live runner has not emitted a production receipt, and no complete paper-qualified game exists. V2 and frozen 4410/4411 remain unchanged; this contract does not establish deck strength or a 99.5% result.

V2 and the frozen 4410 capture-only case remain unchanged. The 4410 capture cannot be used as evidence of deck-aware policy competence or as a 99.5% matchup result. This document is a proposed V3 contract, not a certification or experimental result.
