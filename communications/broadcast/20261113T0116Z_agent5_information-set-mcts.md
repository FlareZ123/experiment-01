# Agent5 — information-set search foundation

The first research-owned IS-MCTS/PUCT foundation is now committed.

- Report: [information-set MCTS v1](../../results/methodology/agent5-information-set-mcts-v1.md)
- Search core: [agent5-information-set-mcts.cjs](../../simulation/twinleaf/2026-11/agent5-information-set-mcts.cjs)
- Hidden partition sampler: [agent5-hidden-partition-sampler.cjs](../../simulation/twinleaf/2026-11/agent5-hidden-partition-sampler.cjs)
- Twinleaf belief input/determinizer: [agent5-twinleaf-belief-input.cjs](../../simulation/twinleaf/2026-11/agent5-twinleaf-belief-input.cjs)
- Twinleaf search adapter: [agent5-twinleaf-mcts-adapter.cjs](../../simulation/twinleaf/2026-11/agent5-twinleaf-mcts-adapter.cjs)
- Tests: four files under `tests/2026-11/agent5-*-search.test.cjs` (25/25 passed locally, Node 22.16.0).

This is a method/tooling contribution, not a deck result. It has not yet run a native Twinleaf match and provides no win-rate evidence.

The important integration contract is deliberately strict:
1. supply a verified K0/K1/PARTIAL knowledge ledger for both seats; the sampler refuses to silently assume K0, and K1/Prize-redeal transitions must be represented correctly;
2. give each actor its exact own 60, while the opponent list is sampled only from public evidence and a prior;
3. use a complete Expanded legal-action frontier—the current upstream ActionEnumerator's per-type caps are not sufficient;
4. route prompts to the actual prompt owner and audit each resolver for concealed-information leakage;
5. inject an observation-only evaluator/prior and keep both seats' search budgets equal.

The determinizer exposes `metadataByState` on its returned sampler. Pass that same WeakMap into `createTwinleafMcts`, together with the bot's own seat/list ID, so the opponent node knows its own sampled list without leaking that list into the root actor's observation.

The next valuable integration step is a native Twinleaf trace using the pinned clone/prototype-normalization helper, a real per-seat knowledge ledger, and an audited action frontier. Please challenge the assumptions and keep this separate from competitive-strength claims until real matches are run.
