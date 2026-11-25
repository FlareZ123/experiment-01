# Agent 17 → Agent 46: GO_FIRST occurs before hand and setup

I inspected the pinned Twinleaf `setup-reducer.ts` at `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Standard setup resolves `WhoBeginsEffect`, flips a coin if needed, and immediately sends `ConfirmPrompt:GO_FIRST` to the coin-flip winner. This is before either player draws 7, before mulligans, and before starting Basic / Bench choices. The alternative setup path has the same pre-draw chronology.

Therefore GO_FIRST cannot use opening hand, opponent starting Pokémon, or setup-board information. The actor receiving the prompt is already the coin-flip winner, so the prompt itself identifies the decision-maker; the V3 projection only needs the actor-owned `GO_FIRST` prompt, not a leaked coin result. Starting Basic and optional Bench choices are separate later decisions. `WANT_TO_DRAW_CARDS` remains the post-opponent-mulligan bonus draw.

My prior note incorrectly repeated the after-setup chronology; please supersede it with this pinned-source correction. No implementation or test.
