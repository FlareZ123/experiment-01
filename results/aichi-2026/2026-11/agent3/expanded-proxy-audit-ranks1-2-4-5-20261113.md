# Aichi source ranks 1, 2, 4 and 5: international Expanded proxy audit

**Agent 3 · 13 November 2026**  
**Disposition:** no current international Expanded card-pool or deck-construction blocker identified in these four English-display lists. **Not admitted as verified Aichi physical opponents:** the Limitless manifest does not authenticate the original Japanese physical printings.

## Scope and source

Audited ranks **1, 2, 4 and 5** from `results/aichi-2026/full-decklists.json` (240 total card slots). The source manifest states that printing IDs follow Limitless English display where available and that Japanese legality/original printings require separate verification. This is an international Expanded card-identity proxy screen, not a claim about the exact cards physically registered by the Japanese players.

## Rank-level construction checks

| Rank | Player | Archetype | Cards | Unique lines | Pokémon / Trainer / Energy | ACE SPEC | Radiant | Prism Star |
| ---: | --- | --- | ---: | ---: | ---: | --- | --- | --- |
| 1 | Yasunori Kato | Shadow Rider Calyrex | 60 | 33 | 18 / 31 / 11 | Unfair Stamp (TWM 165) | Radiant Eternatus ×1 | 0 |
| 2 | Takahiro Ando | Vileplume Control | 60 | 38 | 26 / 28 / 6 | Grand Tree (SCR 136) | 0 | 0 |
| 4 | Shu Hosoda | Raichu Electrode Combo | 60 | 31 | 18 / 30 / 12 | Secret Box (TWM 163) | 0 | Ditto ◇ ×1 |
| 5 | Yamato Nakano | Mew Genesect | 60 | 30 | 14 / 42 / 4 | Secret Box (TWM 163) | 0 | 0 |

All four lists total exactly 60 cards. No non-Basic card name exceeds four copies. Each has exactly one ACE SPEC. No list has more than one copy of the same Prism Star identity, and no list exceeds one Radiant Pokémon. Basic Energy counts are treated separately from the four-copy rule.

## English Expanded printing coverage

Across the four lists there are **104 distinct source display set/number/name tuples**:

- **99** resolve through the normal `ptcgoCode` → set-ID crosswalk and exact collector number in `resources/sets/en.json` and `resources/cards/en/*.json`.
- **Three** promo aliases resolve to exact English card records:
  - Trevenant & Dusknoir-GX SMP 217 → `smp-SM217`
  - Jirachi XYP 67 → `xyp-XY67`
  - Karen XYP 177 → `xyp-XY177`
- **Two** display tuples use the non-indexed `MEE` code for Basic Energy: Psychic Energy and Grass Energy. `MEE` is absent from `resources/sets/en.json`, but both Basic Energy identities have multiple English Expanded-legal printings in the bundled card pool (e.g. Psychic `bw1-109`; Grass `swsh8-283`).

All **102 resolved English card records** are present and marked `legalities.expanded: "Legal"`. The display-name normalization differences are limited to Battle Compressor → Battle Compressor Team Flare Gear, Ditto ♢ → Ditto ◇, and Unit Energy LPM → Unit Energy LightningPsychicMetal. These are catalog naming differences, not missing card identities.

## Official banlist overlay

The current official Pokémon Expanded banned-card page was checked on 13 November 2026. Exact set/collector-number comparison against the official 49-printing list yields **zero banned-printing hits** in these four lists (and zero across all 29 published Aichi lists).

The bundled card-pool legality flags are not a complete banlist authority: eight official banned printings (Duskull CEC 83; four Flapple prints; three Medicham V prints) are incorrectly marked Legal. None of those exact identities occurs in ranks 1, 2, 4 or 5. See [the discrepancy report](../agent3-expanded-banlist-snapshot-discrepancy-20261113.md).

Relevant same-name controls: rank 1's Marshadow UNB 81 is not banned Shining Legends 45 / SM85; rank 5's Wally ROS 94 is not on the Expanded banned list; rank 4's Ditto Prism Star is not a banned identity. Do not infer bans by broad name alone.

## Pre-event Japanese counterpart bridges

- **Rank 2 Jirachi XYP 67** maps to Japanese **Jirachi XY-P 129/XY-P**, with matching Stardust / Dream Dance text and official Japanese-card evidence dating to May 2015.
- **Ranks 2 and 5 Karen XYP 177** map to Japanese **Karen XY-P 256/XY-P**, with matching Supporter text and official Card Gym distribution evidence from 1 August through 30 September 2016.
- **Rank 5 Special Red Card CRI 82 ×2** maps to Japanese **M4 072/083**, released **13 March 2026**, before the Aichi event. The English CRI release is 22 May 2026, after the event; the existing M4 bridge resolves that apparent date conflict and links the official Japanese zero-hand ruling.
- **Rank 1 Trevenant & Dusknoir-GX SMP 217** resolves to an English Expanded-legal card record. A player-specific/original Japanese print bridge for this row is not established in this audit.

The Jirachi/Karen evidence is in [Agent39's official XYP crosswalk](../agent39-xyp-japanese-print-crosswalk-20261113.md). The Special Red Card / M4 evidence is in [Agent3's M4 bridge](../../../legality/agent3-aichi-2026-english-japanese-m4-bridge-v1.json).

## What this does and does not establish

**Established for these four rows:** 60-card count; four-copy rule; one-ACE-SPEC rule; Prism Star and Radiant limits; English card-pool resolution for 102 card records plus two Basic Energy aliases; no exact current international Expanded banned printing; pre-event Japanese counterpart evidence for Jirachi, Karen and Special Red Card.

**Not established:** the exact original Japanese physical copy for every source row (notably Trevenant & Dusknoir-GX); complete player-specific source-print authentication; Twinleaf support/fidelity; competitive playability; any matchup outcome or win rate.

This completes the **card-pool / current-banlist / deck-construction proxy screen for the remaining four potentially compatible lists**. Together with the existing 20-rank screen, all **24/24 authenticated potentially compatible lists** now have a card-pool and current-banlist screen. This does **not** promote any rank to verified Expanded opponent status: the physical Japanese source-print gate remains open and the verified field denominator remains **0/32**.
