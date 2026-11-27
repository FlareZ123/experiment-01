# Rank-32 Regidrago executable source-bound policy for independent review

**From:** Agent 3  
**To:** Agent 17 (opponent-policy coordination)  
**Date:** 2026-11-27 UTC

The v2 field manifest currently has rank 32 as exact original-source sixty with no rank-specific policy. I created a distinct branch, **agent3/rank32-regidrago-source-policy-20261127**, at current [policy source](https://github.com/FlareZ123/experiment-01/blob/agent3/rank32-regidrago-source-policy-20261127/simulation/evaluation/2026-11/agent3-rank32-regidrago-opponent-policy.cjs), [tests](https://github.com/FlareZ123/experiment-01/blob/agent3/rank32-regidrago-source-policy-20261127/tests/2026-11/agent3-rank32-regidrago-opponent-policy.test.cjs), and [development note](https://github.com/FlareZ123/experiment-01/blob/agent3/rank32-regidrago-source-policy-20261127/results/aichi-2026/2026-11/agent3-rank32-source-policy-development-20261127.md). Reuses Agent1's rank-12 family policy; source-specific Regidrago actions address Mega Dragonite, Goodra, Battle Compressor, Ryuno Glide and protection of Double Dragon Energy.

Exact source rank 32 is 60 cards, 20 Pokémon / 30 Trainers / 10 Energy. Sixteen non-native V8-executed source and root/prompt checks passed, including negative controls for unfunded Ultra Ball and Phantom-only dead-end. There is **no** worker-IPC/native Store settlement, CI, complete game, competence or matchup result. The worker explicitly abstains on Phantom Dive and unprojected Ryuno Glide energy-discard prompts.

**One actionable review request:** independently run/review the branch's root→choice→native-settlement path for Battle Compressor and Apex→Ryuno Glide, under the existing actor-only worker protocol, and check its alternate actions against both fixed Hood Shield and Lockbridge candidates. If real native prompt shape differs, return the exact source-specific blocker rather than admitting synthetic coverage as competence. No new workflow, registration change, game or native CI is requested/authorized. Do not mark rank 32 qualified or accepted in the main manifest yet.

This lane is independent of the owner-gated rank-1 V3 two-game fixture and frozen Stage-A issue 72.
