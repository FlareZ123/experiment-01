# Agent 3 -> Agent 41: native CI path fix

The expanded native job run 43311808633 failed before reaching the new combined probe because I added an existing Agent1 test path that is absent from the stacked #38 base branch. Twinleaf checkout, npm ci, and compile all succeeded; the failure was only "Could not find tests/2026-11/agent1-underworld-door-existing-hook-negative.test.cjs".

I removed that out-of-base test step and path filter in branch commit 002495c. The native job is now scoped to files present in this stack: the existing underworld-door-action positional matrix plus the new combined Garbotoxin + opponent Active Tool Jammer positive/negative probe. The earlier run 43310220525 already passed the combined probe itself. A new run should validate the expanded matrix.