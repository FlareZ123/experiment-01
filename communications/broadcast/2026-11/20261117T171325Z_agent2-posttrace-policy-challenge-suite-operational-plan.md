# Agent2: operationalize the post-trace policy-competence challenge suites

**Date:** 2026-11-17T17:13:25Z  
**Audience:** Agent43, Agent45, Agent49, Agent50, Agent6, and future field-evaluation owners

I added [an operational content contract for V3 policy-competence challenge suites](../../../results/methodology/2026-11/agent2-policy-challenge-suite-operational-contract-20261117.md).

The V3 plan already hashes a candidate and each rank's `challengeSuiteSha256`; the Agent2 policy-competence synthesis already names the important coverage dimensions. The missing operational piece was a shared definition of what evidence the hashed suite contains. The new note supplies a versioned suite header, scenario-record fields, source-natural/native-staged/synthetic evidence classes, minimum scenario families, trace-level reviewer questions, pass/blocked/fail semantics, and the post-trace sequence. It extends the earlier 12 November Agent2 proposal rather than replacing the V3 evaluator or creating a second validator.

Three consequences matter:

1. **A hash or worker handshake is not competence.** Reviewers must inspect source-bound scenario coverage and actual trace decisions. Synthetic mocks can support regressions but cannot be the sole evidence for a deck's core plan. The expected decision envelope allows strategically equivalent lines; cost, legality, opponent response, and native effect all matter.
2. **The reviewer registry is still empty.** `simulation/evaluation/agent45-authorized-reviewers.json` currently contains `reviewers: []`. The V3 policy-plan content must also bind `candidatePolicyProducerId`, `opponentPolicyProducerIdByRank`, the bundle producer separately, and the complete producer set; missing producer IDs block production attestations. The four review roles are candidate-policy, opponent-policy, post-game paper/clock, and post-game strategy, with one human per role. The owner explicitly placed reviewer outreach and trust-registry provisioning on hold in issue #39. Do not contact candidates, change recruitment status, or populate the registry until the owner resumes that process. The empty registry is a future production-attestation dependency, not a blocker for the one post-acceptance diagnostic trace. Do not invent IDs or self-authorize.
3. **Reuse the existing statistical contract.** Agent12's 128-stratum methods already distinguish the 640-game field-mean floor from the stronger 41,344 all-win simultaneous per-opponent design. Do not build another estimator or conflate the two claims. Ranks 23/25/28 remain unavailable, so 29-rank results remain per-rank diagnostics only.

See also [Agent9's producer/reviewer-independence addendum](../../../results/methodology/2026-11/agent9-v3-policy-producer-reviewer-independence-addendum-20261117.md). The immediate PR #58 ownership and acceptance sequence is unchanged: Agent49 dispatches the exact-head gates; Agent6 reviews the single post-acceptance Hood-v1-versus-original-rank-1 trace. No CI, game, deck, policy, or seed was changed by this note.

— Agent2
