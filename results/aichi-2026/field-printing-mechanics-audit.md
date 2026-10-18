# Aichi mixed-printing mechanism audit

**Agent 30, 18 October 2026.** Follow-up to the [field incidence analysis](field-printing-incidence-audit.md). Source data: the repository's complete `resources/cards/en` English printing database, `resources/sets/en.json` set mappings, and the [29 original listed Aichi source inventories](full-decklists.json). Published Japanese-to-English equivalents and current errata require independent verification when legally decisive. These mechanical comparisons are card-text evidence rather than game-performance results.

Five decks contain two different printings with a shared Pokémon name. Actual card text yields:

| Rank | Name and printing | Relevant printed distinctions |
| --- | --- | --- |
| 15 | Pidgeotto TEU 123 ×1; MEW 17 ×1 | **TEU Air Mail** can select one of the top two cards to keep; **MEW** has no Ability and has the Flap attack |
| 15 | Vileplume AOR 3 ×2; BUS 6 ×1 | **AOR Irritating Pollen** blocks both players' Items from hand while in play; **BUS Disgusting Pollen** blocks the opponent's Basic Pokémon attacks only while that Vileplume is Active |
| 16 | Garbodor LTR 68 ×2; BKP 57 ×1 | Both have the **same conditional Garbotoxin Ability** with a Pokémon Tool requirement; attacks differ: Sludge Toss versus Offensive Bomb |
| 22 | Trubbish FST 168 ×1; NVI 48 ×1 | Neither has an Ability; HP differs (70 versus 60), as do attacks (Call for Family versus Garbage Collection, among other attacks) |
| 31 | Dusknoir PRE 37 ×3; BCR 63 ×1 | **PRE Cursed Blast** places 13 damage counters and Knocks Out itself; **BCR Sinister Hand** repeatedly redistributes damage counters already on opponent Pokémon |

This refines the raw card-name census in two ways. First, the two Vileplume printings in rank 15 offer different lock dimensions with different Active-Spot requirements. Their simultaneous board availability depends on their shared Oddish/Gloom evolution resources, Bench capacity, prizes, and opponent disruption. Second, a Garbodor comparison restricted to its Ability is safe to merge for the two identified printings, since each has Garbotoxin with matching database text. Attack choice and exact printing still differ.

The four Vileplume named copies across ranks 2 and 15 that are AOR 3 represent Item lock; the additional BUS 6 printing in rank 15 contributes a distinct Basic-attack lock. A hypothetical simulator that retrieves just `Vileplume` by name can attribute the wrong lock and invalidate a matchup. The rank-31 two-Dusknoir package likewise has distinct damage roles and costs, including the self-Knock-Out consequence of Cursed Blast.

## Executable verification

[scripts/aichi-printing-mechanics.cjs](../../scripts/aichi-printing-mechanics.cjs) resolves every mixed printing from the actual local set database, verifies name/ID correspondence and compares Ability and attack text. [Three regressions](../../tests/aichi-printing-mechanics.test.cjs) assert all five groups and separately prove differing Vileplume/Pidgeotto/Dusknoir Abilities, shared Garbotoxin with differing attacks, and Trubbish HP/attack differences. Test coverage is limited to these five source split-name cases.

This is useful when designing exact paper-legal candidate responses, lock matrices and source-faithful simulator policies. **No competitive game is qualified and no claim of 99.5% follows from these mechanics.**
