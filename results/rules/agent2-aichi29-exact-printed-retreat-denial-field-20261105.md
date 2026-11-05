# Aichi Open League 2026: exact-printed retreat-denial sources in authenticated original field

**Agent 2 | 5 November 2026 | exact-card database and original-list crosswalk, independent of bot simulation.**

## Matched original 60s and card texts

Across the 29 currently authenticated Aichi Top32 original sixty-card lists in `results/aichi-2026/full-decklists.json`, four source ranks contain exact Pokémon printings whose supplied card text literally says the opposing Defending/Active Pokémon cannot retreat. The count below distinguishes **unconditional passive opponent Active-spot lock** from **attack-imposed temporary effect**.

| Opponent rank | Original archetype | Copies / exact printing | Card-text mechanism | Condition |
| ---: | --- | --- | --- | --- |
| 2 | Vileplume Control | 2× Lillipup CEC 174 (`sm12-174`) | `Baby-Doll Eyes`, [C] | After Lillipup has successfully used its attack, the Defending Pokémon cannot retreat during the next opposing turn |
| 3 | Snorlax Stall | 3× Snorlax PGO 55 (`pgo-55`) | `Block` Ability | Its Snorlax must occupy its owner's Active Spot and have its Ability effective |
| 7 | Snorlax Stall | 2× Snorlax PGO 55 (`pgo-55`) | `Block` Ability | Same public Active Spot constraint as rank 3 |
| 31 | Dusknoir Chimecho | 3× Dusknoir PRE 37 (`sv8pt5-37`) | `Shadow Bind`, [P][P][C], 150 damage | After Dusknoir has used its attack, the Defending Pokémon cannot retreat in the next opposing turn |

Source prints were checked directly in provided `resources/cards/en/sm12.json`, `pgo.json`, and `sv8pt5.json`. Counts, set codes, rankings and archetypes were matched to the committed original-list manifest. The Dusknoir PRE37 printed `Cursed Blast` Ability is distinct from its `Shadow Bind` attack. This is a **literal exact-printing card-text screen**, not a full inventory of retreat control. Some text may express the same restriction differently, and attack restrictions can disappear when the affected Pokémon changes zones or evolves under the Advanced Player's Rulebook.

The target field's original ranks **23, 25, 28** lack authenticated full 60s, so all 32 cannot yet be certified. Other original cards can deny mobility through Asleep/Paralyzed status, attack effects expressed differently, increased retreat costs, Energy denial, switching constraints and other lock interactions. Presence of one listed printing in a deck is neither evidence the Pokémon is in play nor evidence the player has executed the attack needed to impose temporary retreat denial.

## Consequence for an owner-visible mobility planner

A proposed movement action requires three independent checks: whether **retreating is permitted**, what the actual **retreat fee** is, and whether the resulting Active Pokémon produces enough tactical payoff. The observed native error on original rank3 Snorlax, [initial fresh result](../methodology/agent2-skyliner-independent-eight-initial-native-abort-20261105.md), occurred because a free fee from Latias ex Skyliner did not overcome the categorical `Block` prohibition. The [exact-seed corrected replay](../methodology/agent2-skyliner-fresh-independent-eight-exact-seed-block-repair-20261105.md) closed 24/24 fresh arms without an illegal retreat while preserving the historical native positive winner flip.

Lillipup Baby-Doll Eyes and Dusknoir Shadow Bind are **temporal effects on the Defending Pokémon**, so a policy cannot infer they are active merely from seeing the printed card on the opponent's Bench or in its deck. The public owner state must track **whether the relevant attack landed**, current Pokémon identity, and effect removal at evolution, devolution, Bench movement, etc. This is different from Active Snorlax Block, which is conditioned on board presence and Ability effectiveness. A paper switching effect may still bypass a cannot-retreat restriction.

## Methodological note

The diagnostic script `simulation/evaluation/agent2-aichi-exact-retreat-prohibition-census.cjs` was committed as an **experimental exact-printing source crosswalk** but is not yet treated as validated, because the bundled `resources/sets/en.json` has duplicate `ptcgoCode` values for main/galleries (e.g. LOR and SIT). Its current one-set-only check flags these codes as unresolved. The claims above were independently checked for these four exact printings in the provided card data and original manifest. No machine-complete exact field census is asserted until a resolver explicitly disambiguates those duplicate codes and records unresolved rows.

**Qualification remains zero full paper games and no selected fixed 60 against the full original 32.** This note provides an exact-printing rule-risk map, not a win-rate estimate.
