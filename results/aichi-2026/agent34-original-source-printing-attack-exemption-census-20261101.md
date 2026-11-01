# Source-printed attack exemption exposure across authenticated Aichi opponents

**Agent 34, 1 November 2026.** This is a printed-card-language inventory, never a native effect or competitive attack-usage measurement.

The reproducible [offline census](../../simulation/evaluation/agent34-source-printed-attack-exemptions.cjs) joins the canonical [29 authenticated exact source decklists](full-decklists.json) to the bundled printed card database using set code and card number. Exact printing-name mismatches and ambiguous or unknown set mappings remain unresolved, rather than quietly substituting another printing. Its [five pure tests](../../tests/agent34-source-printed-attack-exemptions.test.cjs) passed under compiled workflow [41363405451](https://github.com/FlareZ123/experiment-01/actions/runs/41363405451); the full workflow later failed on a separate native Resistance **phase-name expectation**, while the physical damage correction itself was correct.

The source has **102 distinct Pokémon printings** across the 29 source lists. **13 printed-source identities remain unresolved** in this exact-string join; their attack text has *not* been classified. Among resolved printings, 13 have at least one of the specified exception/damage-counter language patterns, including three with explicit Weakness/Resistance disregard. Printed regular Bench-spread reminders are classified separately to avoid falsely treating them as global attack exemptions.

| Original printing | Source ranks containing it | Source-text concern |
| --- | --- | --- |
| Tapu Lele-GX GRI 60 | 1, 4, 8, 10, 11, 12, 13, 14, 16, 18, 19, 20, 21, 22, 27, 30, 31, 32 | Energy Drive explicitly ignores Weakness/Resistance. Separate native tests establish the original pinned engine handles both incorrectly; narrowly corrected in research-owned reversible hook. |
| Girafarig LOT 94 | 1, 2, 3, 7 | Printed Weakness/Resistance disregard; native effect handling has **not** been tested by Agent34. |
| Alolan Raichu UNM 57 | 4, 17 | Printed Weakness/Resistance disregard on Electro Rain, a separately investigated native path and hook in the shared repository. |

Across the resolved printings, damage ignoring all effects on the defending Pokémon appears on three printings across ranks 1, 5, 10, 12, 13, 14, 15, 18, 20, 21, 27, 30, 32. The ordinary Benched-Pokémon Weakness reminder appears on three printings, handled as a different pattern. Printed damage-counter placement appears on four printings.

**Interpretation:** At least **22 of the 29** authenticated source opponents include one of the three explicit Weakness/Resistance-bypass Pokémon printings. This is a *deck inclusion union*, not evidence those attacks are selected or strategically obtainable. The 13 unresolved printings limit completeness, and 3 missing opponents (ranks 23, 25, 28) remain outside the 29-original census. The common 18-deck Tapu Lele-GX printing creates a broad source exposure to a real engine defect, even though actual attack-frequency impact remains unknown.

No fixed-deck ranking changes, timing qualification, full-game paper results or 99.5% claims follow from this source catalog.
