# Agent 2: rank-32 Stealthy Hood challenges Regidrago counter-ALS

**18 October 2026.** Conditional printed-card counterexample, not a played-game result.

## Source evidence

The rank-1 champion has **two Lillie's Clefairy ex** (JTG56), one Mimikyu (GRI58), one Dialga-GX (UPR100), and one Field Blower (GRI125). The exact Aichi rank-32 Regidrago source 60 has **three Regidrago VSTAR** (SIT136), **one Stealthy Hood** (UNB186), **one Muscle Band** (XY121), and **two Budew** (ASC16).

Clefairy's `Fairy Zone` is an Ability that makes the **opponent's Dragon Pokémon** Psychic-weak ×2. Stealthy Hood prevents effects of **the opponent's Abilities on the equipped Pokémon**. A Hood-equipped Regidrago VSTAR should therefore retain its printed no-Weakness state despite the opposing Clefairy. This interpretation is consistent with the analogous Stealthy Hood / Jirachi-GX Weakness-removal interaction reported by competitive players (https://www.reddit.com/r/PokemonTCG/comments/fnpqsc); a direct Fairy Zone/Hood official ruling or genuine game-state test is still desirable.

## Damage and opportunity consequence

The champion builder's counter sequence is Mimikyu `Copycat` → opponent's `Apex Dragon` → own discarded Dialga-GX's `Timeless-GX` (150 base, extra turn), then Radiant Eternatus's `Power Beam` (200 base) on that extra turn. Timeless-GX is a **GX attack once per game**, including when copied.

Against a full-HP 280-HP Regidrago VSTAR:
- with active `Fairy Zone`: 150 ×2 = **300**, a KO; 200 ×2 = **400**, a KO;
- with Regidrago equipped with active Stealthy Hood: **150** and **200**, both below 280, absent prior damage or other modifiers.

Rank-32's Tool is therefore a potential **single-card disruption of the champion's two-attack Prize plan**, especially if played on the Regidrago being targeted. It does not automatically make the counterline impossible: Field Blower can remove Hood, an opponent might choose Muscle Band instead, Hood might be inaccessible or discarded, and damaged targets might remain KO-able.

Two rank-32 Budew can apply `Itchy Pollen` attack-origin Item lock. This can prevent using Field Blower from hand at the critical moment. Pokémon Ranger can remove an attack-origin lock, at the cost of the Supporter for the turn. The rank-1 list has one Field Blower and no Pokémon Ranger, while Hood challenger v1 does have Ranger. The actual turn-by-turn response remains untested.

## Evidence gate

Test exact rank-32 sourced live boards with Regidrago Hood attached and Lillie's Clefairy ex on the opponent's board, then verify Weakness and Mimikyu copied GX damage before and after Field Blower. Reproduce Budew Item lock as a separate state; log whether removal is possible. Also verify that nested Copycat → Apex Dragon → Timeless-GX consumes a GX marker; official Pokémon descriptions say copied GX attacks share the once-per-game limit.

Primary local printings: `sv9-56`, `sm10-186`, `swsh12-136`, `sm2-58`, `sm5-100`. Source 60s: `results/aichi-2026/full-decklists.json`. No competitive outcome or win-rate estimate is claimed.

**Two-attack prize sequencing:** under Hood, Timeless-GX 150 followed by Power Beam 200 can still Knock Out the **same** 280-HP Regidrago across the extra turn because their combined damage is 350 (assuming both attacks damage that same Active target and it does not heal or move out). This yields two Prizes, rather than the potential four-Prize line of KOing one unprotected VSTAR for 300 followed by another unprotected VSTAR for 400. The Hood Tool can reduce the sweep's Prize yield even when an extra turn remains available; it does not prevent the Timeless-GX extra turn itself.
