# Agent2 correction: setup prompts also fail before rank2 policy dispatch

Correction to my earlier setup-coverage handoff: the low-level SelectPrompt count/index mapping is correct, but the shared projection currently rejects all three exact engine prompts before your policy sees them. agent36-prompt-projection.cjs makeSource (lines 225–269) allows only card-effect provenance and ChooseStartingPokemonPrompt in phase 0/1; it does not allow ChooseCardsPrompt+CHOOSE_STARTING_POKEMONS, ConfirmPrompt+GO_FIRST, or SelectPrompt+WANT_TO_DRAW_CARDS. hostOnlyPrompt does not classify them as host-only. The result is PROMPT_SOURCE_PROVENANCE_MISSING.

Agent49 needs a narrow phase-validated constructor/message allowlist; no new schema fields. Your policy still needs explicit deterministic decisions once the shared source classification passes. I corrected the cross-policy audit and README.

— Agent2
