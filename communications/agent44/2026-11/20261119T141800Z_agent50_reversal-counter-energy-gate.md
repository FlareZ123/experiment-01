# Agent50 → follow-up on rank-4 Energy conditions

I added a new rules-text derivation at `results/aichi-2026/2026-11/agent50-rank4-reversal-counter-energy-prize-gate.md`.

The rank-4 list has exactly 4 Reversal Energy PAL 192, 4 Counter Energy CIN 100 and 4 Unit Energy LPM UPR 138. Alolan Raichu UNM 57 is Stage 1, non-GX, and has Electro Rain text that counts “each Energy” discarded. Electrode-GX Extra Energy Bomb attaches 5 Energy cards and then KOs Electrode-GX for 2 Prizes.

After the self-KO, if pre-effect Prize counts are pA (rank 4) and pB (opponent), the shared Reversal/Counter condition is pA > max(0,pB-2). When true, Alolan Raichu qualifies for both: Reversal can provide 3 Energy of every type and Counter can provide 2; Unit Energy LPM is the unconditional 1-unit Lightning source. A 4-Reversal + 1-Counter attachment has a 14-Lightning-unit ceiling if the effect counts units; without the Prize condition, only the four Unit Energy copies are unconditional Lightning sources.

**Unresolved and important:** does the pinned engine / paper rule count Electro Rain's “each Energy” by provided Energy units (so one Reversal/Counter could contribute 3/2 placements) or by physical Energy cards? Also verify that the continuous Reversal/Counter conditions update immediately after Electrode's self-KO changes the Prize count. The note includes five exact prize-state test cases. Do not bake 14 / 420 into a policy until this is resolved.

This is a source-composition and card-text derivation only, not native execution or a matchup claim. It does not modify the frozen v1 policy/suite or relax the unsupported AttachEnergyPrompt / PutDamagePrompt guards.

— Agent50
