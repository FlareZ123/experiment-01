# Optional strict prompt-result evidence gate

**Agent 21, 16 October 2026. Status: source and compiled-engine verified; seeded full-game strict-prompt feasibility passed.** This is a simulation validity tool, not match-strength evidence.

The pinned Twinleaf [Store.reducePrompt implementation](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/store.ts) assigns `prompt.result = action.result` and invokes the registered callback without calling `Prompt.validate`. Thus a match driven directly through `Store.dispatch` can accept a malformed selection that the UI would reject. Forest Seal Stone's mandatory one-card search is a concrete example, separately corrected in [the Star Alchemy hook](forest-seal-search-gate.md).

The [strict prompt integrity helper](../../simulation/twinleaf/prompt-integrity.cjs) checks the unresolved prompt corresponding to each `ResolvePromptAction` and calls `prompt.validate(result, state)` before engine dispatch. It rejects unexpected action types, stale or unknown prompt IDs and invalid choices as explicit research-run exceptions. [Seven pure Node regression tests](../../tests/prompt-integrity.test.cjs) passed [manual CI 38828139942](https://github.com/FlareZ123/experiment-01/actions/runs/38828139942).

The headless `runMatch` function now offers `strictPromptValidation: true`. The `evaluatePlan` evaluator forwards the optional switch to the supplied match runner, and its output records the setting. **Default remains false** to avoid changing established fixture results or assuming every upstream validator is complete. For validation runs, opt-in mode prevents silent acceptance of invalid prompt results and makes a failure visible as `engine-exception` in the field benchmark.

This check does not prove Pokémon rules correctness: permissive or incorrectly implemented `Prompt.validate` methods can still admit illegal choices, and certain card-specific callbacks must validate their own mandatory constraints. It does not solve the separately known incomplete decision policy.

### Evidence gates

1. Unit tests and Node syntax checks passed locally.
2. The [seeded rank-1 versus rank-10 strict-prompt smoke](../../simulation/twinleaf/strict-prompt-smoke.cjs) **completed a 118-action engine game** under opt-in strict mode in [manual CI 38828139942](https://github.com/FlareZ123/experiment-01/actions/runs/38828139942). Actual first turn was player 202 and matched first draw-log attribution. The bot is unvalidated, and the completion is a mechanics feasibility result.
3. Only once representative fixtures pass should strict-mode results enter statistical analysis, clearly versioned separately from earlier matches.

No 99.5% result follows from this infrastructure.

## First opt-in full-match validation revealed a second upstream defect

[Manual CI run 38827822110](https://github.com/FlareZ123/experiment-01/actions/runs/38827822110) compiled the pinned engine and passed the five pure helper tests. The strict-mode rank-1 versus rank-10 fixture then stopped at the first real `ShuffleDeckPrompt` (prompt 3). This is an **expected discovery from making validation mandatory**, not proof that a real deck shuffle was illegal.

The pinned [ShuffleDeckPrompt source](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/prompts/shuffle-prompt.ts) checks shuffle indices using `s.sort()` before comparing each value with its expected numeric index. JavaScript's [documented default sort](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort) is lexicographic. As soon as an array includes 10 or higher, even a correct numeric permutation fails this comparison. A 60-card deck shuffle is therefore falsely invalid under the pinned validator.

The research-side pre-dispatch helper now specifically verifies `ShuffleDeckPrompt` by comparing the result to the owner's current deck length, checking every index is an in-range integer and that there are no duplicates. It does not mutate the ordering or upstream code. [Pure regression tests](../../tests/prompt-integrity.test.cjs) and a [compiled pinned-class characterization](../../tests/prompt-integrity-pinned-shuffle.test.cjs) cover both correct and incorrect permutations. The updated guard, seeded full-game smoke, complete 10-test field evaluator suite, 2-test source-printing census, and compiled actual-class shuffle regression passed together in [manual CI 38828139942](https://github.com/FlareZ123/experiment-01/actions/runs/38828139942).

No competitive matchup result is inferred from the original failure or the correction.

## Source-card selection multiplicity

Pinned [`ChooseCardsPrompt.validate`](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/prompts/choose-cards-prompt.ts) checks source membership with `cards.indexOf(r)` independently for each chosen card. It omits source-copy multiplicity, potentially accepting `[A,A]` when only one physical Card A object exists in the searched zone. The strict pre-dispatch gate now adds an identity-based multiset check **after** upstream category, count, filter and blocked-card checks. Two distinct physical copies with the same name remain selectable. [Pure and compiled regression tests](../../tests/prompt-integrity-pinned-selection.test.cjs) were added, with CI pending. The adapter remains opt-in.

## 17 October: opt-in permutation validator consistency audit

**Agent 21 continuation. Engine pin:** `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. **Status: source-verified, local isolated guard checks passed; newly added pinned compiled tests await CI.**

The pinned `OrderCardsPrompt`, `ShufflePrizesPrompt`, and `ShuffleHandPrompt` each use `s.sort()` without a numeric comparator. As with the previously corrected `ShuffleDeckPrompt`, index permutations with an index of 10 or greater are falsely rejected. The pinned `ShuffleHandPrompt` separately checks `result.length !== player.prizes.length`, although its own name identifies a hand shuffle. For a simulated 12-card hand with six Prize slots, the original validator rejects the legal 12-index order and may accept an irrelevant six-index order. That last class has not been shown to have an active card-effect constructor call in the indexed source; do not infer a match exposure from it.

The existing optional `strictPromptValidation: true` helper now applies an exact integer-index permutation predicate to deck, Prize, hand, and ordering prompts. It uses the owner's deck-card count, total physical Prize-card count, hand-card count, and the explicitly ordered CardList count, respectively. `OrderCardsPrompt` retains the pinned `options.allowCancel` behavior for `null`; the mandatory shuffle prompts reject `null`. All other prompt types retain their pinned validator followed by the existing physical-card multiplicity and Energy-target guards.

Evidence and acceptance:
- [Single reusable research-side guard](../../simulation/twinleaf/prompt-integrity.cjs), disabled by default, with no vendor patch.
- [Five pinned-class regression tests](../../tests/prompt-integrity-pinned-permutations.test.cjs) added to the pre-existing manual [Aichi headless feasibility workflow](../../.github/workflows/aichi-headless-feasibility.yml). This workflow was **not executed** as part of this continuation: its remote dispatch request was blocked. Compiled status is **pending**, not passed.
- JavaScript syntax of both changed files was checked using the available JS runtime. Eight independent in-memory predicate cases checked valid and duplicate permutations, allowed/forbidden cancel, 12 physical Prize cards and 12 hand cards against six Prize slots; all eight matched expectations. These are **mock-style helper checks**, rather than a pinned-Store/compiled integration result.
- Source call-site sampling shows `Peonia` (present in published Aichi rank 2) reaches `OrderCardsPrompt` for at most three selected cards; the 10-plus lexicographic bug is **not demonstrated in that Peonia path**. `Mallow`, `Puzzle of Time`, and `Kofu` likewise construct short orders. No actual 2026 Top-32 result, replay, or match-winner revision is justified by this source guard.

Do not mark any previously unqualified rank-10 replay competitively qualified because this guard exists. Source-action transport, full reducer semantics, paper rule exposure, hidden information, and both player policies remain separate acceptance requirements.
