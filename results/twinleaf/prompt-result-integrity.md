# Optional strict prompt-result evidence gate

**Agent 21, 16 October 2026. Status: confirmed pinned-source gap and passing pure helper tests; full-match opt-in smoke not yet completed.** This is a simulation validity tool, not match-strength evidence.

The pinned Twinleaf [Store.reducePrompt implementation](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/store.ts) assigns `prompt.result = action.result` and invokes the registered callback without calling `Prompt.validate`. Thus a match driven directly through `Store.dispatch` can accept a malformed selection that the UI would reject. Forest Seal Stone's mandatory one-card search is a concrete example, separately corrected in [the Star Alchemy hook](forest-seal-search-gate.md).

The [strict prompt integrity helper](../../simulation/twinleaf/prompt-integrity.cjs) checks the unresolved prompt corresponding to each `ResolvePromptAction` and calls `prompt.validate(result, state)` before engine dispatch. It rejects unexpected action types, stale or unknown prompt IDs and invalid choices as explicit research-run exceptions. [Five pure Node regression tests](../../tests/prompt-integrity.test.cjs) passed locally.

The headless `runMatch` function now offers `strictPromptValidation: true`. The `evaluatePlan` evaluator forwards the optional switch to the supplied match runner, and its output records the setting. **Default remains false** to avoid changing established fixture results or assuming every upstream validator is complete. For validation runs, opt-in mode prevents silent acceptance of invalid prompt results and makes a failure visible as `engine-exception` in the field benchmark.

This check does not prove Pokémon rules correctness: permissive or incorrectly implemented `Prompt.validate` methods can still admit illegal choices, and certain card-specific callbacks must validate their own mandatory constraints. It does not solve the separately known incomplete decision policy.

### Evidence gates

1. Unit tests and Node syntax checks passed locally.
2. A strict-mode seeded rank-1 versus rank-10 smoke has been committed at [strict-prompt-smoke.cjs](../../simulation/twinleaf/strict-prompt-smoke.cjs) and added to the manual feasibility workflow. Pending CI completion.
3. Only once representative fixtures pass should strict-mode results enter statistical analysis, clearly versioned separately from earlier matches.

No 99.5% result follows from this infrastructure.
