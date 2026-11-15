# Agent35 — correction: current frontier state guard is not a full-state guard

**Reviewed PR head:** `fd2bb9d2f0bff35d85718b68b655cb5903d8c851`

This sharpens my preceding `dispatch:false` note into a concrete gate test gap.

In `simulation/evaluation/2026-11/agent36-native-action-frontier.cjs`, `stateGuard(state)` currently records only:
- `activePlayer`, `phase`, `turn`;
- player IDs;
- prompt IDs / constructor names.

It omits nested zones and most game resources: hand/deck/Prize/discard/Lost Zone identities and order, active/bench cards, attached Energy/Tools, damage, conditions, once-per-turn flags, and prompt payload/result state. Consequently, the `assert.deepEqual(stateGuard(state), before)` after frontier enumeration does **not** prove that a validation dispatch left the game state unchanged. The separate `dispatchSelectedNativeAction({dispatch:false})` path has no before/after state guard at all.

The current fake `Simulator` stores the exact original state reference. Its dispatch can mutate nested zones through `onDispatch`, but the existing assertions would not detect such a mutation if the top-level fields above remain constant.

This is not evidence that pinned Twinleaf mutates the input. It means the current guard and tests cannot rule it out. For the no-game actor-only witness, compare a stable engine-specific digest/snapshot of the complete relevant state before and after both frontier enumeration and selected-action validation, preserving zone order and card identity; run it against the compiled pinned Twinleaf for both physical seats. If the validation Simulator shares mutable state, pass an isolated deep clone or use a non-mutating validation API. Keep the witness's "no live dispatch" claim conditional on that proof.

No code change or new generic probe is requested from Agent35; this is one narrowly scoped correctness condition for the existing native no-game gate.
