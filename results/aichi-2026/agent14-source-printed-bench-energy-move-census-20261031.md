# Exact-printing own-Bench Energy-movement census of the Aichi 2026 authenticated field

**Agent 14, 31 October 2026.** Read-only static source analysis; not a match result.

## Input and printed-card matching

`simulation/evaluation/agent14-own-bench-energy-move-census.cjs` reads the original [full-decklists.json](full-decklists.json), [sets](../../resources/sets/en.json) and the corresponding individual [card printings](../../resources/cards/en/). Every source rank with a complete published original 60 is included. Each Pokémon is resolved by **set code, printed number, exact card name with only the printed Prism-glyph equivalent normalized**, using all sets that share the source abbreviation. `SMP`/`XYP` promo source numbers are mapped to actual `SMxxx`/`XYxxx` printed identifiers, maintaining distinct printed numbers.

A strict source-custody regression in `tests/agent14-own-bench-energy-move-census.test.cjs` fails if any original Pokémon is unresolved or ambiguous. It also recognizes explicit positive and negative text examples, including opponent-Bench movement and moves from Bench to Active.

[Strict manual CI run 41151167181](https://github.com/FlareZ123/experiment-01/actions/runs/41151167181), exact committed revision `efe7f1d8`, **passed** after fixing the ten source-alias resolution failures revealed by the initial strict test [41151027653](https://github.com/FlareZ123/experiment-01/actions/runs/41151027653). The ten failures were purely display/identifier variants: three source ranks with `SMP`/`XYP` promo numbers and several repeated `Ditto ♢`/`Tapu Koko ♢` names whose database card glyph uses `◇`. Resolved all without changing the original source manifest.

## Relevant exact printed attacks

This deliberately narrow attack-text predicate searches for mandatory or nominal moves of **Energy from the attacking Pokémon itself to its own Benched Pokémon**. The authenticated source roster contains:

| Source final rank | Exact Pokémon printing | Copies | Attack | Printed damage | Printed attack cost |
| ---: | --- | ---: | --- | ---: | --- |
| 6 | Iron Thorns ex TWM 77 | 4 | Volt Cyclone | 140 | Lightning, Colorless, Colorless |
| 24 | Iron Thorns ex TWM 77 | 4 | Volt Cyclone | 140 | Lightning, Colorless, Colorless |
| 29 | Iron Thorns ex TWM 77 | 4 | Volt Cyclone | 140 | Lightning, Colorless, Colorless |
| 30 | Empoleon V BST 40 | 1 | Swirling Slice | 130 | Water, Colorless, Colorless |

The rank-30 original list contains **five Basic Psychic Energy and two Telepathic Psychic Energy**. Printed Telepathic Psychic Energy (POR 88) provides Psychic; none of the listed Energy cards directly provides the required Water for Empoleon V's Swirling Slice. Therefore **ordinary attachment of the source list's Energy inventory cannot fund Swirling Slice's printed Water cost**. This is an Energy-inventory statement, not a proof about all conceivable Trainer effects, card-text substitutions or attack-copying routes.

The exact mechanism native-tested in [Agent 14's companion report](agent14-solo-bench-choice-contract-20261031.md) therefore directly applies to **three authenticated original Iron Thorns ranks**, and potentially only indirectly to rank 30.

## Boundaries

- The field still has **29 authenticated original full 60s; ranks 23, 25 and 28 lack exact rank-matched original lists**. No claim is made about missing ranks.
- The predicate does not enumerate alternative attack wording, attacks that **switch** the attacker, Energy moves from the opponent, damage-counter movement, Tool lock, or indirect Pokémon Abilities. It covers only explicitly printed attack-text instances in this narrow mechanical class.
- A printed attack on an original card is not a guarantee the deck can pay, use or prioritize it; actual root exposure requires owner-hand, Prize, Energy, Bench, Supporter, Stadium and matchup constraints.
- This census neither proves 99.5% strength nor supplies a competitive game outcome. Source-wide field remains **zero competitively qualified games**.

The reusable script and strict test can be re-run from the canonical unchanged manifest and English printing database. Any later original-source correction must requalify the source printing and change the census/CI witness deliberately.
