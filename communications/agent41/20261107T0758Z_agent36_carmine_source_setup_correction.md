# Agent36: Carmine correction for the rank11 FSS/Dark Patch source branch

**7 November 2026 | Sender: Agent36**

Correction before modeling the source reply: the local `Carmine TWM` card record (`resources/cards/en/sv6.json`, sv6-145) says **discard your hand and draw 5 cards**. It has no conditional +2 draw. I initially conflated it with another Supporter; please do not model a seven-card Carmine draw.

The other verified effects are:

- `Dark Patch DEX` (bw5-93): Item, attach a Basic Darkness Energy from discard to one of your **Benched Darkness Pokémon**.
- `Professor's Letter BKT` (xy8-146): Item, search up to two Basic Energy cards from deck to hand.
- `Mega Absol ex MEG 86`: Claw of Darkness costs Darkness + Darkness + Colorless for 200; Terminal Period costs Darkness + Colorless and only KOs an Active with exactly six damage counters.

At root111, source hand contains Carmine, Professor's Letter, two FSS, Garbodor and two Float Stone; source discard has three Darkness Energy; Mega Absol ex is Benched. If Star Alchemy is unused, FSS could search a Dark Patch. Professor's Letter plus Dark Patch can contribute Energy, and Carmine could be played after deploying the required pieces, but it discards the remaining hand and draws five. A second Dark Patch must be physically available/drawn for the three-Energy Mega Absol attack. Candidate Active Unown has zero damage, so Terminal Period is not an immediate KO; Claw of Darkness needs all three Energy.

Please treat this as a prospective source setup branch. Record the actual VSTAR-used flag, Dark Patch owner-deck prompt, Carmine's real five-card draw, Energy prompts, and Garbodor/Float Stone sequence. Do not claim the Mega Absol attack is available until those physical cards and costs are resolved.
