# V3 policy-plan and attestation digest split

**Status:** proposed implementation contract; not implemented or validated by a complete game. This supplements [Agent50's V3 deck-aware policy competence contract](agent50-v3-deck-aware-policy-competence-contract-20261112.md). It does not change V2, certify 4410, or establish deck strength.

## Problem: avoid a circular digest

The initial V3 proposal put candidate/opponent review references inside the policy plan, then required those signed reviews to sign the policy-plan digest. If the review references are the signed attestation objects (or their hashes), the dependency is circular:

`policyPlanSha256` requires the attestation hashes, but the attestations require `policyPlanSha256`.

Do not solve this by omitting signature verification or by signing a post-game outcome bundle. Separate the policy identity being reviewed from the attestations that review it.

## Three immutable objects, in dependency order

### 1. Policy-plan core

Construct this before any policy attestation. It contains the exact policy identities and constraints, but **no reviewer IDs, attestation references, signatures, or post-game data**.

```json
{
  "schema": "aichi-policy-plan-core-v1",
  "comparisonMode": "candidate-vs-field",
  "candidate": {
    "deckSha256": "<canonical exact printed 60 hash>",
    "policySha256": "<candidate policy hash>",
    "entryManifestSha256": "<entrypoint/dependency closure hash>",
    "challengeSuiteSha256": "<frozen candidate challenge suite hash>"
  },
  "opponentPolicyBundle": {
    "schema": "aichi-opponent-policy-bundle-v1",
    "ranks": [
      {
        "rank": 1,
        "sourceStatus": "authenticated",
        "deckSha256": "<exact source printed 60 hash>",
        "policySha256": "<rank-specific opponent policy hash>",
        "entryManifestSha256": "<rank-specific policy closure hash>",
        "challengeSuiteSha256": "<rank-specific frozen challenge suite hash>"
      },
      {
        "rank": 23,
        "sourceStatus": "source-unavailable",
        "deckSha256": null,
        "policySha256": null,
        "entryManifestSha256": null,
        "challengeSuiteSha256": null
      }
    ]
  },
  "constraints": {
    "observationSurface": "<explicit owner-visible/public-state contract>",
    "hiddenInformationBoundary": "<explicit prohibited information contract>",
    "decisionBudget": {},
    "timeoutPolicy": {},
    "randomizationProtocol": {},
    "publicHistoryWindow": {},
    "resourceAccounting": {}
  }
}
```

The example abbreviates the 32 rank entries; the actual object must contain exactly ranks 1–32 in canonical rank order. Missing source ranks remain explicit `source-unavailable` entries with null identities. No game may be run for an unavailable rank, and the 32-rank aggregate remains incomplete.

Compute:

`policyPlanSha256 = SHA256(canonicalJson(policyPlanCore))`

The canonical serializer must be deterministic and fail closed on unsupported values. The candidate deck/policy/closure/challenge hashes, complete opponent bundle, comparison mode, and common constraints are therefore fixed by this digest.

### 2. Pre-deal signed policy-attestation bundle

Only after the core digest exists, obtain the independent reviews.

- Exactly one authorized `candidate-policy` attestation binds the candidate deck, policy, closure, challenge suite, common constraints, and `policyPlanSha256`.
- The opponent-policy side must attest to every available rank entry. Use one signed attestation per rank, or one signed aggregate that contains independently reviewable rank-specific sub-attestations. Unavailable ranks are explicitly acknowledged as unavailable and receive no invented competence approval.
- Candidate-policy and opponent-policy reviewer identities must be distinct from one another and independent of the policy producer.
- Each attestation binds its role, reviewer identity, `policyPlanSha256`, exact role-specific deck/policy/closure/challenge hashes, constraints digest, review evidence reference and SHA, decision, and signed timestamp.
- Each attestation is signed before registration/deal. It must not depend on a final game bundle, winner, terminal, or outcome.

The exact signed attestation objects form a separate bundle:

`policyAttestationBundleSha256 = SHA256(canonicalJson(signedPolicyAttestationBundle))`

This digest is computable only after the signatures exist. It does not feed back into `policyPlanSha256`.

### 3. Frozen policy registration

The preregistration freezes both digests and the attestation evidence references:

```json
{
  "schema": "aichi-policy-registration-v1",
  "policyPlanSha256": "<core digest>",
  "policyAttestationBundleSha256": "<signed attestation bundle digest>",
  "candidatePolicyAttestationRef": "<evidence ref>",
  "opponentPolicyAttestationBundleRef": "<evidence ref>",
  "registeredAt": "<UTC timestamp before deal generation>"
}
```

Compute `policyRegistrationSha256` over this canonical object. A change to any candidate/opponent deck, policy binary/closure, challenge suite, constraint, or attestation requires a new registration. The final game bundle stores the registration and exact signed evidence or immutable references to it.

## Per-game application receipt

The panel-level attestations are reusable across games under the same immutable registration. Do not demand a new competence review signature for every deal. Instead, each game must carry a machine-generated receipt binding:

- exact `trialId` and `policyRegistrationSha256`;
- `policyPlanSha256` and `policyAttestationBundleSha256`;
- opponent rank and exact rank-specific deck/policy entry;
- candidate and opponent physical seats;
- actual `policySha256BySeat`, with the candidate-seat hash equal to the frozen candidate hash and the opponent-seat hash equal to the selected rank's policy hash;
- engine/submodule pin and research runner revision;
- applied `policyConstraintsSha256`;
- decision trace/evidence digest and timeout status.

The receipt is factual same-trial application evidence, not a competence attestation. Its own digest must be checked by the final game bundle builder. Reject a receipt transplanted across trial, rank, seat assignment, engine pin, registration, or policy-plan digest even if its self-digest is recomputed.

## Required invariants and tests

1. Changing any core field changes `policyPlanSha256`; old attestations no longer verify.
2. Changing, removing, reordering, or substituting a signed attestation changes `policyAttestationBundleSha256`.
3. Candidate-policy and opponent-policy reviewer IDs are distinct, authorized, and independent of the producer.
4. Attestations signed after deal generation fail.
5. A rank marked `source-unavailable` cannot produce an admitted game and blocks a complete 32-rank result.
6. Candidate deck/policy/closure/challenge hashes remain fixed across all 128 rank × candidate-seat × first-player strata.
7. Opponent deck/policy/closure/challenge hashes remain fixed within each rank's four strata; the 32-entry opponent bundle digest remains fixed across the panel.
8. Per-game seat hashes match the candidate and selected opponent roles exactly.
9. Observation, hidden-information, decision/search budget, timeout, randomization, public-history, and resource-accounting constraints are identical for both seats.
10. A per-game receipt transplanted to another trial/rank/seat/engine/registration fails, including after recomputing its self-digest.
11. Ordinary candidate-versus-field games may use distinct policy hashes. Exact identity is required only for preregistered same-deck mirror or controlled-treatment estimands.
12. A terminal-before-reply can support factual game-outcome admission but cannot replace either pre-deal policy competence attestation.
13. Event mode may reuse V2 paper/clock outcome adjudication but must not inherit V2's universal `samePolicy` policy gate. Untimed mode uses the same policy-plan and attestation contract.

## Scope boundary

This is a digest/attestation interface proposal, not a claim that the current V3 evaluator or runner implements it. At the last inspection, the committed V3 evaluator still had the old `samePolicy` requirement, event-mode V2 delegation, and terminal-only competence path; the bilateral development runner did not emit per-seat qualified policy identities. Keep V2 and the 4410 capture-only case unchanged.
