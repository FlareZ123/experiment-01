# Agent 21: Lockbridge field-role exposure census

**25 November 2026.** Exact source-list/card-database census for the Aichi Open League 2026 Top 32 lists currently available in the repository. This is a field-exposure result, not a matchup win-rate estimate.

## Decision this can inform

**Fixed-60 candidate ranking:** estimate the field exposure of the two Basic-Pokémon roles exchanged in the Lockbridge package, and avoid valuing Clefairy as if it only mattered against Regidrago. The result does not rank the complete four-slot package.

## Method

- Input lists: all 29 source-verified decks in `results/aichi-2026/full-decklists.json`. Ranks 23, 25, and 28 remain absent from the source dataset.
- Printing-to-card mapping: `resources/sets/en.json` plus `resources/cards/en/{set-id}.json`. The 51 Pokémon-printing set codes mapped through the set index were checked against the corresponding card records; no mapped Pokémon printing failed to resolve.
- Three promo printings did not map through the set index and were excluded from the type/Ability scan: Trevenant & Dusknoir-GX SMP 217 (rank 1), Jirachi XYP 67 (rank 2), and Regirock XYP 49 (ranks 3 and 7). None is Dragon-type. Ranks 1, 2, 3, and 7 already have other mapped non-Psychic Ability-bearing Pokémon, so the 29/29 potential-target count below is unchanged. The promo cards are excluded from individual Ability classification.
- “Potential Wobbuffet target” means the source list contains at least one Pokémon whose printed type is not Psychic and which has a printed Ability. It does not mean that the Ability is live, decisive, unused, or still available after Wobbuffet enters the Active Spot.
- “Clefairy target” means the source list contains at least one Dragon-type Pokémon. Fairy Zone changes the Weakness of each opponent's Dragon Pokémon **in play** to Psychic (×2); the count does not imply that a Dragon Pokémon is necessarily in play at the relevant time.

The card texts were checked directly in the current repository card database:
- Wobbuffet PHF 36 / XY4-36: Bide Barricade applies while Wobbuffet is Active and suppresses Abilities of non-Psychic Pokémon in play, in each player's hand, and in each player's discard pile.
- Lillie's Clefairy ex JTG 56 / SV9-56: Fairy Zone changes the Weakness of every opponent's Dragon Pokémon in play to Psychic (×2).
Both printings are marked Expanded Legal in the card database.

## Results

**29/29 potential Wobbuffet target lists**

Every one of the 29 source-verified lists contains at least one mapped non-Psychic Ability-bearing Pokémon. Representative target families include:

- Regidrago VSTAR Legacy Star and Hisuian Goodra VSTAR Moisture Star across the Regidrago group;
- Dedenne-GX, Squawkabilly ex, Crobat V, Genesect V, Pidgeot ex, Electrode-GX, and Eldegoss V as draw/search or recovery engines;
- Vileplume, Stoutland, Iron Thorns ex, Snorlax, and Toedscruel as lock, control, or utility Abilities;
- Radiant Eternatus, Tapu Koko Prism Star, Galarian Moltres V, Ho-Oh-EX, and Exeggcute as setup or acceleration Abilities.

This is a broad *potential target presence* result. Wobbuffet's Active-only requirement and the timing of the opponent's Ability use are decisive limitations: it cannot undo an Ability that already resolved, and it does not suppress Psychic Pokémon.

**12/29 Dragon-type target lists**

The 12 ranks containing at least one Dragon-type Pokémon are:

**1, 10, 12, 13, 14, 18, 19, 20, 21, 27, 30, 32.**

This comprises the nine Regidrago lists (10, 12, 13, 14, 18, 20, 21, 27, 32) plus ranks 1, 19, and 30. Examples include Radiant Eternatus (rank 1), Regidrago V/VSTAR and Hisuian Goodra VSTAR (the Regidrago group), Dragon-type attackers in rank 19, and Dialga-GX (rank 30). The census also found Mega Dragonite ex in Regidrago lists 14, 20, and 32.

Thus Clefairy has a wider source-list exposure than “nine Regidrago lists”: at least 12/29 known lists contain a Dragon-type target. The effect still requires a Dragon Pokémon to be in play and a Psychic attacker to exploit the changed Weakness.

## Counter-lock and timing caveats

The known direct Ability-lock counter families in the source field are:

- Garbodor Garbotoxin: ranks 8, 11, 16, and 22 (4 lists). Garbotoxin is Psychic and is not suppressed by Wobbuffet; an active Tool-enabled Garbodor can suppress Wobbuffet.
- Klefki: ranks 4 and 17 (2 lists). Its Basic-Pokémon Ability suppression can affect Basic Wobbuffet while Klefki is Active. Klefki is Psychic-type, so Wobbuffet's Psychic exception does **not** suppress Klefki; this is a one-way counter while Klefki remains Active, not a mutual Ability-lock tie.

The Vileplume lists (ranks 2 and 15) also include Stealthy Hood, which can protect a key Pokémon from an opponent's Ability effect. The 29/29 count must therefore not be read as 29 favorable Wobbuffet matchups.

For comparison, existing field audits count Budew in 14/29 lists (relevant to Pokémon Ranger's attack-effect clearing) and Special Energy in 24/29 lists (relevant to Temple of Sinnoh). Those are different effect windows: Ranger is a one-use Supporter answer to attack effects; Temple is a Stadium effect that can be replaced; Wobbuffet is an Active-only Ability lock; Clefairy is a Bench-compatible Weakness modifier.

## Implication for the Lockbridge four-slot trade

The exposure census makes both exchanged roles material:

- Wobbuffet has potential non-Psychic Ability targets in all 29 known lists, though its Active-only window, Psychic exception, Garbodor/Klefki counters, and already-resolved Abilities limit realized value.
- Clefairy has Dragon-type targets in 12/29 known lists, not only the nine Regidrago lists. The second copy therefore provides redundancy for a role with meaningful field exposure.
- Ranger and Temple also have distinct field exposure and timing. Their 14/29 and 24/29 counts are not directly comparable to the Ability/Weakness counts.

This census does **not** justify setting Wobbuffet's role value to 29/29 or Clefairy's to 12/29 in the Prize model. Presence is not impact. It does show that the earlier equal-weight sensitivity (which set Clefairy to 1 by assumption) is illustrative only; a full-package comparison must value the actual effect windows and matchup impact of Clefairy, Wobbuffet, Ranger, and Temple together.


## Interaction matrix: the two Basic roles are complementary, not interchangeable

A further card-text check identifies an important asymmetry between the two abilities:

| Opposing suppressor | Field ranks | Effect on Lillie's Clefairy ex | Effect on Wobbuffet |
|---|---|---|---|
| Path to the Peak | 5, 9, 12, 15, 20, 21, 27 (7 lists) | Suppresses Fairy Zone because Clefairy ex has a Rule Box | Does not suppress Wobbuffet; it has no Rule Box |
| Iron Thorns ex | 6, 24, 29 (3 lists) | Suppresses Fairy Zone while Iron Thorns is Active | Does not suppress Wobbuffet; Wobbuffet can suppress Iron Thorns because Iron Thorns is non-Psychic |
| Garbodor / Garbotoxin | 8, 11, 16, 22 (4 lists) | Suppresses Fairy Zone | Suppresses Bide Barricade; Wobbuffet cannot suppress Garbodor because Garbodor is Psychic |
| Klefki | 4, 17 (2 lists) | Suppresses Fairy Zone while Klefki is Active because Clefairy is Basic | Suppresses Bide Barricade while Klefki is Active because Wobbuffet is Basic; Wobbuffet cannot suppress Klefki because Klefki is Psychic |
| Stealthy Hood present | 2, 3, 15, 32 (4 lists) | Can protect the Pokémon carrying it from an opponent's Ability effect | Can protect the specific Pokémon carrying it from Wobbuffet's Ability effect; other non-Psychic Pokémon remain exposed |
| Tool Jammer present | 3, 6, 7, 24, 29 (5 lists) | Does not directly suppress Fairy Zone | If attached to the opponent's Active Pokémon, it suppresses Tools on our Active Wobbuffet (e.g. Float Stone or Stealthy Hood), but not Bide Barricade itself |

**Important synergy:** against Active Iron Thorns ex, Active Wobbuffet survives Initialization because it has no Rule Box. Wobbuffet then suppresses Iron Thorns because it is non-Psychic. This restores the candidate's own Rule Box Abilities on Psychic Pokémon, most importantly Shadow Rider Calyrex VMAX's Underworld Door; Wobbuffet is Psychic and does not suppress that Ability, while Iron Thorns's Ability is disabled for as long as Wobbuffet remains Active. Clefairy ex's Fairy Zone can also function during that window, although the three Iron Thorns lists (ranks 6, 24, 29) contain no Dragon-type target, so Fairy Zone is not the relevant payoff in those matchups. The key payoff is restoring Shadow Rider's engine and other Rule Box Abilities. If Wobbuffet leaves the Active Spot, Iron Thorns's Initialization becomes active again; the timing and switch/attack line are therefore important and untested. There is a concrete mobility constraint: all three Iron Thorns lists (6, 24, 29) also contain Tool Jammer. The Lockbridge 60 has one Float Stone and no Switch/Escape Rope; an opponent's Active Tool Jammer can turn off Float Stone or Stealthy Hood on our Active Wobbuffet. It does not turn off Bide Barricade, but it can prevent a free retreat after the Underworld Door window. Manual retreat or Guzma changes the energy/lock state and must be tested.

**Important separation:** Path to the Peak suppresses Clefairy but not Wobbuffet. Wobbuffet does not remove a Stadium, so Fairy Zone remains off until the Stadium is replaced, but Bide Barricade can still operate. Garbodor and Klefki are the harder one-way counter-lock families: both are Psychic, so Wobbuffet's Psychic exception does not suppress them.

This interaction matrix reinforces that Wobbuffet's value is not merely an independent “Ability target” role. It can preserve the operation of the Clefairy role against Iron Thorns, while the two cards fail together against Tool-live Garbodor and Active Klefki. This is a card-text inference; the timing, promotion, Tool, Stadium, and gust lines remain untested.

## Related evidence

- [Value-weighted Lockbridge Prize sensitivity](agent21-lockbridge-value-weighted-prize-sensitivity-20261125.md)
- [Lockbridge Prize/tutor audit](agent31-lockbridge-prize-access-20261125.md)
- [Lockbridge scope and policy admission](agent21-lockbridge-scope-and-policy-admission-20261125.md)
- [Aichi lock matrix source census](../../../scripts/aichi_lock_matrix.cjs)
