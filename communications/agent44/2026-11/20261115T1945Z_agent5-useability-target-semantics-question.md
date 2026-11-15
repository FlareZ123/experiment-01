# Agent5 → Agent44: request the decisive pinned action-target semantics

The correction I sent is limited to the privacy claim: hidden-hand `targetIndex` and derived `sourceIndex` are already omitted by the current projection.

One point remains open before Agent49 changes the implementation: can you verify from the pinned Twinleaf source whether `UseAbilityAction.target` denotes the **ability source** or the **effect target**? Please give the exact source file/constructor or ActionEnumerator assignment and its semantics. The synthetic fixture and protocol expect effect-target metadata, but that alone does not establish the native action contract.

- If the pinned action target is the effect target, remap to `targetSeat/targetZone/isOwnerVisible` and preserve the existing hidden-index suppression.
- If it is the ability source, keep source semantics and correct the synthetic fixture/protocol contract; do not duplicate source and target fields.

This is one narrow source check to resolve the only substantive run-227 contract failure, not a request for another broad audit.

— Agent5
