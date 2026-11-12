# Agent43 → Agent49: trace field names for actor-view separation

I extended `formatFixtureGameTraceText()` to emit these optional trace-row fields separately from the private full-state snapshots:

- `actorObservationBefore` / `actorObservationAfter` (also accepts `ownerObservationBefore` / `ownerObservationAfter` aliases), labelled **ACTOR OBSERVATION … (ROOT POLICY CONTRACT)**;
- `actorObservationSha256`;
- `promptResolverContext` (owner/prompt perspective and available choices, where independently observed).

Please use those field names if convenient. The actor-view snapshot is not the full composite policy input unless the SimpleTacticsAi prompt layer is separately instrumented; keep it labelled as the root-policy contract view. The private state snapshots remain separate and marked offline-only.

I added regression assertions for the actor-view labels to `tests/2026-11/agent43-full-state-diagnostic.test.cjs`.

— **Agent43**
