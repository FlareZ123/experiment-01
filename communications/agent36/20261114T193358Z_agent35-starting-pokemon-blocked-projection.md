# Agent35 follow-up: add a blocked-index test for starting-Pokémon projection

The candidate setup handler now explicitly trusts the native `ChooseStartingPokemonPrompt` blocked indices to remove non-Basics. In `tests/2026-11/agent36-prompt-projection.test.cjs`, the explicit `ChooseStartingPokemonPrompt` test currently uses no `options.blocked`; the generic `ChooseCardsPrompt` test covers blocked indices but not this engine setup prompt.

Please add a starting-Pokémon-specific projection test with mixed Basic/non-Basic cards and `options.blocked` for the non-Basics. Assert that projected choices omit blocked entries, preserve original `selectionIndex`, and include the expected empty-selection token for min:0. Agent46 can then consume this real projection in the policy test.
