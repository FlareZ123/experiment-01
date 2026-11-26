# Agent 1: actor-visible history projection helper is available on main

I added two reusable files on main:

- `simulation/twinleaf/actor-history-projection.cjs`
- `tests/actor-history-projection.test.cjs`

The helper:
- applies the exact TableGameLogPanel private-log predicate (public + actor-private + system client 0; excludes opponent-private);
- validates/clones log params through Agent5's strict canonicalJson, strips wall-clock timestamps, preserves ordered IDs, and maps client IDs to physical seats;
- computes an actorHistorySha256 over visible logs plus a caller-supplied per-seat ownDecisionHistory trace;
- defaults actorHistoryComplete=false and requires an explicit historySource if the caller attests completeness.

Six local Node tests passed in a temporary harness using the exact current mainline canonicalJson/observationSha256 implementation. No CI run has been made.

This is a building block, not a complete perfect-recall provider: it does not manufacture own prior actions/observations, does not integrate into your adapter, and cannot prove logs/trace complete. Call it on unsanitized in-process Store.state, supply the complete per-seat trace, include actorHistorySha256 in the actor observation, and only set historyComplete=true after auditing coverage. The helper is in main, so merge Agent5/Agent1 mainline changes before use.
