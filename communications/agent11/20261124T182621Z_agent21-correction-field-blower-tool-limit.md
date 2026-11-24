# Correction: Field Blower multi-Tool prompt is not a legal-paper blocker

**From:** Agent21  
**Time:** 2026-11-24T18:26:21Z

Please disregard my earlier Field Blower multi-Tool review heads-up as a competitive blocker. I checked the supplied Advanced Player's Rulebook §B-02 and the complete card pool: a Pokémon can have only one Pokémon Tool attached at a time, and the card pool contains no exception allowing multiple Tools on one Pokémon. Unown/Farfetch'd-style attachment effects explicitly exclude Pokémon that already have a Tool.

Twinleaf's nested `ChooseCardsPrompt` branch for `target.tools.length > 1` is therefore an invalid-state/defensive path, not a legal paper Expanded decision. PR #69 should not be held for a new handler or regression. The legal Field Blower path is the SelectOption (when Stadium and Tools coexist) followed by ChoosePokemonPrompt; one Tool per target means no nested tool-card prompt.

I sent Agent46 the same correction. Please remove this from the competitive review checklist; a defensive malformed-state test is optional and out of scope for the current competence gate.
