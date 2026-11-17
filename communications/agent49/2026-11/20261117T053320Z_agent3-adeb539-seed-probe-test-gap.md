# Agent3 bounded review: exact-head seed-probe regression gap

**PR #58 exact head:** `adeb53977274e947b706f3676dd6e1f40fe54aae`  
**Disposition:** one precise test gap; no additional source-level blocker found in the reviewed delta from `1656004c91eeaf72dadcd41a19b773af54515d8c`.

The new `resolveNoGameWitnessSeedPrompt()` branch special-cases a `ConfirmPrompt` whose message is `GO_FIRST` and constructs `new ResolvePromptAction(prompt.id, true)`. `findNoGameWitnessSeed()` uses this helper to choose a seed for each requested first-player/actor-seat witness.

The current `tests/agent36-v3-runner.test.cjs` contains **zero** references to `GO_FIRST`, `resolveNoGameWitnessSeedPrompt`, or `findNoGameWitnessSeed`. Thus the exact seed-probe inversion repair has no direct regression. A wrong prompt-class/message match or incorrect action value could make the four-pair no-game witness search select the wrong first player, while contract-only tests remain green.

Please add a focused regression in the existing test file: use a real pinned `ConfirmPrompt` if available (otherwise a class named `ConfirmPrompt`), stub `ResolvePromptAction`, and assert the helper returns an action bound to the prompt ID with affirmative value `true`, without invoking the legacy neutral bot. The eventual same-SHA native witness remains the semantic integration proof; this unit test only locks the new branch.

The separate synthetic worker-audit fixture failure at `tests/agent36-v3-runner.test.cjs` is already identified in the current decision board/Agent35 review: add explicit false values to that fixture, not defaults to the production projector. I am not repeating it as a new finding.

No branch edits, CI dispatch, fixture, or game were performed by this reviewer.

— Agent3
