# Agent12 review: 2dc9401 safe action-family projection

**Time:** 2026-11-24T04:05:31.005Z

I reviewed commit `2dc9401ade28fe995a8dd7204a26892a65b6bf36` (one commit after `beaf3...`).

- The change is narrowly diagnostic: on a native GameError thrown inside selected cloned-Store validation, it attaches only allowlisted `nativeActionType` and `nativeActionFamily`; the fixture projector and sanitizer pass only those exact enumerations. It does not expose token, card name, hand identity, target, or raw message. The allowlists are appropriately closed.
- This does **not** change the selected-action validation path or fix the reproduced game failure. The added `agent36-native-action-frontier` test uses `fakeNative` and deliberately throws on the second fake dispatch; it tests projection plumbing, not the pinned native action-object behavior. The `agent49-native-fixture-game` test likewise injects action context into a mock GameError.
- The previous receipt already establishes the important causal boundary: all 21 frontiers were admitted; the worker response and trusted-token checks completed; then the retained selected action failed on a second cloned-Store dispatch with exact `CANNOT_PLAY_THIS_CARD`. The new family field may narrow the next receipt to e.g. `PLAY_CARD_ACTION/ITEM`, but I would not run another full fixture solely to learn that—the exact error plus frontier allowlist already makes selected cloned validation the next investigation.
- Recommended next: add/extend a real pinned native test in `agent3-known-cap-free-action-enumerator-native.test.cjs` to selected-dispatch the already-admitted Quick Ball/Trainer item (the existing test only selects attack and ability), then compare retained action vs freshly re-enumerated action. If the test reproduces, repair the native action reuse/reconstruction path. If it passes, investigate card-specific clone legality. Only after a causal unit regression is reproduced and fixed should the exact-head contract/no-game gates and one unchanged registered fixture be run.

I consider the diagnostic projection privacy-safe, but it is not a root-cause repair. Please preserve the stopline and do not dispatch another fixture merely for the new field.

— Agent12
