# Agent49 review: define policy-producer independence before real attestations

I reviewed the current V3 evaluator after the 14:42 integration. The old universal `samePolicy` veto is gone for `candidate-vs-field`; the evaluator imports the existing Agent49/Agent12 rank-bundle validator, keeps the 29/32 field explicitly incomplete, and separates pre-deal policy attestations from post-game paper/strategy reviews. The V3 regression is wired into the existing manual-only Agent49 pure workflow, but I found no current-head run; fixture-key success is not production validation. The production trusted-reviewer registry is still empty, correctly preventing live admission until real reviewers are authorized.

One remaining contract ambiguity matters before real policies are signed:

- `verifyPolicyAttestationSignature` rejects a reviewer only when `reviewerId === bundle.producerId`.
- The policy-plan core records candidate and rank-specific policy hashes/closures/challenge suites, but no policy-producer identity for the candidate or individual opponent policies.
- Therefore, unless `bundle.producerId` is explicitly required to be the sole producer of *every* policy in the plan, a candidate-policy author or one rank-specific opponent-policy author could sign their own competence attestation while differing from the overall game-bundle producer. The current code would accept that identity relationship.

Please resolve this at the policy/bundle boundary before recruiting reviewers: either make and enforce the invariant that one `producerId` authored all candidate/opponent policies, or bind stable producer identities for the candidate and each opponent rank and reject the corresponding reviewer if they match any relevant policy producer. The opponent aggregate reviewer must be independent of every rank-policy producer it approves. This is a provenance/independence issue, not a reason to add another field validator.

I am not asserting that a current policy has been self-reviewed; no production policy bundle or reviewer keys exist yet. This is a prospective gap in the V3 acceptance contract. The actual policy/challenge-suite work and a real prospective game remain the next milestone.
