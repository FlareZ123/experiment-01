# V3 deck-aware policy competence and admission contract

**Status:** proposed research/evaluation contract; not yet implemented or validated by a complete game. This document is a design synthesis for prospective V3 competitive experiments. It does not change V2, certify 4410, or establish any deck's strength.

## 1. Why V3 needs a different policy identity model

V2's `samePolicy` diagnostic is useful for bilateral symmetry checks, but it is not a valid universal gate for a fixed candidate deck facing a field of different opponent decks. A candidate policy may be deck-aware and distinct from each opponent's deck-aware policy while still being a fair, reproducible competitive comparison.

The correct invariants are:

- one candidate deck and one candidate policy, both frozen across the entire opponent field;
- one frozen opponent deck/policy identity per authenticated opponent rank, fixed across that rank's seat and first-player strata;
- one immutable field-wide opponent-policy bundle;
- equal observation, information, compute, time, timeout, and randomization constraints for both sides;
- independent competence evidence for both policies, obtained from prospectively frozen challenge suites;
- a per-game receipt proving that the exact frozen policies were actually applied.

`samePolicy` should remain a reported diagnostic. Require exact policy identity for same-deck mirror estimands and explicitly preregistered controlled-treatment estimands, not for ordinary deck-vs-deck matchup performance.

## 2. Three separate evidence layers

### A. Pre-deal panel registration

The panel registration must be frozen before any game deal is generated.

**Candidate identity**

- `candidateDeckSha256`: canonical hash of the exact 60-card physical-print manifest.
- `candidatePolicySha256`: canonical hash of the candidate decision policy.
- `candidatePolicyEntryManifestSha256`: policy entrypoint/dependency closure identity.
- `candidateChallengeSuiteSha256`: exact, prospectively frozen candidate-policy competence suite.
- `candidatePolicyReviewRef`: signed independent competence attestation for that exact candidate deck, policy, entry manifest, challenge suite, and constraints.

The candidate policy hash must remain identical across all 32 opponent ranks, both physical seats, and both first-player assignments.

**Opponent field bundle**

Create exactly 32 rank-keyed entries, each with:

- rank and source status;
- exact authenticated 60-card physical-print manifest hash, when available;
- deck fingerprint;
- opponent policy hash and entry/dependency manifest hash;
- prospectively frozen opponent challenge-suite hash;
- signed competence-review reference, or an explicit unavailable status.

For a rank whose exact decklist is not authenticated, preserve `source-unavailable` with null deck/policy hashes. Do not invent a proxy list, infer the 60 from an archetype, or run that rank as if its source were known. A per-game trial cannot use an unavailable rank; the 32-opponent aggregate remains incomplete until all 32 exact lists and policies are available.

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

The complete object—candidate identity, opponent bundle, constraints, comparison mode, challenge suites, and reviewer references—forms `policyPlanSha256`. Store this digest in the pre-deal registration and every resulting game bundle.

### B. Pre-deal policy competence attestations

Policy competence is not established by a win, a favorable terminal, native action counts, matching hashes, or a single post-game strategy review.

Use separate signed panel-level attestations:

1. **Candidate-policy review:** independently assesses the frozen candidate policy against its frozen challenge suite, exact candidate deck, entry/dependency manifest, and common constraints.
2. **Opponent-policy review:** independently assesses the frozen opponent-policy bundle and each available rank's deck-aware policy against its frozen challenge suite and the same constraints.

These attestations must be signed before deal generation and bind to `policyPlanSha256` plus the exact role-specific policy/deck/challenge-suite hashes. They must not be signed against a final game outcome bundle. Reviewers must be authorized, independent of the producer, and distinct across candidate-policy and opponent-policy roles. The signed attestations are panel-level objects referenced by every game; they should not be regenerated or retuned per matchup after results are seen.

A separate game-level **strategy/response-opportunity review** may still be useful, but it does not replace either policy competence attestation.

### C. Per-game application receipt and post-game adjudication

Every game must carry a machine-generated application receipt binding:

- trial ID and `policyPlanSha256`;
- opponent rank and authenticated deck fingerprint;
- candidate and opponent policy hashes actually loaded;
- physical seat assignments and first-player seat;
- engine/submodule pin and research runner revision;
- applied constraints digest;
- decision counts and trace/evidence digest.

The receipt must prove that the candidate policy hash is the same candidate hash frozen for the entire panel, and that the opponent policy hash matches the entry for the current rank. A correctly hashed but foreign trial envelope must fail identity binding.

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

- `candidateDeckSha256`, `candidatePolicySha256`, `candidatePolicyEntryManifestSha256`, `candidateChallengeSuiteSha256`, `opponentPolicyBundleSha256`, `policyConstraintsSha256`, and `policyPlanSha256` remain fixed.
- For each rank, the opponent deck/policy/entry/challenge hashes remain fixed across that rank's four strata.
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
13. Policy competence reviews bind to `policyPlanSha256` and challenge-suite hashes, not to the post-game outcome bundle; paper/clock/strategy reviews bind to the final game bundle.
14. A policy application receipt transplanted from another trial, rank, seat assignment, engine pin, or policy plan fails.

## 6. Current implementation status and boundaries

At the last review on 12 November 2026, the committed V3 evaluator still used `structural.samePolicy === true` for comparative policy competence, delegated event mode to V2, and allowed a terminal-before-reply strategy audit to satisfy the old policy-competence path. Agent43 has received review messages covering these gaps and is coordinating a policy-plan/runner interface with Agent36, Agent12, Agent21, Agent44, and Agent2. Re-check the current code before treating this design as implemented.

V2 and the frozen 4410 capture-only case remain unchanged. The 4410 capture cannot be used as evidence of deck-aware policy competence or as a 99.5% matchup result. This document is a proposed V3 contract, not a certification or experimental result.
