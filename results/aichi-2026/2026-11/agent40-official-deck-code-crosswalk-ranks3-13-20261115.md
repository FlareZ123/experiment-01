# Official Japanese deck-code reconciliation: Aichi Top32 source rows 3 and 13

**Status:** exact 60-card identity/count reconciliation for two existing Top32 lists. This adds source/printing provenance only; no new opponent is added and no matchup is paper-admitted.

## Sources

- Pokekameshi Top16 roundup: <https://pokekameshi.com/cl2026aichidec-extra/>
  - Best4 Snorlax official deck code: `g9NQng-zfnpte-NngnLg`.
  - Best16 Regidrago/Salamence official deck code: `Y8K84Y-Siioz1-ccc8aG`.
- Official Pokémon deck-builder records:
  - <https://www.pokemon-card.com/deck/confirm.html/deckID/g9NQng-zfnpte-NngnLg/>
  - <https://www.pokemon-card.com/deck/confirm.html/deckID/Y8K84Y-Siioz1-ccc8aG/>
- Comparison target: `results/aichi-2026/full-decklists.json`, `rank: 3` and `rank: 13`.

The official pages state “60枚デッキ” and expose complete saved Japanese card-name/count lists, with Japanese set/collector numbers for Pokémon. The roundup ties the codes to the Aichi Top16.

## Exact comparison

Japanese card identities were normalized to the English identities in `full-decklists.json`; integer multiplicities were compared card-by-card.

| Repository row | Roundup entry | Official code | Pokémon / Trainers (incl. Tools/Stadiums) / Energy | Unique identities | Differences |
|---:|---|---|---:|---:|---:|
| 3 | Best4 Snorlax | `g9NQng-zfnpte-NngnLg` | 11 / 44 / 5 | 38 | **0** |
| 13 | Best16 Regidrago/Salamence | `Y8K84Y-Siioz1-ccc8aG` | 17 / 33 / 10 | 34 | **0** |

Both maps total exactly 60 cards and have zero count differences.

### Row 3 — Snorlax Stall

Official code: <https://www.pokemon-card.com/deck/confirm.html/deckID/g9NQng-zfnpte-NngnLg/>

| Japanese Pokémon | Normalized identity | Count | Japanese set / number |
|---|---|---:|---|
| カビゴン | Snorlax | 3 | S10b 056/071 |
| ガラルマッギョ | Galarian Stunfisk | 2 | S4a 287/190 |
| レジロック | Regirock | 1 | XYP 104/XY-P |
| ミミッキュ | Mimikyu | 1 | SV2P 034/071 |
| キリンリキ | Girafarig | 1 | SM8 045/095 |
| ホルビー | Bunnelby | 1 | XY 107/171 |
| フリーザーGX | Articuno-GX | 1 | SM6b 014/066 |
| ロトムV | Rotom V | 1 | S11 037/100 |

Trainer/Tool/Stadium identities and counts: Scoop Up Cyclone 1; Enhanced Hammer 2; Trainers' Mail 2; Nest Ball 3; VS Seeker 3; Quick Ball 1; Hisuian Heavy Ball 1; Counter Catcher 2; Night Stretcher 1; Float Stone 1; Stealthy Hood 1; Tool Jammer 1; Forest Seal Stone 1; Team Rocket's Handiwork 1; Team Flare Grunt 2; Plumeria 4; Teammates 2; Gladion 1; Lusamine 2; Guzma 1; Faba 1; Arven 4; Penny 1; Eri 1; Lillie's Determination 1; Tropical Beach 1; Player's Ceremony 1; Temple of Sinnoh 1.

Energy: Capture Energy 3; Water Energy 2.

### Row 13 — Regidrago / Salamence

Official code: <https://www.pokemon-card.com/deck/confirm.html/deckID/Y8K84Y-Siioz1-ccc8aG/>

| Japanese Pokémon | Normalized identity | Count | Japanese set / number |
|---|---|---:|---|
| レジドラゴVSTAR | Regidrago VSTAR | 3 | S12 117/098 |
| レジドラゴV | Regidrago V | 4 | S12 107/098 |
| ボーマンダex | Salamence ex | 1 | SV9 129/100 |
| ドラパルトex | Dragapult ex | 1 | SV6 120/101 |
| オンバーンex | Noivern ex | 1 | SV2D 089/071 |
| ディアルガGX | Dialga-GX | 1 | SM5S 069/066 |
| キュレム | Kyurem | 1 | SV6a 047/064 |
| ラティアスex | Latias ex | 1 | SV7a 087/064 |
| カプ・テテフGX | Tapu Lele-GX | 1 | SM2L 052/050 |
| デデンネGX | Dedenne-GX | 1 | SM9a 057/055 |
| イキリンコex | Squawkabilly ex | 1 | SV2P 094/071 |
| スボミー | Budew | 1 | M2a 011/193 |

Trainer/Tool/Stadium identities and counts: Mysterious Treasure 4; Quick Ball 3; Battle VIP Pass 3; Hisuian Heavy Ball 1; VS Seeker 3; Battle Compressor 2; Super Rod 1; Echoing Horn 1; Megaton Blower 1; Muscle Band 2; Professor's Research 3; Lillie's Determination 1; Iono 1; Marnie 1; Crispin 1; Raihan 1; Guzma 2; Silent Lab 1; Parallel City 1.

Energy: Grass Energy 4; Fire Energy 3; Double Dragon Energy 3.

## Limits

- This validates deck contents at the source-row level. The roundup uses public aliases and this report does not assert an unproven alias-to-Limitless-person identity join.
- Official code pages are public saved deck records linked to the event by a secondary roundup, not official tournament registration receipts. Physical copies were not inspected.
- Japanese Pokémon set/collector numbers are recorded above. Exact Trainer/Energy print IDs are not extracted or inferred.
- This does not change 29/32 source-row coverage, 0/32 paper admission, missing ranks 23/25/28, the owner-controlled opponent-format estimand, or any matchup/win-rate claim.

## Reproduction output

```text
rank 3: officialTotal=60, repoTotal=60, officialUnique=38, repoUnique=38, diffs=[]
rank 13: officialTotal=60, repoTotal=60, officialUnique=34, repoUnique=34, diffs=[]
```
