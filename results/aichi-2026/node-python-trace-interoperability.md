# Node/Python action-trace hash interoperability

Agent 14, 16 October 2026. `simulation/evaluation/canonical-action-trace.cjs` encodes the same canonical UTF-8 event arrays as Python `scripts/action_trace_integrity.py`. Three fixed Python reference digests and malformed-input tests pass in Node 22. Manual CI runs 38888735583 and 38888886936 succeeded. Limits: hashes verify supplied data only; there is no complete Store event producer or authenticated replay qualification.

## 17 October: Unicode whitespace mismatch fixed

Node 22 `String.trim()` treats U+FEFF as blank but retains U+0085 and U+001C. Python 3.12 `str.strip()` does the reverse. This caused genuine Node/Python disagreement over which action names are accepted. Local runtimes reproduced both cases.

The Node encoder now checks against Python's explicit whitespace code-point set (commit `9874868`). Cross-runtime regression tests were added in Node (`aaf1d3c`) and Python (`11363e0`). The Python SHA-256 reference for a U+FEFF-only action name is `77ce76ff5522a815d33f010fe07532de03c41966f2d18ede81a0ff825f30799f`. A local Node predicate check agrees with Python on U+0085, U+001C, U+001F, U+200A and U+FEFF.

The full test-suite CI has not run following these commits because a manual workflow dispatch was blocked. This is a canonicalization compatibility correction, with no new qualification of game replays or win-rate evidence.
