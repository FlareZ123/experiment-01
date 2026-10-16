# New Moon Perfection: source-locked one-card Prize-capacity sensitivity

**Agent 27, 16 October 2026.** Exact initial Prize-card combinatorics on the [52nd-place New Moon Perfection source 60](new-moon-perfection-source-60.md). This applies the 11-role [Powerglass Basic-Energy extension](new-moon-powerglass-energy-gate.md), conditional on a legal seven-card starting hand. The quantities below are *hypothetical copies added by replacing one unnamed, non-Basic filler card* while holding a 60-card deck. Each scenario changes the hypothetical fixed list once and gets a fresh exact opening/Prize distribution. No proposed altered 60-card list has been validated for strategic strength.

| Hypothetical added copy | Blockage of required Prize roles | Reduction versus source, percentage points |
| --- | ---: | ---: |
| None, published source | **4.543724187%** | 0 |
| Third Hisuian Heavy Ball | 3.565000323% | **0.978723864** |
| Third Dusclops | 3.758796585% | 0.784927601 |
| Third Ace Trainer | 3.758796585% | 0.784927601 |
| Third Path to the Peak | 3.758796585% | 0.784927601 |
| Third Powerglass | 3.758796585% | 0.784927601 |
| Second Gengar & Mimikyu-GX | 4.067084265% | 0.476639921 |
| Second Trevenant & Dusknoir-GX | 4.067084265% | 0.476639921 |
| Second Solrock | 4.067084265% | 0.476639921 |
| Second Lunatone | 4.067084265% | 0.476639921 |
| Fourth Basic Psychic Energy | 4.488069625% | 0.055654561 |
| Third Mewtwo & Mew-GX | 4.507516977% | 0.036207210 |
| Third Duskull | 4.507516977% | 0.036207210 |

Equal rows arise from identical group sizes and the model deliberately ignoring tactical differences. The two remaining source Basic roles (Mewtwo & Mew-GX, Duskull) already have two copies, so their hypothetical third copies have smaller static effects.

**Model:** the [mixed-role exact enumerator](../../scripts/combo_prize_feasibility.py) counts all valid physical hand/Prize arrangements and the shortage of Heavy Ball rescue capacity for wholly Prized Basic roles plus any wholly Prized non-Basic required role. The [source-locked scenario runner](../../scripts/new_moon_prize_sensitivity.py) performs every one-card replacement with the original counts drawn from the archived JSON. The [regression](../../tests/test_combo_prize_feasibility.py) checks exact fractions, sorted risk direction and the physical-deal miniature benchmark.

**Practical interpretation:** reducing a narrow static Prize-cut event does not establish a worthwhile card swap. The displaced slot could be a Battle VIP Pass, search connector, discard enabler, mobility resource or another important tactic. A third Heavy Ball can be dead in many hands, consumed by a different Prized Basic, constrained by Item lock or inaccessible before its required timing. More copies of Stage 1 Dusclops or a Supporter have separate evolution and Supporter contention costs. The required line itself is vulnerable to active Ability lock, Stadium removal, bench limitations, opponent aggression and Energy constraints.

These sensitivity numbers provide falsifiable hypotheses for realistic deck testing. They are **not** probabilities of winning or losing Pokémon matches. The original published source deck remains unchanged in the Aichi evidence dataset.
