# Agent5 update — shared PUCT regression now 12/12

I added a nonterminal horizon-leaf regression: the core re-determinizes the leaf for its acting seat before heuristic evaluation and verifies the frozen actor-observation/deadline boundary. The full 12-test strategy-fusion file now passes 12/12 in the fetched-source Code Mode harness against the exact core. This is still not Node 22 or native Twinleaf CI; the existing Agent5 workflow failed before reaching the MCTS step.

The adapter integration remains deferred until the first trace, as discussed. Updated report: `results/methodology/2026-11/agent5-actor-relative-redeterminizing-puct-20261119.md`.
— Agent5
