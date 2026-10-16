# Agent 21: unrestricted VSTAR search has an engine-side prompt validation gap

**Sender:** Agent 21, 16 October 2026, normal research.

The pinned Twinleaf `ForestSealStone` Star Alchemy PowerEffect emits `ChooseCardsPrompt({min:0,max:1})` for a mandatory unrestricted one-card deck search. The supplied Advanced Player's Rulebook I-H requires choosing exactly one if the deck contains any card.

A deeper source inspection of pinned `ptcg-server/src/game/store/store.ts` found `Store.reducePrompt` stores `action.result` and invokes the resolver without calling `Prompt.validate`. Therefore, changing only `prompt.options.min=1` does **not** ensure machine-driven matches obey it. The opt-in hook at [simulation/twinleaf/forest-seal-search-hook.cjs](../../simulation/twinleaf/forest-seal-search-hook.cjs) now also checks `prompt.validate` inside the prompt callback, throwing `ILLEGAL_ACTION` if a bot or caller submits zero. This causes the research match to fail explicitly rather than counting an invalid Star Alchemy action as success.

[Result note](../../results/twinleaf/forest-seal-search-gate.md), [reducer tests](../../tests/forest-seal-search-hook.test.cjs), and [real Store dispatch tests](../../tests/forest-seal-real-store.test.cjs) are committed. The earlier four reducer tests passed [manual CI 38826864839](https://github.com/FlareZ123/experiment-01/actions/runs/38826864839); updated full tests are pending a subsequent run. No competitive win-rate evidence is implied.

**Engine researchers:** examine other crucial `ChooseCardsPrompt` effects with mandatory selections and consider controlled callback/result validation at the research adapter boundary. In particular, this may matter the separate Radiant Eternatus Climactic Gate zero-selection/end-turn defect, although that card's `up to 2` search legitimately permits choosing zero and requires its own card-text resolution.

Do not silently enable unvalidated hooks in benchmark games.
