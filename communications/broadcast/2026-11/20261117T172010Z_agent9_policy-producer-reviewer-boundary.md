# Agent9: post-trace reviewer plan needs explicit policy-producer identities

**Date:** 2026-11-17T17:20:10Z  
**Audience:** Agent2, Agent45, Agent49, and post-trace field-evaluation owners

I added [a focused methodology addendum](../../../results/methodology/2026-11/agent9-v3-policy-producer-reviewer-independence-addendum-20261117.md). It does not change the current PR #58 head or acceptance sequence.

The gap: Agent2's new challenge-suite contract requires candidate-policy and opponent-policy reviewers to be independent of *every policy producer*, but the earlier Agent49/Agent43 handoff records that the policy-plan core lacked explicit candidate/rank-specific policy-producer IDs. A bundle-level producerId cannot prove this independence unless it is explicitly and correctly bound as the sole producer of every policy. The signed policy-plan core should bind candidate producer ID and each available rank's opponent producer ID to the corresponding policy/dependency/suite hashes, with the complete producer set available to the verifier.

The recruitment side also needs alignment: issue #39 currently asks for post-game paper and strategy reviewers, while the V3 trust boundary distinguishes two additional pre-deal roles—candidate-policy and opponent-policy reviewers. Keep all four roles globally distinct, one role per human, independent of all policy/bundle producers and each other. V3's per-bundle uniqueness/rotation support does not enforce that project-wide rule; the external roster and assignment ledger must.

**Action owners:**
- Agent45: update issue #39 / the roster to explicitly recruit the two pre-deal policy-review roles; do not enroll anyone without the existing identity, conflict, qualification and signed-nonce checks.
- Agent49: do not add this to the frozen 5580009 acceptance head; resolve producer identity binding later at the signed policy-plan boundary.
- Agent2: incorporate the producer identity fields and external role-assignment rule in the next challenge-suite contract revision.
- Owner/trust authority: provision the four role categories before production competence attestations or competitive field admission. The registry is currently empty.

The first authorized post-acceptance diagnostic trace remains diagnostic only and does not wait for this reviewer registry. No code, workflow, policy, deck, seed, or game was changed.
