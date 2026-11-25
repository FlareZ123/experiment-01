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

For comparison, existing field audits count Budew in 14/29 lists (relevant to Pokémon Ranger's attack-effect clearing) and Special Energy in 24/29 lists (relevant to Temple of Sinnoh). Temple's persistence is especially limited: among the 10 DDE lists, Marshadow UNB 81 appears in 8/10 (and in 7/9 Regidrago lists). Its Psychic Resetting Hole Ability can discard any Stadium from the Bench and is not suppressed by Wobbuffet. A scan of the published field's Pokémon Abilities found Marshadow to be the only Pokémon Ability-based Stadium remover among the 29 lists; other identified answers are Trainer/Stadium cards. This Ability-based answer is additional to direct Stadium/Trainer outs in [Agent39's Temple counter-resource audit](../agent39-temple-double-dragon-field-counter-resource-20261107.md). These are different effect windows: Ranger is a one-use Supporter answer to attack effects; Temple is a Stadium tempo effect with multiple replacement/removal routes; Wobbuffet is an Active-only Ability lock; Clefairy is a Bench-compatible Weakness modifier.

## Implication for the Lockbridge four-slot trade

The exposure census makes both exchanged roles material:

- Wobbuffet has potential non-Psychic Ability targets in all 29 known lists, though its Active-only window, Psychic exception, Garbodor/Klefki counters, and already-resolved Abilities limit realized value.
- Clefairy has Dragon-type targets in 12/29 known lists, not only the nine Regidrago lists. The second copy therefore provides redundancy for a role with meaningful field exposure.
- Ranger and Temple also have distinct field exposure and timing. Their 14/29 and 24/29 counts are not directly comparable to the Ability/Weakness counts.

This census does **not** justify setting Wobbuffet's role value to 29/29 or Clefairy's to 12/29 in the Prize model. Presence is not impact. Rank 1 Shadow Rider is a concrete low-value example: all 11 Energy are Basic Psychic, its Shadow Rider VMAX/Tapu Lele-GX/Latias ex core Abilities are Psychic and exempt from Bide Barricade, and its Marshadow can remove Temple; Wobbuffet's main non-Psychic target is Radiant Eternatus before Gate resolves. It does show that the earlier equal-weight sensitivity (which set Clefairy to 1 by assumption) is illustrative only; a full-package comparison must value the actual effect windows and matchup impact of Clefairy, Wobbuffet, Ranger, and Temple together.


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
| Guzma | 1, 2, 3, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 18, 19, 20, 21, 22, 24, 27, 29, 30, 32 (25 lists) | Does not suppress Fairy Zone | Supporter can force our Active Wobbuffet to the Bench, ending Bide Barricade; remains playable under Wobbuffet |
| Escape Rope | 4, 5, 9, 11, 17, 26, 31 (7 lists) | Does not suppress Fairy Zone | Item forces both Active Pokémon to switch, ending Bide Barricade if playable |

**Important synergy:** against Active Iron Thorns ex, Active Wobbuffet survives Initialization because it has no Rule Box. Wobbuffet then suppresses Iron Thorns because it is non-Psychic. This restores the candidate's own Rule Box Abilities on Psychic Pokémon, most importantly Shadow Rider Calyrex VMAX's Underworld Door; Wobbuffet is Psychic and does not suppress that Ability, while Iron Thorns's Ability is disabled for as long as Wobbuffet remains Active. Clefairy ex's Fairy Zone can also function during that window, although the three Iron Thorns lists (ranks 6, 24, 29) contain no Dragon-type target, so Fairy Zone is not the relevant payoff in those matchups. The key payoff is restoring Shadow Rider's engine and other Rule Box Abilities. If Wobbuffet leaves the Active Spot, Iron Thorns's Initialization becomes active again; the timing and switch/attack line are therefore important and untested. There is a concrete mobility constraint: all three Iron Thorns lists (6, 24, 29) also contain Tool Jammer. The Lockbridge 60 has one Float Stone and no Switch/Escape Rope; an opponent's Active Tool Jammer can turn off Float Stone or Stealthy Hood on our Active Wobbuffet. It does not turn off Bide Barricade, but it can prevent a free retreat after the Underworld Door window. Manual retreat or Guzma changes the energy/lock state and must be tested. More importantly, the source field has Guzma in 25/29 lists and Escape Rope in 7/29. Either can force Wobbuffet out of the Active Spot; Guzma is a Supporter and therefore remains playable under Bide Barricade, while Escape Rope is an Item. The 25/29 Guzma prevalence shows broad list-level access, but it is not an immediate-access probability; the exact first-response displacement model below quantifies the distinction. The lock remains Active-only and can be displaced, but its persistence cannot be inferred from list presence alone. The candidate has no Switch or Escape Rope of its own, so re-establishing Wobbuffet after a forced switch is not automatic.

**Important separation:** Path to the Peak suppresses Clefairy but not Wobbuffet. Wobbuffet does not remove a Stadium, so Fairy Zone remains off until the Stadium is replaced, but Bide Barricade can still operate. Garbodor and Klefki are the harder one-way counter-lock families: both are Psychic, so Wobbuffet's Psychic exception does not suppress them.

This interaction matrix reinforces that Wobbuffet's value is not merely an independent “Ability target” role. It can preserve the operation of the Clefairy role against Iron Thorns, while the two cards fail together against Tool-live Garbodor and Active Klefki. This is a card-text inference; the timing, promotion, Tool, Stadium, and gust lines remain untested.

## Related evidence

- [Value-weighted Lockbridge Prize sensitivity](agent21-lockbridge-value-weighted-prize-sensitivity-20261125.md)
- [Lockbridge Prize/tutor audit](agent31-lockbridge-prize-access-20261125.md)
- [Lockbridge scope and policy admission](agent21-lockbridge-scope-and-policy-admission-20261125.md)
- [Aichi lock matrix source census](../../../scripts/aichi_lock_matrix.cjs)


## First-response displacement-access model

**Decision relevance:** fixed-60 candidate ranking, specifically whether the Wobbuffet Active lock should be discounted as immediately removable across most of the Aichi field.

**Evidence class:** exact multivariate-hypergeometric access prior over the 29 published source lists. This is not a game, policy, action-use rate, lock-uptime estimate, matchup result, or win rate.

### Method

The reproducible script is [`scripts/agent21-lockbridge-displacement-access.cjs`](../../../scripts/agent21-lockbridge-displacement-access.cjs). It reads the unchanged `results/aichi-2026/full-decklists.json`.

For each 60-card opponent list, the calculation chooses six Prize cards from the 60, then samples (H\) cards from the remaining 54, for (H=7,8,9,10). It counts access to:
- Guzma directly;
- Prime Catcher directly;
- Escape Rope directly, assuming the Lockbridge player has a Benched Pokémon to promote;
- Counter Catcher in a separate conditional scenario, assuming the opponent has more Prize cards remaining than Lockbridge;
- a Guzma recovery line when both VS Seeker and Battle Compressor are in the sampled cards and at least one Guzma remains in the draw deck.

The DP enumerates Prize/hand allocations exactly. The `no Counter Catcher` scenario includes Guzma, Prime Catcher, Escape Rope, and the VS Seeker + Battle Compressor + Guzma line. The `with Counter Catcher` scenario adds Counter Catcher as though its Prize condition is live.

This is a K0-style access prior: it does not condition on a legal Basic opening hand, mulligans, cards spent to establish the opponent's board, Supporter contention, whether a legal target/Bench exists, or whether the opponent chooses to use the card. It does not count VS Seeker retrieving a Guzma already in the discard pile, other attacks/Abilities, or other unlisted displacement effects. Consequently these figures are a controlled access screen, not strict lower or upper bounds on actual play.

### Aggregate results

| Cards observed (H) | Gust-style access, no Counter Catcher | Any modeled displacement, no Counter Catcher | Any modeled displacement, Counter Catcher condition assumed live |
|---:|---:|---:|---:|
| 7 | 20.78% | 24.72% | 28.02% |
| 8 | 23.68% | 28.11% | 31.74% |
| 9 | 26.54% | 31.42% | 35.36% |
| 10 | 29.35% | 34.67% | 38.88% |

At (H=9), the modeled access rate is **31.42%–35.36%** across the 29 known lists. The complement, **64.64%–68.58%**, is the share with no modeled displacement line in that sampled card pool; it does not prove that Wobbuffet remains Active or that its Ability is effective.

### (H=9) by archetype

| Archetype | Known lists | Any displacement, no Counter Catcher | Counter Catcher condition assumed live |
|---|---:|---:|---:|
| Regidrago | 9 | 35.85% | 40.66% |
| Iron Thorns | 3 | 35.42% | 35.42% |
| Raichu Electrode Combo | 2 | 39.14% | 39.14% |
| Absol Garbodor | 4 | 27.70% | 27.70% |
| Snorlax Stall | 2 | 15.00% | 43.95% |
| Vileplume archetypes | 2 | 27.97% | 27.97% |
| Absol Electrode | 1 | 41.68% | 41.68% |
| Lillie's Clefairy | 1 | 43.95% | 43.95% |
| Raging Bolt | 1 | 33.41% | 33.41% |
| Mew Genesect | 1 | 39.14% | 39.14% |
| Meloetta Donk | 1 | 15.00% | 27.97% |
| Shadow Rider Calyrex | 1 | 19.17% | 19.17% |
| Dusknoir Chimecho | 1 | 15.00% | 15.00% |

### (H=9) by published rank

| Rank | Archetype | No Counter Catcher | Counter Catcher condition assumed live |
|---:|---|---:|---:|
| 1 | Shadow Rider Calyrex | 19.17% | 19.17% |
| 2 | Vileplume Control | 27.97% | 27.97% |
| 3 | Snorlax Stall | 15.00% | 39.14% |
| 4 | Raichu Electrode Combo | 39.14% | 39.14% |
| 5 | Mew Genesect | 39.14% | 39.14% |
| 6 | Iron Thorns | 39.14% | 39.14% |
| 7 | Snorlax Stall | 15.00% | 48.75% |
| 8 | Absol Garbodor | 22.83% | 22.83% |
| 9 | Absol Electrode | 41.68% | 41.68% |
| 10 | Regidrago | 42.71% | 42.71% |
| 11 | Absol Garbodor | 39.14% | 39.14% |
| 12 | Regidrago | 27.97% | 39.14% |
| 13 | Regidrago | 35.63% | 35.63% |
| 14 | Regidrago | 32.06% | 42.71% |
| 15 | Lopunny Vileplume | 27.97% | 27.97% |
| 16 | Absol Garbodor | 26.01% | 26.01% |
| 17 | Raichu Electrode Combo | 39.14% | 39.14% |
| 18 | Regidrago | 48.75% | 48.75% |
| 19 | Raging Bolt | 33.41% | 33.41% |
| 20 | Regidrago | 30.87% | 30.87% |
| 21 | Regidrago | 32.06% | 42.71% |
| 22 | Absol Garbodor | 22.83% | 22.83% |
| 24 | Iron Thorns | 27.97% | 27.97% |
| 26 | Meloetta Donk | 15.00% | 27.97% |
| 27 | Regidrago | 41.68% | 41.68% |
| 29 | Iron Thorns | 39.14% | 39.14% |
| 30 | Lillie's Clefairy | 43.95% | 43.95% |
| 31 | Dusknoir Chimecho | 15.00% | 15.00% |
| 32 | Regidrago | 30.87% | 41.68% |

Ranks 23, 25, and 28 remain missing and are not imputed. The nine known Regidrago lists are therefore not the complete Regidrago portion of the Top 32.

### Interpretation for the fixed-60 decision

The raw presence counts are 48 Guzma copies in 25 lists, 11 Escape Rope in 7 lists, 10 Counter Catcher in 7 lists, and 3 Prime Catcher in 3 lists. Those counts establish broad potential access, not immediate access in a particular response window. The exact access calculation materially narrows the inference: among the 29 published lists, only about one-third have one of the modeled Trainer displacement lines in the first nine cards observed under the stated assumptions.

This supports treating Wobbuffet as a meaningful potential control window rather than assuming that list-level Guzma prevalence immediately removes it. It does **not** prove a persistent lock. The model does not evaluate whether the opponent actually spends a Supporter, whether the line is strategically correct, whether Wobbuffet can be re-established, or whether a separate Ability counter-lock (notably Tool-live Garbotoxin or Active Klefki) neutralizes Bide Barricade. Those remain distinct matchup questions.

**Disposition:** keep Lockbridge as an unranked structural challenger; do not promote it or alter the fixed 60 from this access prior alone. The next admissible comparison remains the full Lockbridge package against Hood Shield under the same competent frozen policies, once the policy/game gate is separately authorized. No deck, policy, fixture, workflow, or game was changed or dispatched for this analysis.
