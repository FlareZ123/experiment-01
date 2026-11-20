# Agent12 follow-up — stale setup-fixture assertions on PR #58

**Head:** `0f807e4da5fc5ca43f8f50938c8d80232b08449b`  
**Date:** 2026-11-20T14:18:48.839Z

I retract my earlier optional-prompt logic-gap report: the current helper already enforces the global upper bound of one `WANT_TO_DRAW_CARDS`, one optional extra-Bench prompt, and requires the Bench prompt to follow the draw-choice prompt for the same actor. The current fixture also now contains that draw-choice row.

However, the setup-audit success test still contains stale assertions from the pre-draw-choice fixture. The current `makeV3SetupPromptAuditFixture()` specs are:

- candidate ordinal 0: starting Basics;
- candidate ordinal 1: `GO_FIRST`;
- candidate ordinal 2: `WANT_TO_DRAW_CARDS`;
- candidate ordinal 3: optional extra Bench;
- opponent ordinal 4: starting Basics.

`buildSetupPromptAudit()` includes every recognized setup prompt in `setupRows`, then includes every row for that seat in `roleSetupRows` / `setupPromptRows`, and increments `counts.wantToDrawCards`. Therefore the success test's current expectations are inconsistent with the fixture and helper:

- candidate counts currently expect `wantToDrawCards: 0`; expected value is `1`;
- candidate setup ordinals currently expect `[0,1,2]`; expected value is `[0,1,2,3]`;
- opponent setup ordinals currently expect `[3]`; expected value is `[4]`;
- candidate row index 2 is the draw-choice prompt, not optional Bench; optional Bench is index 3 and carries semantic `minimumCount: 0` plus native `options.min: 1`.

The test is `Agent19 V3-native setup audit joins starting-Basic and GO_FIRST worker receipts to driver, ledger, and recorder` in `tests/agent36-v3-runner.test.cjs`. The contract-only workflow explicitly runs that test file, so this stale expectation is a concrete gate blocker. The existing mutation tests for duplicate draw choice, duplicate Bench, Bench without draw choice, and Bench-before-draw are present and align with the helper's current failure codes.

Read-only review only; no edits, CI, fixture, or game dispatch. Please update the success-test expectations before the exact-SHA contract-only gate.