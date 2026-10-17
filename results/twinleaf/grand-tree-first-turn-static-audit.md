# Grand Tree first-turn evolution: confirmed pinned-engine defect and reversible correction

**Agent 6, 17 October 2026. Evidence: five direct-Store staged game-state cases against pinned Twinleaf, before and after one opt-in hook.** This is a demonstrated rules-fidelity defect, not a source-dealt match or competitive win-rate observation.

## Source rule and exposure

Grand Tree SCR 136 says that a player cannot evolve a Basic Pokémon during their first turn or the turn the Basic was put into play. The supplied Advanced Player's Rulebook, section A-05, likewise forbids either player from evolving during their first turn. The exact Aichi 2026 source roster at [full-decklists.json](../aichi-2026/full-decklists.json) includes **one Grand Tree** in each of **rank 2 Vileplume Control** and **rank 15 Lopunny Vileplume**, both containing Oddish UNB, Gloom UNB and Vileplume AOR. The same printed restriction concerns any Grand Tree-based Stage 1 or Stage 2 route.

The pinned engine source [grand-tree.ts](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/10-scarlet-and-violet/set-stellar-crown/grand-tree.ts) only checks `CheckPokemonPlayedTurnEffect.pokemonPlayedTurn === state.turn` and whether the target is Basic. A setup Basic marked with played turn zero passes that test on both initial global turns 1 and 2. Its [player-turn reducer](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/reducers/player-turn-reducer.ts) does not add a separate first-turn condition for `UseStadiumAction`. The source class uses `fullName='Great Tree SCR'` and printed `name='Grand Tree'`; the reproduction uses the real engine fullName.

## Reproduction with real Store actions

[Manual CI run 38997169218](https://github.com/FlareZ123/experiment-01/actions/runs/38997169218), pinned engine `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, successfully compiled and executed [grand-tree-first-turn-audit.cjs](../../simulation/twinleaf/grand-tree-first-turn-audit.cjs). The fixture creates physically coherent Stadium, Active and Bench slots with Oddish already in play, plus Gloom and Vileplume in deck. It dispatches the genuine `UseStadiumAction`, validates the `ChoosePokemonPrompt`, resolves subsequent `ChooseCardsPrompt` for Stage 1 and Stage 2 using `ResolvePromptAction`, and inspects the final evolution stack.

| Global turn and board | Paper evolution allowed | Raw Store result |
| --- | --- | --- |
| Turn 1, first player's setup Oddish | No | **Incorrect full Oddish → Gloom → Vileplume** |
| Turn 2, second player's setup Oddish | No | **Incorrect full Oddish → Gloom → Vileplume** |
| Turn 3, first player's surviving setup Oddish | Yes | Full evolution chain succeeds |
| Turn 4, second player's surviving setup Oddish | Yes | Full evolution chain succeeds |
| Turn 3, Oddish freshly Benched on the current turn | No | `ChoosePokemonPrompt.validate` rejects the target, evolution does not occur |

The invalid full Stage 2 chain, including both deck-to-board card movements, was observed before any research correction. This is stronger evidence than a speculative rule interpretation or an unresolved prompt alone.

## Corrected comparison and reproducibility

The research-owned [grand-tree-first-turn-hook.cjs](../../simulation/twinleaf/grand-tree-first-turn-hook.cjs) wraps the pinned `GreatTree.prototype.reduceEffect` only for the matching `UseStadiumEffect`. It rejects use on global turns 1 and 2 with `CANNOT_PLAY_THIS_CARD`, delegates all other cases to the original implementation, and restores the original reducer exactly afterward. It leaves `vendor/twinleaf` untouched.

[Manual CI run 38997399546](https://github.com/FlareZ123/experiment-01/actions/runs/38997399546) passed the full raw-versus-corrected five-case matrix with assertions:
- Raw engine: **two completed illegal Stage 2 chains** (turns 1 and 2).
- Corrected engine: **zero completed illegal chains** in those same cases; both first-turn activations explicitly rejected.
- Turns 3 and 4: **complete Stage 2 chains still succeed** under correction.
- Freshly Benched Oddish on turn 3: **still cannot evolve** under correction.

The opt-in headless `runMatch` request flag is `grandTreeFirstTurnCorrection: true`; the match output echoes `grandTreeFirstTurnCorrection` for provenance. Uncorrected historical results should never be pooled silently with corrected ones.

## Impact and remaining gates

The Aichi ranks 2 and 15 have an additional fast Vileplume Item-lock line that the raw simulator may exaggerate. The test establishes a board-state rules defect. It does **not** establish whether a particular source-dealt first-turn hand uses Grand Tree, whether actual policy selects it, whether subsequent lock survives an opponent's response, or whether an observed full-game winner changes. A future paired source-dealt run should retain deck fingerprints and physical seeds and compare direct `UseStadiumAction` exposure with and without the hook.

Other engine and decision-policy defects remain; this patch alone cannot qualify any simulated game for tournament-strength inference. The project remains at **zero independently qualified competitive games**, and the 99.5% target remains unverified.

## 17 October follow-up: actual Stadium play from hand

The original five-case matrix staged Grand Tree already in the Stadium zone. A later extension also uses **`PlayCardAction` to play the printed Great Tree SCR Stadium from hand** on each player's opening turn, followed by the real `UseStadiumAction` and both `ResolvePromptAction` evolution searches. It constructs six face-down Prize cards per player so the Store remains in a fully formed playing state. Before that Prize-zone correction, the hand-play fixture failed to locate the entered Stadium and could not demonstrate an actual evolution; that failed setup is not game-rule evidence.

With the corrected setup, [manual compiled CI 39026987716](https://github.com/FlareZ123/experiment-01/actions/runs/39026987716), source commit [`4ba4b722`](https://github.com/FlareZ123/experiment-01/commit/4ba4b72257942a293484e9e821c65bfde05a7a40), **passed all seven raw cases and all seven hooked cases**. The raw engine completed **four prohibited first-turn Stage 2 evolutions**: two with an initially placed Stadium and two after playing Grand Tree from hand. The research correction prevented all four; the previously demonstrated legal later-turn evolutions and freshly Benched restriction continued to pass. This is a stronger first-turn reducer-path witness than Stadium-zone injection alone, but remains a staged board experiment rather than a source-dealt match or win-rate observation.
