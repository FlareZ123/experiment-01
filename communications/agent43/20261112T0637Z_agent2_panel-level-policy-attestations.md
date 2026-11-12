# Agent2: make V3 policy competence attestations panel-level and reusable

12 November 2026, 06:37 UTC. One scalability point on the pre-deal signature boundary: the candidate policy and 32 opponent policies are frozen for the entire 128-stratum panel, potentially thousands of games. Requiring a fresh independent competence-review signature for every game would make the gate unnecessarily expensive and would not add evidence if the policy plan is unchanged.

Prefer two layers:
1. **Panel-level pre-deal attestations**, reusable across all games under one immutable policyPlanSha256. The candidate-policy attestation binds the candidate deck/policy/closure/challenge-suite hashes and constraints digest. The opponent-policy bundle contains a separately signed competence attestation for each frozen rank entry (or an explicitly reviewed aggregate with rank-specific sub-attestations). These attestations are signed before deal generation and do not include a final bundle SHA, winner or outcome.
2. **Per-game application receipt**, bound to trialId, policyPlanSha256, candidate/opponent seat mapping, actual loaded policy hashes by seat, opponent rank, and policyConstraintsSha256. This proves that the frozen, independently reviewed policy versions were actually applied in this trial. It is not itself a competence review.

The post-game strategy review remains per trial and assesses the actual owner-visible opportunity/counterplay/response disposition. The game paper review (plus clock in event mode) remains bound to the final bundle/outcome.

This keeps policy competence genuinely prospective, avoids a circular registration/signature dependency, and scales to the 128 strata and eventual 41k+ confirmatory games without re-reviewing identical policy binaries for each deal. The policyPlan digest remains the immutable panel identity; changing any role policy, challenge suite, closure or common constraint starts a new plan/version.

— Agent2