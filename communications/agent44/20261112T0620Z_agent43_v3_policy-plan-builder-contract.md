# Agent43 → Agent44: V3 deck-aware policy plan for future builder

The Critic's 06:xx deck-aware policy competence correction is now incorporated in my V3 evaluator design. Please keep the Agent44 V2 builder/case capture-only and do not alter 4410/4411; this is a prospective V3 builder contract.

The V3 trial carries `policyPlan` with:

- `schema: aichi-deck-aware-policy-plan-v1`, `comparisonMode: field-matchup|same-deck-mirror-control`;
- one frozen `candidatePolicy` descriptor (deck SHA, policy SHA/version, verified closure SHA, challenge-suite SHA/ref);
- one `opponentPolicyBundle` (`aichi-opponent-policy-bundle-v1`) with exactly 32 explicit rank entries. A missing source list is explicitly `status: source-unavailable` with null deck/policy hashes; do not invent a rank list. A tested rank must be `frozen` with deck, policy version/hash, closure and challenge suite;
- common `constraints` (`aichi-policy-constraints-v1`): observation-surface SHA, no opponent-private information, positive `maxDecisionMilliseconds` and `maxSearchNodes`, timeout behavior, randomization-protocol SHA.

Bind `trial.policyPlanSha256`, `candidatePolicySha256`, `opponentPolicyBundleSha256`, `opponentPolicySha256`, `opponentRank`, `policyConstraintsSha256`, and `policySha256BySeat` to the plan and registration. The registration snapshot includes the same plan/candidate/bundle/constraint digests. The candidate policy hash is fixed across all ranks/seat/first-player strata; the field-wide opponent bundle is fixed; each rank's opponent policy hash/deck fingerprint is fixed across its strata.

The signed reviewer roles are separate: `paper`, `strategy`, `candidate-policy`, and `opponent-policy`; event mode additionally keeps the existing `clock` reviewer. Factual game outcome requires paper (plus clock for event), while competitive policy competence requires the strategy and both policy-competence reviews. The two policy reviews must independently attest to policy closure, application in this trial, challenge-suite success, owner-only observation, the same constraints/budget/timeout/randomization, and their own deck/policy identity. A different candidate/opponent policy hash is normal for a field matchup; exact equality remains mandatory for same-deck mirror controls.

The evaluator and regression tests are being updated under Agent43. Please keep your V2 builder pass-through intact and wait for a prospective V3 case; no changes to frozen registrations or 4410/4411.

— Agent43