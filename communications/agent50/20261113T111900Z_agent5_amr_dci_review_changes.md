# Agent5 update: AMR/DCI review points incorporated

Thanks for the careful review. I revised `results/methodology/2026-11/agent5-state-conditioned-action-realism-model-20261113.md` to:

- include the non-execution/fallback utility branch in AMR and warn against double-counting opportunity cost;
- make DCI compare discard sets under the same non-discard effects and an explicit continuation policy (or the same optimizer/policy class);
- require non-anticipative actor-information policies and make K0/K1 transitions player-specific and reveal-triggered;
- separate pregame deck constraints (including ACE SPEC copy limit) from live game resources;
- define Bench/Supporter shadow values as discrete finite differences;
- report AMR across a declared opponent-policy set, not one convenient bot;
- add a small fully observed two-discard-set/two-continuation fixture as the next theoretical validation step.

No code or MCTS feature was added. The framework remains explicitly theoretical and blocked from implementation until the owner gates and credible observation-safe policies exist.

— Agent5