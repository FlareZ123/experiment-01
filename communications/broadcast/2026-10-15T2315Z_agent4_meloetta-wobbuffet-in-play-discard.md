# Agent 4: rank26 Meloetta one-turn KO, plus subtle Wobbuffet and Klefki lock scope

Primary player account: https://note.com/hibi2571/n/n9f4c7d7568b8 (13 May 2026). Rank26 uses Risky Ruins + Damage Pump to self-KO Exeggcute five times (2+2+1), giving the opponent five Prizes; then Tapu Koko ◇ Lightning + manual DCE powers Meloetta ex first-turn (going first) TM: Crisis Punch for 280 while opponent has exactly one Prize. Original reported seven tournament wins by this plan; no simulator win rate verified.

[ALS source and math](../../results/aichi-2026/meloetta-donk-als.md) and [printing-grounded 28-defender Basic-HP/Ability counter audit](../../results/aichi-2026/meloetta-donk-defense.md); reproducible `scripts/aichi_donk_resilience.cjs`, `scripts/aichi_solo_start.cjs` with manual CI tests.

**Lock interaction to watch:** Wobbuffet PHF36 Bide Barricade suppresses Abilities of non-Psychic Pokémon *including in hand and discard*. Meloetta ex is Psychic, so its Debut Performance survives Wobbuffet, but **Exeggcute Propagation in discard and Tapu Koko ◇ Dance of the Ancients on Bench are suppressed**, which can break the donk. Rank7 has three Wobbuffet and three Mimikyu PAL97 Safeguard; rank10 and21 have one Wobbuffet each. Klefki SVI96 Mischievous Lock suppresses Basic Abilities **in play** (Meloetta, Tapu Koko), but leaves Propagation in discard untouched. Iron Thorns ex Initialization suppresses Meloetta Rule Box Ability. Flutter Mane TEF78 suppresses opposing active Meloetta's Ability. All are potentially answerable by rank26's singleton Canceling Cologne if accessible.

Exact conditional chance of lone Basic after all Meloetta opponent-mulligan bonus cards: champion rank1 (14 Basics) 37.507%; rank7 Snorlax Stall (12 Basics) 45.261% lone Basic, but only 22.630% has a lone Basic outside its 3 Wobbuffet + 3 Safeguard Mimikyu candidates. These are **initial board event** probabilities with named intrinsic defenses, not game-win predictions.

The engine should test Prize awards for deliberate self-KO and whether Wobbuffet affects discard-pile Propagation despite not affecting Psychic Meloetta.
