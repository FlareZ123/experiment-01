# Original Aichi paper Expanded field: printed Dragon target coverage of source Mew/Genesect Fairy Zone

**Agent8, 10 November 2026.** A bounded exact source-card database census ties the native last-Bench Genesect donor + Lillie's Clefairy ex Fairy Zone tactic to **at least 13 of 29 authenticated original Top 32 decklists**. It is a *printed target-HP/Weakness opportunity* and a tactical reason to preserve Genesect's attack-donor Bench slot, **not a game win-rate measurement**.

## Auditable nine-set lower-bound census

Read actual `results/aichi-2026/full-decklists.json` (29 original printed sixties). For original source Pokémon with one of the nine set codes `SIT,TWM,LOR,PAL,JTG,ASC,CEC,UPR,SSP`, join the precise physical printing set+collector number to its full JSON under `resources/cards/en/`, and count only actual `types: ['Dragon']` cards. The source-set mapping is pinned in `simulation/evaluation/2026-11/agent8-fairy-zone-original-field-dragon-census.cjs`, with independent tests at `tests/2026-11/agent8-fairy-zone-original-field-dragon-census.test.cjs`, both passed Node.js 22 in [manual pure CI 42738739042](https://github.com/FlareZ123/experiment-01/actions/runs/42738739042) without any additional native-game CI workload.

This gives **101 counted physical Dragon copies across 13 distinct original published ranks**; all 101 have printed HP **at most 370**. The highest HP among them is original **Mega Dragonite ex ASC, 370 HP**. Nine selected card sets are a strict subset of the 53 set codes represented among all original source Pokémon: **13 decks and 101 Dragon copies are lower bounds** on the possible full-source Dragon presence. Nothing here proves access to one of those targets during a specific turn or says the other 16 decks have no Dragon targets.

| Original rank | Dragon copies in selected nine sets | Selected actual original printings |
| ---: | ---: | --- |
| 1 | 1 | Dialga-GX 180 HP |
| 10 | 10 | Regidrago V/VSTAR, Dragapult ex, Dialga-GX, Hisuian Goodra VSTAR |
| 12 | 11 | Regidrago V/VSTAR, Dialga-GX, Dragapult ex, Noivern ex |
| 13 | 11 | Regidrago V/VSTAR, Salamence ex, Dragapult ex, Noivern ex, Dialga-GX |
| 14 | 12 | Regidrago V/VSTAR, Dialga-GX, Mega Dragonite ex, Dragapult ex, Noivern ex, Hisuian Goodra VSTAR |
| 15 | 1 | Tatsugiri 70 HP |
| 18 | 9 | Regidrago V/VSTAR, Dialga-GX, Dragapult ex, Hisuian Goodra VSTAR |
| 19 | 1 | Arceus & Dialga & Palkia-GX 280 HP |
| 20 | 11 | Regidrago V/VSTAR, Dialga-GX, Dragapult ex, Mega Dragonite ex, Noivern ex |
| 21 | 10 | Regidrago V/VSTAR, Dialga-GX, Dragapult ex, Hisuian Goodra VSTAR, Noivern ex |
| 27 | 11 | Regidrago V/VSTAR, Dialga-GX, Dragapult ex, Noivern ex |
| 30 | 1 | Dialga-GX 180 HP |
| 32 | 12 | Regidrago V/VSTAR, Dialga-GX, Noivern ex, Dragapult ex, Hisuian Goodra VSTAR, Mega Dragonite ex |

The source's printed Mew VMAX FST can use `Cross Fusion Strike` with just one attached DCE SUM to copy actual Benched Genesect V FST `Techno Blast` for **210 base damage**. The rank5 original single Lillie's Clefairy ex has printed `Fairy Zone`: opposing Dragon Pokémon's Weakness is Psychic ×2 while the Ability applies. Thus **210 × 2 = 420** before other applicable game effects, enough to meet the **printed** HP of all 101 counted source Dragon copies. This is an actionable potential threshold for target selection and last-Bench donor preservation.

The actual pinned native Store constructed original-rank5 vs original-rank10 Regidrago V experiment [CI 42737710796](https://github.com/FlareZ123/experiment-01/actions/runs/42737710796) proved the necessary conditional mechanism in both seats: Fairy Zone + source Genesect donor copied 210 produced two Prize KO against Regidrago V 220; replacing on-Bench Clefairy with source's own Dedenne left exactly 210 live damage and Regidrago V 10 remaining HP, no Prize/terminal. Detailed actual native four-cell evidence is in [the staged source ALS report](agent8-original-rank5-lastbench-donor-fairy-zone-20261110.md).

## High-value qualifications

The 420 number is **not a universal guaranteed KO**. Damage reductions from attacks (e.g. Hisuian Goodra VSTAR Rolling Iron), opponent Ability denial of Clefairy ex (e.g. active Iron Thorns ex Initialization), protections, target shifts, altered HP, future/temporary effects, copied attack restrictions and a depleted Bench/hand can invalidate the route. Opponent timing, the source's Supporter turn, any printed immunity, normal Energy and Prize commitments and alternate use of the final Bench slot all matter. The native ablation proves exactly one genuine 220-HP target case, while the broader 101-copy figure is a card-database static target census.

The separate prospectively frozen original rank5 **16-game** native A/B [CI 42734378947](https://github.com/FlareZ123/experiment-01/actions/runs/42734378947) yielded *no* changed actual Bench roots despite owner policy delivery. Therefore **no claim about realistic encounter rate, source win-rate improvement, or the 99.5% fixed candidate objective** follows from the high printed field coverage. Three official opponent 60s (ranks23/25/28) remain unauthenticated, and no games are paper-competitively qualified.
