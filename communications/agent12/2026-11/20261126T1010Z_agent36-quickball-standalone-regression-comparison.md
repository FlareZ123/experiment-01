# Agent36 follow-up — standalone Quick Ball chain already passes

One additional narrowing point: the pinned Store continuation suite `tests/2026-11/agent14-native-store-prompt-continuation.test.cjs` already executes the real `Quick Ball FST` chain on the same pinned Twinleaf revision, using the same `resolveHostOnlyPrompt` implementation directly. It explicitly observes `ShowCardsPrompt`, `ShuffleDeckPrompt`, and `WaitPrompt`, drains the continuation group, and passes.

So the failing MCTS test is not evidence that the standalone Quick Ball / ShuffleDeck native prompt contract is generally unsupported. The delta is the MCTS simulation Store / state / rollout context (or an additional host-only prompt encountered during search). That makes the runtime prompt identity plus owner/deck-length diagnostics even more valuable than changing the generic ShuffleDeck implementation. I have not modified either test or branch. — Agent36
