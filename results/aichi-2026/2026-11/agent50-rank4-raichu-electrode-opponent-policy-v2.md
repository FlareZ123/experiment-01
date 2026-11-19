# Agent50 rank-4 Raichu / Electrode opponent-policy v2 — worker initialization correction

**Status: initialization contract corrected in source; focused test suite authored but not executed.** This is not a native game, strategic-competence, matchup, or win-rate attestation.

## Exact bindings

- **Opponent:** rank 4, Shu Hosoda, Raichu Electrode Combo; unchanged original 60-card source.
- **Source entry digest:** `2dcb4c65c31103bebe9c3e3a4185f4a21e1dd0705e5bedcb777b6c07defeb106`.
- **Fixed candidate:** Hood Shield Shadow Rider v1, canonical fingerprint `1880c60b44761c0cf22eb3e5cfa43e6e5581c174dc737932c19728cc5da5a1e4`.
- **Twinleaf:** `vendor/twinleaf`, pinned `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`; no engine or hook changes.
- **Worker:** `simulation/evaluation/2026-11/agent49-policy-worker.cjs`, blob `d51ea95c457d61b50a9ee114d342eb17f4350451`, file SHA-256 `5405d2c86865e3c423b9b14e6da14c3551c5aba3675dfb6c3c6ddc4cc1450751`.

## Correction

The shared worker's `validateInit()` accepts only an empty object for `config`. The previous rank-4 v2 module required `candidateFingerprint`, `rank`, and `sourceFingerprint` in that runtime object, making initialization impossible through the actual worker.

The v2 entry point now accepts only `config: {}`. Rank, exact source digest, candidate fingerprint, policy version, engine pin, and worker protocol identity remain immutable module constants and are bound in the versioned dependency manifest. The v1 module is retained as historical evidence and is explicitly marked **not worker-initializable** under the current protocol.

## Focused regression authored

- Policy: [rank-4 v2 module](../../../simulation/evaluation/2026-11/agent50-rank4-raichu-electrode-opponent-policy-v2.cjs).
- Tests: [v2 policy tests](../../../tests/2026-11/agent50-rank4-raichu-electrode-opponent-policy-v2.test.cjs).
- Dependency manifest: [v2 manifest](../../../simulation/evaluation/2026-11/agent50-rank4-raichu-electrode-dependency-manifest-v2.json).
- Common constraints: [v2 constraints](../../../simulation/evaluation/2026-11/agent50-rank4-raichu-electrode-common-constraints-v2.json).
- Preregistered suite: [v2 challenge suite](agent50-rank4-raichu-electrode-opponent-policy-challenge-suite-v2.json).

The 29-test v2 source calls the actual exported `validateInit`, instantiates the module using the accepted empty config for both physical seats, and retains actual `validateRequest` / `validateDecision` checks. The test file has **not** been executed in this invocation; therefore worker-initialization success is not yet demonstrated. The v2 suite preserves 26 prior actor-view cases as unexecuted inputs, three negative controls, and nine held-out review targets. It does not claim that v2 has reproduced v1's prior synthetic outcomes.

## Remaining blockers

- The v2 test suite still needs execution with `node --test tests/2026-11/agent50-rank4-raichu-electrode-opponent-policy-v2.test.cjs`.
- No dedicated test yet covers the v2 Ditto Prism Star Almighty Evolution line.
- Extra Energy Bomb (`AttachEnergyPrompt`), Electro Rain (`PutDamagePrompt`), and Crush and Burn-GX (`DiscardEnergyPrompt`) remain blocked in the current worker; no prompt or engine support was added.
- Agent42's ranks-4/9/17 readiness veto remains in force pending the CES48 paper correction and two-seat regression.
- No native Twinleaf game, source-natural game, native policy trace, matchup, win-rate estimate, or 99.5% result is established.

No candidate deck, rank-1 policy, PR #58, worker, runner, validator, workflow, fixture, seed, seat assignment, Twinleaf pin, or upstream code was changed.
