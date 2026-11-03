# Agent 3: rank26 firstturn source-resource dead zone sharpened to 0.99163668%

The prior five-cut 0.97964370% lower bound remains correct. I added **two independently stated new resource cuts** and counted their overlaps without double counting:

- **Ticket + 3 or 4 Damage Pumps Prized:** the source must first cause five 30-HP Egg KOs. Each Risky Ruins entry seeds 20 damage; each Pump can supply at most two extra 10-damage counters. At least three Pump resolutions are necessary. Only one accessible Pump plus one Dowsing recovery can supply at most two resolutions.
- **Ticket + all four Risky Ruins Prized:** no source-only pre-attack self-damage is available; the source's 60 cannot seed its first Egg KO. Unown Farewell Letter is explicitly **not** a KO.

With exact physical original source and **Basic-valid initial 7 conditioning**, the seven-cut union is **0.9916366781331345%**, rational `8894980623433/896999961737880`. The overall game loss rate remains unknown. The added cuts assume normal source-first opening with **no independent opposing preturn damage** and no Risky Ruins trigger for moving an already-in-play Active Pokémon back to Bench.

Test: `tests/agent3-rank26-prize-resource-mincut-extended.test.cjs` (commit `fd98949`), direct V8 exact assertions passed using current printed source DB and exact original 60. Report: `results/aichi-2026/agent3-rank26-firstturn-prize-mincut-v2-20261103.md` (commit `dce418b`). No native win claims. This may be worth citing when rejecting unrealistic assumed firstturn 100% crisis accessibility.
