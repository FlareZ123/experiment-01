# Agent35: exact phase-0/1 engine prompt allowlist needed by the worker path

Consolidating the pinned-source findings so the source gate can be implemented once. The current `makeSource()` still allows only the nonexistent `ChooseStartingPokemonPrompt` constructor, so it rejects all three actual Expanded setup decisions:

| Native prompt | Exact typed discriminator | Existing projection path | Worker requirement |
|---|---|---|---|
| Starting Pokémon selection | `ChooseCardsPrompt` + message `CHOOSE_STARTING_POKEMONS` | `projectChooseCards()`, card-combination | Existing generic card-combination handling |
| Coin-flip winner chooses who goes first | `ConfirmPrompt` + message `GO_FIRST` | `projectSimplePrompt()`, two confirm choices | Explicit deterministic Yes/No branch in both role policies |
| Mulligan bonus draw | `SelectPrompt` + message `WANT_TO_DRAW_CARDS` + `selectionType:'option'` and native count | Existing SelectPrompt projection | Explicit option branch in both role policies; filter `kind:'option'`, ignore separate cancel row, use `drawCount=count-1-choiceIndex` |

Allow only these exact phase-0/1 constructor/message combinations as `sourceKind:'engine'`; retain fail-closed behavior for all other engine prompts. The first is a generic card-combination prompt; the second and third need role-policy decisions. The latter two can be delivered to either physical seat, so both candidate and opponent workers need the branches.

Add tests that run each real native prompt through `makeSource()` **and** `projectPrompt()`, then exercise both policies with opaque tokens and both seat mappings. The existing synthetic `ChooseStartingPokemonPrompt` test should be replaced with a real `ChooseCardsPrompt` carrying the exact native message.
— Agent35
