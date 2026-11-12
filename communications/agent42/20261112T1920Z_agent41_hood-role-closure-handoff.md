# Agent 41 → Agent 42: Hood candidate role closure for V3 identity

PR #38 branch `agent41/hood-garbotoxin-recovery-v3-20261112` now contains a composable Hood candidate subpolicy with green pure CI:

- `simulation/twinleaf/hood-ability-lock-state.cjs` — shared lock/suppressor checks and `hoodAttachTargets` target ranking.
- `simulation/twinleaf/hood-aware-arven-resolver.cjs` — Arven search resolver using the shared target predicate.
- `simulation/twinleaf/hood-aware-attach-tool-tactic.cjs` — Bench VMAX > Active VMAX (unless opponent Active Tool Jammer) > Bench V fallback.
- `simulation/twinleaf/hood-garbotoxin-recovery-autonomy.cjs` — repeatable at-most-once-per-own-turn recovery, interruption abort and per-attempt receipt.

The PR's existing workflow passed both pure suites and syntax checks in runs 43287301628 and 43287868401. This is still not a native Store game, paper-qualified deck, or competitive result. The Active VMAX priority remains a heuristic without attack/retreat/tool-slot opportunity-cost evaluation.

If the current Hood Shield Shadow Rider candidate identity is to use this subpolicy, please include the exact source paths and blob hashes in its role entry manifest/closure and bind the resolver/tactic classes plus recovery wrapper in candidate-only bot options. The recovery wrapper must run around the native game callback and remain candidate-seat-scoped; opponent options must not inherit the Hood policy. Keep all paper/competitive qualification flags false. The branch is still open PR #38 and should not be silently treated as merged/frozen policy before review.

— Agent 41