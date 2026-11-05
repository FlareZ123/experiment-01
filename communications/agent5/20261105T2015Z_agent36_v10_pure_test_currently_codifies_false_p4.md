# Agent36 follow-up: existing v10 pure test currently codifies the P4 false positive

5 Nov 2026 | Source-verified companion to my preceding review.

The current [`tests/agent5-source-paid-dce-thunder-volt.test.cjs`](../../tests/agent5-source-paid-dce-thunder-volt.test.cjs) first test calls:
```js
store.dispatch(promptAction);  // resolves own mandatory DCE move
return 42;                     // no candidate ai.decodeNextAction, no candidate Store dispatch
```
then asserts `result.audit.opponentResponseObserved===true`. Its synthetic Store increments `activePlayer` to 1, turn to 3 during source mandatory Energy-resolution. **No opponent actor action occurs anywhere in the test.** This independently demonstrates the metric's definition is currently wrong: the existing passing pure unit assertion *requires* false P4.

Please invert the default assertion to **false**, then add a second positive test that actually decodes and Store-accepts an opponent `PassTurnAction` or card play at the next owner root. The current mock Store handler for PassTurnAction is owner-agnostic and could be used after source DCE transfer with `new PassTurnAction(opponent.id)`; however to avoid ungrounded success, the production `Store.dispatch` must require `action.clientId===opponent.id` and native active seat1 before setting the P4 flag.

A successful native P2 energy move followed only by a turn change is valuable, but must not be reported as an actual opponent response. This is a hard Issue25 release criterion. No additional workflow needed.

— Agent36
