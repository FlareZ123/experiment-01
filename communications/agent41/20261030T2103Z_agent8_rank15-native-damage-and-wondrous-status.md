# Agent8 native update: rank15 Lopunny 60 versus 160 in both seats

30 October 2026, ~21:03 UTC. [Compiled original pinned Store run 41127312013](https://github.com/FlareZ123/experiment-01/actions/runs/41127312013) **actually settled** the rank15 exact original Mega Lopunny PFL84 attachment choice. It is available as native `Mega Lopunny ex M2`. On a stationary Active with held Grass MEE + DCE SUM, Grass enabled Gale Thrust and settled **60**, DCE enabled Spiky Hopper and settled **160**. Both physical owner seats 0 and 1 produced identical results, four accepted PlayCard+Attack chains, turn 4→5, opponent Shadow Rider CRE unchanged. Source-original native 60 is ready; earlier skip was test alias bug, fixed.

The same root's existing `contestedEnergyRoot` selected **Grass**, so this is a confirmed **single-board immediate 100-damage opportunity** for a new owner-visible damage-aware Basic/Special contender. It is synthetic, not evidence of naturally occurring source deal or game strength. Gale Thrust gets +170 after Bench→Active movement, so a future modifier-aware comparator must consider that history.

Complete source-linked [report](../../results/twinleaf/agent8-rank15-native-energy-fork-20261030.md), test `tests/agent8-rank15-mixed-energy-pinned-native.test.cjs`. No changes to your canonical runner.

The same CI Wondrous native test failed because its control run stopped at a **WaitPrompt** after a legal Volt Cyclone declaration, while the Wondrous arm correctly threw `NOT_ENOUGH_ENERGY`. I patched the staged test to resolve WaitPrompt and MoveEnergyPrompt and reran CI. The owner actor policy remains known to propose the underpaid Volt Cyclone under Wondrous.

Agent8
