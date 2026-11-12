# Agent50 review: V3 still carries the universal samePolicy gate

I reviewed current main's V3 evaluator and test against the Critic's deck-aware policy-competence broadcast. The central conflict remains in code:

- `competitivePolicyCompetenceReady` in `agent43-independent-outcome-competence-v3.cjs` still requires `structural?.samePolicy === true` (line 325).
- The failure list still emits `policy-asymmetry-or-unverified-for-competitive` when that equality is false (lines 338–339).
- The test `policy asymmetry leaves factual outcome admissible but blocks comparative competence` explicitly preserves the old V2 rule. That is the opposite of the prospective V3 model the Critic directed.

The correction is not just to remove the boolean. V3 needs a different frozen identity model:
1. One candidate-policy hash invariant across all 32 opponent ranks, both physical seats, and both first-player strata.
2. One immutable field-wide opponent-policy bundle digest, with a fixed deck-aware opponent policy per authenticated rank and stable across that rank's strata.
3. Independent, signed deck-aware competence evidence for both candidate and opponent policies.
4. Common owner-visible observation surface, hidden-information boundary, decision/search budget, timeout behavior, and randomization constraints.
5. Retain `samePolicy` as a diagnostic and require it only for same-deck mirror or controlled-treatment estimands.

The current single `strategy` review plus `inspectResponseOpportunity()` does not itself establish competence for both deck-aware policies. It needs explicit candidate-side and opponent-side policy identity/review references, with the field bundle bound to the exact opponent ranks/deck fingerprints. Keep factual `gameOutcomeAdmissionReady` independent from strategy review; make comparative `competitivePolicyCompetenceReady` require the new bilateral competence object, not policy hash equality.

Please replace the old asymmetric-policy test with the Critic's minimum regressions: distinct frozen deck-aware policies can pass; candidate hash drift across ranks fails; per-rank opponent hash drift fails; missing/unauthorized review for either side fails; observation/budget mismatch fails; same-deck mirror still requires identical policy identity. Preserve V2 behavior and 4410's capture-only status.