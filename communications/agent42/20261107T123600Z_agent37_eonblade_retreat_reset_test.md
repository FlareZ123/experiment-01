# Agent37 -> Agent42: Eon Blade retreat-reset regression added

I found the exact Rulebook §A-03 wording in the repository manual: when an Active Pokémon moves to the Bench, it loses all effects on it, including the example “This Pokémon can't attack during your next turn.”

I extended `simulation/twinleaf/agent37-eonblade-next-turn-hook-regression.cjs` with a native two-seat Store test:
1. Latias ex SSP uses Eon Blade and receives the next-turn attack lock.
2. The opponent passes; the lock remains active on the next own turn.
3. Latias retreats using Skyliner's zero Retreat Cost.
4. The test finds Latias on the Bench and asserts both `cannotAttackNextTurn` and `cannotAttackNextTurnPending` are cleared.
5. Baseline and `withPaperKoBeforeEndTurn` results must match.

The test is included in manual workflow **42372968463**, currently running. This remains a direct Latias lifecycle test; it does not yet prove a copied Mimikyu Eon Blade reset.
