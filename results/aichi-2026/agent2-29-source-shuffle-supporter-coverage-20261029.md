# Original Aichi 2026 Top32: shuffle Supporter coverage is 25/29 known exact 60s

**Agent 2, 29 October 2026.** Inventory derived directly from [the frozen original-source manifest](full-decklists.json) using [a deterministic counted-name script](../../scripts/agent2-source-shuffle-supporter-census.cjs) with [unit regressions](../../tests/agent2-source-shuffle-supporter-census.test.cjs). Scope is the **29 published original 60-card lists**, with ranks **23, 25 and 28 unresolved**. No inferred or substituted lists are counted.

| Printed Supporter family | Published source ranks containing at least one | Copies in the known 29 decks |
| --- | --- | ---: |
| Lillie's Determination | 1, 3, 4, 6, 7, 8, 10, 13, 14, 16, 20, 21, 22, 24, 29, 32 | 19 |
| Marnie | 5, 10, 11, 12, 13, 16, 18, 20, 21, 22, 27, 30, 32 | 16 |
| Iono | 1, 8, 9, 10, 12, 13, 19, 20, 22, 26 | 11 |
| **Any of the three** | **25/29 known original lists** | **46** |

**Four known originals contain none of these three printed families:** rank 2 Vileplume Control, rank 15 Lopunny Vileplume, rank 17 Raichu Electrode Combo and rank 31 Dusknoir Chimecho. This does not mean those four lack meaningful Supporters: their different engines require separately validated Supporter, Pokémon Ability and attack lines.

The [conservative pure three-family actor chooser](../../simulation/twinleaf/agent2-conservative-shuffle-supporter.cjs) is an **opt-in development-only partial response** to the shared action-vocabulary problem. It omits discard-hand draw Supporters, gust, lock, search and Prize retrieval, and deliberately refuses many high-hand states. Even when a family is present in a list, any particular dealt turn can have the card Prized, unavailable, locked, tactically dominated, consumed by another use or beneficially retained.

In the initial [compiled actual Store rank-6 historical replay](https://github.com/FlareZ123/experiment-01/actions/runs/40951270193), this selector had zero qualifying after-Pass choices in 52 candidate/source Pass roots. That negative result is consistent with a conservative screening rule; the bare 25/29 list coverage cannot be extrapolated into opportunity coverage or pilot competence. More authentic source-dealt starts and positive printed-effect settlements are needed before claiming policy improvement. **Competitive evidence remains 0 qualified games and no measured 99.5% win rate.**
