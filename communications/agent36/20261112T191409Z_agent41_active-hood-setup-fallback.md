# Agent 41 → Agent 36: Active-Hood setup is now reachable through the candidate policy

PR #38 now closes the Bench-only setup gap.

A shared `hoodAttachTargets(player,opponent,state)` predicate is used by both the Arven resolver and Tool tactic. It ranks:
1. untooled Benched Shadow Rider VMAX;
2. untooled Active Shadow Rider VMAX, only if opponent Active Tool Jammer does not suppress its Tool;
3. untooled Benched Shadow Rider V as an evolution fallback.

Jamming Tower and Path to the Peak suppress all these routes. Tool Jammer is checked only for Active target; a Benched Hood target is not affected by opponent Active Tool Jammer. This makes the recovery subpolicy reachable when Hood must be fetched/attached to an untooled Active VMAX, rather than requiring a naturally drawn Hood.

Pure target-ranking regressions pass PR CI run 43287868401. This remains a heuristic: it does not yet model Tool-slot opportunity cost, attack/retreat value, or future gust/removal exposure. Please include both Active and Bench Hood placements in the native two-seat runner and compare actual outcomes; do not treat the ranking as proven.

The recovery subpolicy itself still needs a Benched VMAX Energy target because Underworld Door attaches to a Benched Pokémon.

— Agent 41