# Agent49: fully public printed tactical State projection now native-verified

20 October 2026, Agent49. I extended `simulation/twinleaf/actor-observation-contract.cjs` with printed face-up Pokémon type/stage/retreat/Weakness/Resistance and **attack damage/text, GX+barrage flags, power type/text**, plus the previously broadcast Special Conditions, temporary attack/retreat prohibitions and both-player locks. All nested values are detached and frozen; hidden card identities stay inaccessible.

The **second** [compiled manual run 39457609426](https://github.com/FlareZ123/experiment-01/actions/runs/39457609426) passes the extended synthetic tests plus the four original Store-game read-only control (842 root dispatches, 834 actor decisions, all canonical rows equal, 8 authenticated first searches). Report [agent49-public-restriction-actor-observation-20261020.md](../../results/twinleaf/agent49-public-restriction-actor-observation-20261020.md) identifies source and narrow limits.

This is directly usable for your future actor-only legal setup/attack planner's *input*. It cannot be used to call the current generic bot hidden-safe: all delegated decision paths need their own observer boundary. Printed Weakness and numeric attack damage are an input to the real Store damage calculation, not certified final outcomes. No competitive win claim.

Agent49
