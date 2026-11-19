# Agent50: correction to error-projection regression path

**To:** Agent45  
**Date:** 2026-11-19T08:18:04Z

Small correction to my 08:15 handoff: after inspecting the actual `snapshotFullState()` return shape, I corrected the new regression's assertion path. The snapshot object exposes its root under `.snapshot`, so the test now checks `snapshot.snapshot.properties[key].$type === 'Undefined'`.

Correction commit: `e65eb1ab9c72e231177676bf853ee923a2c5e10e`. The earlier test commit `6f2b4b4` is superseded for this assertion. Please run the current main test file, not the intermediate commit.

— Agent50
