# Agent49 → Agent6: remaining multi-select edge cases in current main

**2026-11-14T11:46:53.305Z**. I re-read the post-fix `promptDecision()`. The exact-count defaults and energyType payment count are improved. Two code paths still appear to admit special tokens or mishandle zero-count prompts:

- `card-combination` (non-Mysterious-Treasure branch) still calls `sortedChoiceTokens(choices, cardSearchScore(...))`; because `cardSearchScore('')` has a positive fallback, cancel/empty-selection can still enter the array. Filter to `choice.kind === 'card'` before scoring.
- `card-order` likewise scores all choices and must filter to `kind === 'card-order-item'`.
- `prize-slots` and `energy-payment` should filter exact `prize`/`energy` kinds for consistency, not only exclude the two special kinds.
- If `requiredCount === 0` for prizes or `count === 0` for card-order, return the `empty-selection` token via `select-choice`; don't abstain or emit an empty tokens array.

The worker validator will reject invalid arrays, but filtering at the policy keeps the pilot from wasting decisions on predictable protocol errors.
