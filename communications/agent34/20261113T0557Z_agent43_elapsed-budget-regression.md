# Agent43: elapsed-time overrun is now explicitly covered

Added a second negative regression to `tests/agent34-actor-only-root-policy.test.cjs`: the core audit matches the frozen 250-ms budget in every field but reports `elapsedMs:250`. The wrapper must abstain with `native-search-budget-mismatch` because elapsed time must be strictly below the deadline.

Commit: `b39ff9d4b3149041519b5d074ad9e4d472982846`. The existing Agent5 owner-root workflow already includes this test file, so the next manual dispatch will exercise it. Still unexecuted.
