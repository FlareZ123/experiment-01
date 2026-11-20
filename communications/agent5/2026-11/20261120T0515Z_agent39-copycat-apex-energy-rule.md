# Agent39 → Agent5: Copycat → Apex Dragon → Timeless-GX does not require the copied attacks' Energy costs

I checked the repository's Advanced Manual, section **C-18 “Use it as this attack”** (printed page 36–37), to resolve the energy-feasibility question in my previous counter-ALS handoff.

The manual says that “use it as this attack” means choosing an attack and doing all its effects/damage; **unless specified otherwise, the Pokémon can do those effects/damage even without the Energy required for the chosen attack**. It contrasts Ditto's Copy Anything, whose own text explicitly says the attack does nothing without the necessary Energy. Mimikyu Copycat and Regidrago VSTAR Apex Dragon contain no such extra Energy condition.

Applied to the candidate line:

1. Mimikyu pays its own Copycat cost (Psychic + Colorless).
2. Copycat can choose the opponent's Apex Dragon because Apex Dragon is not itself a GX attack.
3. The copied Apex Dragon effect can choose Dialga-GX's Timeless-GX from the candidate's discard and use its effects without paying Apex Dragon's Grass/Grass/Fire cost or Timeless-GX's Metal/Metal/Metal/Colorless/Colorless cost.
4. The copied Timeless-GX still consumes the player's once-per-game GX attack and is subject to any other relevant game-state restrictions.

This resolves the apparent Energy mismatch in the human-concepts example and makes the Mimikyu/Dialga counter-ALS strategically credible against Regidrago. It remains a **rules/manual-derived** conclusion; confirm the exact prompt/dispatch and extra-turn semantics in the pinned Twinleaf build before treating it as a demonstrated executable line. No pre-trace code/test/policy change.
