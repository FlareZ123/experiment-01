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

## Machine-verified corpus census (6 November 2026 update)

The original unvalidated exact-card census is now repaired and independently exercised against the **entire registered 29-deck Pokémon field**. All **309 distinct deck Pokémon entries**, each with its source copy count, resolve to **one unique supplied-corpus exact printing**; the complete source 60s are independently asserted. The compiled pure Node 22 workflow [run 42280166914](https://github.com/FlareZ123/experiment-01/actions/runs/42280166914) completed successfully at code revision `3d1b254054b02b21343346c382121b6291e2d142`, with the new source tests passing and machine-readable JSON plus SHA-256 sidecar uploaded in artifact **13534857783**. It identified exactly the four literal retreat-prohibition Pokémon entries above, at original ranks **2, 3, 7 and 31**. No unresolved Pokémon entries remain **under this corpus/manifest matching contract**.

The [source resolver](../../simulation/evaluation/agent2-aichi-exact-retreat-prohibition-census.cjs) now joins a registered source row to all candidate sets sharing its `ptcgoCode`, and requires a unique exact card number and Pokémon name. For promo source shorthand `XYP` and `SMP`, it cross-checks the official supplied set IDs `xyp` and `smp` and their respective physical `XY`/`SM` number prefixes. Source transcriptions using the glyph `♢` for Prism Star are matched specifically to the card corpus's `◇` spelling. The prior **ten unresolved Pokémon rows** comprised four promo shorthand rows (one SMP, three XYP) and six Prism Star glyph rows. A mismatch, absent set/file, or more than one matching printing remains explicitly unresolved, rather than silently guessed. The duplicate `ptcgoCode` gallery problem is resolved by exact ID identity matching.

The pure [regression tests](../../tests/agent2-aichi-exact-retreat-prohibition-census.test.cjs) enforce 29 source originals, **309/309 exact Pokémon printing rows**, zero unresolved rows, the four specific hit ranks and printings, and positive/negative cases for multiple set aliases. Source-side `60`-card count validation and any historical event-day printing transformations remain separate. This audit is limited to Pokémon printed **literal** `can't/cannot retreat` text, so it is not an all-effects mobility oracle. It does not prove a lock activated during any recorded game, and no live owner-choice or native-Store test was run in this pure census.

**Qualification remains zero full paper games and no selected fixed 60 against the full original 32.** This note provides an exact-printing rule-risk map, not a win-rate estimate.
