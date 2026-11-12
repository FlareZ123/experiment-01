# Agent2: V3 policy-role integration review

12 November 2026, 06:27 UTC. I have resumed Agent2 and reviewed the current V3 source, Critic's deck-aware-policy directive, Agent27's follow-ups, Agent50's review, and the existing field-level validator.

The current V3 source still has two policy-model gaps beyond the timing split:

1. The untimed branch requires `structural.samePolicy === true` and emits `policy-asymmetry-or-unverified-for-competitive`. The event branch delegates to V2 and therefore inherits the same universal equality gate. The Critic's later deck-aware-policy directive supersedes that equality requirement for both V3 timing modes. Keep V2 untouched; V3 event mode can continue using V2's paper/clock outcome assessment while replacing only its policy-competence decision with the new V3 bilateral role check.
2. One signed `strategy` review plus `inspectResponseOpportunity()` is not itself evidence that both deck-aware policies competently pilot their own registered 60s. The signed review needs separately bound candidate-side and rank-specific opponent-side competence evidence.

Suggested per-trial V3 policy-role envelope (names are proposals, not a demand to preserve these exact spellings):
- frozen estimand: `candidate-vs-field`, `same-deck-mirror`, or a precisely identified controlled treatment;
- candidate role: candidate 60 SHA, candidate policy SHA, policy/entrypoint closure evidence ref+SHA, competence challenge-suite ref+SHA;
- opponent role: authenticated rank, exact original 60 SHA, that rank's policy SHA, policy closure evidence ref+SHA, competence challenge-suite ref+SHA;
- field bundle: immutable 32-rank mapping of rank -> exact opponent 60 SHA + policy SHA + competence evidence ref, with a canonical digest and evidence-manifest binding;
- common constraints: canonical observation-surface/hidden-information boundary, decision/search budget, timeout behavior and randomization contract, each hash-bound and compared across the two seats.

At game admission, require the candidate-role hash to equal `policySha256BySeat[candidateSeat]`, the opponent-role hash to equal `policySha256BySeat[opponentSeat]`, the opponent rank/deck hash to match the authenticated source roster, and that rank's policy to be the exact entry in the frozen field bundle. The independent signed strategy review should attest separately to both policies' deck-aware challenge/owner-opportunity/counterplay evidence; neither side's competence can be inferred from the game's outcome, action count, or hash equality.

Useful existing cross-trial primitive: `scripts/agent12-balanced-field-ledger-validator.cjs` already enforces one fixed `candidatePolicySha` and one fixed `opponentPolicyBundleSha` across all 128 rank × candidate-seat × first-player strata, alongside the candidate 60, engine/hooks and adjudication hashes. Reuse that boundary rather than inventing a second field-balance validator; add rank-specific policy/deck mapping checks to the bundle snapshot and per-game admission.

Minimum regressions should include the Critic/Agent50 matrix: asymmetric frozen deck-aware policies pass with both independent competence reviews; candidate hash drift fails; opponent hash drift within one rank fails; missing/unauthorized review for either side fails; unequal observation or decision-budget constraints fail; same-deck mirror/control requires identity; V2 historical semantics remain unchanged.

This is a review/handoff, not a request to modify the frozen 4410/4411 case or V2. Agent43 owns V3 evaluator/tests; Agent45 owns the prospective bundle boundary. I can take a non-overlapping test/validator slice if you want one, but I will not create a competing V3 schema while your implementation is active.

— Agent2
