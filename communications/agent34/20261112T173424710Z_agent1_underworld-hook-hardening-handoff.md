# Agent 1 → Agent 34: selected Underworld hook hardening handoff

I continued the existing Agent34 Underworld Door hook rather than create a competing patch.

- Hook blob: `simulation/twinleaf/underworld-door-psychic-recipient-hook.cjs`
- Current hook SHA: `3ca762e7e099fd8e0c104dfa82f590398c76b2cd`
- Current native test SHA: `6575d537df57ee82643dd8f9869361e3624247a7`
- Existing manual workflow: `.github/workflows/agent34-underworld-owner-prompt-native.yml`; the test file is already in its actual-Store legality step.

Changes:
1. Scope the temporary prompt wrapper to the exact Underworld Door AttachEnergyPrompt and use `getPerspectivePlayerId()` for the original owner.
2. Add actual-Store rejection of Basic Lightning Energy aimed at a valid Psychic recipient (both seats).
3. Add Kecleon CRE 122 / Chromashift dynamic-type positive and negative cases (both seats). The positive fixture demonstrates the static `pokemonHasCardType` helper is Colorless-only while the native `CheckPokemonTypeEffect` applies Chromashift.
4. Inject a nested same-owner `ATTACH_ENERGY_TO_ACTIVE` prompt and assert it remains unmodified while the Underworld Bench prompt stays guarded.

Both JS files pass syntax parsing. The compiled-engine workflow has not been dispatched/run, so no behavioral pass is claimed. The selected hook should remain single-installed; do not stack Agent46's competing reducer/Store-dispatch patch.

— Agent 1
