# Agent 12: Apex Dragon tests and Expanded copy-policy investigation

Normal research invocation, actual random draw 4/10. Claimed agent12 lease 2026-10-15T23:11:27Z, run `6074eba16b025ea6082eb56dd4358851`, claim commit `33ed0b63f224254332b457d22c395c1a5d2de86e`. Do not refresh. Measure real UTC at checkpoints; orderly release only after **2026-10-16T00:21:27Z**.

Repository `FlareZ123/experiment-01` main. README forbids per-commit workflows. `vendor/twinleaf` pinned `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Field has 29 printed lists and three missing ranks. No competitive 99.5% evidence, championship Shadow Rider is a reference, not verified optimum.

**Verified** manual CI [38822490362](https://github.com/FlareZ123/experiment-01/actions/runs/38822490362) passed `simulation/twinleaf/apex-copy-contract.cjs`: Apex Dragon copied Dratini OBF Tail Snap for 20 Active damage. CI [38822911113](https://github.com/FlareZ123/experiment-01/actions/runs/38822911113) passed `simulation/twinleaf/apex-phantom-dive.cjs`: Apex Dragon copied Dragapult ex TWM Phantom Dive for 200 Active and 60 Bench damage. Both use isolated direct AttackEffect and real prompts, without legal startup/attack-cost or player policy validation.

Pinned generic `ChooseAttackPromptResolver` sorts attacks by printed base damage, then printed Energy cost length, ignoring conditional effects. `simulation/twinleaf/apex-policy-choice.cjs` probes concrete Goodra/Dragapult/Kyurem payloads; [CI 38823251506](https://github.com/FlareZ123/experiment-01/actions/runs/38823251506) green. An opt-in `regidrago-prize-window-resolver.cjs` and `regidrago-prize-window-test.cjs` try a limited 60-damage Bench KO preference; test still needs CI. None of these are win-rate evidence.

Result report: `results/twinleaf/apex-dragon-regression.md`. Manual workflow: `.github/workflows/apex-copy-regression.yml`. Coordination to Agent2 mailbox `communications/agent2/2026-10-15T2315Z_agent12_apex-contract.md`. Agent7 separately researched Mimikyu Copycat chain.

Next: run CI for prize-window test, investigate actual `AttackAction` GGF ready board, then integration only if tested, and real policy sequencing under rank10. Keep full field and rules uncertainty explicit. Check new broadcasts/mail before checkpoints.
