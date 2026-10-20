# Iron Thorns Initialization: exact-print static Ability eligibility across 29 published Aichi decks

**Agent 5, 20 October 2026. Evidence:** deterministic registered-60 inventory audit against unfiltered English card printings and manual compiled-free GitHub CI. This measures **possible printed targets** of the *Initialization* Ability, not an active lock, successful opponent denial, game result or candidate win rate.

## Verified result

[Manual card-audit run 39377306393](https://github.com/FlareZ123/experiment-01/actions/runs/39377306393) passed on source commit `317283e92f26b680046848c298bfd39e2b0243f8`. The [source census](../../scripts/aichi-initialization-potential-census.cjs) resolves each Pokémon's **published English printing identity** against `resources/sets/en.json` and its specific `resources/cards/en/*.json`. The [two regression tests](../../tests/aichi-initialization-potential-census.test.cjs) passed, including the full 29-deck snapshot and a synthetic independent separation of Rule Box, non-Rule Box, Future and evolution-only classes. The manual [existing card audit workflow](../../.github/workflows/aichi-card-audit.yml) now reruns the check when dispatched; no new workflow or recurring CI was added.

| Registered target inventory class | Exact ranks | Number of known 60s |
| --- | --- | ---: |
| **Zero Rule Box Pokémon with a non-Future Ability** | **6, 7, 24, 29** | **4** |
| Rule Box Ability targets exist, but **only on Evolution Pokémon** | **2** | **1** |
| At least one **Basic** Pokémon with a potentially suppressible Rule Box Ability | Remaining published ranks | **24** |
| Published exact source 60s | All ranks except 23, 25, 28 | **29** |

There are **four irrevocably no-target decks among the 29 published lists**. They represent at least **4/32 tournament placements**, with three original lists still unavailable. The class is independent of whether Iron Thorns is presently Active, and so it should be assigned before considering observed source lock success. The first 29 are source registrations, not the distribution of future optimized challenger decks.

The no-target class has **two different mechanisms**:

* **Ranks 6, 24 and 29:** each registered Pokémon pool consists of four **Iron Thorns ex TWM 77**. Its *Initialization* is a Rule Box Ability, but the Pokémon is **Future** and is explicitly exempted by the printed text.
* **Rank 7, Hiroto Fuji's Snorlax Stall:** the exact 60 has **zero Rule Box Ability copies**. Its eight Pokémon copies with Abilities are all non-Rule-Box Pokémon: three Wobbuffet PHF 36, three Mimikyu PAL 97 and two Snorlax PGO 55. The source list consequently has no Ability that opposing Initialization can remove, even with Iron Thorns Active. This distinct exception was absent from the earlier Future-only triage.

**Rank 2, Takahiro Ando's Vileplume Control** has three possible suppressible Ability copies, all on Evolution Pokémon: two **Pidgeot ex OBF 164** (*Quick Search*) and one **Vileplume-GX CEC 4** (*Fragrant Flower Garden*). Static absence of Basic targets must not be taken to mean those Evolution Pokémon can never enter play early through card effects. Rank 1, by comparison, has **10** printed suppressible Ability copies, **6** of which are Basic Pokémon. These are copy counts, not the probability or duration of live suppression.

## Method and formal boundary

For each of the 29 original source 60s, expand the published Pokémon printings without merging similarly named cards. Resolve their exact `set + number + name` in the supplied card archive, including the separate numbered promo sets and Trainer Gallery set-code collisions. Mark a Pokémon printing as a *possible Initialization target* when:

1. Its card has at least one printed Ability.
2. Its card has a Rule Box, evidenced here by the database's `rules` list.
3. Its subtypes do **not** include `Future`.

Count the physical copies and distinguish Basic from Evolution. `noTarget`, `evolutionOnly` and `basicPossible` are exhaustive inventory classes. The census preserves rank-by-rank printing IDs and Ability names in machine-readable JSON. It uses the exact registered opponent 60s as immutable inputs and does not choose favorite game outcomes, seeds, source opening hands or tactical branches.

**Input normalization uncovered a real reproducibility issue.** The registered Limitless English display spells the Prism Star symbol in names such as `Ditto ♢` while the supplied card archive uses `Ditto ◇`. The first live workflow run [39377149975](https://github.com/FlareZ123/experiment-01/actions/runs/39377149975) correctly failed closed at rank 4 `LOT 154`. The resolver now normalizes only those two **display glyphs** while retaining an exact collector set, number and original name match otherwise. The corrected [39377306393](https://github.com/FlareZ123/experiment-01/actions/runs/39377306393) passed; no broad name-only matching was introduced.

The textual effect of Wobbuffet PHF 36 *Bide Barricade*, when Active, removes Abilities from non-Psychic Pokémon and is therefore a possible **counter-lock** to Lightning-type Iron Thorns ex. This is a printed-text possibility requiring a separate simultaneous-Ability and live board validation. Rank 7's exemption from Initialization says nothing about its vulnerability to a **different** Ability lock such as Garbodor *Garbotoxin*.

## Consequence for the fixed-deck objective

A test requiring **positive native suppression** as its only definition of source lock pressure systematically rejects no-target lists, even when the source's Ability is functioning exactly as printed. Prospectively separate (a) the source lock's own presence, (b) which target category is available in the opposing physical 60, (c) whether an eligible Pokémon is **actually in play**, (d) whether the applicable Ability is suppressed, and (e) the opponent's tactical response and game outcome. Include all original arms in unconditional evaluations; reserve positive suppression for its appropriately conditioned stress-test stratum. Other lock sources and actual board-specific immunities require their own predicates.

**Limits:** The database and Limitless provide English display printings, not confirmed original Japanese physical card copies. The remaining ranks 23/25/28 cannot be assigned a class without their 60s. This analysis establishes no paper-clock feasibility, human-strength decision policy, match win, or proven advantage for any fixed candidate. The repository still has **zero independently qualified competitive games** and **no demonstrated 99.5% deck**.
