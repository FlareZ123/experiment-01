# Rescue Carrier target-pool analysis: Aichi Open League 2026

**Status:** descriptive card-pool analysis, not a game-performance result  
**Field coverage:** all 29 published decklists in `full-decklists.json`; 3 full lists remain unavailable  
**Question:** How many potential Rescue Carrier targets are present in the five published lists that include Rescue Carrier?

## Method

1. Read the exact published decklists from `results/aichi-2026/full-decklists.json`.
2. Select the five lists containing Rescue Carrier EVS 154.
3. For every Pokémon entry, map the decklist's English display set code through `resources/sets/en.json`, then resolve the exact set and collector number in the corresponding card JSON.
4. Count Pokémon copies with printed HP at or below 90, matching Rescue Carrier's condition.
5. Count deck copies, not cards currently in the discard pile. The result is a potential target pool only.

The card database confirms Rescue Carrier (`swsh7-154`) is Expanded Legal and reads: “Put up to 2 Pokémon, each with 90 HP or less, from your discard pile into your hand.”

## Results

| Aichi rank | Archetype | Rescue Carrier copies | Pokémon copies | Potential targets at 90 HP or less |
|---:|---|---:|---:|---:|
| 9 | Absol Electrode | 4 | 15 | 6 |
| 17 | Raichu Electrode Combo | 4 | 18 | 10 |
| 26 | Meloetta Donk | 2 | 12 | 7 |
| 30 | Lillie's Clefairy | 3 | 16 | 5 |
| 31 | Dusknoir Chimecho | 4 | 22 | 13 |
| **Total** | **5 lists** | **17** | **83** | **41** |

<Chart content={{"chartType":"bar","xKey":"rank","series":[{"dataKey":"eligible","label":"Pokémon copies with HP ≤90","valueFormat":"integer"}],"data":[{"rank":"9","eligible":6},{"rank":"17","eligible":10},{"rank":"26","eligible":7},{"rank":"30","eligible":5},{"rank":"31","eligible":13}]}} />

The five lists contain 41 potential target copies among 83 Pokémon copies, or **49.40%** of their Pokémon counts.

### Eligible Pokémon by list

| Rank | Potential Rescue Carrier targets |
|---:|---|
| 9 | Unown ×4 (60 HP); Voltorb ×1 (60); Toedscool ×1 (60) |
| 17 | Unown ×4 (60); Voltorb ×2 (60); Pikachu ×1 (60); Marshadow ×1 (80); Klefki ×1 (70); Ditto ◇ ×1 (40) |
| 26 | Unown ×4 (60); Exeggcute ×2 (30); Bunnelby ×1 (60) |
| 30 | Unown ×3 (60); Mimikyu ×1 (70); Minior ×1 (70) |
| 31 | Duskull ×3 (60); Dusclops ×3 (90); Unown ×3 (60); Koffing ×3 (60); Chimecho ×1 (70) |

For rank17, the decklist's display name `Ditto ♢` resolves by set/number (`LOT 154`) to the card-pool record `sm8-154`, `Ditto ◇`, 40 HP. The set/number identity was used where the display glyph differed.

## Implications for discard-cost modeling

- Rescue Carrier appears in five of the 29 published lists, including rank26 with two copies. Its recovery potential is relevant to the Aichi field.
- A boolean `hasCarrierTarget` check loses the difference between one legal target and two legal targets, even though the card can recover up to two Pokémon. A future DCI model should count eligible discard targets and estimate their utility. The target count is an input to utility, not the utility itself.
- The current Agent21 DCI native fixture contains one Unown (60 HP) in discard. It tests the one-target branch only. It does not test two legal targets, natural target availability, or the value of the recovered Pokémon.
- A target-pool count in the decklist is not a current discard count. Cards may be Prized, still in deck, already in play, or otherwise unavailable. The 41-copy total must not be interpreted as 41 simultaneously recoverable cards.

## Limitations

- Only 29 of 32 full lists are published; the three missing lists are not imputed.
- Decklist printings use English display representatives. Japanese physical-print chronology is a separate audit.
- The calculation uses printed HP and card identity. It does not simulate card movement, discard composition, game state, or player decisions.
- No matchup win rate, DCI weight, or strategic conclusion is established.

## Reproduction

Inputs:
- `results/aichi-2026/full-decklists.json`
- `resources/sets/en.json` (set-code mapping)
- Corresponding `resources/cards/en/*.json` card records by set and collector number

The exact rank-by-rank Pokémon counts and eligible-target lists are preserved above. This is a descriptive field statistic intended to guide future Rescue Carrier DCI modeling.
