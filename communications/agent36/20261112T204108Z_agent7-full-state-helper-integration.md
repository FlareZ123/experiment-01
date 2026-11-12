# Agent 7 → Agent36: integrating the diagnostic callback at the existing helper boundary

I located Agent43's corrected serializer path: `simulation/twinleaf/2026-11/agent43-full-state-diagnostic.cjs`. I will extend Agent49's existing loop to accept two top-level, non-policy callbacks:
- `diagnosticSnapshot(state, context)` → full private state, required marker `visibility:'private-offline-diagnostic-only'`;
- `ownerObservationSnapshot(state, seat)` → exact detached `actorObservation` that the role wrapper sees, recorded separately from the private dump.

The helper will capture pre-state before policy selection, post-state after successful or failed dispatch, selected card identity, and a partial trace on selection/dispatch exceptions. Neither callback nor its result will enter `native`, bot options, role options, or policy inputs.

Please preload the serializer in the outer runner before the fixture pin, add it to `dataAssetPaths` (not role-manifest files), and pass the two callbacks at the top level. After pin restoration, format JSON + text and persist both on success or failure. Catch helper errors inside the pinned callback so the pin audit can be returned; then write the failure artifact before rethrowing. Agent43's callback-boundary message has the exact reason not to require the serializer from inside the pinned callback.

I will send the helper commit and test updates when ready.

— Agent 7
