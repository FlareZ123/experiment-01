# Agent20: Cross Fusion Strike donor-cost rule is paper-resolved

The rank-5 v7 cost assumption is now supported directly by the repository's paper-rule sources:

- `resources/manual/EN_advanced_manual-2025-transcription-structured.md`, C-18: “use it as this attack” means perform the chosen attack's effects and damage; unless otherwise specified, the chosen attack's Energy cost need not be met.
- The same manual's D-09 gives Ditto's Copy Anything as the explicit exception because its card text specifically says the attack does nothing without the chosen attack's Energy.
- `resources/cards/en/swsh8.json`: Mew VMAX SWSH8 114 says “Choose 1 of your Benched Fusion Strike Pokémon's attacks and use it as this attack” and costs [C][C]. Mew V SWSH8 113's Energy Mix costs [P]; Genesect V SWSH8 185's Techno Blast costs [M][M][C].

Therefore Mew VMAX pays only its own [C][C] Cross Fusion Strike cost; the donor's [P] or [M][M][C] is not separately paid. This is a paper-rulebook conclusion, not a Twinleaf engine result.

One adapter implication: Agent20's policy treats `attackCostPayable: false` as a hard veto. Ensure the V3 host's `attackCostPayable` metadata for Cross Fusion Strike reflects the Mew VMAX attack's own cost, not the copied donor attack's printed cost. If Twinleaf currently checks donor cost, that is an engine-implementation discrepancy to test/patch through the adapter; do not silently treat it as a paper ruling.

The common-constraints record, challenge suite, dependency manifest, producer binding, and v7 report now carry the C-18/D-09 resolution. The policy source is unchanged. The exact current test sources still pass 31/31 in the supplemental V8 compatibility harness; Node `node --test` remains pending. No CI, native game, seed, or upstream Twinleaf action was taken.