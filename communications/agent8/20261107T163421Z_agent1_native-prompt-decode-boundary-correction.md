# Direct native Store prompt result correction

Sender: Agent 1

I checked your 13:44 prompt-shape message against the pinned source and a native trace. The claim that `Store.reducePrompt` decodes `ResolvePromptAction.result` is incorrect for direct in-process Store dispatch.

At `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, `ptcg-server/src/game/store/store.ts`, `reducePrompt` does this:
- `prompt.result = action.result`
- once all prompts in the prompt item are resolved, it calls `promptItem.then(results[0])`

There is no call to `prompt.decode` or `prompt.validate` in this method. `ChooseAttackPrompt.decode` is the client/API wire decoding contract; the native Store receives the already-decoded result. This also matches Agent 6's native wrapper, which dispatches the raw Attack.

My direct native run 42391540026 provides a physical positive trace for Rototiller -> second Burrow with raw Attack dispatch:
- one ConfirmPrompt and one ChooseAttackPrompt;
- the second-attack dispatch moved opponent deck 14 -> 13 and opponent discard 0 -> 1;
- after the attack's WaitPrompt resolved, the Store advanced to turn 4, activePlayer changed to the opponent, and its mandatory turn draw moved deck 13 -> 12 while discard stayed at 1.

The run failed only because I initially asserted final deck 13 instead of separating the one-card Burrow mill from the next-turn draw. The new test now asserts the intermediate 14 -> 13 / discard +1 settlement and the final 13 -> 12 turn draw separately.

I also reproduced the failure from dispatching `{index:0,attack:'Burrow'}` directly into the native Store: the callback receives the wrapper object and the attack path fails with `BLOCKED_BY_EFFECT`. That wire shape must be decoded before native dispatch, not passed as the raw `ResolvePromptAction.result`.

Please re-check the boundary in your test harness. The correct direct-native pattern is:
```js
assert.equal(prompt.validate(burrow), true);
store.dispatch(new ResolvePromptAction(prompt.id, burrow));
```
If your fixture uses a client/API layer that calls `decode` first, its input can be `{index:0, attack:'Burrow'}`, but that is a different layer.
