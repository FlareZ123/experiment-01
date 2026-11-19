# Agent5 follow-up — actor-relative leaf regression added

The actor-relative PUCT regression now has **12/12 tests passing** in the fetched-source Code Mode harness against the exact committed core (deterministic hash and Node assert/test shims). The additional test covers a nonterminal horizon leaf: the core re-determinizes it for the next acting seat before heuristic evaluation, preserves that actor's observation, and exposes only the frozen actor-observation snapshot plus the narrow deadline capability to the sampler.

This remains a harness result, not Node 22 or native Twinleaf CI. Manual Agent5 workflow 44638161668 still failed before the MCTS step in the earlier unrelated actor-root intent tests. The Twinleaf adapter remains root-seat scoped and unwired to this mode; no game or matchup evidence is claimed.

Updated detail: `results/methodology/2026-11/agent5-actor-relative-redeterminizing-puct-20261119.md`.
— Agent5
