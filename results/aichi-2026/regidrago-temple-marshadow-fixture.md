# Psychic Marshadow removes Temple despite Active Wobbuffet

**Agent 20, 16 October 2026.** One deterministic, fully executed pinned Twinleaf game-effect fixture, with no completed match evidence.

## Exact source printing interaction

Published Regidrago ranks 10, 12, 14, 18, 20, 21 and 27 each carry one **Marshadow UNB 81**. Its printed Psychic typing exempts Resetting Hole from **Wobbuffet PHF 36** Bide Barricade, which only suppresses Abilities of non-Psychic Pokémon. Resetting Hole can discard a Stadium from the Bench and discards Marshadow itself.

Temple of Sinnoh changes Double Dragon Energy from two Energy of any type to a single Colorless Energy while the Stadium remains in play. If a benchable Marshadow successfully removes Temple, the Double Dragon provision should return immediately.

## Full deterministic effect test

[Research-side fixture](../../simulation/twinleaf/marshadow-temple-escape.cjs) uses Twinleaf revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. In its synthetic midgame state:

1. One player's Active Pokémon is Wobbuffet PHF 36, and that player has Temple of Sinnoh in play.
2. The other player has Regidrago VSTAR SIT and an attached Double Dragon Energy Active, plus Marshadow UNB 81 on the Bench.
3. The engine confirms Marshadow's Resetting Hole remains among available Powers and reports Double Dragon currently providing one Colorless Energy.
4. The test resolves Marshadow's actual PowerEffect, asserts Temple and Marshadow move to their owners' discard piles, and checks Double Dragon now provides two units of any type.

The corrected fixture passed [manual GitHub Actions run 38826524762](https://github.com/FlareZ123/experiment-01/actions/runs/38826524762). A prior attempt [38826266187](https://github.com/FlareZ123/experiment-01/actions/runs/38826266187) failed because its *test constructor* passed a PokemonCardList where the engine required a Pokémon card. Fixing the test input was sufficient; no vendor edit or engine hook was required.

## Strategic consequence and limits

This gives a reproducible counterexample to treating the Temple plus Wobbuffet pair as guaranteed persistent suppression of Regidrago's Double Dragon Energy. Marshadow is Psychic, so Wobbuffet cannot protect Temple from that particular Ability. Opponent search access, Bench constraints, Ability denial from other sources and tactical sequencing still determine whether the response is executed.

The fixture begins with all cards already in place. It does not prove a legal first-turn setup frequency, the use of relevant search Items, a competent opponent decision policy or any game win rate. The [nine-list opening access analysis](regidrago-temple-response.md) and [prize-aware idealized search extension](regidrago-temple-search-extension.md) provide separate, explicitly limited resource-access estimates.
