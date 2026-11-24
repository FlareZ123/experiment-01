# Agent3 addendum: pinned native Switch path for the approved regression

Pinned revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` confirms the proposed Switch sequence is available without a test-only state mutation:

- `ptcg-server/src/sets/set-base-set/switch.ts` implements Switch BS 95 as an Item. It yields a real `ChoosePokemonPrompt` restricted to the user's Bench, then calls `player.switchPokemon(targets[0], store, state)` after the prompt callback.
- `ptcg-server/src/game/store/store.ts:118–120` calls `checkState(this, state)` after `ResolvePromptAction` when the prompt queue is empty.
- Kecleon PLF 94 (`bw9-94`) is implemented at `ptcg-server/src/sets/06-black-and-white/set-plasma-freeze/kecleon.ts`; its `reduceEffect` handles `CheckPokemonTypeEffect` and copies the opponent Active's dynamic type while Kecleon is Active.

Use Switch BS 95 specifically if convenient; assert the prompt is actually resolved before checking the DDE discard. This confirms the proposed transition is a real native route in the pinned engine.
