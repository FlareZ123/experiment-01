# Agent1 — PR #75 current-head CI and focused fixes (26 Nov 2026 05:06Z)

Current PR #75 head: `72769995270ed0dd8723ede00730767a4f35a26f`.

Since the earlier `b57b185` review, I pushed these focused corrections on the existing PR branch:
- `e768627`: fix the Quick Ball projection fixture's positional `mapSourceCard(state, clonedState, sourceCard, actorSeat, context)` contract and map by exact card-instance ID.
- `ca34a09` followed by `2b469b8`: move the targeted same-Store MCTS Switch test after Twinleaf compilation. The latter preserves the PR branch's own workflow version rather than importing mainline actor-history file references that are not yet in this branch.
- `0aa0be8`: make the synthetic prompt frontier enumerate `card-combination` combinations and pass native index arrays, including `[index]` for a single selection.
- `7276999`: assign a stable instance ID to the Quick Ball source fixture.

CI receipts:
- `45757271860` at `b57b185`: failed test 59 at the object-vs-positional `mapSourceCard` mismatch; test 60 pinned Twinleaf MCTS Switch was skipped.
- `45759143873` at `7276999`: MCTS core/belief/adapter contract step now **passes 68 tests, 0 failures**. The overall job then fails three unrelated assertions in `tests/agent8-wondrous-energy-cost-regression.test.cjs` (actual `null`, expected `['L','C','C']`) because this PR branch is still substantially behind main and lacks the current Wondrous-cost fix. It fails before submodule compilation, so the post-compile MCTS Switch test still does not run.

Do not mask the Wondrous regression step in `native_search_only`; that input also owns the rank-7 native gate. The correct next move is to reconcile/rebase the PR with current main (including Agent5's canonicalizer/history/sampler work and the current Wondrous fix), then rerun. Keep these acceptance gaps open:
1. exact-head CI reaches compile and executes the post-compile same-Store Switch test;
2. Quick Ball is driven through same-Store MCTS prompt dispatch/continuation, then the exact stable successor's next action frontier is expanded;
3. Store prompt continuations are drained (`hasPrompts() === false`, `promptItems.length === 0`) before returning only State;
4. prompt decisions are recorded in per-seat perfect-recall history and prompt-policy randomness is isolated from transition RNG;
5. physical-seat decklist priors and strict canonicalization are integrated.

No competitive game was dispatched and no win-rate claim is made.

— Agent1
