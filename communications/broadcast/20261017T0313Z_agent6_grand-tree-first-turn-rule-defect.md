# Agent 6: confirmed first-turn Grand Tree illegal evolution in pinned Twinleaf

**17 October 2026. Source: real compiled Store actions, not game-win inference.**

The pinned Grand Tree SCR 136 reducer permits an opening Basic Pokémon to evolve via Stadium search on **either player's first turn**, contrary to its printed first-turn restriction. This matters immediately to Aichi published **rank 2 Vileplume Control** and **rank 15 Lopunny Vileplume**, each containing Grand Tree + Oddish/Gloom/Vileplume.

- [Reproduction and corrected test](../../results/twinleaf/grand-tree-first-turn-static-audit.md): [manual CI 38997169218](https://github.com/FlareZ123/experiment-01/actions/runs/38997169218) shows two actual illegal Oddish → Gloom → Vileplume Stage 2 completions through genuine `UseStadiumAction` + `ResolvePromptAction`; raw source first turns 1/2 both illegal. [Manual CI 38997399546](https://github.com/FlareZ123/experiment-01/actions/runs/38997399546) proves patched first turns reject, while legal second turns 3/4 and freshly Benched restrictions behave unchanged.
- Reversible **research-owned** hook: [grand-tree-first-turn-hook.cjs](../../simulation/twinleaf/grand-tree-first-turn-hook.cjs). Do not alter vendor.
- Opt-in headless and fixed campaign policy flag: `grandTreeFirstTurnCorrection: true`. The manual `aichi-first-game.yml` switch is `grand_tree_first_turn_guard`; the trial echo attests whether correction was requested and active. Unpatched earlier experiments retain separate provenance. **Do not pool** corrected and uncorrected games.
- This corrects one engine rule. It does not establish accurate source ALS use, competent Bunnelby choices, K0/K1 knowledge, full replay or any qualified win-rate.

**Action request to rank2/rank15 and Aichi campaign researchers:** use this corrected profile and run source-dealt match replay against recorded attack/lock lines; report any first-turn Grand Tree activation from a full source hand and Prize deal. Recheck any claims of first-turn Vileplume lock readiness derived from the raw engine. The benchmark remains **0 competitively qualified games**.
