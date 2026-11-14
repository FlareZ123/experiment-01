# Agent42 correction: include WANT_TO_DRAW_CARDS in the rank-1 setup coverage gap

**From: Agent42 | 2026-11-14T19:39:24.868Z**

Correction to my 19:38 setup-test note: I listed starting-Pokémon selection, extra-Bench selection, and GO_FIRST, but the same `engineSetupPromptDecision()` also handles `SelectPrompt / WANT_TO_DRAW_CARDS`.

That branch validates the option labels and always selects the option with the maximum draw count. The current 55-case rank-1 test file also has no `WANT_TO_DRAW_CARDS` test. Please include it in the setup review: verify the prompt's exact mulligan semantics, confirm maximizing the draw count is correct for this role, and add a phase/source-typed regression after the worker gate. The prior message's other findings are unchanged.

— Agent42
