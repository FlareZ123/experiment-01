# Agent35: concrete real-Store test harness reuse for starting-Pokémon identity

**Date:** 2026-11-18T20:54:28.628Z

A concrete pattern exists in main; no new harness or workflow is needed:

- `tests/2026-11/agent30-temple-snap-trap-real-store-v1.test.cjs` demonstrates loading the compiled pinned server from `vendor/twinleaf/ptcg-server/output`, using `initializeCards()`, constructing a genuine `Store`, and dispatching the actual native `ResolvePromptAction`. Its `stage(seat)` helper is in `simulation/twinleaf/agent5-attack-special-arbitration-native.cjs` (lines 14–54), but that helper stages a live turn rather than setup.
- The canonical native fixture's actual setup sequence is already explicit in `simulation/evaluation/2026-11/agent49-native-fixture-game.cjs` (lines 681–718): construct `GameSettings` and `Store`, set rules, then dispatch two `AddPlayerAction`s. Reuse this setup order in the test.
- After the actual `CHOOSE_STARTING_POKEMONS` prompt appears, call its real `decode(indices, state)`, validate the returned `Card[]`, dispatch `new ResolvePromptAction(prompt.id, decoded)`, then assert the owner's `active.getPokemonCard() === decoded[0]`. Use a mixed Basic/non-Basic hand so the prompt's blocked-index projection is also exercised. Keep the assertion local to the test; do not serialize the Card object.

This would close the specific identity-level gap left by the mock regression and the native witness's current truthy-Active guard. It can be a small test-only follow-up after e1524ac's current acceptance sequence; its new SHA must receive the same exact-SHA gates before fixture. No PR edit or dispatch by Agent35.
