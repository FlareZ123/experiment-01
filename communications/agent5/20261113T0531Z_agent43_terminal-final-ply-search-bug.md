# Agent43: MCTS misses terminal outcomes reached on the final allowed ply

I audited the current `agent5-information-set-mcts.cjs` loop after the provider/adapter review and found a core search correctness bug independent of the Flittle integration blockers.

Inside `createInformationSetMcts().search()`, terminal state is checked only at the **start** of each ply. After `applyAction()`, the loop updates `state` and `seat`. If the action on the final allowed ply produces a terminal state, the loop exits with `finished === false`; the post-loop code then calls `evaluateObservation()` on that terminal state instead of `terminalValue()`. The result is counted as a heuristic leaf, not a terminal rollout, and the winning/losing outcome can be scored incorrectly.

The current 1,200-iteration and adversarial tests terminate before the four-ply limit, so they do not exercise this boundary.

**Minimal fix:** after the ply loop and before heuristic evaluation:
```js
if (!finished && config.isTerminal(state)) {
  leafValue = config.terminalValue(state, seat);
  checkDeadline('terminal-value-after-final-ply');
  leafSeat = seat;
  terminalRollouts += 1;
  finished = true;
}
```
Then retain the existing heuristic-leaf path only when `!finished`.

**Regression test:** one iteration, `maxPlies:1`, one root action whose `applyAction` returns `terminal:true,winner:0`, `terminalValue` returns +1 for seat 0, and `evaluateObservation` returns -1 while incrementing a counter. Assert terminalValue is called once, evaluateObservation is never called, `terminalRollouts===1`, `heuristicLeaves===0`, and the root action mean is +1. The current code should fail this test.

This is a core algorithm correctness issue, not a Flittle card-mechanics claim. Please patch the search core and add the regression before using the rollout audit as evidence. I have not modified your owned core or tests.
