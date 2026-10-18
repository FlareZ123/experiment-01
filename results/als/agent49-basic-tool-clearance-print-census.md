# Single-energy, Basic attack routes to opposing Benched Tools

**Agent 49, 18 October 2026.** A card-printing search in the supplied `card-list.zip` across English card attack texts was filtered to Basic Pokémon from the Black & White series onward with an attack costing exactly one Colorless that can discard at least one opponent's **Benched** Pokémon Tool. Duplicate illustration/reprint rows were consolidated. This is a **print-text catalogue**, subject to paper legality, exact card errata, and engine behavior. It is not a new tested deck.

| English card | Dataset ID | HP, Prize burden | Attack (1 Colorless) and relevant target scope |
| --- | --- | --- | --- |
| Chatot PLB 77 | `bw10-77` | 60, one Prize | **Misinformation** discards all Tools from each opposing Pokémon. |
| Minccino FCO 86 | `xy10-86` | 60, one Prize | **Cleaning Up** discards one Tool from one opposing Pokémon. |
| Beedrill-EX XY promo 157 | `xyp-XY157` | 160, two Prizes | **Double Scrapper** discards up to two opposing attached Tools. |
| Purrloin UNM 135 | `sm11-135` | 70, one Prize | **Cleaning Up** discards one Tool from one opposing Pokémon. |
| Rotom FST 94 | `swsh8-94` | 80, one Prize | **Surprise Short** discards all Tools from all opposing Pokémon. |

**Source:** cards' `attacks[].name`, `cost`, and `text` in the supplied English dataset, with [Rotom print](https://www.serebii.net/card/fusionstrike/094.shtml), [Chatot print](https://www.serebii.net/card/plasmablast/077.shtml), and [official Expanded format Black & White onward](https://www.pokemon.com/uk/news/2026-pokemon-tcg-standard-format-rotation-announcement) providing independent spot checks. The search excluded attacks that discard only the **Active** Pokémon's Tool, attacks that discard only your own hand/attached Tools, and attacks with multiple Energy requirements. It did not establish that this is the only practical way to unlock a Bench Ability.

## Access and sequencing

The [exact Rotom counterfactual](agent49-attack-tool-clearance-frontier.md) uses one Rotom replacing one of two Blowers in the fixed New Moon 60. For the first seven plus mandatory draw conditioned on a valid Basic opening, it finds **7.759920830%** direct Rotom plus any Energy, and **19.894642126%** direct Rotom/Energy **or** remaining Blower, versus **24.376459377%** direct two-Blower baseline. These are hand visibility subsets and exclude searching.

**Search friction:** four Fog Crystal seek Basic Psychic Pokémon or Basic Psychic Energy, and two Mysterious Treasure seek Psychic/Dragon Pokémon; the five printed Tool-clearing Basics above are neither Psychic nor Dragon. Thus they do **not** inherit those six Psychic/Dragon search channels. The list's four first-turn Battle VIP Pass can search a Basic attacker if Item actions remain legal, at the cost of using one of two Bench acquisition slots and still needing to promote and power that attacker.

**Perfection trap:** Beedrill-EX is an EX that Mewtwo & Mew-GX can normally copy through Perfection if present in the required zone. However, when the purpose is to remove the very Tool sustaining **Garbodor's Garbotoxin**, Perfection is already Ability-blocked. Copying Double Scrapper cannot unlock Perfection in that blocked state; it requires some **other** lock-release channel first. A physical Beedrill-EX itself can use its printed attack if legally Active and powered, giving a distinct two-Prize vulnerability.

The attacks all consume the attacking turn. A responsive opponent can potentially **reattach a Tool** during their following turn, causing relock before the primary Mewtwo attacker obtains another attack. The crucial next evidence is a **complete two-player legal turn cycle**: make the Tool-clearing attack, let an autonomous opponent attempt the best legal retool, then verify whether a meaningful follow-up attack is still available. Search access, prize risk, and inability to attack on the clearance turn are substantial opportunity costs.

No source-dealt competitive Aichi game has been validated by this catalogue. Do not modify any frozen candidate or change the benchmark's **zero qualified games** status.
