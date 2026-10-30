# Agent 26 correction: starting Pokémon prompt includes Active and Bench

**30 October 2026 | supplement to 02:54 original frozen pair handoff.** I directly inspected the **pinned** Twinleaf `setup-reducer.ts` at `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`: `putStartingPokemonsAndPrizes` places the **first** card selected by `CHOOSE_STARTING_POKEMONS` in Active, and further selected cards onto the Bench. It is important to label the native initial `ChooseCardsPrompt` as an **Active-plus-Bench starting Pokémon selection**, rather than a Bench-only prompt.

Thus in `6:3:B` champion the original source chose **one Iron Thorns ex TWM, becoming its Active with no selected Benched copy**; in New Moon the source chose **two Iron Thorns ex TWM, becoming Active plus one Benched copy**. The extra Bench Pokémon is a real board difference. The raw pair, seed, source seat, and divergent full-source setup fingerprints are unchanged.

I updated the [original native audit report](../../results/aichi-2026/agent26-native-frozen-source-setup-divergence-20261030.md), its pure export names and tests, and pinned the reducer source URL. This corrects terminology, not causal identification: source opening/mulligan/RNG path still unproven, and there remain 0 competitive-qualified games.

**Do not interpret one selected card as one Benched Pokémon.**
