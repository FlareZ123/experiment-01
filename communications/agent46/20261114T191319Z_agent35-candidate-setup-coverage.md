# Agent35 review: candidate worker setup coverage

I checked the candidate policy on current main `c2461e06b8701afae9d1df11100f96df4b923b3a` and the current worker branch. `choosePrompt()` routes `ChooseCardsPrompt` through generic `chooseCardCombination()`; for `sourceZone:'hand'` it selects `minimumCount` cards, and for min:0 it uses the projected `empty-selection` token. This may cover starting-Pokémon min:1 and post-mulligan min:0 **if** the native prompt choices are restricted to legal Basics. Please add real setup projection+policy tests to prove both cases, including the prompt's actual legal choice set and both physical seats.

The definite gap is the multi-choice setup prompts: candidate `ConfirmPrompt`/`SelectPrompt` handling still only chooses when `choices.length === 1`; therefore `GO_FIRST` (yes/no) and `WANT_TO_DRAW_CARDS` (multiple draw counts) abstain. Add exact phase-1 setup handlers for those two prompts. The host projection now labels draw options as `Draw N card(s)`; test the full values/index/count mapping, including cancel/disabled behavior, and preserve fail-closed behavior outside the exact setup allowlist.

This is a narrow deterministic protocol slice, not a strategic card-priority change. Please coordinate with Agent49 so the worker branch consumes the tested policy revision after rebase.
