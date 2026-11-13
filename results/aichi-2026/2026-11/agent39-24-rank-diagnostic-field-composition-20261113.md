# Agent39: 24-rank diagnostic field composition

**Status:** descriptive aggregation of identity-normalized source lists; not paper-format admission, matchup evidence, or a strength estimate.  
**Source:** CI run [43407979154](https://github.com/FlareZ123/experiment-01/actions/runs/43407979154), artifact [14027319169](https://github.com/FlareZ123/experiment-01/actions/runs/43407979154/artifacts/14027319169), `diagnostic_normalized_field.decks`.

## Field composition

The 24 identity-screened lists contain 1,440 card copies, 812 source card rows and 211 distinct canonical English card-pool identities. Every list has exactly 60 copies. Archetype labels and ranks are preserved from the source data.

| Archetype | Ranks | Decks | Share of 24 |
|---|---|---:|---:|
| Regidrago | 10, 12, 13, 14, 18, 20, 21, 27, 32 | 9 | 37.5% |
| Absol Garbodor | 8, 11, 16, 22 | 4 | 16.7% |
| Raichu Electrode Combo | 4, 17 | 2 | 8.3% |
| Shadow Rider Calyrex | 1 | 1 | 4.2% |
| Vileplume Control | 2 | 1 | 4.2% |
| Mew Genesect | 5 | 1 | 4.2% |
| Absol Electrode | 9 | 1 | 4.2% |
| Lopunny Vileplume | 15 | 1 | 4.2% |
| Raging Bolt | 19 | 1 | 4.2% |
| Meloetta Donk | 26 | 1 | 4.2% |
| Lillie's Clefairy | 30 | 1 | 4.2% |
| Dusknoir Chimecho | 31 | 1 | 4.2% |

Regidrago is the largest single archetype cluster, but the screened subset is not a homogeneous Regidrago field: four Absol Garbodor lists and multiple distinct one-off strategies remain represented. This is a composition fact, not a claim about matchup difficulty or the full Top 32.

## Most common card identities

Counts are summed across all 24 normalized lists. “Decks” is the number of distinct rank lists containing at least one copy; it is not a match count or metagame weighting.

| Card-pool ID | Canonical English card name | Copies | Decks |
|---|---|---:|---:|
| `swsh8-237` | Quick Ball | 71 | 20 |
| `xy4-109` | VS Seeker | 44 | 18 |
| `swsh8-225` | Battle VIP Pass | 42 | 15 |
| `sm3-115` | Guzma | 38 | 20 |
| `xy6-97` | Double Dragon Energy | 38 | 10 |
| `sve-1` | Basic Grass Energy | 37 | 11 |
| `sm6-113` | Mysterious Treasure | 37 | 10 |
| `swsh12-135` | Regidrago V | 34 | 9 |
| `xy4-92` | Battle Compressor Team Flare Gear | 33 | 17 |
| `sve-7` | Basic Darkness Energy | 30 | 6 |
| `swsh12-136` | Regidrago VSTAR | 27 | 9 |
| `swsh10-146` | Hisuian Heavy Ball | 24 | 19 |
| `me1-131` | Ultra Ball | 24 | 14 |
| `xy1-121` | Muscle Band | 23 | 15 |
| `xy8-137` | Float Stone | 23 | 11 |
| `sm10-57` | Dedenne-GX | 22 | 18 |
| `sm2-60` | Tapu Lele-GX | 20 | 18 |
| `sve-2` | Basic Fire Energy | 20 | 9 |
| `me2pt5-16` | Budew | 19 | 14 |
| `xy6-92` | Trainers' Mail | 18 | 6 |

## Common identities within the multi-list archetype clusters

These are the eight most prevalent card identities within each source-labeled cluster with at least two lists. “Decks” is prevalence within that cluster; the source archetype labels are not reclassified.

**Regidrago (9 lists)**

| Card-pool ID | Card | Copies | Decks |
|---|---|---:|---:|
| `sve-1` | Basic Grass Energy | 34 | 9/9 |
| `xy6-97` | Double Dragon Energy | 34 | 9/9 |
| `swsh12-135` | Regidrago V | 34 | 9/9 |
| `sm6-113` | Mysterious Treasure | 33 | 9/9 |
| `swsh8-237` | Quick Ball | 33 | 9/9 |
| `swsh12-136` | Regidrago VSTAR | 27 | 9/9 |
| `xy4-109` | VS Seeker | 23 | 9/9 |
| `sve-2` | Basic Fire Energy | 20 | 9/9 |

**Absol Garbodor (4 lists)**

| Card-pool ID | Card | Copies | Decks |
|---|---|---:|---:|
| `sve-7` | Basic Darkness Energy | 25 | 4/4 |
| `swsh8-237` | Quick Ball | 16 | 4/4 |
| `xy8-137` | Float Stone | 15 | 4/4 |
| `swsh10-139` | Dark Patch | 13 | 4/4 |
| `swsh8-225` | Battle VIP Pass | 10 | 4/4 |
| `xy4-109` | VS Seeker | 10 | 4/4 |
| `me1-86` | Mega Absol ex | 9 | 4/4 |
| `swsh10-155` | Temple of Sinnoh | 8 | 4/4 |

**Raichu Electrode Combo (2 lists)**

| Card-pool ID | Card | Copies | Decks |
|---|---|---:|---:|
| `xy4-92` | Battle Compressor Team Flare Gear | 8 | 2/2 |
| `sm4-100` | Counter Energy | 8 | 2/2 |
| `sv2-192` | Reversal Energy | 8 | 2/2 |
| `sm5-138` | Unit Energy LightningPsychicMetal | 8 | 2/2 |
| `sm2-130` | Rescue Stretcher | 7 | 2/2 |
| `sm7-48` | Electrode-GX | 6 | 2/2 |
| `swsh5-125` | Escape Rope | 6 | 2/2 |
| `swsh8-225` | Battle VIP Pass | 5 | 2/2 |

These are source-list signatures only. They do not establish how the cards interact, how a policy plays them, or the matchup performance of any candidate. Singleton archetypes are intentionally not aggregated.

## Card-type totals

| Card supertype | Copies |
|---|---:|
| Trainer | 803 |
| Pokémon | 432 |
| Energy | 205 |
| **Total** | **1,440** |

## Method and limitations

- Aggregate `normalized.count` by canonical `normalized.card_id`; count each card ID at most once per deck for the “Decks” column.
- Archetype and rank are taken from the source audit. No archetype relabeling, opponent weighting, match simulation, or win-rate model is applied.
- The 24 lists remain diagnostic-only: five unchanged Japanese-Extra-incompatible ranks (3, 6, 7, 24, 29) and three unavailable ranks (23, 25, 28) are not included. Original physical Japanese copies remain unverified, and paper/competitive admission remain false.
- The separate official banned-printing overlay remains required; bundled card-pool Expanded flags alone are not authoritative.
- The 24-rank subset is not the complete Aichi Top 32 and must not be used to claim a 99.5% field result.

The machine-readable source and reproducible normalization policy are documented in the [identity-normalized diagnostic field report](agent39-identity-normalized-expanded-diagnostic-field-20261113.md).