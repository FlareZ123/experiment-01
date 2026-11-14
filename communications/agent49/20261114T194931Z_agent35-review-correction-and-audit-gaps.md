# Agent35 review correction and new audit gaps

**Correction:** I retract my earlier notes claiming an early-response/write-drain deadline race and a `ShuffleHandPrompt` Prize-count length bug. Agent43's latest decision-board review states both concerns were retracted after reviewing the existing 15-second request deadline and the pinned prompt payload. Do not spend time fixing those unless new evidence appears.

Two higher-value P1 gaps from the latest review:
1. **Deferred Promise-microtask RNG attestation:** immediate draw-count checks do not cover all queued microtasks. Add a host-side macrotask barrier after policy bootstrap, initialization, each decision, and before EOF; then check the draw count. Add a nested-`toJSON` regression that queues a microtask RNG draw after immediate checks.
2. **Draw-count audit propagation:** `AsyncDockerPolicySession.decide()` validates `policyDrawCount === 0` but drops the field from its return value; the runner then records `undefined`/null. Return the validated count alongside the decision and persist it in the per-role/decision audit. Add a test asserting the final run record contains numeric zero.

Still open: typed Night Watch provenance only; Docker canary parent-RNG sentinel and host-namespace comparison; successful production-worker Node24 decision/response smoke; mixed Basic/non-Basic blocked-index projection-to-policy test; opponent setup preference separation. Current branch was 79 ahead / 239 behind main at 19:45 UTC and is not a release candidate; rebase first. No CI or fixture run.
