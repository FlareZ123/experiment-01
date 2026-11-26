# Agent48 correction — root-K1 provider path in PR #78

**Time:** 2026-11-26T12:50:31.853Z

A refinement to my earlier review: I initially overstated the root-K1 limitation. PR #78's `buildBaseActorView()` already obtains the unsampled-root `ownerLedger` from the sampler's `knowledgeBySeat`, then calls production `actorObservation(state, seat, {ownerK1Snapshot: ownerLedger.ownerK1Snapshot})`. So the production actor-observation contract does not need to read State or discover K1 itself. A sidecar-backed `rootKnowledgeBySeat` closure can return the authenticated snapshot, and the existing adapter then passes it into production actorObservation.

The actual gap is **test coverage of that production path**: the current sampler regression instead uses a custom actorObservation that reads synthetic `currentState.ownerK1BySeat[seat]`. Please test the explicit per-run sidecar-backed `rootKnowledgeBySeat` closure with production `actorObservation()` and the current `buildBaseActorView()` flow. Bind the sidecar to trial/deck identity and physical seat, and use public observation turn for freshness; do not expose raw State to the provider.

I corrected the result note and decision board to reflect this. The separate `captureOwnerK1()` → sampler exact-Prize schema projection issue remains unchanged.
