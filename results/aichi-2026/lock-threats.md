# Lock-effect threat inventory: Aichi 2026 Top 32

## Exact-print methodology

[Published 29 complete lists](full-decklists.json) were matched by displayed card name, **set and number** to Pokémon/effects in the bundled English database. The [machine-readable audit code](../../scripts/aichi_lock_matrix.cjs) includes every curated printing and counts list placement separately. It was curated against the card text, not by Pokémon name alone.

**24/29 published lists** include at least one of these twelve identified printed lock-effect cards. That is card *presence*, with no claim the effects can actually be brought online, activated simultaneously, or used to win. The five published lists without an inventory match are ranks **1, 19, 26, 30, 31**. Other control effects not included here can still matter.

| Source printing | Matches among 29 | Printed copies | Restriction and required activation |
| --- | ---: | ---: | --- |
| Budew ASC 16 | 14 | 19 | Its zero-Energy *Itchy Pollen* attack temporarily prevents the opponent playing Items on their following turn; ends the current player's attacking turn |
| Vileplume AOR 3 | 2 | 4 | Stage 2 *Irritating Pollen* prevents **both players** playing Items while its Ability is active |
| Vileplume BUS 6 | 1 | 1 | Stage 2 Active *Disgusting Pollen* prevents the opponent's **Basic Pokémon** attacking |
| Garbodor LTR 68 | 2 | 4 | Stage 1 *Garbotoxin* removes Pokémon Abilities, with a Tool attached, while active |
| Garbodor BKP 57 | 3 | 5 | Another Garbotoxin printing, separately identified; Tool required |
| Stoutland BCR 122 | 1 | 1 | Stage 2 Active *Sentinel* prevents opponent playing Supporters |
| Iron Thorns ex TWM 77 | 3 | 12 | Basic Active *Initialization* removes Rule Box Pokémon Abilities, except Future Pokémon; affects **both** sides |
| Snorlax PGO 55 | 2 | 5 | Basic Active *Block* prevents opponent's Active Pokémon retreating |
| Klefki SVI 96 | 2 | 2 | Basic Active *Mischievous Lock* turns off Basic Pokémon Abilities for both players, except itself |
| Wobbuffet PHF 36 | 3 | 5 | Basic Active *Bide Barricade* turns off non-Psychic Pokémon Abilities for both players |
| Path to the Peak CRE 148 | 7 | 8 | Stadium removes Rule Box Pokémon Abilities while in play |
| Silent Lab PRC 140 | 4 | 5 | Stadium removes Basic Pokémon Abilities while in play |

### Position, resource and opportunity costs

- **Competing Active slots.** Stoutland and Iron Thorns ex cannot both provide their own Active-dependent effects from the same player's Active Spot, and Budew has to attack to impose its temporary Item restriction. Multiple card names in one list are not additive lock bonuses.
- **Item locks have distinct mechanics.** Vileplume AOR 3 affects both players continuously from play; Budew's attack restricts the opponent's next turn, and the attacker loses its attack opportunity for the turn. Garbotoxin must be established as a Stage 1 and requires a Pokémon Tool.
- **Ability lock can disable other locks.** Conditional Ability-based effects depend on whether those Pokémon keep their Abilities. Stealthy Hood and Tool interference can create exceptions; consult original rulebook, card text and actual game state.
- **Retreat lock differs from forced switching.** Snorlax's *Block* prevents the natural once-per-turn retreat, but Switch and similar effects can still reposition Pokémon if allowed.

## Rank and deck relevance

- **Regidrago:** all nine published Regidrago lists contain Budew; two include Wobbuffet, four contain Path to the Peak, and two contain Silent Lab. Two additional Regidrago top-32 lists lack published card contents.
- **Iron Thorns:** ranks 6, 24 and 29 each contain four Iron Thorns ex, making the Active-dependent Ability lock an archetype-defining threat. Their four Basic Pokémon produce a 60.050% initial mulligan probability and, conditioned on a valid opening, 84.175% of initial hands contain exactly one Basic. [Exact opening audit](opening-hand-audit.json)
- **Vileplume control:** rank 2 has AOR Vileplume and Stoutland; rank 15 has AOR and BUS Vileplume, plus Budew and Ability-lock Stadium options.
- **Absol Garbodor:** all four published lists contain Tool-dependent Garbotoxin; some include Budew, and they may use Tool/Bench resources differently.
- **Snorlax Stall:** ranks 3 and 7 contain *Block* Snorlax; rank 7 also includes Wobbuffet.
- **Raichu Electrode Combo:** both published lists contain Klefki; rank 25's exact list is unpublished.

## Implications for the single-deck search

The candidate should be evaluated under the **actual state-conditioned access** constraints for Item, Supporter, Ability, retreat and attack locks. A list looking consistent without active adversarial lock modeling cannot establish strength across this particular field. Branching order, Tools, Stadium replacement, counter-gust, Item-vs-Supporter contention, and whether the opponent can establish the lock matter.

The inventory is **partial by design**: it enumerates twelve confirmed effect printings, not every possible lock, damage prevention or denial card in the Japanese Expanded pool. A simulator still needs to validate its card implementations, interactions and decision policies. These figures are descriptive frequencies, **not** match win-rate measurements.

Source anchor: bundled English Pokémon card JSON, [full Aichi lists](full-decklists.json), and Advanced Player's Rulebook sections on Abilities, attack effects and retreat.
