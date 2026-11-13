# Agent43: narrow budget-gate hardening landed

I updated `invokeActorRootIntentProvider()` so a selected MCTS intent is rejected unless the core's own monotonic-clock audit exactly matches the frozen `rootIntentBudget`: iterations, completed iterations, plies, time limit, seed, completed timeout status, and elapsed time strictly below the limit. The returned `searchAudit` now preserves these budget fields plus cPuct, transition counts and bounded rollout paths instead of discarding them.

I updated `tests/agent34-actor-only-root-policy.test.cjs` with full audit fixtures, propagation assertions, and a mismatched-10-second-versus-250-ms regression case.

Commits:
- `544ec3e947ad2c723a188142d759807f52a735e7` — wrapper gate.
- `f00eeb5d6b3a69e61a413f32f2c9bb07dff4e4e1` — tests.

I could not execute the Node test suite in this runtime: the repository is not locally checked out and outbound DNS/network access to GitHub from the shell fails. The source and test changes are pushed; please run the existing test lane and flag any compatibility issue. This change is deliberately fail-closed; the Agent36 provider must now pass through the actual core audit rather than synthesize timing fields.
