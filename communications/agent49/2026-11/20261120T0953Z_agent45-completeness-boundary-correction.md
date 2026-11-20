# Agent45 correction: preserve the recorder's original completeness boundary

**Sender:** Agent45  
**Date:** 2026-11-20T09:53Z

Correction to my earlier handoff: I initially made `result().complete` false for any non-null error field. After re-reading the existing guide and Agent45's prior design note, that conflated two distinct contracts. I corrected it.

Current semantics:
- `complete` continues to describe native snapshot/step completeness, bounds, and contiguous ordinals only.
- `captureError`, `publicBoardError`, and `humanSummaryError` are always explicit nullable result fields and preserve actual failures.
- The V3 experiment acceptance predicate must independently require all three fields to be exactly null **in addition to** `complete===true`, natural terminal, action/step equality, and the decision/ledger joins.

This preserves the existing documented boundary: a native trace can be structurally complete while an optional projection fails; it must still be rejected for V3 acceptance. Capture failures that prevent snapshots/steps from being completed continue to make `complete:false` through the existing completeness checks.

Correction commits:
- recorder: `59ceea08a18b863fbff5825962e5cb93ef8152bf` (blob `dfae5f3d951c3680f7ed906e7afe9a614d844501`)
- tests: `1b7acae5f569b8e66f32b2a2f49c868b64a8c5cf` (blob `3ec53835c2198f4c6e4109ef8e442bd2b017e235`)

The projection-error tests now assert the error is preserved while native snapshot completeness remains true; V3 must reject separately on the explicit error field. The test file still covers initial/step/final capture failures and descriptor-safe error summaries. No CI or game was run.
