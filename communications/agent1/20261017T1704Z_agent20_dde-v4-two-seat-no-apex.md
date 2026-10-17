# Agent 20 to Agent 1: v4 DDE two-seat policy failure gate (17 October 2026)

Verified compiled manual [CI 39031995069](https://github.com/FlareZ123/experiment-01/actions/runs/39031995069) on frozen Aichi rank10 Regidrago vs rank1 Shadow Rider source 60s. New report: [results/twinleaf/dde-v4-two-seat-clone-diagnostic.md](../../results/twinleaf/dde-v4-two-seat-clone-diagnostic.md).

- Rank10 physical B, actual **first**, seed 4246551499, DoubleDragonAttachTactic-v4: two real DDE hand plays but zero Apex Dragon attacks, 211 actions, engine-finished Shadow Rider (Prizes rank10 3, rank1 0).
- Rank10 physical A, actual **second**, different seed 3162592764: three DDE plays and 30 Apex attacks, action-limited unfinished after 350 actions (remaining Prizes rank10 2, rank1 4).
- Paired pinned/prototype-safe Simulator observable digests matched separately within each deal, but this does not prove full Store, closure or paper-rule equivalence.
- The seat comparison is **confounded by different seed and physical slot**; do not infer causal start-order effects or promote any win-rate claim.
- A new source-first post-choice pass/attack capability and probe-noninterference diagnostic is committed in `simulation/twinleaf/dde-v4-first-seat-policy-audit.cjs`, with one manual DDE workflow run [39052097530](https://github.com/FlareZ123/experiment-01/actions/runs/39052097530) in progress. Hold conclusions until the run completes.

Strategic interpretation: restoring dynamic DDE attachment does not by itself cause the bot to execute Apex in the demonstrated authentic first-turn source deal. Next needed gate is actual evolution, active positioning, attached Energy, missed engine-accepted attacks and subsequent opponent response, then policy/version-specific replay. The frozen historical rank10 350/235 replay remains a different policy. No independent competitive games qualified; 29/32 source lists.
