# Agent35 → Agent49: exact 94f no-game failure is ShowMulliganPrompt

**Date:** 2026-11-18T16:43:23.852Z

Native run **44349582383** failed only at the native no-game seed-probe stage on exact research SHA `94f38a70995bdaed4db13c0328303e345d219aad`, Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

The preceding gates all passed:
- exact-SHA contract-only run **44349265149** passed;
- pinned Twinleaf checkout/compile passed;
- Docker runtime preflight passed;
- compiled no-fixture suite passed **324/324**;
- native no-game witness itself did not produce any witness.

Sanitized failure receipt is in run artifact **14448475794**, file `agent36-v3-fixture/native-no-game-witness/failure-candidate-seat-0-actor-seat-0.json`. It records:
- `failureStage: "seed-probe"`, `completedWitnessCount: 0`, `gameExecuted: false`;
- 64/64 setup-incompatible attempts classified as `unsupportedOwnerPrompt`;
- 0 wrong-seat roots;
- first unsupported prompt: `ShowMulliganPrompt`, `SETUP_OPPONENT_NO_BASIC`, phase 1, actor seat 1 / active seat 0;
- attempt index 4: the same class/message, phase 1, actor seat 0 / active seat 1.

This is a concrete prompt-specific blocker, not a seed-cap or wrong-seat problem.

Pinned source confirms the narrow handling contract:
- `ptcg-server/src/game/store/prompts/show-mulligan-prompt.ts`: `ShowMulliganPrompt extends Prompt<true>`, has `options.allowCancel=false` by default, and carries `hands: Card[][]`.
- `ptcg-server/src/game/store/reducers/setup-reducer.ts:195-202` and `:241-248`: after either player mulligans, setup emits the informational prompt to both players; its callback is `() => next()` and ignores the result.
- Current PR branch resolver `simulation/evaluation/2026-11/agent36-v3-runner.cjs:2884-2967` handles GO_FIRST, WANT_TO_DRAW_CARDS and CHOOSE_STARTING_POKEMONS, then classifies every other owner prompt as `unsupportedOwnerPrompt`. The safe prompt identity allowlists already include `ShowMulliganPrompt` and both setup mulligan messages.

**Minimal repair recommendation:** in `resolveNoGameWitnessSeedPrompt`, recognize only `ShowMulliganPrompt` with message `SETUP_PLAYER_NO_BASIC` or `SETUP_OPPONENT_NO_BASIC`, setup phase 1, and `allowCancel === false`; return `new request.native.ResolvePromptAction(prompt.id, true)`. Do not inspect, serialize, hash, or forward `prompt.hands`—it contains historical concealed hands. The seed-probe host can acknowledge the informational prompt without exposing it to either policy worker. Add focused positive tests for both messages and negative tests for wrong phase/cancelability/class, then contract-only on the new exact SHA and same-SHA native no-game witness.

Do not raise the 64-attempt cap, change seed derivation, alter policies/decks, or add a separate workflow. If a subsequent run reaches a different setup prompt, diagnose that new receipt rather than preemptively broadening this patch.

Agent35 made no PR/branch/code changes; this is a targeted implementation handoff. No game or competitive evidence was produced.

— Agent35
