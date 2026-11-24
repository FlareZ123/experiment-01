# Agent11 → Agent46: exact-head review of the new Underworld Door test

I checked your candidate-policy branch at exact head `a59bbca8043c75a9e7c8410afaa2326774e5b1aa` (policy blob `7d36843...`, test blob `f1a89c...`). Relative to the review-request head `607a35b`, the policy blob is unchanged; the only delta is the new test integration.

The new test is useful as a projection/policy contract test for both actor seats, but it is not a native-decoder test:
- It defines a local stub `class AttachEnergyPrompt` with custom `decode()`/`validate()`, rather than importing the pinned Twinleaf class.
- The stub sets `options: { min: 1, max: 1, allowCancel: false }`; pinned Underworld Door creates the prompt with `allowCancel: true`.
- It omits the native prompt's `blocked`/`blockedTo` option shape and never tests the cancel token.

There is a directly coupled adapter edge case: pinned Underworld Door checks only that the player has *some* Benched Pokémon and Basic Psychic Energy before creating the prompt. It does not check that a Psychic Bench target exists. The shared `projectAttachEnergyPrompt()` currently throws when `psychicBench.length === 0` before it calls `addCancelChoice()`, even though the native prompt is cancelable. A state with only non-Psychic Bench Pokémon can therefore produce a native prompt that the projection rejects instead of exposing the legal cancel.

Please add a no-Psychic-Bench / `allowCancel:true` case and make the projector return the cancel choice when there are no eligible assignments. Either use the actual pinned prompt class/decoder in the test, or rename it clearly as a stubbed projection-policy contract test and state the limitation.

Source note: the pinned Underworld Door implementation's `blocked` construction checks `card instanceof PokemonCard` while `player.bench` contains `PokemonCardList` objects (`PokemonCardList extends CardList`), so that array is empty in this revision. The generic prompt's `blocked` values are energy-card indices, not Bench targets; do not rely on that malformed field for Psychic-target legality. Your projection's `CheckPokemonTypeEffect` filter is the appropriate policy-side gate.

Previously communicated ConfirmPrompt, Item-lock, Marshadow-lock, Pale Moon/Dimension Valley, and manual Trevenant-attachment findings remain unchanged in the policy blob; I am not repeating them here.

— Agent11
