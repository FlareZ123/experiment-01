# Forest Seal Stone extension to Radiant Eternatus opening access

**Agent 10, 15 October 2026.** Exact combinatorial extension to [the direct Climactic Gate model](radiant-eternatus-opening.md) for Aichi Open League 2026 champion Shadow Rider Calyrex. This is an **accessibility study**, not evidence of realized play or match wins.

## Previously omitted connector

The published champion list also includes **1 Forest Seal Stone**, **3 Shadow Rider Calyrex V** and **4 Fog Crystal**. Forest Seal Stone grants Star Alchemy to the Pokémon V it is attached to, allowing a **once-per-game** search for any single card. Fog Crystal can find a Basic Psychic Pokémon, including Shadow Rider Calyrex V. With Forest Seal Stone in early hand, a viable new sequence exists:

1. Use a Shadow Rider V already in hand/on board, or Fog Crystal to fetch one from the deck.
2. Attach Forest Seal Stone to that Pokémon V.
3. Use Star Alchemy to search **Radiant Eternatus** if it remains in the deck. If Radiant is Prized, search **Hisuian Heavy Ball** if that Item is still in the deck, then use Heavy Ball to retrieve Radiant.
4. Bench Radiant Eternatus and activate Climactic Gate with at least two VMAX still in deck. This ends the turn.

Only states **not already reachable** through direct Radiant in hand, five Mysterious Treasure/Quick Ball search sources, or Heavy Ball in hand are counted in the incremental result.

## Exact computation

Refine the 60-card partition into nine groups: Radiant 1; direct eligible search Items 5; Heavy Ball 1; VMAX 4; other Basics 10; Shadow Rider V 3; Forest Seal Stone 1; Fog Crystal 4; other cards 31.

Enumerate opening-seven compositions and first-turn draws. The player going first **does draw** on first turn, exactly like the player going second ([official Q&A](https://asia.pokemon-card.com/sg/rules/search/?pageNo=11)); the seven-card column is only a setup snapshot, prior to the mandatory draw. For each early-hand composition, count remaining six-Prize arrangements using exact binomial coefficients for the four classes whose Prize allocation matters here: Radiant, Heavy Ball, Shadow Rider V and VMAX. Group all other Prized categories. Selecting the turn draw before six Prizes during enumeration is mathematically equivalent to the actual setup order because cards are uniformly shuffled and exchangeable; this reduces the enumeration without changing the joint distribution.

The Forest Seal Stone route requires the Tool in hand plus a usable Shadow Rider V in hand or fetched by Fog Crystal. A direct line requires Radiant still in the deck. The Prize rescue requires Radiant Prized, Heavy Ball available in the deck, and Star Alchemy able to find it. At least two VMAX must remain in deck for the two-target count. We condition on a valid initial seven with 14 Basics, and assume all intermediate searches, Tools and Abilities can resolve without strategic contention.

## Exact conditional probabilities

| Quantity | Setup only, 7 (%) | First turn after mandatory draw, 8 (%) |
|---|---:|---:|
| Baseline direct Radiant access | 47.2822 | 52.2048 |
| **Additional** Forest Seal Stone to Radiant in deck | +3.1176 | +3.4713 |
| **Additional** Forest Seal Stone to Heavy Ball Prize rescue | +0.5282 | +0.6522 |
| **Total including these VSTAR lines** | **50.9281** | **56.3284** |
| Baseline with two VMAX still available | 46.2058 | 50.6594 |
| **Additional** Forest Seal Stone, two VMAX available | +3.5683 | +4.0066 |
| **Total two-VMAX potential including these VSTAR lines** | **49.7742** | **54.6660** |

All additional lines are mutually exclusive with previously counted direct routes. Exact integer weights and denominators are retained in the script output.

## Independent verification and implications

- [Exact Forest Seal Stone extension](../../scripts/radiant-fss-extension.cjs) complements the [original enumerator](../../scripts/radiant-eternatus-opening.cjs). [Regression and independent Monte Carlo tests](../../tests/radiant-fss-extension.test.cjs) independently shuffle 60 physical-category cards and classify the Forest Seal Stone routes for 300,000 deals for each snapshot. Both tests passed under Node 22.16.0, within ±0.3 percentage points of exact estimates.
- Forest Seal Stone adds **4.1235 percentage points** to the modeled after-draw Radiant access and **4.0066 points** to modeled two-target access. Its incremental access value is larger than an additional Hisuian Heavy Ball under the narrower model, but it cannot be considered an automatic deck benefit: Star Alchemy may be essential to obtaining Energy, an attacker, a Supporter, or another game-winning singleton.
- The model still ignores additional draw and search paths, discard-capability constraints, locks, opponent mulligan bonuses, enemy interaction, board decisions, and whether ending the turn with Climactic Gate is strategically correct. Consequently, the totals are **neither bounds on actual activation frequency nor win-rate estimates**. The swarm's 99.5% win target remains unproven.
