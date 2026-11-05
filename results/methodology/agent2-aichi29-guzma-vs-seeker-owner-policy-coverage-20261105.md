# Original Aichi 29: Guzma and VS Seeker are a widespread owner-policy requirement

**Agent 2, 5 November 2026. Exact name/count census, zero game-quality inferences.**

Source: authenticated 29 original 60-card **name/count** inventories in [full-decklists.json](../aichi-2026/full-decklists.json). Three ranks (23, 25 and 28) remain unavailable. This is a deterministic card-name census. Some original entries contain later-release Basic Energy artwork; printed historical authenticity and paper game readiness are separate questions.

| Original-60 feature | Decks with feature | Total listed copies |
| --- | ---: | ---: |
| Guzma | **25 of 29** (86.21%) | **48** |
| VS Seeker | **23 of 29** (79.31%) | **59** |
| Both Guzma and VS Seeker | **23 of 29** (79.31%) | Recovered-Guzma line exists in inventory, conditional on actual zones |
| Float Stone | 12 of 29 | 24 |
| Escape Rope | 7 of 29 | 11 |
| Counter Catcher | 7 of 29 | 10 |

Only rank **2 Vileplume Control** and rank **15 Lopunny Vileplume** list Guzma without VS Seeker. The four missing-Guzma originals are rank **4 and 17 Raichu Electrode Combo**, **26 Meloetta Donk**, and **31 Dusknoir Chimecho**. Every original with VS Seeker also lists Guzma.

For the 23 decks with both, a potential two-step action path `VS Seeker -> discarded Guzma -> both switch prompts` is central to **what the opponent might do**. The actual opportunity still requires the VS Seeker in the acting player's hand, Guzma in its own discard, Item/Supporter quotas and locks, a legal opposing Bench and own Bench, native payment and the real opportunity cost of the Supporter. Deck-list co-occurrence is only a structural potential, not evidence this line is always available or optimal.

Why field-wide: the specific [rank3 owner-held Guzma native counterexample](agent2-rank3-reciprocal-guzma-native-accepted-reply-20261105.md) demonstrated one direct bench-mobility response ignored by a weak bot, and its rank1 reply may require recovering Guzma via VS Seeker. The [existing generic damage-only Guzma selector](agent2-guzma-control-attack-omission-20261105.md) misses funded non-damaging control Pokémon and conservatively excludes some Special Energy boards. Counting Guzma and Seeker without native owner prompts can overestimate **or underestimate** the actual strategic access.

**Reproduction:** for each of the 29 deck objects, sum `count` over cards with `name === 'Guzma'` and `name === 'VS Seeker'`; count positive deck-level occurrences and their intersection. The counting procedure is independent of opponent bot behavior. No match has been added to the competitive denominator, and no candidate is nominated.

**Recommended policy coverage:** the shared owner-information-safe bilateral policy should handle held Guzma, VS Seeker's own discard retrieval, native card and Pokémon target prompts, Supporter contention, special Energy supplied units, attack payoff even when printed damage is zero, and an opponent's next tactical reply. A strong deck cannot be evaluated against opponents denied actions that appear in a large fraction of their actual fixed sixties.
