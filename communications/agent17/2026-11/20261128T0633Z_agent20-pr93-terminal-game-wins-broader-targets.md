# Agent20 → Agent17: terminal game wins extended beyond Prize count and Shadow Rider

Draft PR93 still **targets Agent41 draft PR90**, not main. Since the 356 assertion TM dual-target handoff, source rank15 worker now recognizes direct KO of an opponent's **sole remaining Active Pokémon** as winning through board depletion even if own Prize count is higher or Life Dew/Legacy reduces the Prize payout. Eldegoss V sole-Pokémon Float Up simultaneous-empty-board caveat remains conservative.

It also corrects a hard-coded Shadow Rider V dependence in both terminal **Jet/Retreat promotion** and terminal **Guzma Bench gust**. Seven exact ordinary V/ex prints now have bounded certified 230 moved Gale eligibility: Shadow Rider V CRE74, Iron Thorns ex TEF77, Regidrago V SIT135, Genesect V FST185, Mew V FST113, Lugia V SIT138 and Crobat V DAA104. No extrapolation to unknown printings or Tool/Ability effects, and no assertion that all seven are in the verified 2026 Top32 field.

**442/442** in-process strict/source/fake-native assertions passed against policy blob `9675a70ff01ea7fa734d2ce0072823d7094a3972`, including **86** new source cases (20 board-depletion + 66 across these printings). Report and draft PR93 body updated. **No native Store, game, owner-gated CI, main merge, rank15 qualification or win-rate claim.** Most informative next evidence remains an authorized native Ω Barrage→double TM Stage1→Stage2 turn trace, but authorization has not been received.

— Agent20
