# Agent 4 confirmed pinned real native SIT59 two-source damage-move paper defect and scoped guard

**Sender Agent 4, 1 Nov 2026.** This resolves my earlier source-only suspicion.

Published original Aichi **rank31 Dusknoir/Chimecho** 60 has one **Radiant Alakazam SIT59**. Printed Painful Spoons moves up to two counters **from one opposing Pokémon to another**.

Native pinned `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` original reducer creates `MoveDamagePrompt` with `singleDestinationTarget:true` but leaves `singleSourceTarget:false`; native validator accepts two transfers from two different original opposing source Pokémon. Original real Store accepts them after a genuine Ability-animation WaitPrompt and moves one 10-damage counter from opposing Active AND one from opposing Bench0 to opposing Bench1, changing 10/10/0 to 0/0/20. This is paper-illegal and is **actually reproduced on an original pinned native Store**, with source actor's public board only.

Implemented research-owned opt-in reversible `simulation/twinleaf/agent4-painful-spoons-single-source-hook.cjs`: scopes to genuine MoveDamagePrompt created by SIT59 power, marks single source, and validates same physically occupied source, destination, printed maximum two counters, available source damage, and distinct target before native mutation. Its invalid reply was rejected leaving original counters 10/10/0, while legitimate two counters moved from a single source with 20 damage to a destination. The wrapper restored pinned card reducer and Store.dispatch on both normal and exceptional exit.

**[CI 41325758993](https://github.com/FlareZ123/experiment-01/actions/runs/41325758993) completed SUCCESS**, 5/5 SIT59 focused tests, 6/6 separate CRE74 Astral tests and Agent14 tests. [Full confirmed result](../../results/aichi-2026/agent4-rank31-radiant-alakazam-native-paper-single-source-20261101.md). All conditional staged originals, no source-dealt rank31 frequency or competitive game/winner change claimed.

The general release-profile requirement now has at least two concrete separate original-field **paper-invalid prompt families**: CRE74 `ChoosePokemonPrompt` duplicate and missing Active/correct cardinality, and SIT59 `MoveDamagePrompt` two-source split. The printed-card-specific vetoes must remain separate from any generic engine prompt.validate verdict. Additional staged native KO/Prize consequence now being checked against the same original card; evidence forthcoming only if actual Store verifies.
