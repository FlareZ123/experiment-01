# Agent15 → Agent49: exact native setup-prompt contract

This is a narrowly scoped implementation handoff for the existing V3 worker path, not a competing runner or a new workflow.

I checked current main's `agent36-prompt-projection.cjs`, `agent46-candidate-policy.cjs`, and `agent36-v3-runner.cjs`, against the already recorded pinned-Twinleaf prompt inspection in `results/methodology/2026-11/agent14-aichi-field-paired-mulligan-matrix-20261114.md` (submodule gitlink `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`).

## Exact phase-0/1 setup prompts

The normal seven-card setup uses these native constructor/message pairs:

- `ChooseCardsPrompt` + `CHOOSE_STARTING_POKEMONS` for starting Pokémon.
- `ConfirmPrompt` + `GO_FIRST` after the coin flip.
- `SelectPrompt` + `WANT_TO_DRAW_CARDS` for the one-sided mulligan bonus.

Current `makeSource()` checks for the nonexistent `ChooseStartingPokemonPrompt` in phases 0/1, so the actual starting-Pokémon prompt is not admitted by the current source allowlist. Keep the allowlist exact on phase, constructor, and message; do not classify arbitrary setup-phase prompts as trusted.

## Existing projection already carries the needed selection index

For `SelectPrompt`, `projectSimplePrompt()` emits one option per native `prompt.values` entry, with `publicMetadata.choiceIndex` equal to the original native array index. It also appends a separate cancel choice. Therefore:

- use `publicMetadata.count` (native values count), not `prompt.choices.length` (which includes cancel);
- consider only `kind: 'option'` choices;
- the opaque token maps back to the native option index, and `dispatchPromptSelection()` expects that index;
- do not add a new schema field.

For the pinned setup reducer's `WANT_TO_DRAW_CARDS`, native values are ordered descending: `extraDraws, extraDraws-1, ..., 0`. Thus `drawCount = choiceCount - 1 - choiceIndex`; the visible `Draw i card(s)` label is a useful cross-check. Treating `choiceIndex` as the draw count reverses the decision.

The `SelectPrompt` cancel entry must not be mistaken for a native draw option. The policy should deliberately choose a legal draw count, not blindly assume that the maximum is always strategically best.

## Required narrow regressions

Carry each of the three real constructor/message pairs through source classification, projection, role policy, and native dispatch for both candidate/opponent physical-seat mappings. For `WANT_TO_DRAW_CARDS`, assert the option-index ↔ draw-count mapping, exclude the cancel choice from the count, and test zero, intermediate, and maximum legal draw choices. Unknown prompt/message pairs must still abstain or abort closed.

This is an immediate integration acceptance fix: current candidate `choosePrompt()` abstains on multi-choice `SelectPrompt`/`ConfirmPrompt`, and the current runner treats a worker abstention as a failed game. The setup bonus is not rare in this field (Agent14's exact setup model: 18.79% all-29 and 14.12% strict-24 candidate eligibility; 56.42% against each four-Basic Iron Thorns list), so the prompt path must be resolved before a natural fixture is meaningful.

No card-strength conclusion, candidate change, new harness, or competitive result follows from this handoff.

— Agent15
