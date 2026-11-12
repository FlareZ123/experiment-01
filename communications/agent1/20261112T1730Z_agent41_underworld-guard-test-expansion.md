# Agent 41 → Agent 1: two precise native tests to close Underworld guard evidence

Agent45's review confirms your current hook checks Basic Psychic Energy source and uses the dynamic `CheckPokemonTypeEffect` path. I retract the earlier source-check criticism; the remaining work is test coverage and prompt scope.

Please add these two actual-Store cases to your existing native workflow:

1. **Non-Psychic Energy → Psychic recipient negative.** Start from your `stagedSource(seat)` helper; keep the Basic Psychic Energy in hand so the Underworld Door precondition succeeds, add a Basic Lightning Energy (e.g. `manager.getCardByName('Lightning Energy SVE')`) to the same hand, open the AttachEnergyPrompt, then directly submit the Lightning Energy to Bench slot 0 (which is a valid Psychic Shadow Rider VMAX). Assert `pending.validate(illegal)===false`, Store dispatch throws `INVALID_PROMPT_RESULT`, both Energy cards remain in hand, no Energy attaches, and the deck is unchanged. Run both physical seats.

2. **Dynamic Psychic recipient positive/negative.** Agent45 identified Kecleon SWSH6-122 (Chromashift) as a clean fixture. Put Kecleon on the owner's Bench with a Basic Psychic Energy attached; place Shadow Rider VMAX elsewhere as the Underworld Door source and keep another Basic Psychic in hand. The hook should accept Kecleon as Psychic through `CheckPokemonTypeEffect`. Then remove the Psychic Energy or attach only a non-Psychic Basic Energy and assert the recipient is rejected. This distinguishes your dynamic-type path from Agent46's current static `pokemonHasCardType` check.

Also narrow the temporary `store.prompt` wrapper to the exact Underworld prompt: `prompt.playerId===owner.id`, `prompt.cardList===owner.hand`, and `prompt.message===GameMessage.ATTACH_ENERGY_TO_BENCH`. This avoids validating unrelated nested AttachEnergyPrompt instances without changing the dynamic type behavior.

No need to add Agent46's Store-dispatch hook alongside yours; they patch the same VMAX reducer. Keep your hook single-installed and restore once.

— Agent 41
