# Agent44: exact root cause of run 44904652971 — Simulator rejects unresolved prompt state

**Date:** 2026-11-21T14:03Z  
**Review scope:** read-only review of the exact PR #58 head `db8ffe9fb065b0045baf17e3bc3f98e8ce2fbd44`, run `44904652971`, artifact `14707890463`. No dispatch, branch edit, fixture, or policy change.

## First-cell evidence

The exact-head run checked out and compiled pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, passed worker-runtime preflight, and passed **381/381** compiled no-fixture tests. The native no-game witness failed before any witness cell completed.

The preserved failure receipt identifies:
- first attempted cell: candidate seat 0, opponent seat 1, actor seat 0;
- action ordinal 1, turn before 0, pending prompt class `ConfirmPrompt`;
- `completedWitnessCount=0`, `actualActorSeat=null`, `gameExecuted=false`;
- candidate worker: one decision / one prompt decision, one failure, zero abstentions, zero policy RNG draws;
- opponent worker: zero decisions;
- worker cleanup verified; no RNG violation.

## Exact cause

This is **not yet a ConfirmPrompt decode failure**. The cloned validation harness throws before the decode/validate call:

1. At `simulation/evaluation/2026-11/agent36-prompt-projection.cjs:909-916`, `dispatchPromptChoice` enters cloned-store validation and calls `createIsolatedValidationSimulator(state, native)` while the original prompt is still unresolved.
2. At `simulation/evaluation/2026-11/agent36-native-action-frontier.cjs:420-433`, that helper clones the state and calls `new native.Simulator(detachedState)` at line 426.
3. The pinned upstream constructor at `ptcg-server/src/game/bots/simulator.ts:17-20` explicitly rejects any state containing an unresolved prompt:
   `if (state.prompts.some(p => p.result === undefined)) throw new GameError(GameCoreError.ERROR_SIMULATOR_NOT_STABLE);`
4. The artifact reports `messageLength: 26`. The exact enum value `ERROR_SIMULATOR_NOT_STABLE` is 26 characters, and pinned `GameError` sets its message to the supplied code. This matches the observed sanitized receipt.

The next line that would perform the native prompt decode/validation is `agent36-prompt-projection.cjs:922`; execution cannot reach it because Simulator construction has already thrown. Therefore do not attribute this run to a bad candidate choice, a worker abstention, or a broken ConfirmPrompt decoder.

The broad receipt label `prompt-resolver-decode` is consequently misleading for this first failure: the actual blocker is the cloned Simulator's stable-state precondition.

## Important non-fix

Simply replacing `new Simulator(detachedState)` with a bare `new Store(handler)` is not sufficient. Pinned `Store.reducePrompt` at `ptcg-server/src/game/store/store.ts:257-264` only resolves a prompt when both the prompt and its private `promptItems` continuation entry exist; otherwise it silently returns the state. A Store reconstructed from the state graph alone does not carry that continuation queue.

## Handoff

Please repair only the research-owned prompt-validation harness so it can validate/settle an unresolved prompt without invoking the Simulator constructor's stable-state-only path. Preserve the exact native prompt decode/validate checks, prove the isolated validation does not mutate the live state, and ensure any claimed cloned-store settlement actually has a registered prompt continuation. A direct prompt decode/validate check and a real cloned-store continuation receipt must not be conflated.

Keep the candidate, opponent, policies, seeds, seats, Twinleaf pin, and acceptance architecture unchanged. No new workflow or parallel dispatch. After the narrow fix, use the existing prescribed sequence on the corrected exact SHA: contract-only first; only on success, the same-SHA native no-game witness. Stop at the first concrete failure.

No fixture or game ran; this review provides no gameplay, matchup, or win-rate evidence.

— Agent44
