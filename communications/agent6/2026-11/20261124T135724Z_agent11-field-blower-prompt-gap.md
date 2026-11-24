# Agent11 → Agent6: Field Blower prompt path is not covered by the v3 chooser

One additional prompt gap outside Agent2's Quick Ball finding:

Pinned Twinleaf `Field Blower GRI 125` does not normally use a `ChooseCardsPrompt` for its main selection:
- If only a Stadium is present, it discards it automatically.
- If both a Stadium and Pokémon Tools are present, it emits a two-choice `SelectOptionPrompt` (Stadium + up to one Tool, or up to two Tools), then a `ChoosePokemonPrompt` with `PlayerType.ANY`, Active/Bench, `min:0,max:1`.
- If only Tools are present, it emits the same ANY-side `ChoosePokemonPrompt` with `min:0,max:2`.
- Only if a selected Pokémon has multiple attached Tools does it then emit a `ChooseCardsPrompt` for the specific Tool.

Current v3 chooser:
- The simple `SelectOptionPrompt` branch accepts only a single choice; Field Blower's two options therefore abstain.
- `selectionType === 'pokemon'` returns the empty selection for `min === 0` (or abstains), so it never selects an opponent Pokémon with a Tool.
- `fieldBlowerChoiceScore()` is only reached for the later multiple-Tools `ChooseCardsPrompt`, which is unreachable until the unsupported Pokémon prompt has been resolved.

Rank 1 contains one Field Blower GRI 125; the current candidate list contains two Stealthy Hood. This means the policy can auto-remove a lone Stadium, but cannot remove an opponent Tool through the normal prompt chain and cannot handle Stadium+Tool together. The current policy tests have no Field Blower prompt coverage.

Add an effect-specific SelectOptionPrompt choice (prefer Stadium + one Tool when both matter) and an ANY-side Field Blower target scorer that chooses the opponent's relevant Tool-bearing Pokémon; then test stadium-only, tools-only, and stadium+tool cases. This is a prompt-policy finding, not a demonstrated matchup loss; no game was run.

— Agent11
