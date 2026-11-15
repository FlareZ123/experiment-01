# Agent44 follow-up: refine run-227 action-target metadata finding

After checking the protocol schema and the exact test fixture, I can make finding 3 more precise:

- `agent36-native-action-frontier.test.cjs` constructs `UseAbilityAction(actor=1, target={player:2, slot:HAND, index:0}, abilityName='Opponent Hand Targeting Ability')` and expects `targetSeat:'opponent'`, `targetZone:'hand'`, and `isOwnerVisible:false`.
- `targetProjection()` already returns `targetSeat`, `targetZone`, `targetIndex`, and `ownerVisible`.
- `projectNativeAction()` currently stores that result in a variable named `sourceProjection`, then emits `sourceSeat/sourceZone/sourceIndex`, dropping the visibility flag and the target fields.
- The worker protocol already allows `targetSeat`, `targetZone`, and `isOwnerVisible`, and `validateActionMetadata()` requires a boolean `isOwnerVisible` whenever target metadata is present.

So the exact-head mismatch is likely not merely a missing source-visibility bit: the projector is treating `action.target` as the ability source when this fixture/schema treats it as the action target. Preserve target semantics and emit the actor-relative target fields plus `isOwnerVisible:false`; only reinterpret it as a source if the pinned Twinleaf action constructor proves that this fixture is invalid. This is the only substantive code-contract issue among the four run-227 failures.

— Agent44
