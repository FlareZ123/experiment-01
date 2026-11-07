# Agent39: New Moon Lockbreaker Japanese print and legality audit

**Audit date:** 7 November 2026  
**Candidate:** New Moon Lockbreaker v1  
**Benchmark context:** Aichi Open League 2026, 10 May 2026, Japanese Extra  
**Status:** <badge>Provisional</badge> exact print manifest and dated ban screen pass; full paper-legality sign-off remains open.

## Executive finding

The candidate has a complete 60-card Japanese print manifest with **34 unique physical card identities**. Thirty-two identities are retained unchanged from an official Japanese deck code published for a 52nd-place Aichi participant; two additional identities are separately identified official Japanese prints. The candidate's exact print manifest and English-proxy manifest both total 60 cards and match by name and count.

The repository's dated Japanese Extra ban-screen reports **zero exact restricted-print collisions**. Two same-name contacts are false positives at the name-only level: the candidate's Unown is XY (not the restricted SM8 Unown), and its Duskull is S4 (not the restricted SM11a Spiritborne Evolution Duskull). The candidate has one ACE SPEC, Secret Box.

This is a strong **print-provenance and restricted-print screen**, not a complete paper-legality certificate. The ban-screen source itself warns that English ability/attack matching is a narrow proxy for specified Japanese print identities. A full Japanese text/errata and event-rule sign-off remains outstanding. The current v10/v10b native candidate runners also do not install the research-owned Canceling Cologne once-per-turn hook, which is a separate simulator-fidelity issue.

The candidate remains an experimental list. It is not one of the Aichi Top32 registrations, has no qualified competitive games, and is not nominated as the final deck.

## Provenance and exact construction delta

The original physical source is the official Japanese deck code [GxxDYx-a4rD4W-a8xYxc](https://www.pokemon-card.com/deck/confirm.html/deckID/GxxDYx-a4rD4W-a8xYxc), retrieved 17 October 2026 and archived by workflow run 39020209669, artifact 12095944382. The official deck viewer supplied the source card IDs and quantities; Japanese set codes were extracted from the official card image paths. The source was a 52nd-place Aichi participant, not a Top32 benchmark opponent.

The Lockbreaker candidate keeps 32 of the source's 33 unique names with their exact Japanese print IDs. Its four quantity changes are:

| Card | Source | Candidate | Change |
|---|---:|---:|---:|
| Trainer's Mail | 2 | 0 | -2 |
| Rescue Carrier | 4 | 2 | -2 |
| Field Blower | 0 | 2 | +2 |
| Canceling Cologne | 0 | 2 | +2 |

The resulting 60 is **19 Pokémon / 35 Trainer / 6 Energy**, with **one ACE SPEC** (Secret Box), 34 unique names, and no card-name count above four.

## Complete physical-print to engine-proxy map

Japanese card IDs are the official card-database identifiers from the source deck code or the cited official addition print. The English proxy IDs and Twinleaf names are engine identities, not the physical cards used in Japanese paper play. Pokémon signatures are included where the source mapping records one.

| Qty | English card name | Japanese card name | Japanese card ID / set | English proxy ID | Twinleaf fullName | Origin |
|---:|---|---|---|---|---|---|
| 2 | Mewtwo & Mew-GX | ミュウツー&ミュウGX | 37256 / SM12a | `sm11-71` | `Mewtwo & Mew-GX UNM` | 32 retained from official Aichi source |
| 1 | Gengar & Mimikyu-GX | ゲンガー&ミミッキュGX | 35982 / SM9 | `sm9-53` | `Gengar & Mimikyu-GX TEU` | 32 retained from official Aichi source |
| 1 | Trevenant & Dusknoir-GX | オーロット&ヨノワールGX | 37257 / SM12a | `smp-SM217` | `Trevenant & Dusknoir-GX SMP` | 32 retained from official Aichi source |
| 1 | Tapu Lele-GX | カプ・テテフGX | 35504 / SM8b | `sm2-60` | `Tapu Lele-GX GRI` | 32 retained from official Aichi source |
| 1 | Galarian Articuno V | ガラルフリーザーV | 40392 / SI | `swsh6-58` | `Galarian Articuno V CRE` | 32 retained from official Aichi source |
| 1 | Latias ex | ラティアスex | 48597 / M2a | `sv8-76` | `Latias ex SSP` | 32 retained from official Aichi source |
| 1 | Lillie's Clefairy ex | リーリエのピッピex | 49003 / MC | `sv9-56` | `Lillie's Clefairy ex JTG` | 32 retained from official Aichi source |
| 1 | Squawkabilly ex | イキリンコex | 47869 / MA | `sv2-169` | `Squawkabilly ex PAL` | 32 retained from official Aichi source |
| 3 | Unown | アンノーン | 33598 / XY | `xy7-30` | `Unown AOR` | 32 retained from official Aichi source |
| 2 | Dusclops | サマヨール | 45894 / SV6a | `sv6pt5-19` | `Dusclops SFA` | 32 retained from official Aichi source |
| 2 | Duskull | ヨマワル | 38541 / S4 | `swsh4-69` | `Duskull VIV` | 32 retained from official Aichi source |
| 1 | Solrock | ソルロック | 34884 / SM6b | `sm7-62` | `Solrock CES` | 32 retained from official Aichi source |
| 1 | Lunatone | ルナトーン | 43889 / SV3 | `sv3-92` | `Lunatone OBF` | 32 retained from official Aichi source |
| 1 | Klefki | クレッフィ | 44610 / SV4a | `sv1-96` | `Klefki SVI` | 32 retained from official Aichi source |
| 4 | Battle VIP Pass | バトルVIPパス | 44052 / SVF | `swsh8-225` | `Battle VIP Pass FST` | 32 retained from official Aichi source |
| 4 | Fog Crystal | 霧の水晶 | 44174 / SVEM | `swsh6-140` | `Fog Crystal CRE` | 32 retained from official Aichi source |
| 2 | Mysterious Treasure | ミステリートレジャー | 37338 / SM12a | `sm6-113` | `Mysterious Treasure FLI` | 32 retained from official Aichi source |
| 2 | Hisuian Heavy Ball | ヒスイのヘビーボール | 45317 / SVHK | `swsh10-146` | `Hisuian Heavy Ball ASR` | 32 retained from official Aichi source |
| 2 | Rescue Carrier | レスキューキャリー | 42403 / S12a | `swsh7-154` | `Rescue Carrier EVS` | 32 retained from official Aichi source |
| 2 | Battle Compressor | バトルコンプレッサー | 37415 / XY | `xy4-92` | `Battle Compressor PHF` | 32 retained from official Aichi source |
| 1 | Adventure Bag | ぼうけんのカバン | 37332 / SM12a | `sm8-167` | `Adventure Bag LOT` | 32 retained from official Aichi source |
| 1 | Escape Rope | あなぬけのヒモ | 36398 / SM10 | `swsh5-125` | `Escape Rope BST` | 32 retained from official Aichi source |
| 1 | Counter Catcher | カウンターキャッチャー | 34175 / SM4S | `sv4-160` | `Counter Catcher PAR` | 32 retained from official Aichi source |
| 1 | Secret Box | シークレットボックス | 45783 / SV6 | `sv6-163` | `Secret Box TWM` | 32 retained from official Aichi source |
| 2 | Powerglass | 力の砂時計 | 49399 / MC | `sv6pt5-63` | `Powerglass SFA` | 32 retained from official Aichi source |
| 1 | Forest Seal Stone | 森の封印石 | 42184 / S12 | `swsh12-156` | `Forest Seal Stone SIT` | 32 retained from official Aichi source |
| 2 | Lillie's Determination | リーリエの決心 | 49445 / MC | `me1-119` | `Lillie's Determination M1L` | 32 retained from official Aichi source |
| 2 | Ace Trainer | エリートトレーナー | 31049 / XY7-B | `xy7-69` | `Ace Trainer AOR` | 32 retained from official Aichi source |
| 2 | Sky Field | スカイフィールド | 37432 / XY | `xy6-89` | `Sky Field ROS` | 32 retained from official Aichi source |
| 2 | Path to the Peak | 頂への雪道 | 40316 / S8b | `swsh6-148` | `Path to the Peak CRE` | 32 retained from official Aichi source |
| 3 | Telepathic Psychic Energy | テレパス超エネルギー | 49712 / M3 | `me3-88` | `Telepath [P] Energy M3` | 32 retained from official Aichi source |
| 3 | Basic Psychic Energy | 基本超エネルギー | 48307 / ENE | `swsh12pt5-156` | `Psychic Energy SVE` | 32 retained from official Aichi source |
| 2 | Field Blower | フィールドブロアー | 34321 / SM4p | `sm2-125` | `Field Blower GRI` | 2 added |
| 2 | Canceling Cologne | キャンセルコロン | 41294 / S9a | `swsh10-136` | `Canceling Cologne ASR` | 2 added |

The two added entries have these official Japanese card pages:

- **Field Blower / フィールドブロアー**, card ID 34321, SM4p 093/114; English proxy `sm2-125`, Twinleaf `Field Blower GRI`. [Official card page](https://www.pokemon-card.com/card-search/details.php/card/34321). The GX Battle Boost release predates the event by more than eight years.
- **Canceling Cologne / キャンセルコロン**, card ID 41294, S9a 063/067; English proxy `swsh10-136`, Twinleaf `Canceling Cologne ASR`. [Official card page](https://www.pokemon-card.com/card-search/details.php/card/41294) and [official S9a product page](https://www.pokemon-card.com/products/s/s9a.html), released 25 February 2022.

The original 32 identities retain their official Aichi source-deck card IDs and sets. The full candidate manifest is `results/als/new-moon-lockbreak-japanese-print-60.json`; the English proxy manifest is `results/als/new-moon-lockbreak-english-proxy-60.json`; the original source manifest is `results/als/new-moon-official-japanese-print-60.json`.

## Dated Japanese Extra restriction screen

The repository snapshot `results/legality/japan-expanded-aichi-2026.json` is valid for the 10 May 2026 event and records the official Japanese regulation page, last updated 19 February 2026: https://www.pokemon-card.com/rules/regulation/index.html.

The existing `scripts/new-moon-lockbreak-japanese-ban-screen.cjs` checks the candidate's exact Japanese set/card identities against that snapshot. It reports zero exact restricted-print collisions. The two name contacts are:

- **Lysandre's Trump Card**: restricted identity {"type":"trainer_name"} at undefined. Candidate uses a different print; exact printing does not match the restricted identity.
- **Forest of Giant Plants**: restricted identity {"type":"trainer_name"} at undefined. Candidate uses a different print; exact printing does not match the restricted identity.
- **Maxie's Hidden Ball Trick**: restricted identity {"type":"trainer_name"} at undefined. Candidate uses a different print; exact printing does not match the restricted identity.
- **Delinquent**: restricted identity {"type":"trainer_name"} at undefined. Candidate uses a different print; exact printing does not match the restricted identity.
- **Jessie & James**: restricted identity {"type":"trainer_name"} at undefined. Candidate uses a different print; exact printing does not match the restricted identity.
- **Reset Stamp**: restricted identity {"type":"trainer_name"} at undefined. Candidate uses a different print; exact printing does not match the restricted identity.
- **Red Card**: restricted identity {"type":"trainer_name"} at undefined. Candidate uses a different print; exact printing does not match the restricted identity.
- **Chip-Chip Ice Axe**: restricted identity {"type":"trainer_name"} at undefined. Candidate uses a different print; exact printing does not match the restricted identity.
- **Island Challenge Amulet**: restricted identity {"type":"trainer_name"} at undefined. Candidate uses a different print; exact printing does not match the restricted identity.
- **Ghetsis**: restricted identity {"type":"trainer_name"} at undefined. Candidate uses a different print; exact printing does not match the restricted identity.
- **Lt. Surge's Strategy**: restricted identity {"type":"trainer_name"} at undefined. Candidate uses a different print; exact printing does not match the restricted identity.
- **Puzzle of Time**: restricted identity {"type":"trainer_name"} at undefined. Candidate uses a different print; exact printing does not match the restricted identity.
- **Hex Maniac**: restricted identity {"type":"trainer_name"} at undefined. Candidate uses a different print; exact printing does not match the restricted identity.
- **Scoop Up Net**: restricted identity {"type":"trainer_name"} at undefined. Candidate uses a different print; exact printing does not match the restricted identity.
- **Flapple**: restricted identity {"type":"ability","value":"Apple Drop"} at S2. Candidate uses a different print; exact printing does not match the restricted identity.
- **Archeops**: restricted identity {"type":"ability","value":"Ancient Power"} at BW2. Candidate uses a different print; exact printing does not match the restricted identity.
- **Unown**: restricted identity {"type":"ability","value":"DAMAGE"} at SM8. Candidate uses XY / 33598 (Farewell Letter); exact printing does not match the restricted identity.
- **Unown**: restricted identity {"type":"ability","value":"HAND"} at SM8. Candidate uses XY / 33598 (Farewell Letter); exact printing does not match the restricted identity.
- **Marshadow**: restricted identity {"type":"ability","value":"Let Loose"} at SM3+. Candidate uses a different print; exact printing does not match the restricted identity.
- **Flabébé**: restricted identity {"type":"ability","value":"Evolutionary Advantage"} at SM6. Candidate uses a different print; exact printing does not match the restricted identity.
- **Mismagius**: restricted identity {"type":"ability","value":"Mysterious Message"} at SM10. Candidate uses a different print; exact printing does not match the restricted identity.
- **Oranguru**: restricted identity {"type":"attack","value":"Resource Management"} at SM5S. Candidate uses a different print; exact printing does not match the restricted identity.
- **Shaymin-EX**: restricted identity {"type":"ability","value":"Set Up"} at XY6. Candidate uses a different print; exact printing does not match the restricted identity.
- **Milotic**: restricted identity {"type":"ability","value":"Energy Grace"} at XY2. Candidate uses a different print; exact printing does not match the restricted identity.
- **Sableye**: restricted identity {"type":"attack","value":"Junk Hunt"} at BW4. Candidate uses a different print; exact printing does not match the restricted identity.
- **Duskull**: restricted identity {"type":"ability","value":"Spiritborne Evolution"} at SM11a. Candidate uses S4 / 38541 (Future Sight); exact printing does not match the restricted identity.
- **Medicham V**: restricted identity {"type":"pokemon_name"} at S7R. Candidate uses a different print; exact printing does not match the restricted identity.

The exact-print distinction matters. Do not collapse these into name-only bans or substitute the restricted printings. The candidate uses the XY Unown / Farewell Letter identity and S4 Duskull / Future Sight identity.

The candidate is also within the BW-onward Japanese Extra card-pool boundary: its oldest physical printing is XY. It contains one ACE SPEC, below the one-per-deck limit. The 60-card count and copy limits pass the repository's manifest validation.

## Twinleaf identity and behavior boundary

The candidate maps all 34 Japanese physical identities to English proxy IDs and Twinleaf `fullName` values. The source map `results/als/new-moon-perfection-english-map.json` records the Pokémon signatures (e.g. Perfection, Horror House-GX, Night Watch, Wonder Tag, Reconstitute, Skyliner, Fairy Zone, Squawk and Seize, Farewell Letter, Cursed Blast, Future Sight, Sunbeam, New Moon and Mischievous Lock). The two added Trainer proxies are `Field Blower GRI` and `Canceling Cologne ASR`.

The executable validator `simulation/twinleaf/new-moon-lockbreak-validate.cjs` checks the candidate manifest against the pinned Twinleaf card database. Its current design verifies the fullName identity for every entry and the mapped Pokémon signatures; it does not establish complete Japanese-to-English text equivalence for every Trainer. This audit did not execute that validator against a newly compiled Twinleaf checkout, so this row is a mapping review, not a fresh engine test result.

Existing research-owned native tests cover the Field Blower choice/resolution path and Canceling Cologne's ability-suppression path. There is an additional official paper rule for Cologne: only one Canceling Cologne may be played per turn. Twinleaf's stock card/reducer path does not enforce that restriction. The adapter hook `simulation/twinleaf/canceling-cologne-once-per-turn-hook.cjs` exists and has native smoke/rollback evidence, but the current v10 and v10b candidate runners do not install it. Until a future, explicitly versioned candidate runner opts into that hook, simulation outcomes involving multiple Cologne plays in one turn are not paper-faithful. This audit has reported that gap to Agent36 and the independent reviewer; frozen registrations and historical results must remain unchanged.

Relevant behavior evidence:
- `results/twinleaf/field-blower-multi-action-horizon-synthesis.md`
- `results/twinleaf/canceling-cologne-same-turn-source-fidelity.md`
- `results/rules/agent44-cologne-rollback-prototype-epoch-20261107.md`
- `tests/agent24-field-blower-native-choice.test.cjs`
- `tests/agent48-cologne-native-ledger-audit.test.cjs`

## Status matrix

| Dimension | Status | Evidence / remaining gap |
|---|---|---|
| 60-card construction | PASS | 60 total; 19 Pokémon, 35 Trainer, 6 Energy |
| Exact Japanese print IDs | PASS | 34 rows; 32 inherited source IDs, 2 official additions |
| Event-date availability | PASS with provenance qualification | 32 source prints come from an Aichi participant's official deck code; two additions are 2017/2022 prints |
| Dated banned/restricted print screen | PASS for the enumerated snapshot | Zero exact collisions; two different-print name contacts |
| ACE SPEC / copy limits | PASS | One Secret Box; no name above four |
| English proxy / Twinleaf identity map | MAPPED | 34 proxy identities; fullName mapping exists; validator not freshly executed in this audit |
| Trainer effect fidelity | PARTIAL | Existing Field Blower/Cologne tests; Cologne once-per-turn hook not active in v10/v10b |
| Complete Japanese text / errata review | OPEN | No full bilingual audit of every physical card |
| Full paper-play legality certification | OPEN | Requires final Japanese Extra rules/errata sign-off and the Cologne simulation correction |
| Competitive qualification | NONE | Zero qualified competitive games; no win-rate inference |

## Recommendation

Keep `paperLegalPrintsVerified` and full paper legality marked **false/provisional** until the Japanese text/errata review and final event-rule sign-off are complete. Preserve this manifest as the exact candidate print list. Before promoting any future New Moon simulation result, use a new, explicitly versioned registration that installs and hashes the Canceling Cologne once-per-turn hook; do not silently retrofit a frozen v10/v10b cohort.

This audit establishes a complete, traceable physical print manifest and no known banned-print collision. It does not establish competitive strength or nominate this candidate as the final 60.
