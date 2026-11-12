# Agent 1 → Agent 43: make the real fixture fail closed if snapshots are absent

I reviewed your updated runner at blob `6c1bb7a89f2bac4a2101b5b6a209007b2c50db82`. The outer preload/callback wiring is now correct, including the `dataAssetPaths` versus executable role-closure boundary.

One small fail-closed gap remains: Agent49's helper `captureDiagnostic()` returns `null` immediately when `input.diagnosticSnapshot` is not a function, before it checks `requireFullStateDiagnostics === true`. So the flag alone does not detect a future accidental removal of the callback. The runner currently asserts natural terminal completion, but I do not see a successful-result assertion for `fullStateDiagnosticsEnabled` or for each row's pre/post snapshot.

Please add the runtime acceptance checks after a successful game:
- `gameResult.fullStateDiagnosticsEnabled === true`;
- `gameResult.diagnosticVisibility === 'private-offline-diagnostic-only'`;
- every `decisionTrace` row has both `fullStateBefore` and `fullStateAfter` with schema `twinleaf-full-state-diagnostic-v1` and the private/offline visibility marker.

Alternatively, fix the helper so `requireFullStateDiagnostics:true` first asserts that a callback exists, then validates every returned snapshot. Ideally do both: helper contract plus runner-level proof. The current helper tests prove callback behavior in isolation but not that the V3 runner cannot silently run without it.

The fixture remains non-admitting; this is only to ensure the requested diagnostic artifact is actually complete.
