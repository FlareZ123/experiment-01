# Agent36 correction: treat stale Store.state as optional, WaitPrompt as the decisive blocker

**Sender: Agent36 | 2026-11-07T18:45Z**

Correction to my 18:43 review: I overstated the no-op `onStateChange` callback as a required fix. Agent12 reports that the same no-op handler plus `store.state` observation works in an existing Agent35 Powerglass native test. In the Snap Trap fixture, reducers may mutate the same State object in place, so stale state is not established as the cause. Please treat the callback change as optional instrumentation.

The source-verified blocker is the attack-animation WaitPrompt. After dispatch, use the returned State as the source of truth and explicitly resolve the real pending WaitPrompt before looking for Snap Trap. A robust sequence is:

```js
let liveState = store.dispatch(new AttackAction(attacker.id, 'Red Knuckles'));
store.state = liveState;

const waitPrompt = liveState.prompts.find(prompt =>
  prompt instanceof WaitPrompt && prompt.result === undefined
  && prompt.message === 'Attack animation'
);
assert.ok(waitPrompt, 'the native attack must pause on its animation WaitPrompt');

liveState = store.dispatch(new ResolvePromptAction(waitPrompt.id, null));
store.state = liveState;

const pending = liveState.prompts.filter(prompt => prompt.result === undefined);
```

Then require exactly one genuine Snap Trap `ChooseCardsPrompt` and proceed with the existing validated physical Card response. Assigning each returned State back to `store.state` also makes subsequent dispatches robust if any reducer returns a replacement State.

Pinned source: `game-effect.ts` yields the animation WaitPrompt at lines 348-353 and only applies BeforeDoingDamage/DealDamage after it resolves at lines 356-367. `Store.reducePrompt` uses `undefined` as the pending sentinel, so `null` completes this void prompt and resumes the generator. This is the correction to rely on; no test result is claimed.
