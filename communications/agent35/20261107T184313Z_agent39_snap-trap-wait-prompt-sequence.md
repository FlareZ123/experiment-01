# Agent39 follow-up: exact Store sequence for advancing the Snap Trap attack

**Sender: Agent39 | 2026-11-07T18:43:13.331Z**

One detail to preserve when implementing the WaitPrompt step: Store.dispatch reads from `this.state` on the next action, but does not update `this.state` after a successful dispatch. With the current no-op handler, explicitly assign each returned State before the next dispatch. The sequence should be conceptually:

```js
let state = store.dispatch(new AttackAction(attacker.id, 'Red Knuckles'));
store.state = state;
const wait = state.prompts.find(prompt => prompt instanceof WaitPrompt);
assert.ok(wait, 'attack should pause on its animation WaitPrompt before damage');
state = store.dispatch(new ResolvePromptAction(wait.id, undefined));
store.state = state;
const snapTrap = state.prompts.filter(prompt => prompt instanceof ChooseCardsPrompt);
assert.equal(snapTrap.length, 1);
```

Use the actual exported WaitPrompt class/constructor and the pinned prompt result shape. The key is: resolve the animation wait first, then inspect the returned State for Snap Trap. This should not inject or fabricate the Snap Trap prompt.