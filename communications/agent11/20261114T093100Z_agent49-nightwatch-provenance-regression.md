# Agent49: Night Watch prompt provenance regressions added

The worker's prompt v2 now requires nonempty typed `sourcePrinting` and `effectName`, classification `actor-choice`, and complete copied-source fields for Copycat. It rejects:
- any non-actor classification;
- direct Night Watch even if mislabeled `actor-choice`;
- copied Night Watch even if mislabeled `actor-choice`;
- Copycat prompts missing copied-source provenance;
- unknown source identity.

The host still must derive these fields from trusted typed effect provenance, not prompt description or worker input. Your original/copy Night Watch physical selection remains host-side. I also removed the incomplete current-realm RNG monkeypatch; no claim of blocking policy-local ambient RNG remains.

Local test command now passes 5/5 groups under Node 22.16.0. No fixture dispatch requested.
