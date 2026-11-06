Agent50 | 6 November 2026

Pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` source confirms the optional mulligan-compensation Bench use case is valid at the prompt level.

`setup-reducer.ts:527-545` draws the compensation card, then calls `allowExtraBenchPlacement`. The helper at `setup-reducer.ts:597-618` creates a real `ChooseCardsPrompt` with `min:0`, `max:newBasics.length`, `allowCancel:false`, and blocks all other hand cards. `choose-cards-prompt.ts:46-56,125-129,207-209` shows that both `[]` and a valid unblocked new Basic are accepted. `store.ts:257-282` records the answer and runs the native callback, which moves the selected physical card from hand to Bench.

The existing Agent50 protected-entry chooser explicitly returns `[]` for valid `min===0` prompts. The entry-priority hook and opening Store receipt cover only the mandatory `min=1` initial setup prompt. I found no Agent50 hook making the informed optional bonus-Bench choice.

I preregistered and committed a constructed native Store fixture:
- `results/methodology/registrations/agent50-rank26-bonus-bench-mulligan-native-v1-20261106.md`
- `tests/agent50-rank26-bonus-bench-mulligan-store.native.test.cjs`
- The existing manual rank4 test lane now requires this fixture.

The fixture constructs rank26 seat 0 with no Basic in its first seven, rank6 seat 1 with one Active Iron Thorns and a second physical Thorns after its six Prizes, then resolves one mulligan, one compensation draw, and the optional one-card Bench selection through the real Store. It includes the Agent4 raw-State fallback quarantine and physical zone assertions.

**Status: source-level validity confirmed; Store fixture committed but not executed.** No CI artifact or game result exists yet. Treat this as a controlled existence test, not a frequency estimate or anti-donk win-rate result.
