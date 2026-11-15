# Official deck-code reconciliation: Aichi Top32 source rows 1 and 15

**Status:** completed card-identity/count reconciliation for two existing Top32 lists. This complements the rank26/32 crosswalk in `agent40-official-deck-code-printing-crosswalk-ranks26-32-20261115.md`. It adds source/printing provenance only; it does not add opponent coverage or paper-admit a matchup.

## Sources

- Pokekameshi official-event Top16 roundup: <https://pokekameshi.com/cl2026aichidec-extra/>
  - Rank 1 Shadow Rider list links official Pokémon deck code `QnLLQ9-qvPVqa-g9gi6Q`.
  - Best16 Evo Lopunny list links official Pokémon deck code `nig96i-G4v0GI-QQngHL`.
- Official Pokémon deck-builder records:
  - <https://www.pokemon-card.com/deck/confirm.html/deckID/QnLLQ9-qvPVqa-g9gi6Q/>
  - <https://www.pokemon-card.com/deck/confirm.html/deckID/nig96i-G4v0GI-QQngHL/>
- Normalized comparison target: `results/aichi-2026/full-decklists.json`, records `rank: 1` and `rank: 15`.

The official pages explicitly say “60枚デッキ” and expose the saved Japanese card-name/count inventory plus Pokémon set/collector numbers. The roundup links those codes to Aichi Top16 entries; the official pages are primary for saved deck contents.

## Method and result

Japanese card names were mapped to the English card identities used by the repository, then exact integer multiplicities were compared against the corresponding `full-decklists.json` record.

| Repository source row | Roundup entry | Official code | Pokémon / Trainers / Energy | Unique identities | Count mismatches |
|---:|---|---|---:|---:|---:|
| 1 | 1st — Shadow Rider | `QnLLQ9-qvPVqa-g9gi6Q` | 18 / 31 / 11 (31 Trainers/Tools/Stadiums combined) | 33 | **0** |
| 15 | Best16 — Evo Lopunny | `nig96i-G4v0GI-QQngHL` | 25 / 28 / 7 (incl. 6 Tools and 5 Stadiums within Trainer total) | 33 | **0** |

Both official records total exactly 60 cards and their normalized identity/count maps match the corresponding repository rows exactly.

### Row 1 — Shadow Rider

Official code: <https://www.pokemon-card.com/deck/confirm.html/deckID/QnLLQ9-qvPVqa-g9gi6Q/>

| Japanese card name | Normalized identity | Count | Japanese set / number |
|---|---|---:|---|
| こくばバドレックスVMAX | Shadow Rider Calyrex VMAX | 4 | S6K 037/070 |
| こくばバドレックスV | Shadow Rider Calyrex V | 3 | S6K 075/070 |
| オーロット&ヨノワールGX | Trevenant & Dusknoir-GX | 1 | SM12a 178/173 |
| リーリエのピッピex | Lillie's Clefairy ex | 2 | SV9 115/100 |
| カプ・テテフGX | Tapu Lele-GX | 2 | SM2L 052/050 |
| ラティアスex | Latias ex | 1 | SV7a 078/064 |
| ディアルガGX | Dialga-GX | 1 | SM5S 069/066 |
| ミミッキュ | Mimikyu | 1 | SM4p 043/114 |
| キリンリキ | Girafarig | 1 | SM8 045/095 |
| マーシャドー | Marshadow | 1 | SM12a 064/173 |
| かがやくムゲンダイナ | Radiant Eternatus | 1 | S12a 115/172 |
| ミステリートレジャー | Mysterious Treasure | 4 | — |
| 霧の水晶 | Fog Crystal | 4 | — |
| クイックボール | Quick Ball | 1 | — |
| ヒスイのヘビーボール | Hisuian Heavy Ball | 1 | — |
| バトルサーチャー | VS Seeker | 3 | — |
| バトルコンプレッサー（フレア団ギア） | Battle Compressor | 1 | — |
| フィールドブロアー | Field Blower | 1 | — |
| 夜のタンカ | Night Stretcher | 1 | — |
| アンフェアスタンプ (ACE SPEC) | Unfair Stamp | 1 | — |
| かるいし | Float Stone | 1 | — |
| 森の封印石 | Forest Seal Stone | 1 | — |
| リーリエの決心 | Lillie's Determination | 2 | — |
| ゼイユ | Carmine | 1 | — |
| ナンジャモ | Iono | 1 | — |
| センパイとコウハイ | Teammates | 1 | — |
| キバナ | Raihan | 1 | — |
| アセロラ | Acerola | 1 | — |
| グズマ | Guzma | 1 | — |
| リップ | Tulip | 1 | — |
| スカイフィールド | Sky Field | 2 | — |
| 次元の谷 | Dimension Valley | 1 | — |
| 基本超エネルギー | Psychic Energy | 11 | — |

**Totals:** 18 Pokémon, 31 Trainer/Tool/Stadium cards, 11 Energy = 60. Pokémon set/collector numbers are explicit above; Trainer/Energy print IDs are not present in the extracted text and are not inferred.

### Row 15 — Evo Lopunny / Vileplume

Official code: <https://www.pokemon-card.com/deck/confirm.html/deckID/nig96i-G4v0GI-QQngHL/>

| Japanese card name | Normalized identity | Count | Japanese set / number |
|---|---|---:|---|
| ホルビー | Bunnelby | 2 | XY 107/171 |
| ミミロル | Buneary | 2 | M2 071/080 |
| メガミミロップex | Mega Lopunny ex | 2 | M2 114/080 |
| ポッポ | Pidgey | 2 | XY2 061/080 |
| ピジョン | Pidgeotto | 2 | SM9 069/095 and SV2a 017/165 (one each) |
| ピジョットex | Pidgeot ex | 2 | SVN 006/045 |
| スピンロトム | Fan Rotom | 2 | SV8a 131/187 |
| ナゾノクサ | Oddish | 2 | SM10 001/095 |
| クサイハナ | Gloom | 2 | SM10 003/095 |
| ラフレシア | Vileplume | 3 | XY 003/171 (2), SM3H 003/051 (1) |
| スボミー | Budew | 2 | SV8a 001/187 |
| ワタシラガV | Eldegoss V | 1 | S4a 016/190 |
| シャリタツ | Tatsugiri | 1 | SV8a 121/187 |
| タッグコール | Tag Call | 4 | — |
| なかよしポフィン | Buddy-Buddy Poffin | 3 | — |
| ライブキャスター | Xtransceiver | 2 | — |
| ワザマシン エヴォリューション | Technical Machine: Evolution | 2 | — |
| 隠密フード | Stealthy Hood | 2 | — |
| かるいし | Float Stone | 1 | — |
| こだわりベルト | Choice Belt | 1 | — |
| グズマ&ハラ | Guzma & Hala | 3 | — |
| N | N | 1 | — |
| グズマ | Guzma | 2 | — |
| カリン | Karen | 2 | — |
| ボウルタウン | Artazon | 2 | — |
| 偉大な大樹 (ACE SPEC) | Grand Tree | 1 | — |
| 頂への雪道 | Path to the Peak | 1 | — |
| サイレントラボ | Silent Lab | 1 | — |
| ジェットエネルギー | Jet Energy | 2 | — |
| キャプチャーエネルギー | Capture Energy | 1 | — |
| パワフル無色エネルギー | Powerful Colorless Energy | 1 | — |
| ダブル無色エネルギー | Double Colorless Energy | 1 | — |
| 基本草エネルギー | Grass Energy | 2 | — |

**Totals:** 25 Pokémon, 28 Trainer/Tool/Stadium cards, 7 Energy = 60. Pokémon set/collector numbers are explicit above; Trainer/Energy print IDs are not present in the extracted text and are not inferred.

## Interpretation and limitations

- **Exact deck contents are independently reconciled.** These are full per-card multiplicity matches, not archetype-only comparisons.
- The roundup and Limitless use different player-name representations for some entries (notably the Best16 Evo Lopunny alias). This report validates the deck content at the source-row level; it does not assert an alias-to-legal-name identity join beyond the event-roundup placement link.
- Official deck codes are public saved deck records linked to the event by the roundup, not official tournament registration receipts. Physical copies were not inspected.
- The official text exposes Japanese set/collector numbers for Pokémon. Trainer/Energy exact print IDs remain unverified from extracted text.
- This adds provenance for two existing lists only. It does not change 29/32 source-row coverage, 0/32 paper admission, the missing ranks 23/25/28, the owner-controlled opponent-format estimand, or any matchup/win-rate claim.

## Reproduction output

```text
rank 1: officialTotal=60, repoTotal=60, officialUnique=33, repoUnique=33, diffs=[]
rank 15: officialTotal=60, repoTotal=60, officialUnique=33, repoUnique=33, diffs=[]
```
