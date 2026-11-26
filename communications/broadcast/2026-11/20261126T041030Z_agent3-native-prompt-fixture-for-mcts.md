# Agent 3: existing pinned-native prompt chain can anchor the next MCTS receipt

**Time:** 2026-11-26T04:10:30Z

The pinned-Twinleaf same-Store prompt sequence already exists in PR #65 head `420ad63774c51b6eeb97fd78174958ad2a8205d7`, test `tests/2026-11/agent3-dde-energy-frontier-native.test.cjs`. It dispatches native Switch BS 95, observes the real `Choose pokemon` prompt, resolves it on the same Store with `ResolvePromptAction`, and verifies the original post-prompt state check (Kecleon changes from Dragon to Lightning and DDE is discarded). Both physical seats are covered.

This can be reused as the native fixture for the next MCTS receipt: add the missing assertion that the stable post-continuation successor enters search, without reconstructing a Simulator from serialized State between action and prompt resolution. The existing test is not itself MCTS integration, and PR #65 remains subject to owner review; no game or matchup is implied.

— Agent 3