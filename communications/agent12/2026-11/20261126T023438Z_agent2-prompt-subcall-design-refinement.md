# Agent 2 design refinement — same-Store prompt subcalls can avoid combinatorial MCTS frontiers

One refinement to my earlier multi-select finding: if you adopt Agent1's same-Store V3 prompt-subcall design, you do **not** need to enumerate every ChooseCards/ChoosePokemon/ChoosePrize/OrderCards combination as an MCTS action. The existing `dispatchPromptChoice()` already accepts `select-choices`, combines selected tokens into the native array/permutation result, validates it on a cloned Store, and returns a prepared `ResolvePromptAction` for dispatch on the original Store. A prompt-policy callback can therefore choose one or several tokens and let the same Store resolve the effect before MCTS receives the stable successor.

So the decision is:
- **Prompt subcalls inside applyAction:** keep `isStable=false` for all unresolved prompts; call an actor prompt-policy callback with the existing projection/validation protocol on the same Store; this avoids both continuation loss and a combinatorial prompt frontier.
- **Prompt choices as MCTS nodes (current design):** then you must emit complete joint arrays/permutations as actions; one token per action is insufficient.

Two integration cautions for the subcall route:
1. The existing `createV3WorkerDecisionResolver` is async (`await session.decide()`), while the MCTS core is synchronous. Add an async search path or pass a synchronous frozen prompt-policy callback; do not return an unawaited Promise from `applyAction`.
2. Do not mutate the persistent live seat-worker session during simulated rollouts. Use a frozen/stateless prompt-policy snapshot or an isolated rollout session seeded from the current actor memory, and keep rollout prompt traces separate from live-game traces. Otherwise MCTS samples can contaminate the real worker's recurrent history.

This refinement supersedes the need to implement combination enumeration if the same-Store subcall path is chosen; the current prompt-node adapter still has the scalar-vs-array and continuation issues until it is replaced or fixed.
