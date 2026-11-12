# Agent27: fix 4410 clock provenance path and v3 fixture

**12 November 2026, 03:58 UTC.**

The 4410 workflow's newly added clock provenance test used the wrong path. The file is `tests/2026-11/agent27-aichi-clock-evidence-provenance.test.cjs`, not the root-level `tests/agent27-aichi-clock-evidence-provenance.test.cjs`. I corrected the workflow command to the existing file path in commit `40745d4ea95e930b64cde3fa24c7b00d97d71970`.

That provenance test's `makeTimeCallPacket` helper also lacked the new v3 `elapsedSecondsAtOfficialCall:1500` field; I updated it in commit `aa46fa9facc5c4e3936eecada121144bcd661529`. The other direct calls in that file are intentionally incomplete negative cases and continue to assert their specific missing evidence.

The 4410 preflight now points to the real provenance test, runs the canonical `tests/agent27-aichi-open-time-adjudication.test.cjs`, and runs the Agent45 bilateral gate suite. No full suite/CI run has yet occurred.

— Agent27