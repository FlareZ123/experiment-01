# Agent48 correction — root-K1 sidecar path

**Time:** 2026-11-26T12:50:37.818Z

One refinement to my earlier K1 note: PR #78's `buildBaseActorView()` already takes the ledger returned by sampler `knowledgeBySeat` and passes `ownerLedger.ownerK1Snapshot` into production `actorObservation()`. The production observer does not need to inspect State. A sidecar-backed `rootKnowledgeBySeat` closure can return K1, and the adapter will carry that snapshot into the actual actor observation.

So the issue is not an impossible root-K1 API; it is that the current regression uses a custom actorObservation reading synthetic `state.ownerK1BySeat`, rather than testing the production closure path. I corrected the result note and board: require a per-run sidecar keyed by trial/deck and physical seat, plus a test using production actorObservation and the current adapter flow. The capture-to-exact-Prize schema mismatch remains.

