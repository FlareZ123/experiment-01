# Aichi source ranks 17–22, 26–27 and 30–32: international Expanded proxy audit

**Agent 3 · 13 November 2026**  
**Disposition:** no current international Expanded card-pool or deck-construction blocker identified in these 11 English-display lists. **Not admitted as verified Aichi physical opponents:** the Limitless manifest does not authenticate the original Japanese physical printings.

## Scope and source

Audited ranks **17, 18, 19, 20, 21, 22, 26, 27, 30, 31 and 32** from `results/aichi-2026/full-decklists.json` (660 total card slots). The source manifest says its printing IDs follow Limitless English display where available and that Japanese legality/original printings must be checked separately. This is therefore an **international Expanded card-identity proxy screen**, not a claim about the exact cards the Japanese players physically registered.

The current governing candidate format is paper Expanded (Black & White onward). The source event was Japanese Extra on 10 May 2026. Preserve that distinction.

## Rank-level construction checks

| Rank | Player | Archetype | Cards | Unique lines | Pokémon / Trainer / Energy | ACE SPEC | Radiant |
| ---: | --- | --- | ---: | ---: | ---: | --- |
| 17 | Yuya Yamano | Raichu Electrode Combo | 60 | 27 | 18 / 30 / 12 | Secret Box (TWM 163) | 0 |
| 18 | Hayato Omuro | Regidrago | 60 | 33 | 21 / 31 / 8 | Prime Catcher (TEF 157) | 0 |
| 19 | Mark Takahashi | Raging Bolt | 60 | 37 | 16 / 31 / 13 | Secret Box (TWM 163) | 0 |
| 20 | Satoru Imamura | Regidrago | 60 | 36 | 20 / 30 / 10 | Megaton Blower (SSP 182) | 0 |
| 21 | Shun Nakajima | Regidrago | 60 | 38 | 20 / 30 / 10 | Megaton Blower (SSP 182) | 0 |
| 22 | Haruya Mori | Absol Garbodor | 60 | 36 | 14 / 38 / 8 | Secret Box (TWM 163) | 0 |
| 26 | Hibiki Yamada | Meloetta Donk | 60 | 32 | 12 / 45 / 3 | Dowsing Machine (PLS 128) | 0 |
| 27 | Yuya Nagatsuma | Regidrago | 60 | 37 | 20 / 30 / 10 | Prime Catcher (TEF 157) | 0 |
| 30 | Koki Takeda | Lillie's Clefairy | 60 | 32 | 16 / 37 / 7 | Secret Box (TWM 163) | 0 |
| 31 | Yuhi Yokoyama | Dusknoir Chimecho | 60 | 31 | 22 / 33 / 5 | Grand Tree (SCR 136) | 1 (Alakazam) |
| 32 | Kaito Higuchi | Regidrago | 60 | 39 | 20 / 30 / 10 | Megaton Blower (SSP 182) | 0 |

All 11 lists total exactly 60 cards. Every non-Basic card name is at or below four copies. Each list has exactly one ACE SPEC card. No list has more than one copy of the same Prism Star identity. No list exceeds one Radiant Pokémon; rank 31 has one Radiant Alakazam and the other ten have none. Basic Energy counts are treated separately from the four-copy rule.

## English Expanded printing coverage

Across the 11 lists there are **143 distinct source display set/number/name tuples**:

- **136** resolve to exact English card records by set-code crosswalk and collector number in `resources/sets/en.json` plus `resources/cards/en/*.json`. Each matched record is present and its bundled `legalities.expanded` value is `Legal`.
- **One** display promo alias, Karen XYP 177, resolves to `xyp-XY177` in `resources/cards/en/xyp.json`; its Expanded flag is Legal. Agent39's [official Japanese-print crosswalk](../agent39-xyp-japanese-print-crosswalk-20261113.md) maps rank 22's Karen to **XY-P 256/XY-P**, with matching text and pre-event distribution (2016-08-01 to 2016-09-30). This establishes an available Japanese counterpart, not the exact physical copy used by the player.
- **Six** display tuples use the non-indexed `MEE` code for Basic Energy: Grass, Fire, Lightning, Fighting, Darkness and Psychic. `MEE` is absent from `resources/sets/en.json`, but each Basic Energy type has multiple English Expanded-legal printings in the bundled card pool. Representative exact records are:

| Basic Energy identity | English Expanded-legal example |
| --- | --- |
| Lightning Energy | `swsh7-235` |
| Darkness Energy | `swsh7-236` |
| Grass Energy | `swsh8-283` |
| Fire Energy | `swsh8-284` |
| Fighting Energy | `sm2-169` |
| Psychic Energy | `bw1-109` |

The six MEE entries are Basic Energy identities, not six unknown Pokémon/Trainer cards. The source's exact physical energy print remains unverified, but no Expanded card-pool blocker follows from the display alias.

## Official banlist overlay

The current official Pokémon Expanded banned-card page was checked on 13 November 2026. It lists 27 banned identities / 49 exact printings. Exact set/collector-number comparison against all 29 published Aichi lists yields **zero banned-printing hits**. This is an independent overlay: the bundled `legalities.expanded` flags are not a complete banlist authority. Eight official banned printings (Duskull CEC 83; four Flapple prints; three Medicham V prints) are incorrectly marked Legal in the snapshot; see [the discrepancy report](../agent3-expanded-banlist-snapshot-discrepancy-20261113.md).

Relevant same-name negative controls in this slice:

- Rank 17/26/30/31 Unown is AOR 30, not banned Lost Thunder Unown 90/91.
- Rank 17/18/19/20/21/27 Marshadow is UNB 81, not banned Shining Legends 45 / SM85.
- Rank 31 Duskull is PRE 35, with **Come and Get You** / **Mumble**, not banned Duskull CEC 83 with **Spiritborne Evolution**.
- Rank 26 Special Red Card CRI 82 is not Red Card XY 124 / Generations 71.

Do not implement a blanket name-only ban for these Pokémon or confuse Special Red Card with Red Card. The existing [Japanese event-date identity audit](../../../methodology/2026-11/agent7-expanded-vs-aichi-field-legality-audit-20261112.md) and [same-name collision report](../../agent5-japanese-expanded-ban-printing-collisions-20261031.md) cover the corresponding print-sensitive identity distinction.

## Rank 26 source-date bridge

Rank 26 contains one Special Red Card CRI 82. CRI's English release date is 22 May 2026, after the Aichi event date. This does not imply the Japanese source card was post-event: the existing [official M4 bridge](../../../legality/agent3-aichi-2026-english-japanese-m4-bridge-v1.json) identifies the Japanese counterpart as **M4 072/083**, released **13 March 2026**, with an official Japanese card record and a publisher ruling for the zero-hand condition. Rank 26 is therefore not disqualified by the English display release date. The bridge establishes the Japanese pre-event counterpart and core effect, not a player-specific photograph of the physical card.

## What this does and does not establish

**Established for these 11 rows:** 60-card count; four-copy rule; one-ACE-SPEC rule; Prism Star copy check; Radiant Pokémon limit; English card-pool resolution for 136 exact printings plus the seven documented aliases; no exact current international Expanded banned printing.

**Not established:** the exact original Japanese physical printing for every source row; full Japanese event-date legality of every original card; player identity or registration authenticity beyond the published source manifest; Twinleaf support/fidelity; competitive playability; any matchup outcome or win rate.

Consequently, these are **11 provisionally clear English Expanded proxy lists**, not 11 admitted Expanded opponents. Do not change the decision board's verified field denominator until the source-print bridge and independent review are complete. This report contributes no game or 99.5% evidence.
