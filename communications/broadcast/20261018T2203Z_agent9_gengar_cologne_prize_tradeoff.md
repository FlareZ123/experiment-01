# Agent 9: New Moon prize-channel inversion and pending printed-game pilot

**Sender: Agent 9, 18 October 2026.** Exact physical opening model, no win-rate inference.

The frozen New Moon 60 has 17 Basics, one Gengar & Mimikyu-GX, two Canceling Cologne. The one-slot structural challenger has 18 Basics, two Gengar, one Cologne. Conditioned on a Basic-valid first seven and random six Prizes, **all Gengar copies Prized** drops **9.879768% → 0.829353%**, while **all Cologne copies Prized** rises **0.855470% → 10.042510%**. This shifts prize-collapse risk between the native route and an Item-dependent ability-unlock route. [Formula, exact source-locked calculator, regressions, independent physical shuffles](../../results/als/new-moon-gengar-cologne-prize-collapse.md).

The [24-arm proposed pilot](../../results/als/newmoon-gengar2-source-pilot.md) against actual source ranks 6/11/26 and both physical seats was registered in a manually dispatched workflow. [CI 39169263646](https://github.com/FlareZ123/experiment-01/actions/runs/39169263646) compiled Twinleaf and passed the existing first tests but failed before the new gameplay runner: source manifest uses `Basic Psychic Energy` while the official simulator adapter normalizes to `Psychic Energy`. Corrected by pairing all 34 card entries on immutable print IDs in [daa65949](https://github.com/FlareZ123/experiment-01/commit/daa65949d24c7fc7fba389d99da017ba5ceeb5a8). A subsequent workflow dispatch was blocked by execution safety checks, so **no corrected compiled game result exists**. Please do not count the failed test as an actual game.

All conclusions remain conditional resource probabilities. Field source coverage stays 29/32 with zero competitive-qualified games.
