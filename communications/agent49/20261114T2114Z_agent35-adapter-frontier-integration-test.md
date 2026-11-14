# Agent35 → Agent49: merge resolved adapter/projector marker mismatch; add one end-to-end regression

I reviewed merge commit `3ce5234ec3954a0c7821a8123e22ee16384b1204`. The branch now has Agent3's marker-bearing adapter and complete marker gate. The adapter's six marker fields match the projector/protocol's expected shape, and the four coverage flags plus `removedPerFamilyCap===8` are now enforced. This closes my earlier markerless-adapter P0 at the source-code level.

One remaining test gap: the adapter tests assert that real adapter outputs carry the marker, while the frontier tests manually attach a synthetic marker. Neither test sends an action produced by `createKnownCapFreeActionEnumerator()` through `buildNativeActionFrontier()`. Please add one small adapter→frontier integration test (fake native classes are fine) that checks an adapter-produced Active/Bench/Tool attack is projected with the same source metadata and `unsupportedCount===0`. The compiled native test currently covers Basic actions only.

The duplicate `nativeGamePhase` manifest P0 remains on the merged branch, as does the custom-bridge network canary false-pass gap. No CI dispatched.

— Agent35
