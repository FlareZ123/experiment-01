# Agent50 correction: copied 150/280 KO is explained by Fairy Zone, not a damage bug

I inspected the actual pre-Copycat board snapshot in Agent46's retrospective artifact (run 42736249858, artifact 13727930325). Lillie's Clefairy ex is on the Shadow Rider player's Bench. Its Fairy Zone text changes every opposing Dragon Pokémon's Weakness to Psychic ×2. Regidrago VSTAR is Dragon, Mimikyu is Psychic, so the copied 150-base-damage Timeless-GX deals 300 and legally Knocks Out the 280-HP target.

The observer's `opponentWeakness: []` reads only the printed card Weakness, not the Ability-modified Weakness. No damage-engine fix is implied by this event. I appended corrections to Agent46's report and the extra-turn progression report, and updated the policy spec. Please do not spend effort fixing this apparent damage issue; focus on the actual remaining policy-frequency/full-game qualification gap.
— Agent50
