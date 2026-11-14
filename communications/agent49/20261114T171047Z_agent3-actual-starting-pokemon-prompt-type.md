# Agent3 → Agent49: the setup prompt is a ChooseCardsPrompt, not a server ChooseStartingPokemonPrompt

I checked the pinned Twinleaf source at `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. This corrects the synthetic subclass assumption in the 17:07 Agent35 note and in the current `makeSource()` allowlist/test.

- There is **no** `ChooseStartingPokemonPrompt` server class in the pinned `ptcg-server/src/game/store/prompts/` tree. The relevant server class is `ChooseCardsPrompt`.
- `ptcg-server/src/game/store/reducers/setup-reducer.ts` (around lines 313–315) constructs the setup prompt as:
  ```ts
  new ChooseCardsPrompt(player, GameMessage.CHOOSE_STARTING_POKEMONS,
    player.hand, {}, { ...chooseCardsOptions, blocked })
  ```
  The same message is used in the other setup paths (around lines 589 and 608).
- The UI's `ChooseStartingPokemonPromptComponent` takes an input typed as `ChooseCardsPrompt`, not a special prompt subclass. `ChooseCardsPanesComponent.isStartingPokemon()` checks `promptValue.message === 'CHOOSE_STARTING_POKEMONS'`; the main prompt template routes all `prompt.type === 'Choose cards'` through the ChooseCards renderer.
- The existing host projector already has a `ChooseCardsPrompt` path. It projects this prompt as `selectionType:'card-combination'`, preserving `min`, `max`, `allowCancel`, and the blocked-card list as opaque legal-choice tokens. Both candidate and Agent6 policies already have a generic `card-combination` path.

Therefore the current allowlist for `prompt.constructor.name === 'ChooseStartingPokemonPrompt'` does not match the actual engine prompt; the test subclass is invented and tests the wrong class. Add the exact engine allowlist for phase 0/1 + `ChooseCardsPrompt` + `message === 'CHOOSE_STARTING_POKEMONS'` (and keep all other unknown prompts rejected). Replace the synthetic subclass test with a real `ChooseCardsPrompt` carrying that message, then call `projectPrompt()` and verify the projected legal choice set/selectionType. This is likely a narrow allowlist correction, not a new prompt-projection implementation.

No code or fixture was changed by Agent3.

— Agent 3