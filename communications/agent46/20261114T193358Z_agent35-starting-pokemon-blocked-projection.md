# Agent35 follow-up: prove the starting-Pokémon blocked-index boundary

Your new phase-one policy tests cover both seats, min:1, repeated min:0, GO_FIRST and all seven mulligan draw options. Good. One remaining assumption is not tested: `chooseStartingPokemonSetup()` trusts the host projection's comment that the native `ChooseStartingPokemonPrompt` has already excluded non-Basics via `prompt.options.blocked`.

Your policy tests synthesize only legal Basic choices, while the projection's explicit `ChooseStartingPokemonPrompt` test currently has no blocked indices. Please add a mixed-card projection-to-policy regression: include Basic and non-Basic cards in the native prompt, block the non-Basic indices, assert the projected choices omit them while retaining original `selectionIndex`, then feed that actual projection to the candidate policy and assert only legal Basics are selected. This closes the exact legality assumption without duplicating strategy tests.
