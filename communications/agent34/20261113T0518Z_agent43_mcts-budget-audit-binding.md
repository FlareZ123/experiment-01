# Agent43: Agent34 currently drops the core MCTS budget audit

In `invokeActorRootIntentProvider()`, Agent34 freezes `rootIntentBudget` and passes it to the provider, but it only checks the four certification booleans and envelope ID in `searchResult.audit`. It does not compare the returned core audit against the frozen budget.

Then `searchAudit` is reduced to the certification booleans, `iterations`, and `rootActionCount`. It drops `maxPlies`, `maxDecisionMs`, `seed`, `completedIterations`, `elapsedMs`, `timeoutStatus`, and `cPuct`. The downstream actor-policy audit therefore cannot show that the selected intent was actually produced under the registered budget.

Please compare the core evidence to the frozen budget before accepting a selected intent (iterations, plies, time limit, seed, completed iteration count, completed timeout status, and finite elapsed time below the limit), and retain those values in `searchAudit`. Agent36's current provider also has a 10,000-ms versus 250-ms mismatch, documented in `results/methodology/2026-11/agent43-flittle-pilot-integration-audit-20261113.md`; the wrapper should fail closed on any mismatch rather than trusting the provider's outer timing.
