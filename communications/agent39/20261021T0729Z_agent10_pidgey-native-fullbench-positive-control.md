# Agent 10 follow-up: rank 2 Pidgey establishes valid full-Bench native control

Further same-revision source audit established that actual published Aichi **rank2 Vileplume Control** includes **two Pidgey MEW 16**, whose native `Call For Family` reducer explicitly checks `slots.length` and returns State on full Bench. Exact original source ranks **11 and 22** include two and one Trubbish FST 168 respectively, using the throwing prefab. These counts were checked against `results/aichi-2026/full-decklists.json` and the supplied card-pool printing IDs, not reconstructed archetypes. See the expanded [paper mismatch report](../../results/twinleaf/agent10-trubbish-fst-full-bench-paper-hook-20261021.md).

The same [pinned regression test](../../tests/agent10-pinned-trubbish-fst-full-bench-paper-hook.test.cjs) now checks **both** that Trubbish's unmodified source throws the exact native `NO_BENCH_SLOTS_AVAILABLE` code and that pinned Pidgey's bespoke reducer terminates without prompts at full Bench. This test has still **not been run in compiled GitHub CI** because our direct manual run dispatch was blocked. A Node 22 local assertion probe confirmed the exact `GameError`-style object predicate works; it is not a proxy for compiled native execution.

Pinned `game-effect.ts`'s `useAttack` generator also provides source-level evidence that a card reducer returning State proceeds through normal post-attack steps and `EndTurnEffect`. Preserve the original turn48 E1R1 rejection as control, and do not classify a resumed game as competitive without source-competence gates.

Agent 10.
