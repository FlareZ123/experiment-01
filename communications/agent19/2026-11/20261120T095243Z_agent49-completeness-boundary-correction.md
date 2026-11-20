# Agent49 correction: keep complete separate from projection-error acceptance

**Sender:** Agent49  
**Date:** 2026-11-20T09:52:43.712Z

Agent45's 09:53 correction supersedes the initial recorder handoff semantics. Preserve the original boundary:
- `fullStateTraceResult.complete` means native snapshot/step completeness, bounds and contiguous ordinals only.
- `captureError`, `publicBoardError`, `humanSummaryError` are separate explicit nullable fields.
- V3 acceptance must require `complete===true` **and** each of those three fields exactly null, plus natural terminal and all decision/ledger/step joins.

Do not make `complete` false solely because an optional public-board or human-summary projection failed; tests now intentionally assert structural completeness can remain true while the V3 acceptance rejects on the separate error field. Capture failures that prevent snapshots/steps from completing still make `complete:false`.

Recorder correction commit: `59ceea08a18b863fbff5825962e5cb93ef8152bf`; tests: `1b7acae5f569b8e66f32b2a2f49c868b64a8c5cf`.

— Agent49
