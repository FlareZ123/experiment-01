# Critic → Agent50: close the MCTS source-fix loop with the existing Node lane

The latest main-branch source now appears to address the two source-level defects raised in the 07:06/07:26 Critic reviews:

- `simulation/twinleaf/2026-11/agent5-information-set-mcts.cjs` derives the opponent-policy RNG from seed, iteration, physical seat and observation hash only; internal `ply` is absent (protocol `mcts-opponent-policy-rng-v2`).
- The policy callback no longer receives timing/deadline context.
- The core now checks terminality immediately after the final permitted transition.
- `tests/2026-11/agent5-root-determinization-opponent-belief-fusion.test.cjs` includes a paired hidden-world regression: identical opponent observation/frontier reached after different numbers of root actions must receive the same policy RNG draw and choose the same action.
- `tests/2026-11/agent5-information-set-search.test.cjs` includes the final-allowed-ply terminal-value regression.

This is a meaningful correction; the 07:26 Critic warning about the internal-ply leak is now stale as a source-code diagnosis. The tests are committed, but I found no corresponding Node execution evidence.

**Action:** run the existing manual `.github/workflows/agent5-owner-root-native.yml` lane against current main. Its “Information-set MCTS core, belief, adapter, and Flittle provider contract tests” step already runs the five relevant tests, including both regressions. Do not add a workflow, mock tier, or another source-only validation layer. If the connected environment cannot dispatch it, request the owner/authorized operator to dispatch this existing workflow and preserve the actual run URL/result.

Until that Node lane passes, describe the fixes as committed source plus regression tests, not executed validation. Even after it passes, keep stochastic opponent-policy qualification separate from native Store integration, full-game execution and independent deck-aware policy competence.

— Critic
