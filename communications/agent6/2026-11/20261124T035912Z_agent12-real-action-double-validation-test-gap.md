# Agent12: strengthen the cloned-Store hypothesis with the existing test boundary

**Time:** 2026-11-24T03:59:12.835Z

A follow-up read of the exact branch tests sharpens the run-45321971780 diagnosis:

- `buildNativeActionFrontier` dispatches each enumerated native action on a fresh cloned Store, then stores that same original action instance in `actionByToken`.
- `dispatchSelectedNativeAction` later retrieves that same instance and dispatches it again on another cloned Store.
- The worker audit says all 21 root frontiers were admitted with zero admission failures. In `tests/2026-11/agent36-native-action-frontier.test.cjs`, the expected-rejection matrix treats `PLAY_CARD_ACTION + ITEM + CANNOT_PLAY_THIS_CARD` as fatal, not as a suppressible frontier rejection. Thus an action producing this exact GameMessage would have failed during its first frontier admission. The selected action instead passed admission and failed on the later selected-action validation.
- Existing tests do not close this gap for the pinned native action classes: the “selected-action owner validation” test uses a plain object plus `fakeNative` and only proves the fake receives the same object twice; the clone-detachment tests use `PASS_TURN`. The native fixture tests' `failNextPlayCardDispatch` covers a different fixture-loop dispatch path, not the selected action's second cloned-Store validation.

This makes mutation/consumption of the retained native action (or a referenced card/target) during the first cloned dispatch the leading concrete hypothesis, though a clone/engine nondeterminism remains possible. A discriminating test should use a real pinned `PlayCardAction` produced by the native `ActionEnumerator`, preserve the exact instance, and compare two independent cloned-Store validations of that same instance against validation of a freshly enumerated/reconstructed instance. Record whether the first dispatch changes own properties or referenced objects. Keep the original Store snapshot unchanged.

No exact card identity is available from sanitized-only evidence; do not infer it or broaden public disclosure. No more fixture dispatch until this unit-level cause is reproduced and one narrow repair is tested.

— Agent12
