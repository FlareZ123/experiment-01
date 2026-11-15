# Official Japanese deck-code reconciliation: Aichi Top32 source row 4

**Status:** exact 60-card identity/count reconciliation for an existing Top32 list; source/printing provenance only.

## Sources

- Pokekameshi Top16 roundup: <https://pokekameshi.com/cl2026aichidec-extra/> (Best4 Alolan Raichu deck code `LNnnHg-baOFyZ-Qgg69n`).
- Official Pokémon deck-builder record: <https://www.pokemon-card.com/deck/confirm.html/deckID/LNnnHg-baOFyZ-Qgg69n/>.
- Comparison target: `results/aichi-2026/full-decklists.json`, `rank: 4`.

The official page identifies a 60-card deck and exposes its Japanese card-name/count inventory and Pokémon set/collector numbers.

## Exact reconciliation

Japanese-to-English identity normalization followed by exact integer multiplicity comparison:

| Row | Deck | Official code | Pokémon / Trainers+Tools+Stadiums / Energy | Unique identities | Differences |
|---:|---|---|---:|---:|---:|
| 4 | Alolan Raichu / Electrode | `LNnnHg-baOFyZ-Qgg69n` | 18 / 30 / 12 | 31 | **0** |

### Pokémon and Japanese print identifiers

| Japanese card | Normalized identity | Count | Set / number |
|---|---|---:|---|
| メタモン | Ditto Prism Star | 1 | SM7a 043/060 |
| アローラライチュウ | Alolan Raichu | 2 | SM10a 010/054 |
| ビリリダマ | Voltorb | 2 | XY6 019/078 |
| マルマインGX | Electrode-GX | 3 | SM8b 217/150 |
| イキリンコex | Squawkabilly ex | 1 | SV2P 065/071 |
| クロバットV | Crobat V | 2 | SK 008/030 |
| デデンネGX | Dedenne-GX | 2 | SM12a 048/173 |
| ゲンガー&ミミッキュGX | Gengar & Mimikyu-GX | 1 | SM9 038/095 |
| ピカチュウ | Pikachu | 1 | S10a 014/071 |
| クレッフィ | Klefki | 1 | SV-P 123/SV-P |
| ワタシラガV | Eldegoss V | 1 | S4a 016/190 |
| カプ・テテフGX | Tapu Lele-GX | 1 | SMM 008/031 |

Trainer/Tool/Stadium identities and counts: Quick Ball 4; Ultra Ball 1; Hisuian Heavy Ball 2; Battle VIP Pass 1; Battle Compressor 4; Escape Rope 3; Rescue Stretcher 4; Secret Box (ACE SPEC) 1; Telescopic Sight 1; U-Turn Board 1; Forest Seal Stone 1; Gladion 1; Carmine 1; Pokémon Ranger 1; Lillie's Determination 1; Sky Field 3.

Energy: Counter Energy 4; Reversal Energy 4; Unit Energy LPM 4.

The official Pokémon list contains 18 cards; Trainers/Tools/Stadiums total 30; Energy total 12. All 60 card identities and multiplicities match row4 in `full-decklists.json` exactly (31 unique identities; no differences).

## Limits

This is a public saved deck code linked to the event by a secondary roundup, not an official tournament registration receipt. The report validates deck content, not a separate civil-name identity join or the physical copies used. Japanese Pokémon set/collector numbers are recorded above; Trainer/Energy print IDs are not inferred. This does not change 29/32 source coverage, 0/32 paper admission, missing ranks 23/25/28, or any matchup/win-rate claim.

## Reproduction output

```text
rank 4: officialTotal=60, repoTotal=60, officialUnique=31, repoUnique=31, diffs=[]
```
