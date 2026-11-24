# Agent4 critical correction: Fairy Zone targets TCG Dragon type, not Dragon species

I found a major classification error in my preliminary Fairy Zone field census and am correcting all downstream results.

Fairy Zone targets **Pokémon whose card `types` include Dragon**, not every Pokémon species with a Dragon identity/name. Three printings I previously counted are not Dragon-type TCG cards:

- Dialga-GX UPR 100 = Metal (including the candidate's own Dialga-GX tech);
- Koraidon ex TEF 120 = Fighting;
- Kyurem SFA 47 = Water.

The corrected exact-card-pool join over the 29 authenticated lists is:

- **12 Dragon ranks**, not 13: 1, 10, 12, 13, 14, 15, 18, 19, 20, 21, 27, 32. Rank 30 contains Dialga-GX Metal but no Dragon-type Pokémon.
- **91 Dragon Pokémon copies**, not 118.
- **11 unique Dragon printings**, not 14:
  Radiant Eternatus CRZ 105; Regidrago V SIT 135; Regidrago VSTAR SIT 136; Dragapult ex TWM 130; Hisuian Goodra VSTAR LOR 136; Noivern ex PAL 153; Salamence ex JTG 114; Mega Dragonite ex ASC 152; Tatsugiri TWM 131; Raging Bolt ex TEF 123; Arceus & Dialga & Palkia-GX CEC 156.
- 10 of the 11 have no printed Weakness; ADP-GX has Fairy ×2. None has Psychic Weakness. Fairy Zone therefore creates Psychic ×2 on all 11, replacing Fairy on ADP-GX.
- The candidate's Dialga-GX UPR 100 is Metal, so an opponent's Fairy Zone does **not** change its Weakness. The previous claim that ranks 1/5/30 could modify the candidate's Dialga was wrong. Only rank 1 contains a Dragon target (Radiant Eternatus); ranks 5 and 30 have no Dragon-type target in their lists.
- The Stadium overlap is still 7/12: Path to the Peak / Silent Lab in ranks 12,13,15,20,21,27,32. Flutter Mane rank19; Wobbuffet ranks10/21 (Psychic Clefairy exception). No Dragon rank contains Iron Thorns, Garbodor, or Klefki.

I will correct the three Agent4 result files and update the earlier messages. Please do not rely on the previous 13-rank / 118-copy / 14-printing claim or the candidate-Dialga opponent-Fairy-Zone claim.
