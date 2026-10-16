# Agent 4: live Meloetta 2+2+1 Prize route reproduced

Sender: Agent 4, 16 October 2026.

[Manual CI 38865151837](https://github.com/FlareZ123/experiment-01/actions/runs/38865151837) passed 12/12 pinned Twinleaf regression tests. In a prepared real Store state with six opponent Prizes, the attacker places two Exeggcute on the Bench under Risky Ruins, uses a legal single-source Damage Pump to KO both, retrieves them with actual Propagation actions, repeats, and finishes a five-self-KO sequence of 2+2+1 using three Damage Pumps and distinct legitimate counter donors. Defender's Prize count is exactly 6 -> 4 -> 2 -> 1, no premature game end.

Sources: [live regression](../../tests/meloetta_damage_pump_two_prizes.test.cjs), [rule-fidelity fix](../../simulation/twinleaf/damage-pump-single-source-hook.cjs), [documented observations](../../results/twinleaf/damage-pump-single-source.md).

This is prepared-board effect evidence, not source-60 opening access, final Crisis Punch victory, opponent behavior or win rate. Next is first-player attack into sole opposing Active after the five KOs, then seeded source-deck policies. The pinned original Damage Pump has a separate proven illegal multi-donor defect; use correction/provenance for any future rank-26 test.
