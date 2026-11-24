# Fairy Zone value against the Aichi Dragon-type field

**Date:** 24 November 2026  
**Author:** Agent4  
**Status:** corrected exact-card-type census; no matchup or game evidence

## Correction

The preliminary version incorrectly classified Dialga-GX UPR 100, Koraidon ex TEF 120, and Kyurem SFA 47 as Dragon Pokémon based on species identity. Fairy Zone uses the Pokémon TCG card's `types` field, not the species name. These three printings are respectively Metal, Fighting, and Water, and are not affected by Fairy Zone.

The candidate's Dialga-GX UPR 100 is likewise Metal, not a Fairy Zone target. The candidate does contain Radiant Eternatus CRZ 105, which is Dragon type and can be affected by an opponent's Fairy Zone.

## Method

- Joined `results/aichi-2026/full-decklists.json` against the repository's exact card records under `resources/cards/en/*.json`, using `resources/sets/en.json` to map PTCGO set codes.
- Included only printings whose exact card `types` contain `Dragon`.
- No inference from species names, archetype labels, or card names.
- This is a static decklist/card-text analysis; it does not imply all targets enter play or establish a matchup outcome.

## Findings

The 29 authenticated Aichi lists contain **91 Dragon Pokémon copies across 11 unique Dragon-type printings in 12 ranks**: 1, 10, 12, 13, 14, 15, 18, 19, 20, 21, 27, and 32.

Ten printings have no printed Weakness. Arceus & Dialga & Palkia-GX CEC 156 has Fairy ×2. None has printed Psychic Weakness. Fairy Zone therefore creates Psychic ×2 Weakness on all 11 printings; it replaces Fairy ×2 on ADP-GX.

| Dragon printing | Copies across field | HP | Printed Weakness |
|---|---:|---:|---|
| Regidrago V SIT 135 | 34 | 220 | None |
| Regidrago VSTAR SIT 136 | 27 | 280 | None |
| Dragapult ex TWM 130 | 9 | 320 | None |
| Noivern ex PAL 153 | 7 | 260 | None |
| Hisuian Goodra VSTAR LOR 136 | 5 | 270 | None |
| Mega Dragonite ex ASC 152 | 3 | 370 | None |
| Raging Bolt ex TEF 123 | 2 | 240 | None |
| Radiant Eternatus CRZ 105 | 1 | 170 | None |
| Salamence ex JTG 114 | 1 | 320 | None |
| Tatsugiri TWM 131 | 1 | 70 | None |
| Arceus & Dialga & Palkia-GX CEC 156 | 1 | 280 | Fairy ×2 |

## Dragon copies by rank

| Rank | Archetype | Dragon Pokémon copies |
|---:|---|---:|
| 1 | Shadow Rider Calyrex | 1 |
| 10 | Regidrago | 9 |
| 12 | Regidrago | 9 |
| 13 | Regidrago | 10 |
| 14 | Regidrago | 11 |
| 15 | Lopunny Vileplume | 1 |
| 18 | Regidrago | 8 |
| 19 | Raging Bolt | 3 |
| 20 | Regidrago | 10 |
| 21 | Regidrago | 9 |
| 27 | Regidrago | 9 |
| 32 | Regidrago | 11 |
| **Total** | **12 lists** | **91** |

Rank 30 is not a Dragon rank: its Dialga-GX UPR 100 is Metal. The candidate's own Dialga-GX is also Metal. The candidate's Radiant Eternatus CRZ 105 is Dragon, however, so opponent Fairy Zone in ranks 1, 5, and 30 can change the candidate's Radiant Eternatus Weakness to Psychic ×2. Rank 1 also contains its own Radiant Eternatus, which the candidate's Fairy Zone can affect. Ranks 5 and 30 have no Dragon-type Pokémon in their own lists.

## Policy implications

1. Fairy Zone remains a high-value damage modifier: it creates Psychic ×2 Weakness on all 11 exact Dragon printings in the authenticated field.
2. The candidate's 2 Lillie's Clefairy ex can target the 91 Dragon Pokémon copies in 12 lists, subject to the ability being active and the target not having effective Stealthy Hood.
3. Do not count Metal Dialga-GX, Fighting Koraidon ex, or Water Kyurem as Fairy Zone targets.
4. The candidate's own Radiant Eternatus is its Dragon-type target vulnerable to opponent Fairy Zone; its Dialga-GX is not.
5. Keep source resolution, target-side Stealthy Hood, and Stadium suppression separate. Path to the Peak and Silent Lab directly suppress Clefairy; Hood cannot bypass them.

## Limitations

- Three Aichi lists (ranks 23, 25, 28) remain missing; their Dragon-type contents are unknown.
- Decklist counts are not board-state counts; not every Dragon is expected to be in play simultaneously.
- No games, matchup samples, policy competence, or win-rate claims are included.
- This analysis does not change the fixed candidate deck or nominate a new list.
