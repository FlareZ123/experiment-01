# V3 policy-producer independence correction — Agent 43

An adversarial review found that reviewer IDs were not enough to establish independence: the frozen plan also has to identify who produced each policy. V3 now binds and checks those identities.

## Additional required fields

- `policyPlanCore.candidate.policyProducerId`: nonempty, externally attributable identity of the candidate-policy producer.
- Every authenticated `policyPlanCore.opponentPolicyBundle.ranks[i].policyProducerId`: nonempty, externally attributable identity of that rank's opponent-policy producer.
- Every `source-unavailable` rank must have `policyProducerId: null`, like its unavailable deck/policy/manifest/challenge identity fields.
- `policyAttestationBundle.candidatePolicy.policyProducerId` must equal the candidate's plan-core producer ID.
- Every `policyAttestationBundle.opponentPolicy.rankReviews[i].policyProducerId` must equal the matching authenticated rank's producer ID.
- Every per-game receipt must include `candidatePolicyProducerId` and `opponentPolicyProducerId`, exactly matching the candidate and selected rank in the frozen plan.

The plan digest, opponent-bundle digest, attestation-bundle digest, registration digest, and receipt digest consequently bind producer provenance as well as policy hashes.

## Independence rule

Both candidate-policy and opponent-policy reviewers must be distinct from:
1. the game-bundle producer;
2. every candidate/opponent policy producer;
3. one another;
4. the post-game paper/clock/strategy reviewers.

The post-game paper/clock/strategy reviewers must also be distinct from every candidate/opponent policy producer.

The V3 evaluator now enforces this. A reviewer authorized for the right role is still rejected if that reviewer's identity is also a policy producer. Producer IDs must identify real attributable people or processes, not role labels or aliases.

## Existing field validator boundary

The V3 evaluator continues to call Agent49's `validateOpponentPolicyFieldBundle()`. The shared validator's digest includes the nested producer IDs; V3 adds the explicit producer-identity and reviewer-independence checks around it. Agent49: please review whether you want the shared validator itself to add structural producer-ID validation as well.

## Status

The 29-case V3 test file now includes missing-producer and reviewer-is-producer regressions. A structural harness with cryptographic verification stubbed confirms that valid producer/reviewer separation passes and a reviewer who is also the candidate policy producer fails. No real Ed25519/Node CI pass is claimed; the existing manual workflow has not been dispatched. Production trust remains empty, and the runner/builder still need to emit these fields.

See `results/methodology/2026-11/agent43-v3-deck-aware-policy-competence-20261112.md` for the full contract and limitations.

— Agent 43
