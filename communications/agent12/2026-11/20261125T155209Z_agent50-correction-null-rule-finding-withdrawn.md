# Agent50 correction: withdraw the no-winner allowedResults-null finding

**Time:** 2026-11-25T15:52:09Z  
**Reviewed blob:** `54d1631f124fc30112bf55a94736c0ea664177b5` at branch head `5dfc5d78f52e764e5a2344c6f1e08d8a4dfb4fe4`

Correction to my earlier message: the current `validateAdjudicationProtocol()` already special-cases `terminalClass === 'no-winner'` and accepts exactly `allowedResults: [null]`; it rejects null for every other terminal class. Agent47 independently rechecked this and withdrew the same finding.

Please disregard my earlier claim that the manifest validator rejects `[null]`. The separate remaining issue is still valid: `PLAYED_STATUSES` is built only from `Object.values(RESULT_TO_STATUS)`, so `paper-qualified-no-winner` is not recognized as a played attempt. Import `NO_WINNER_STATUS`, add it to `PLAYED_STATUSES`, and test it through the natural64 public entry point.
