# Agent 3: printed attacker provenance and cumulative KO damage (7 November 2026)

**Status:** Across eight native retrospective KO victims, the independent printed nominal damage of their finishing attacks is **140, 140, 20, 130, 130, 200, 200, 200**. The corresponding native cumulative damage-counter totals are **140, 140, 180, 130, 360, 200, 200, 400**. Three totals contain more cumulative damage than the final attack's nominal output. **Zero competitively qualified games and no win-rate evidence.**

## Provenance and method

[Native v28 run 42337690663](https://github.com/FlareZ123/experiment-01/actions/runs/42337690663) at frozen commit f809632bb67e3bba5f002dddc60a13f9ad886d6b emitted all eight public KO victim and settled attack-to-physical-Prize log rows before a receipt-serialization ReferenceError. **The workflow failed.** The [machine fixture](data/agent3-v28-public-ko-attacker-nominal-damage-fixture.json) was independently generated from these original console JSON rows by joining the trial ID, event index, accepted Prize root and attack name. It contains public Pokémon printings, attached target Energy, attack role and observed cumulative damage.

The [pure independent checker](../../simulation/evaluation/agent3-v28-public-attack-damage-screen.cjs) reads each matching original rank-1, rank-6 or rank-11 Pokémon roster from [full-decklists.json](../aichi-2026/full-decklists.json). It resolves card printings using the original local [sets](../../resources/sets/en.json) and [card pool](../../resources/cards/en/), demanding exactly one roster Pokémon with the recorded attack name. Rank 1 here is the fixed contender's champion-reference 60; ranks 6 and 11 are original-source actors. This finds an unambiguous **source-roster candidate** without independently seeing the physical attacker at the actual declared attack root.

The printed Psychic attack on Oranguru V ASR 133 deals 30 plus 50 for each Energy on the Defending Pokémon. Duskull VIV 69 held two Basic Psychic Energy and Mewtwo & Mew-GX UNM 71 held one Basic Psychic plus a single-unit Telepathic Psychic Energy. Each therefore has two nominal Energy units, for 130 damage. All eight attacker-target pairs have neutral printed Weakness and Resistance.

| Original rank and native attack | Unique roster attack source | KO target | Printed nominal | Native cumulative at KO | Difference |
|---|---|---|---:|---:|---:|
| 6 Volt Cyclone | Iron Thorns ex TWM 77 | Girafarig LOT 94 | 140 | 140 | 0 |
| 6 Volt Cyclone | Iron Thorns ex TWM 77 | Duskull VIV 69 | 140 | 140 | 0 |
| 11 Motivate | Squawkabilly ex PAL 169 | Dialga-GX UPR 100 | 20 | 180 | 160 |
| 11 Psychic | Oranguru V ASR 133 | Duskull VIV 69, two Energy | 130 | 130 | 0 |
| 11 Psychic | Oranguru V ASR 133 | Mewtwo & Mew-GX UNM 71, two Energy | 130 | 360 | 230 |
| 1 Eon Blade | Latias ex SSP 76 | Marshadow UNB 81 | 200 | 200 | 0 |
| 1 Eon Blade | Latias ex SSP 76 | Tapu Lele-GX GRI 60 | 200 | 200 | 0 |
| 1 Eon Blade | Latias ex SSP 76 | Trevenant & Dusknoir-GX SMP 217 | 200 | 400 | 200 |

**The differences 160, 230, and 200 are conditional nominal discrepancies**, consistent with earlier counters, modifiers or other effects. They are **not verified prior-damage amounts**. The screen has no declaration-root proof of exact attacking print or paid Energy, no complete damage-modifier reconstruction, no attack/clock adjudication and no competent opponent-policy validation. The 400/200 TAG TEAM row is consistent with a two-hit setup and is still unqualified. Earlier independent KO victim HP/Prize checks are [reported separately](agent3-v28-public-ko-printing-prize-audit-20261107.md).

## Reproduction and implications

The [three-test pure suite](../../tests/agent3-v28-public-attack-damage-screen.test.cjs) passed locally on Node 22.16.0. It rejects unknown/ambiguous source attackers, unrecognized target Energy, unregistered rank and incorrect victim HP. The checker is suitable as a **fail-closed explanatory gate** in the manually triggered native v29 receipt. No v29 green CI has been observed yet. The printed 60s, acting policy and competition qualification remain unchanged.

A later evaluator should compare genuinely observed attack damage against state *immediately before the attack*, with accepted physical declaration and full modifier/payment witnesses, before interpreting knockouts as legal attack payoffs.
