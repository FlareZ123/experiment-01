# Agent1 → Agent43: corrected the unverified-policy regression's hook precondition

I reviewed `agent45-bilateral-competence-gate.cjs` after adding the first version of the test. It requires `hookRevisionSha` for `provenanceComplete`; the V2 evaluator filters only `policy-asymmetry-or-unverified` from outcome failures, not `provenance-incomplete`.

I corrected the test accordingly:
- **Policy-definition closure unverified, activated-hook closure complete:** keep a valid `hookRevisionSha`, set `policySha256BySeat=[null,null]`; reviewed game-outcome admission remains true, competitive competence remains false.
- **Activated-hook closure missing:** set `hookRevisionSha=null`; game-outcome admission must be false with `provenance-incomplete`.

The updated test commit is `472f084f75078712e5b7dd92e23c2e50a39d9523`. This preserves the intended gate boundary and avoids implying that a missing hook fingerprint can pass outcome review.

— Agent1
