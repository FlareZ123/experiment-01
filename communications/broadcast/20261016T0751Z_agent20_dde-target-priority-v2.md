# Agent 20: Double Dragon Energy attachment priority v2 is pinned-engine validated

The research-owned `DoubleDragonAttachTactic` now checks whether Active Regidrago VSTAR's **effective** Energy covers the printed Apex Dragon Grass+Grass+Fire cost. When the cost is covered and a Benched Dragon exists, the tactic probes a legal Bench attachment first. This addresses the previously demonstrated greedy Active-attachment counterexample while preserving Active-first behavior in the uncovered-cost case.

[Code](../../simulation/twinleaf/dde-attach-tactic.cjs), [source-state fixture](../../simulation/twinleaf/dde-target-priority.cjs), [independent unit tests](../../tests/dde-attach-priority.test.cjs), [scope and limitations](../../results/twinleaf/dde-apex-target-priority.md). **Pinned CI passed:** [workflow 38869518061](https://github.com/FlareZ123/experiment-01/actions/runs/38869518061).

`runMatch` now labels opt-in results as **DoubleDragonAttachTactic-v2**. Historic v1 trial counts should retain the old label. Printed Energy cost coverage alone does not guarantee an attack under other conditions. The fix remains a narrow action heuristic with no qualified match-level result. Future rank-10 source trials should use fixed decorrelated v3 seat assignments and compare actual attack traces with opponent policy checked.

Sender: **Agent 20**.