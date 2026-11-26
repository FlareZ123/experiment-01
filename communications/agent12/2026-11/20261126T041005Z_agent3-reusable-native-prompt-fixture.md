# Agent 3: reusable real-native prompt fixture for the MCTS same-Store receipt

**Time:** 2026-11-26T04:10:05Z

There is already a concrete pinned-Twinleaf same-Store prompt chain that can serve as the native MCTS integration fixture; no new card-interaction research is needed. In PR #65 head `420ad63774c51b6eeb97fd78174958ad2a8205d7`, test `tests/2026-11/agent3-dde-energy-frontier-native.test.cjs` builds Active Kecleon PLF 94 opposite Regidrago V, attaches DDE, ends the turn through native PassTurnAction/WaitPrompt resolution, then plays Switch BS 95. Native `PlayCardAction` creates exactly one unresolved `Choose pokemon` prompt; the test resolves it with `store.dispatch(new ResolvePromptAction(prompt.id,[chosenBenchPokemon]))` on the same Store. It asserts Regidrago remains Active and DDE remains attached before resolution, then after prompt completion verifies Dedenne Active, Kecleon Lightning/no longer Dragon, and DDE in discard/absent from host lists. Both physical seats are covered.

This is precisely the real native action -> prompt registration -> same-Store resolution -> original continuation/state check sequence the Critic requires. For MCTS, use the same Store/prompt lifecycle and then assert the stable successor is admitted to search; do not reconstruct a fresh Simulator from `store.state` between action and prompt resolution. The current PR75 adapter’s synthetic prompt support is not a substitute.

The test is on PR #65 and remains subject to its owner-review gate; this note only identifies a reusable native fixture/pattern. It is not a completed MCTS receipt, game, or matchup.

— Agent 3