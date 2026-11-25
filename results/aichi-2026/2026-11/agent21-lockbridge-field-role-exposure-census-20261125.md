# Agent 21: Lockbridge field-role exposure census

**25 November 2026.** Exact source-list/card-database census for the Aichi Open League 2026 Top 32 lists currently available in the repository. This is a field-exposure result, not a matchup win-rate estimate.

## Decision this can inform

**Fixed-60 candidate ranking:** estimate the field exposure of the two Basic-Pokémon roles exchanged in the Lockbridge package, and avoid valuing Clefairy as if it only mattered against Regidrago. The result does not rank the complete four-slot package.

## Method

- Input lists: all 29 source-verified decks in `results/aichi-2026/full-decklists.json`. Ranks 23, 25, and 28 remain absent from the source dataset.
- Printing-to-card mapping: `resources/sets/en.json` plus `resources/cards/en/{set-id}.json`. The 51 Pokémon-printing set codes mapped through the set index were checked against the corresponding card records; no mapped Pokémon printing failed to resolve.
- Three promo printings did not map through the set index and were excluded from the type/Ability scan: Trevenant & Dusknoir-GX SMP 217 (rank 1), Jirachi XYP 67 (rank 2), and Regirock XYP 49 (ranks 3 and 7). None is Dragon-type. Ranks 1, 2, 3, and 7 already have other mapped non-Psychic Ability-bearing Pokémon, so the 29/29 potential-target count below is unchanged. Regirock may add another Wobbuffet target in ranks 3 and 7.
- “Potential Wobbuffet target” means the source list contains at least one Pokémon whose printed type is not Psychic and which has a printed Ability. It does not mean that the Ability is live, decisive, unused, or still available after Wobbuffet enters the Active Spot.
- “Clefairy target” means the source list contains at least one Dragon-type Pokémon. Fairy Zone changes the Weakness of each opponent's Dragon Pokémon **in play** to Psychic (×2); the count does not imply that a Dragon Pokémon is necessarily in play at the relevant time.

The card texts were checked directly in the current repository card database:
- Wobbuffet PHF 36 / XY4-36: Bide Barricade applies while Wobbuffet is Active and suppresses Abilities of non-Psychic Pokémon in play, in each player's hand, and in each player's discard pile.
- Lillie's Clefairy ex JTG 56 / SV9-56: Fairy Zone changes the Weakness of every opponent's Dragon Pokémon in play to Psychic (×2).
Both printings are marked Expanded Legal in the card database.

## Results

<badge color="success">29/29 potential Wobbuffet target lists</badge>

Every one of the 29 source-verified lists contains at least one mapped non-Psychic Ability-bearing Pokémon. Representative target families include:

- Regidrago VSTAR Legacy Star and Hisuian Goodra VSTAR Moisture Star across the Regidrago group;
- Dedenne-GX, Squawkabilly ex, Crobat V, Genesect V, Pidgeot ex, Electrode-GX, and Eldegoss V as draw/search or recovery engines;
- Vileplume, Stoutland, Iron Thorns ex, Snorlax, and Toedscruel as lock, control, or utility Abilities;
- Radiant Eternatus, Tapu Koko Prism Star, Galarian Moltres V, Ho-Oh-EX, and Exeggcute as setup or acceleration Abilities.

This is a broad *potential target presence* result. Wobbuffet's Active-only requirement and the timing of the opponent's Ability use are decisive limitations: it cannot undo an Ability that already resolved, and it does not suppress Psychic Pokémon.

<badge color="info">12/29 Dragon-type target lists</badge>

The 12 ranks containing at least one Dragon-type Pokémon are:

**1, 10, 12, 13, 14, 18, 19, 20, 21, 27, 30, 32.**

This comprises the nine Regidrago lists (10, 12, 13, 14, 18, 20, 21, 27, 32) plus ranks 1, 19, and 30. Examples include Radiant Eternatus (rank 1), Regidrago V/VSTAR and Hisuian Goodra VSTAR (the Regidrago group), Dragon-type attackers in rank 19, and Dialga-GX (rank 30). The census also found Mega Dragonite ex in Regidrago lists 14, 20, and 32.

Thus Clefairy has a wider source-list exposure than “nine Regidrago lists”: at least 12/29 known lists contain a Dragon-type target. The effect still requires a Dragon Pokémon to be in play and a Psychic attacker to exploit the changed Weakness.

## Counter-lock and timing caveats

The known direct Ability-lock counter families in the source field are:

- Garbodor Garbotoxin: ranks 8, 11, 16, and 22 (4 lists). Garbotoxin is Psychic and is not suppressed by Wobbuffet; an active Tool-enabled Garbodor can suppress Wobbuffet.
- Klefki: ranks 4 and 17 (2 lists). Its Basic-Pokémon Ability suppression can affect Basic Wobbuffet while Klefki is Active; Wobbuffet can in turn suppress Klefki because Klefki is non-Psychic. This is a state/order interaction, not an unconditional counter.

The Vileplume lists (ranks 2 and 15) also include Stealthy Hood, which can protect a key Pokémon from an opponent's Ability effect. The 29/29 count must therefore not be read as 29 favorable Wobbuffet matchups.

For comparison, existing field audits count Budew in 14/29 lists (relevant to Pokémon Ranger's attack-effect clearing) and Special Energy in 24/29 lists (relevant to Temple of Sinnoh). Those are different effect windows: Ranger is a one-use Supporter answer to attack effects; Temple is a Stadium effect that can be replaced; Wobbuffet is an Active-only Ability lock; Clefairy is a Bench-compatible Weakness modifier.

## Implication for the Lockbridge four-slot trade

The exposure census makes both exchanged roles material:

- Wobbuffet has potential non-Psychic Ability targets in all 29 known lists, though its Active-only window, Psychic exception, Garbodor/Klefki counters, and already-resolved Abilities limit realized value.
- Clefairy has Dragon-type targets in 12/29 known lists, not only the nine Regidrago lists. The second copy therefore provides redundancy for a role with meaningful field exposure.
- Ranger and Temple also have distinct field exposure and timing. Their 14/29 and 24/29 counts are not directly comparable to the Ability/Weakness counts.

This census does **not** justify setting Wobbuffet's role value to 29/29 or Clefairy's to 12/29 in the Prize model. Presence is not impact. It does show that the earlier equal-weight sensitivity (which set Clefairy to 1 by assumption) is illustrative only; a full-package comparison must value the actual effect windows and matchup impact of Clefairy, Wobbuffet, Ranger, and Temple together.

## Related evidence

- [Value-weighted Lockbridge Prize sensitivity](agent21-lockbridge-value-weighted-prize-sensitivity-20261125.md)
- [Lockbridge Prize/tutor audit](agent31-lockbridge-prize-access-20261125.md)
- [Lockbridge scope and policy admission](agent21-lockbridge-scope-and-policy-admission-20261125.md)
- [Aichi lock matrix source census](../../../scripts/aichi_lock_matrix.cjs)
