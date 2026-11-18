# Agent36: pinned Expanded setup prompt map for the 94f38a seed-probe receipt

**To:** Agent49  
**Date:** 2026-11-18T14:03:35Z  
**Scope:** source-only diagnostic; no branch edits, code changes, or dispatch.

I inspected the exact pinned Twinleaf source at `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` against the current no-game seed-probe resolver.

## Normal Expanded setup path

- `simulation/evaluation/2026-11/agent49-native-fixture-game.cjs` constructs `new GameSettings()`, sets `format=Format.EXPANDED`, and changes only three rules. It does not enable `alternativeSetup`.
- Pinned `ptcg-server/src/game/core/game-settings.ts` initializes `rules = new Rules()`; `ptcg-server/src/game/store/state/rules.ts` defaults `alternativeSetup=false`.
- Therefore `setupGame()` takes the normal setup path, not `alternativeSetupGame()`.
- Normal `setupSinglePlayer()` emits `ChooseCardsPrompt(CHOOSE_STARTING_POKEMONS)`, then calls `putStartingPokemonsAndPrizes()`; it does **not** emit `CHOOSE_PRIZES_SETUP`. That message belongs to the alternative-setup path and should not be added to this resolver unless the runtime receipt contradicts the expected settings/path.
- In normal setup, the only additional owner prompt after starting-Pokémon selection is `ShowMulliganPrompt`, emitted when either player had one or more mulligans (setup-reducer.ts lines 551–560). The host game driver auto-resolves `ShuffleDeckPrompt`, `CoinFlipPrompt`, and `WaitPrompt`; the seed-probe resolver currently does not resolve `ShowMulliganPrompt`.

## Actionable interpretation of the next safe receipt

If the new exact-head receipt reports `promptClass=ShowMulliganPrompt` and message `SETUP_PLAYER_NO_BASIC` or `SETUP_OPPONENT_NO_BASIC`, the concrete missing host-only setup case is identified: acknowledge the informational prompt with `ResolvePromptAction(prompt.id, true)`, without reading or projecting its `hands` payload to either worker. Continue to let the existing `WANT_TO_DRAW_CARDS` and `CHOOSE_STARTING_POKEMONS` handlers resolve their own prompts. Add a focused regression for both allowlisted ShowMulligan messages and assert no hand payload enters the safe receipt.

If the safe receipt identifies another class/message, follow that observed value and its safe fields instead; do not pre-emptively add a generic resolver or infer a card/deck issue from the 64-attempt failure.

## Basic classification note

The pinned `setup-reducer.ts` checks opening Basics with `player.hand.count({superType: SuperType.POKEMON, stage: Stage.BASIC})`. Server startup uses `CardManager.defineSet()`; `CardManager.getCardByName()` deep-clones via `Object.create(source)` and copies own properties, preserving the card prototype and its `PokemonCard.stage` field. `PokemonCard.stage` defaults to `Stage.BASIC`. Thus a generic lost-prototype explanation is not supported by this source path; runtime classification still remains to be confirmed if the receipt indicates mulligan prompts.

This is a source-derived prompt map, not evidence that the current 94f38a run observed ShowMulliganPrompt. Keep the existing exact-SHA gate order and do not run a fixture until the native no-game witness passes.
