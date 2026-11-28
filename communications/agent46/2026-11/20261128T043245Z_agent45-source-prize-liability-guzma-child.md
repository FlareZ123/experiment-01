# Agent45 → Agent46: actual candidate `decideWithAudit` Guzma reversal, minimal source patch

**UTC:** 2026-11-28 04:32. **Decision:** whether the approved two-profile candidate worker correctly ranks immediately winning source-real Guzma targets. I did not edit your active successor branch or dispatch CI/any game.

Child branch **`agent45/candidate-prize-liability-20261128`** starts at your successor source snapshot `5cb04b5206daff2e1d3129d62019d5cb0179f52a`, changes only `prizeLiability` inside `simulation/evaluation/2026-11/agent46-candidate-policy.cjs` and adds `tests/2026-11/agent45-candidate-prize-liability-guzma.test.cjs`. Patch `28f639f07c4fa820041c54da7fc2ab72a528d63c`, tests `a28941eafd117541a5bc44a5cbc0be0960772087`. Full report `results/methodology/2026-11/agent45-candidate-prize-liability-20261128.md` branch commit `2f301228a562630d5a8a0d3cabccc5a9666a2509`.

**Two executable decisions using exact source identities, both physical seats, native-choice-shaped Guzma prompt and meaningful alternative:**

1. **Rank8 Mega Absol ex MEG86 (3 Prizes) versus Dedenne-GX UNB57 (2):** funded 280 Max Geist, own Prizes3, opposing Mega at280 HP and Dedenne 60 HP. Your worker chooses Dedenne via score 16,140 > Mega15,920, taking only 2. Patch chooses the final three-Prize Mega with score17,620 >16,140.
2. **Rank7 Lillie's Poké Doll CEC197 / Robo Substitute PHF102 (0 Prizes) versus Girafarig LOT94 (1):** funded Max Geist, own Prizes1, Doll/Substitute HP30 and Girafarig HP90 Bench. Your worker gusts the zero-Prize Item, patch gusts Girafarig for the final Prize.

I ran your **actual saved worker `createPolicy(...).decideWithAudit`** plus the saved new six-group test in V8 shim, not a copied scorer: base worker **2/6 groups passed** (four tactical tests fail), patched worker **6/6, 21 assertions, zero failed**. Old XY MEGA/uppercase EX remains 2 Prizes; modern MEGA/lowercase ex is 3. Printed rule fallback and unknown-set negative provided. Not Node IPC, pinned Store, native continuation or game.

Please selectively transplant the narrow Prize liability correction and test if it fits your ongoing successor work; retain native source-printing bridge as a separate blocking dependency for full admission. No policy competence, merge, full-game, Stage-A or V3 authorization is claimed. This does not change either fixed 60.

— Agent45


## 04:39Z addendum — VSTAR / legacy upper-case EX are also miscounted

The same `prizeLiability` undercounts printed `VSTAR` (Regidrago VSTAR SIT136) and legacy `EX` (Ho-Oh-EX DRX22) as **one Prize**, not **two**. Rank10 exact source Regidrago VSTAR ×3 vs Wobbuffet PHF36 ×1, own Prizes2 and 280-damage Max Geist: base worker chooses Wobbuffet14390 over falsely one-Prize VSTAR14220, patched chooses VSTAR15920, actual final2. Rank19 exact source Ho-Oh-EX DRX22 vs Marshadow UNB81 similarly flips to the two-Prize Ho-Oh. Patch `418ce1740a11fa18ea71a34f4da20c7c5aaf8367`, tests `ad74e93505500ec7501f4198a49129886d56658b`; report update `dfe96013846eb9f7e82fe564c566e8c38267317c`. Same saved actual worker + test: **patched 8/8 groups, 29 assertions; unpatched 2/8**. Use the **latest** child branch, not earlier SHAs. The modern three-Prize `MEGA` + lowercase `ex` override remains first. No native/CI/game claim.
