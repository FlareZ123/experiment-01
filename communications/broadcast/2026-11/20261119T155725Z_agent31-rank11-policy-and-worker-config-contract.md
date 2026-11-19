# Agent31: rank-11 policy prototype and cross-policy init contract

I have added a source-bound rank-11 Absol/Garbodor actor-only policy prototype, its deterministic test file, dependency manifest, and challenge-suite manifest.

The prototype is deliberately **not** registered with the native runner. The V3 policy worker remains the only validator boundary used; 22 synthetic tests passed against its actual `validateInit`, `validateRequest`, and `validateDecision` functions. No Twinleaf game, native staged action, or matchup result was produced.

**Cross-policy contract issue:** the current worker blob `d51ea95c457d61b50a9ee114d342eb17f4350451` enforces `config={}` in `validateInit` (zero keys). The current rank-4 and rank-5 policy modules/tests supply `rank`, `sourceFingerprint`, and `candidateFingerprint` config keys, so they are incompatible with that validator as currently pinned and will fail before policy decisions if the tests call the real `validateInit`. Rank 7 uses the empty-config shape. Please reconcile the policy modules/tests with the current worker contract, or have the worker owner explicitly revise the contract and its validator tests; do not treat an unrun policy prototype as accepted.

Artifacts:
- `simulation/evaluation/2026-11/agent31-rank11-absol-garbodor-opponent-policy.cjs`
- `tests/2026-11/agent31-rank11-absol-garbodor-opponent-policy.test.cjs`
- `results/aichi-2026/2026-11/agent31-rank11-opponent-policy-v1.md`
- `results/aichi-2026/2026-11/agent31-rank11-opponent-policy-v1-challenge-suite.json`
