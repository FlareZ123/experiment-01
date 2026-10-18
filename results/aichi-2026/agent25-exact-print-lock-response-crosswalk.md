# Agent 25: exact-print lock pressure and realistic counterplay across Aichi 2026 Top 32

**18 October 2026.** Evidence: 29 archived, printing-identified published 60-card lists and individual printed card text, independently checked against the bundled card database and Advanced Player's Rulebook. This is **inventory analysis and mechanical reasoning**, with no real-game decision validation or matchup-win claim. Ranks 23, 25 and 28 remain source-unavailable.

## Why another source census is useful

The project already has a complete [printing-resolved lock matrix](../../scripts/aichi_lock_matrix.cjs), its [archived lock output](lock-presence.json), and [same-name printing checks](../../tests/aichi-printing-mechanics.test.cjs). This contribution **reuses** those definitions and measures a narrower outstanding dimension: how often the published 60s actually contain several widely proposed *responses*, and which proposed response channels disappear when an Item or Supporter lock is genuinely active.

A name-only count can merge two different attacks/Abilities. At rank **15**, the two `Vileplume AOR 3` have **Irritating Pollen** (Item lock), while one `Vileplume BUS 6` has **Disgusting Pollen** (Active-position Basic attack denial). At rank **16**, `Garbodor LTR 68` (two copies) and `Garbodor BKP 57` (one copy) share **Garbotoxin**, despite having different attacks. The project’s earlier canonical matrix already models these distinctions; the answer census must retain them.

## Exact published 29-list inventory

| Printed candidate response | Printed lists containing it | Physical copies | Source rank numbers |
| --- | ---: | ---: | --- |
| Field Blower GRI 125 | **9 / 29** | 11 | 1, 5, 7, 8, 19, 22, 29, 30, 31 |
| Lost Vacuum LOR 162 | **1 / 29** | 1 | 5 |
| **At least one of the two Item Tool removers** | **9 / 29** | 12 combined copies | Same nine ranks; rank 5 carries both |
| Pokémon Ranger STS 104 | **5 / 29** | 5 | 4, 5, 7, 18, 32 |
| Stealthy Hood UNB 186 | **4 / 29** | 7 | 2, 3, 15, 32 |
| Canceling Cologne ASR 136 | **2 / 29** | 2 | 9, 26 |
| Escape Rope BST 125 | **7 / 29** | 11 | 4, 5, 9, 11, 17, 26, 31 |

In these narrow six exact-print categories, **19 of 29** published lists contain at least one named card. That union is **printed inventory**, not a universal `19/29 can break a lock` statistic. Items can be unplayable, Ranger competes for the Supporter turn, Escape Rope requires the relevant Bench and gives the opponent their promotion choice, and Stealthy Hood only protects the equipped Pokémon against an opponent's Ability effects.

For scale, the canonical source-lock matrix finds **24 of 29** published lists with at least one of its twelve known exact-print threat types (including Budew Itchy Pollen, Garbotoxin, Vileplume and Stoutland, Iron Thorns Initialization, Klefki, Wobbuffet, Path to the Peak, Silent Lab and Snorlax Block). Mere inclusion likewise says nothing about whether that lock was reachable or active at a specific turn.

## Two mechanically distinct Item-lock challenges

| Response example | After Budew ASC 16 **Itchy Pollen** resolved on the defender | With Vileplume AOR 3 **Irritating Pollen** currently active |
| --- | --- | --- |
| Field Blower / Lost Vacuum | Cannot play the Item during the attack-imposed Item lock | Cannot play the Item while the Ability-imposed Item lock persists |
| Escape Rope | Cannot play the Item under the attack-imposed lock | Cannot play the Item under the Ability-imposed lock |
| Pokémon Ranger | **Can remove the attack's effect on the player**, provided Ranger is playable and the Supporter use remains available | Its effect clears attack effects; **does not remove this passive Ability** |
| Stealthy Hood | Protects an equipped Pokémon from effects of opposing Abilities, not a player from an attack-imposed Item prohibition | Protects an equipped Pokémon from opposing Abilities; **does not lift an effect on the player** prohibiting Item play |
| Canceling Cologne | It is itself an Item, so is unavailable during the lock | It is itself an Item, so is unavailable during the lock |

This is a direct consequence of printed `Budew ASC 16` (effect of an **attack on the opposing player**), `Vileplume AOR 3` (continuing **Ability affecting both players**), `Pokémon Ranger STS 104` (removes **effects of attacks**), and `Field Blower GRI 125`, `Lost Vacuum LOR 162`, `Escape Rope BST 125`, `Canceling Cologne ASR 136` (all **Items**). The supplied advanced rulebook C-19 expressly treats such a play prohibition as an effect **on the player**, and basic effect priority makes an active “can't play” prohibition operative. The distinction also matters for preserving `Stealthy Hood` on a lock Pokémon because the Tool affects Pokémon-targeted Ability effects.

A further possible source board deserves a replay: published rank 2 contains both `Vileplume AOR 3` and `Stoutland BCR 122`. If the former is in play with its Ability active and the latter is Active with **Sentinel** active, the opponent can face simultaneous **Item and Supporter** locks. A Pokémon Ranger that could ordinarily clear a preceding Budew attack effect would then be unavailable as a Supporter. This states a *conditional board-legal mechanism*; it does not claim the tournament pilot actually established it in a particular game.

## How this should change deck optimization

1. For each candidate lock escape, require **the exact lock source and timing**, then assess whether the counter card can legally be played at that time. Searching for an Item is not progress when the opponent has already imposed Item lock.
2. Before trusting a “Field Blower answer” to early Garbotoxin, verify Field Blower remains accessible and Item play remains legal; check whether `Garbotoxin` is on the Bench and whether the Tool can be removed. An opponent’s Active-only Ability denial route will not automatically disable a Benched Garbodor.
3. Against Budew, model Ranger as a **Supporter-contended, conditional attack-effect reset**. Do not grant it the same response role against an already active Vileplume, and do not conflate it with a future-turn attack position or eventual KO.
4. Keep the 29 observed lists as a bounded source cohort. A fixed 60 must ultimately be tested against all 32 with independently qualified action selection and paper-accurate resolution. Neither missing rank may be replaced by an archetype proxy for performance reporting.

## Reproduction and verification

- Existing canonical lock data: [source script](../../scripts/aichi_lock_matrix.cjs), [print-aware result](lock-presence.json).
- New **counterplay crosswalk**: [source script](../../scripts/aichi-printing-lock-surface.cjs), with [source-lock and collision regressions](../../tests/aichi-printing-lock-surface.test.cjs). It uses the canonical lock definitions and counts only original printing identities from `full-decklists.json`.
- [Existing manually invoked threat audit](../../.github/workflows/aichi-threat-audit.yml), [CI **39148201128**](https://github.com/FlareZ123/experiment-01/actions/runs/39148201128), **passed** at source head `8223116ad1261fed596e0a6b1666fc6a5118d909`, including new print-resolved answer tests and the existing threat audit. This is pure Node/source validation, with no simulator or qualified game.
- Human-prior mechanisms: `resources/human_concepts.md` (lock interactions, Bench contention, DCI/AMR). They are hypotheses for follow-up, not gameplay evidence.

**Research status unchanged:** exact original opponents **29/32**, competitively qualified source games **0**, and the 99.5% full-field target **unproven**.
