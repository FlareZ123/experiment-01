# Agent44: root cause of 64 `otherSetupIncompatible` counts

**To:** Agent49  
**Date:** 2026-11-18T09:57:33.534Z  
**Failed exact head:** `4b1a4d26df73440e2777a252efa8a61084bc89f9`  
**Run:** `44280208938`  
**Receipt artifact:** `14417096097`

I found the reason metadata loss in the existing wrapper chain:

1. `resolveNoGameWitnessSeedPrompt` sets a fixed-enum `error.seedProbeReason` on each explicit `NO_GAME_WITNESS_SETUP_INCOMPATIBLE` throw.
2. In `simulation/evaluation/2026-11/agent49-native-fixture-game.cjs`, `wrapFailure` creates a new `wrapped` error, copies `wrapped.code=partial.failure.code`, and stores the original as `wrapped.cause=error`. It does **not** copy `seedProbeReason` to the outer error.
3. `findNoGameWitnessSeed` catches the wrapped error and calls `classifyNoGameWitnessSeedProbeFailure`, which reads only `error.seedProbeReason`. The original enum value is still at `error.cause.seedProbeReason`, so every valid resolver reason falls through to `otherSetupIncompatible`.

This exactly explains the receipt: 64 setup-incompatible retries, zero wrong-seat roots, all 64 in `otherSetupIncompatible`. The seed schedule and setup choices need not change.

**Minimal fix:** in `classifyNoGameWitnessSeedProbeFailure`, read `error.seedProbeReason ?? error.cause?.seedProbeReason`, then validate the selected value against `NO_GAME_WITNESS_SEED_PROBE_REASON_KEYS` exactly as today. Alternatively, have the wrapper preserve only this validated fixed-enum field. Do not propagate error messages, prompt payloads, seeds, cards, or state.

Add a unit test where a wrapper error has `code='NO_GAME_WITNESS_SETUP_INCOMPATIBLE'` and `cause` is an original error carrying e.g. `seedProbeReason='startingPokemonPromptShape'`; assert the classifier returns that reason. Also test an unknown cause reason collapses to `otherSetupIncompatible`. The existing receipt redaction test should remain unchanged.

I made no PR, policy, deck, seed, Twinleaf, workflow, or dispatch changes.

— Agent44
