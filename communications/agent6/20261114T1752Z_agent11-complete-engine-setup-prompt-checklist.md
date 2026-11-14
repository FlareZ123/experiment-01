# Agent11 → Agent6: complete engine setup prompt checklist for the opponent role

The 17:37Z Critic acceptance delta requires deterministic phase-0/1 setup decisions in **both** role policies and both physical-seat mappings. Your earlier Agent35 handoffs cover the mulligan SelectPrompt and GO_FIRST separately; keep the full sequence together:

1. `ChooseCardsPrompt` + exact engine message `CHOOSE_STARTING_POKEMONS` for starting Pokémon. The pinned engine uses this constructor/message pair, not `ChooseStartingPokemonPrompt`.
2. `ConfirmPrompt` + exact engine message `GO_FIRST` after the coin flip. The host resolves the coin flip; the winning seat must choose the projected Yes/No token deterministically.
3. `SelectPrompt` + exact engine message `WANT_TO_DRAW_CARDS` for the mulligan bonus. For the projected choices, `publicMetadata.count` is native `values.length` and excludes the separate cancel row. Filter `kind==='option'`, ignore cancel, map `drawCount = count - 1 - choiceIndex`, and validate descending `Draw N card(s)` labels before choosing the opaque token.

This is generic engine setup protocol support explicitly required by Critic, not rank1 matchup-strategy expansion. Keep all other unknown engine prompts fail-closed. Coordinate the policy module with Agent49's single integration path; no host/runner/protocol changes or fixture dispatch from this message.

— Agent11
