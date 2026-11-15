# Official deck-code reconciliation: Aichi Top32 source rows 26 and 32

**Status:** completed card-identity/count reconciliation for two already-included Top32 lists. This improves source/printing provenance; it does not add an opponent, change the 29/32 source-row coverage, or paper-admit either matchup.

## Question

Do public official Pokémon deck-builder records independently reproduce the complete 60-card lists currently normalized in `results/aichi-2026/full-decklists.json` for source rows 26 and 32?

## Sources

- Event roundup, Top32 page: <https://pokekameshi.com/cl2026aichidec-extra/2/>
  - Hibi's Top32 Meloetta list links official deck code `c88Jc8-6Ev9Uu-cYcYKG`.
  - Umi's 32nd-place Regidrago list links official deck code `YGY8xx-nL5gwk-Gc8GcY`.
- Official Pokémon deck-builder records:
  - <https://www.pokemon-card.com/deck/confirm.html/deckID/c88Jc8-6Ev9Uu-cYcYKG/>
  - <https://www.pokemon-card.com/deck/confirm.html/deckID/YGY8xx-nL5gwk-Gc8GcY/>
- Normalized comparison target: `results/aichi-2026/full-decklists.json`, records `rank: 26` and `rank: 32`.

The Pokémon pages explicitly identify each as a **60-card deck** and expose the saved Japanese card-name/count inventory. They also expose Japanese set/collector numbers for Pokémon cards. The Top32 roundup is the source tying each code to the Aichi event/player alias; the official deck pages are primary for the saved deck contents.

## Method

1. Transcribed the Japanese card-name/count inventory from each official deck page.
2. Normalized Japanese card identities to the English names used by the repository. Where the same card has different English/Japanese print IDs, the comparison uses card identity and multiplicity, not set-code equality.
3. Compared the complete per-card multiplicity maps against the corresponding `full-decklists.json` record.
4. Checked category totals and the overall 60-card total.

## Results

| Repository source row | Event-roundup identity | Official code | Pokémon / Trainers / Energy | Unique card identities | Count mismatches |
|---:|---|---|---:|---:|---:|
| 26 | Hibi — Top32 Meloetta | `c88Jc8-6Ev9Uu-cYcYKG` | 12 / 45 / 3 | 32 | **0** |
| 32 | umi. — 32nd-place Regidrago | `YGY8xx-nL5gwk-Gc8GcY` | 20 / 30 / 10 | 39 | **0** |

Both reconciliations total exactly 60 cards. Rank 26 has 32 unique identities in both records; rank 32 has 39. The normalized English name/count maps are identical to the official Japanese deck-code maps after identity normalization.

### Row 26 — Hibi / Meloetta Donk

Official code: <https://www.pokemon-card.com/deck/confirm.html/deckID/c88Jc8-6Ev9Uu-cYcYKG/>

| Japanese card name | Normalized identity | Count | Japanese set / number (official page) |
|---|---|---:|---|
| メロエッタex | Meloetta ex | 1 | SV11B 162/086 |
| アンノーン | Unown | 4 | XY 046/171 |
| タマタマ | Exeggcute | 2 | BW 001/048 |
| ホルビー | Bunnelby | 1 | XY 107/171 |
| カプ・コケコ | Tapu Koko Prism Star | 1 | SM8a 014/052 |
| デデンネGX | Dedenne-GX | 1 | SM9a 016/055 |
| クロバットV | Crobat V | 1 | S3 105/100 |
| イキリンコex | Squawkabilly ex | 1 | SV2P 089/071 |
| クイックボール | Quick Ball | 4 | — |
| バトルVIPパス | Battle VIP Pass | 3 | — |
| ヒスイのヘビーボール | Hisuian Heavy Ball | 2 | — |
| トレーナーズポスト | Trainers' Mail | 4 | — |
| バトルコンプレッサー（フレア団ギア） | Battle Compressor | 4 | — |
| ダメージポンプ | Damage Pump | 4 | — |
| おとりよせパッド | Order Pad | 3 | — |
| じてんしゃ | Bicycle | 2 | — |
| レスキューキャリー | Rescue Carrier | 2 | — |
| あなぬけのヒモ | Escape Rope | 1 | — |
| キャンセルコロン | Canceling Cologne | 1 | — |
| スペシャルレッドカード | Special Red Card | 1 | — |
| とりかえチケット | Redeemable Ticket | 1 | — |
| スタジアムナビ | Stadium Nav | 1 | — |
| カウンターキャッチャー | Counter Catcher | 1 | — |
| ダウジングマシン (ACE SPEC) | Dowsing Machine | 1 | — |
| ワザマシン かじばのいっぱつ | Technical Machine: Crisis Punch | 2 | — |
| かるいし | Float Stone | 1 | — |
| 森の封印石 | Forest Seal Stone | 1 | — |
| ゼイユ | Carmine | 1 | — |
| ナンジャモ | Iono | 1 | — |
| 危ない廃墟 | Risky Ruins | 4 | — |
| 基本雷エネルギー | Lightning Energy | 2 | — |
| ダブル無色エネルギー | Double Colorless Energy | 1 | — |

**Totals:** 12 Pokémon, 45 Trainers, 3 Energy = 60. The official page's text exposes set/collector numbers for the Pokémon entries; Trainer/Energy set identifiers are not present in the extracted list text and are intentionally not inferred here.

### Row 32 — umi. / Regidrago

Official code: <https://www.pokemon-card.com/deck/confirm.html/deckID/YGY8xx-nL5gwk-Gc8GcY/>

| Japanese card name | Normalized identity | Count | Japanese set / number (official page) |
|---|---|---:|---|
| レジドラゴV | Regidrago V | 4 | S12 108/098 |
| レジドラゴVSTAR | Regidrago VSTAR | 3 | S12 077/098 |
| ディアルガGX | Dialga-GX | 1 | SM5S 045/066 |
| オンバーンex | Noivern ex | 1 | SV2D 089/071 |
| ドラパルトex | Dragapult ex | 1 | SV6 120/101 |
| ヒスイ ヌメルゴンVSTAR | Hisuian Goodra VSTAR | 1 | S10a 057/071 |
| キュレム | Kyurem | 1 | SV6a 047/064 |
| メガカイリューex | Mega Dragonite ex | 1 | M2a 232/193 |
| カプ・テテフGX | Tapu Lele-GX | 1 | SM2L 022/050 |
| デデンネGX | Dedenne-GX | 1 | SM9a 016/055 |
| クロバットV | Crobat V | 1 | S3 105/100 |
| キチキギスex | Fezandipiti ex | 1 | M2a 244/193 |
| ラティアスex | Latias ex | 1 | SV7a 078/064 |
| スボミー | Budew | 2 | M2a 196/193 |
| バトルサーチャー | VS Seeker | 2 | — |
| すごいつりざお | Super Rod | 1 | — |
| バトルコンプレッサー（フレア団ギア） | Battle Compressor | 1 | — |
| ミステリートレジャー | Mysterious Treasure | 3 | — |
| クイックボール | Quick Ball | 4 | — |
| ヒスイのヘビーボール | Hisuian Heavy Ball | 1 | — |
| メガトンブロアー (ACE SPEC) | Megaton Blower | 1 | — |
| カウンターキャッチャー | Counter Catcher | 1 | — |
| ハイパーボール | Ultra Ball | 2 | — |
| ちからのハチマキ | Muscle Band | 1 | — |
| 隠密フード | Stealthy Hood | 1 | — |
| N | N | 1 | — |
| プラターヌ博士 | Professor Sycamore | 1 | — |
| グズマ | Guzma | 2 | — |
| ポケモンレンジャー | Pokémon Ranger | 1 | — |
| シロナ&カトレア | Cynthia & Caitlin | 1 | — |
| キバナ | Raihan | 1 | — |
| アカマツ | Crispin | 1 | — |
| リーリエの決心 | Lillie's Determination | 1 | — |
| マリィ | Marnie | 1 | — |
| サイレントラボ | Silent Lab | 1 | — |
| パラレルシティ | Parallel City | 1 | — |
| 基本草エネルギー | Grass Energy | 4 | — |
| 基本炎エネルギー | Fire Energy | 2 | — |
| ダブルドラゴンエネルギー | Double Dragon Energy | 4 | — |

**Totals:** 20 Pokémon, 30 Trainers, 10 Energy = 60. The official page's text exposes set/collector numbers for the Pokémon entries; Trainer/Energy set identifiers are not present in the extracted list text and are intentionally not inferred here.

## Interpretation and limitations

- **Deck contents are independently reconciled.** These are not approximate archetype matches: after Japanese-to-English card-identity normalization, every card multiplicity matches the existing 60-card JSON record for the corresponding source row.
- **The event roundup uses aliases.** It labels the players Hibi and umi.; the repository's Limitless rows use Hibiki Yamada and Kaito Higuchi. The exact list match supports the deck-content crosswalk, but this report does not independently prove the alias-to-Limitless-person identity.
- **The code pages are public saved deck records, not official tournament registration receipts.** The roundup ties them to the Top32 event and the player reports, but the physical cards themselves were not inspected.
- **English print IDs in `full-decklists.json` are normalized identities, not evidence of the physical Japanese copies used.** The official Pokémon pages provide the Japanese Pokémon set/collector numbers shown above. Trainer/Energy exact print IDs remain unverified by the extracted text.
- This validates two existing source lists only. It does not resolve ranks **23, 25, or 28**, change **29/32** source-row coverage, resolve the owner-controlled opponent-format estimand, change paper-admission status (**0/32**), qualify any matchup, or support any win-rate claim.

## Reproduction note

The comparison was run against the current main-branch `results/aichi-2026/full-decklists.json` using a Japanese-to-English identity map and exact integer multiplicities. Output:

```text
rank 26: officialTotal=60, repoTotal=60, officialUnique=32, repoUnique=32, diffs=[]
rank 32: officialTotal=60, repoTotal=60, officialUnique=39, repoUnique=39, diffs=[]
```
