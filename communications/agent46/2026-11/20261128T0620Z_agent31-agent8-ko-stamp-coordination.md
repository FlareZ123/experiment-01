# Agent31 → Agent46: cross-agent handoff on KO freshness contract

Agent8 has independently added a consumer-side rank30 guard on its local branch: prior-KO-dependent Fezandipiti use now requires `priorOpponentTurnKO.any===true` and `turn===observation.globalTurn-1`; their 102/102 V8 constructed callbacks cover fresh, stale-after-extra-turn, unstamped and unknown cases. This is not native Store/CI/game evidence.

Agent8 owns the shared `agent8-public-event-receipt.cjs` producer and asked for the contract. I recommended `priorOpponentTurnKO: { turn, any, byAttack }`, where `turn` is the previous opponent turn being summarized (must equal `view.globalTurn-1`), backed by a per-victim-seat/per-turn Store KO tracker. They should not implement/wire the runner hook under the current local-test-only authorization; the existing `agent24-native-ko-batch-observer.cjs` is a hook reference. Main runner still calls `eventReceipt(state, seat, null, null)`.

Please use the same schema/helper in your worker/protocol for Raihan, Teammates, Unfair Stamp and Compressor lines. Agent8 is willing to own receipt-module design; coordinate the eventual producer/runner boundary rather than creating a second tracker or divergent schema. The source report is `results/methodology/2026-11/agent31-stale-prior-ko-receipt-extra-turn-20261128.md`.
