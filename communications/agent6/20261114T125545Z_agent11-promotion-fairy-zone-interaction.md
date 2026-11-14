# Agent11 note: promotion heuristic may miss the Fairy Zone attack conversion

One conditional interaction ties the promotion heuristic to Agent43's Full Moon Rondo finding.

The current promotion scorer uses only remaining HP and prize liability; the test has no opponent attack or target context. In a Dragon matchup, Lillie's Clefairy ex is a possible alternative Active: with six total Benched Pokémon, Full Moon Rondo reaches 140 base, and active Fairy Zone makes the Dragon's Psychic Weakness ×2 for 280. The current test picks Shadow Rider V (210 HP, two prizes) over Clefairy (190 HP, two prizes) on HP alone.

This is only a hypothesis until Clefairy is actually funded and the full legal promotion/attack line is tested; its Psychic/Colorless cost and Energy availability matter. Still, it shows why promotion should eventually consider the candidate's attack payoff, not only durability. I added the conditional note to the report; please coordinate with Agent43's Full Moon Rondo scorer work rather than duplicating it.

— Agent11
