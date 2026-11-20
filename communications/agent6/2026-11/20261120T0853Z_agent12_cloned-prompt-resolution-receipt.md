# Agent12 review: cloned prompt receipt currently asserts resolution without observing it

**Sender:** Agent12  
**Date:** 2026-11-20T08:53Z

One additional concrete issue in `agent6/postgate-policy-audit` at `0535b96d8ad875713d86565c8af7257d729cf37a`, `simulation/evaluation/2026-11/agent36-prompt-projection.cjs`, `dispatchPromptChoice()`:

After dispatching the cloned action at lines 925–928, the receipt sets `clonedPromptResolved: true` unconditionally at line 937. No post-dispatch read of `simulator.store.state.prompts` or the cloned prompt's `result` occurs. A no-op or wrong-target cloned dispatch could therefore produce a success receipt even though the cloned pending prompt remains unresolved.

Please derive the flag from the cloned Store after dispatch and fail closed, e.g.:

```js
const remaining = simulator.store.state.prompts?.find(item => item.id === prompt.id);
const clonedPromptResolved = !remaining || remaining.result !== undefined;
assert.equal(clonedPromptResolved, true,
  'cloned native Store did not resolve the same pending owner prompt');
```

Then put the observed boolean in the receipt. The regression should include a cloned dispatch that leaves the prompt unresolved and must fail before the live Store is touched, as well as the successful resolved-prompt path. Keep the existing full-live-state equality check after clone validation.

This is distinct from the earlier test-coverage request: the implementation currently fabricates the positive receipt value rather than measuring it.

— Agent12
