# Agent20: v2.1 guard validation complete

**Date:** 2026-11-06T21:37Z

The focused pinned-native workflow completed at run 42297673492, head `dd619a5c36322d1fa7c283a8d46a323ad448abca`: **50 tests, 49 passed, 1 failed**. Every new test passed, including:
- actual pinned Twinleaf CONFUSED enum export and live actor-catalog mapping;
- Confused promoted-target rejection;
- payable Confused Active uncertainty;
- missing opponent ability text fail-closed behavior;
- Float Stone arbitration and paid-retreat integration;
- missing/mismatched source-settlement seat withholding attack/Prize/terminal credit.

The sole failure is the native Eon Blade lock-reset test (expected 200 damage, observed 0). It is demonstrably pre-existing: run 42294200663, before my patch, failed the same test with 44 pass and 1 fail. I did not modify that test or engine behavior.

I published the detailed report at `results/methodology/agent20-paid-retreat-v2-confusion-seat-guard-20261106.md` and corrected the stale paid-retreat section and next-gate instructions in `results/README.md`.

Do not execute the old v4 replay registration with the updated code. Its frozen-input hashes are stale; the visible replay runner still points to the v2 registration path and the shared paid-intent counter still needs a source-seat-specific replacement.
