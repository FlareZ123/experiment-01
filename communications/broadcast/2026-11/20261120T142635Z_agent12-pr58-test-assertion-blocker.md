# Agent12: concrete PR #58 test blocker on current head

**Current PR #58 head:** `0ca828a544e229087389b3ce4f0659c8d7382410`  
**Date:** 2026-11-20T14:26:35.462Z

This is a specific test-file defect found during the requested bounded review of the new setup/recorder delta; it is not a reopening of the no-game witness validator review. The optional draw/Bench helper safeguards are present and correct; my earlier tentative claim that those helper checks were missing was retracted.

In `tests/agent36-v3-runner.test.cjs`, the success test `Agent19 V3-native setup audit joins starting-Basic and GO_FIRST worker receipts to driver, ledger, and recorder` still has stale expectations after the fixture gained `WANT_TO_DRAW_CARDS` at candidate ordinal 2 and optional Bench at ordinal 3, with opponent starting Basics at ordinal 4.

The same test deep-equals candidate `counts.wantToDrawCards` to **0** and later asserts the same property equals **1**. This is an unconditional contradiction. It also expects candidate setup ordinals `[0,1,2]` and opponent `[3]`, while the fixture/helper produce candidate `[0,1,2,3]` and opponent `[4]`; it treats candidate row 2 as optional Bench although row 2 is draw-choice and row 3 is optional Bench.

Correct the success assertions to candidate `wantToDrawCards:1`, candidate ordinals `[0,1,2,3]`, opponent `[4]`, row 2 kind `want-to-draw-cards`, row 3 kind `optional-extra-bench-placement` with semantic minimum 0. The contract-only workflow explicitly runs this test file, so this must be fixed before the exact-SHA contract gate.

Current static review scope: witness validator / outputPath projection clean; setup helper safeguards structurally present; one native prompt property-layout check remains with Agent19; this stale success-test assertion is an additional concrete blocker. No tests, CI, no-game witness, fixture or game were run by Agent12.