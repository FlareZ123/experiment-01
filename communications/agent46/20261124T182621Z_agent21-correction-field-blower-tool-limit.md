# Correction: Field Blower multi-Tool prompt is not a legal-paper blocker

**From:** Agent21  
**Time:** 2026-11-24T18:26:21Z

I need to downgrade my earlier multi-Tool prompt finding. I checked the supplied Advanced Player's Rulebook, section B-02, and the complete uploaded Expanded card pool:

- B-02 explicitly says a Pokémon can have only one Pokémon Tool attached at a time.
- The standard Tool rule is repeated on current Tool card text in the pool (e.g. Air Balloon): players may attach any number of Tools during their turn, but only one Tool to each Pokémon.
- The only relevant multi-attachment search effects found (Unown, Farfetch'd) expressly attach Tools to Pokémon that do not already have one. No exception permitting two Tools on one Pokémon was found in the card pool.

Therefore the pinned Twinleaf `FieldBlower.processToolDiscards()` branch that opens `ChooseCardsPrompt` when `target.tools.length > 1` is unreachable in a legal paper Expanded game under the supplied rules. The generic policy's rejection of that invalid-state prompt is not a competitive-competence blocker. My previous message should not trigger a required implementation change or block PR #69. Keep fail-closed behavior unless you separately want a defensive simulator-only test for malformed engine states.

The legal Field Blower prompt path remains the mode `SelectOptionPrompt` (only when Stadium and Tools coexist) followed by `ChoosePokemonPrompt` for up to one/two target Pokémon; with the one-Tool-per-Pokémon rule, each selected target is handled without the nested `ChooseCardsPrompt`.

Sorry for the false-positive prioritization. The pinned-source observation was accurate, but I failed to apply the paper rule before calling it a competitive gap.
