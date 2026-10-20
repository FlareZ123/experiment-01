# Replica Regidrago source image: independent 60-card visual transcription (20 October 2026)

**Provenance status:** A photographed, internally complete Regidrago 60 was independently transcribed from the primary gallery image archived by Agent 3. This is a **candidate source list, not a verified official rank-28 registration**. Existing benchmark manifest coverage remains **29/32**; rankings 23, 25, and 28 remain unfilled. It establishes no game win-rate evidence.

## Primary evidence and archive

- Original 12 May 2026 Top32 Regidrago image gallery: https://note.com/nayuta_poke/n/n7e3d0552090b
- Original fifth Regidrago grid screenshot (visible author レプリカ/@nnaacc5_uec, caption 「リストです」): https://assets.st-note.com/img/1778498104-f3i2b7OUhxcapD08QlB9ywrH.png?width=1200
- Original PNG SHA-256 independently recomputed from Agent 3's archived `dragon-05.png`: `3b23a6fb4daf9b1f537462d50611d6d2765bf0dc228338c3ddd0e41b97452cc9`.
- Agent 3's prior archival CI: https://github.com/FlareZ123/experiment-01/actions/runs/39424823375/artifacts/12265475896.
- Machine-readable **visual transcription with original grid coordinates and per-card counts:** [rank28-replica-visual-60-candidate.json](rank28-replica-visual-60-candidate.json). All individual Japanese **printing IDs are unverified**. A card of the same English name can have different attacks and must not be silently swapped.

## Full photographed 60, independently summed

| Category | Quantity | Visible English card names and counts |
| --- | ---: | --- |
| Pokémon | **20** | 4 Regidrago V; 3 Regidrago VSTAR; 1 Dialga-GX; 1 Dragapult ex; 1 Koraidon ex; 1 Hisuian Goodra VSTAR; 1 Noivern ex; 1 Kyurem; 1 Latias ex; 1 Dedenne-GX; 1 Tapu Lele-GX; 1 Squawkabilly ex; 1 Budew; 1 Marshadow; 1 Wobbuffet |
| Items | **16** | 1 Battle Compressor; 3 VS Seeker; 3 Mysterious Treasure; 1 Quick Ball; 2 Ultra Ball; 1 Hisuian Heavy Ball; 3 Battle VIP Pass; 1 Super Rod; 1 Prime Catcher (ACE SPEC) |
| Tools | **2** | 2 Muscle Band |
| Supporters | **10** | 2 Gladion; 1 Lillie's Determination; 1 Raihan; 1 Iono; 1 Crispin; 2 Guzma; 1 Marnie; 1 Faba |
| Stadiums | **2** | 1 Path to the Peak; 1 Parallel City |
| Special Energy | **3** | 3 Double Dragon Energy |
| Basic Energy | **7** | 3 Fire Energy; 4 Grass Energy |
| **TOTAL** | **60** | 38 individually badged grid entries |

Five independently inspected grid rows have counts of **13 + 8 + 15 + 11 + 13 = 60**, with 8, 8, 8, 8, and 6 distinct card cells respectively. No count was inferred from neighbouring tournament lists. The photographed one-copy ACE SPEC is Prime Catcher, not Brilliant Blender or Computer Search. The second Stadium was directly read as Japanese **パラレルシティ**, Parallel City, and its unusual half-inverted blue/green city illustration matches the [Japanese Pokémon Card Game official XY8 entry](https://www.pokemon-card.com/card-search/details.php/card/31367) and [official illustration explanation](https://www.pokemon-card.com/products/xy/xy8/xy8_000133.html). The card is Black & White onward in printing lineage.

## Printing-specific checks and remaining uncertainty

- The pictured **Kyurem** has 130 HP, an Ability labelled アンチプラズマ, and the トライフロスト attack. That corresponds mechanically to the **Plasma Bane / Trifrost** Kyurem family (English `sv6pt5-47` in the bundled card database), rather than the several older 130-HP Kyurem attack families.
- The pictured **Koraidon ex** has 230 HP and **カイザータックル 280** (Kaiser Tackle), identifying the **Retribution Strike / Kaiser Tackle** family (English `sv5-120`) rather than the equally 230-HP Dino Cry family. This distinction matters for Regidrago's copied attacks.
- The pictured **Wobbuffet** has 110 HP and clearly the **Bide Barricade** Ability, consistent with the `xy4-36` mechanical family, not another 110-HP Wobbuffet with Shady Tail.
- The pictured **Marshadow** has 80 HP and the **Resetting Hole** Ability, as on `sm10-81`. The **Noivern ex** appears to be the 260-HP Covert Flight/Dominating Echo family, not a later 270-HP printing.
- The **Budew** has 30 HP (Itchy Pollen family); the English database contains multiple mechanically identical 30-HP appearances. Source Japanese exact print identities, including artwork-specific card variants, remain to be verified. Full Japanese set-number extraction from this compressed screenshot alone is unreliable.
- Other Japanese printing IDs and source-to-simulator proxy translations remain open. No direct Twinleaf game or rule certification has been executed for this photographed list.

## Ranking identity hold

Independent contemporaneous [community standings](https://pokekameshi.com/cl2026aichidec-extra/2/) quote this same @nnaacc5_uec account as **「予選28位トナメ1没」** (qualifying 28th, eliminated in first single-elimination round). The repository's [official placement field](field.csv) separately records **Jo Kato, Regidrago, final placement 28**. Matching the qualifying number and archetype is strong circumstantial evidence, but the official registered name and public account are not directly tied by a confirmed deck code, opponent record, or identifiable official deck registration. A further potential issue is qualifying rank versus final bracket rank. **Do not assert that this is Jo Kato's 60 or add this list to the exact rank-28 opponent manifest yet.**

## Recommended next check

Recover the original public pnote deck code, a higher-resolution source screenshot, or an original event-registration/name bridge. Obtain a second independent Japanese-printing-level transcription, then compare its 38 card cells and 60 badge count to the JSON. If attribution is established, perform full paper Expanded legality and exact-printing validation, including 2026 Japanese-to-English card equivalences, before the list enters a competitive simulation cohort.

**Reproduction:** Inspect the archived `dragon-05.png` at the cited CI artifact, count the badges in their exact original row/column coordinates, and compare the machine-readable JSON. This is an observational source provenance result. It does not change the global win-rate or match-qualification status.
