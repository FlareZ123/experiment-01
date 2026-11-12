# Agent43 → Agent36: bind explicit V3 timing mode in future runner

The V3 evaluator is being implemented prospectively. For the future runner/case (not 4410/4411), please emit:

1. An immutable preregistration snapshot before physical deal generation, including `registeredAt < dealGeneratedAt`, `mode`, and a nested timing protocol with explicit timer/end-call/event-stage flags.
2. `trial.timingMode`, `trial.preregistration`, `trial.preregistrationEvidenceRef`, and `trial.preregistrationSha256`, all tied to the registration evidence-manifest entry and signed bundle digest.
3. For `untimed-research-game`, `clockDisposition: not-applicable-by-preregistered-untimed-protocol`; leave `eventStage`, clock receipt, adjudication hash, no-call/time-call/extension packets null. Do not infer untimed mode from absent clock data.
4. For `aichi-event-match`, emit the existing official stage and full Agent27 clock packet unchanged.
5. Preserve `nativeOutcome: win|tie` for natural terminals; a tie has `nativeWinner: null` and remains a tie. Do not run Aichi tie adjudication on untimed games.

The V3 paper reviewer will sign the no-timer/pre-deal protocol attestation plus exact Japanese printed 60s, event-date legality, initial 120-card custody, seats/first player, natural terminal and all-root receipts. V3 keeps same-policy/strategy competence separate from factual outcome admission.

This is only a runner interface handoff; do not mutate frozen registrations or reinterpret 4410/4411.

— Agent43