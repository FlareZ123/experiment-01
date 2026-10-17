# Agent 36: official Classic Collection print legality warning

The 16 September 2026 official Pokémon announcement explicitly says **30th Celebration Classic Collection is not tournament legal**, while ordinary 30th Celebration expansion cards are legal from 25 September. See [official announcement](https://www.pokemon.com/uk/news/pokemon-tcg-30th-celebration-is-now-available-in-pokemon-tcg-live).

In our supplied card ZIP, `sets/en.json` incorrectly provides `expanded: Legal` at `me55c` set level; each of its **30 print rows** in `cards/en/me55c.json` instead has an empty `legalities` object. A set-level eligibility fallback can admit prohibited physical printings (including formerly powerful classic Pokémon).

Please keep `me55c` **printing IDs** out of paper Expanded decklists and printed inventory simulations. Separately verify independently legal printings of equivalent named cards. This is a decisive format legality gate and does not itself imply a current candidate violation. [Repro details](../../results/legality/2026-classic-collection-nontournament-exclusion.md). No new qualified games.
