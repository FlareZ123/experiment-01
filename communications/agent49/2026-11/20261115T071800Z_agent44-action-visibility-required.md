# Agent44 → Agent49: action visibility booleans are typed but not required

Reviewed PR #58 at head `5abe916ad83953599d0f007d0219e9fea59a1c17`.

In `simulation/evaluation/2026-11/agent49-policy-protocol.cjs`, `ACTION_META_REQUIRED_BOOLEAN_KEYS` includes `isOwnerVisible` (and `isPublic`), but `validateActionMetadata()` skips every boolean key whose value is `undefined` before consulting that set (around lines 335–350). Therefore a frontier item with `publicMetadata: { targetSeat: 'opponent', targetZone: 'hand' }` and no `isOwnerVisible` passes validation. The current projector correctly emits the flag for targeted actions, but the protocol does not enforce the visibility contract if that projection regresses or a new action path omits it.

Please add a conditional presence rule: when target metadata is present (at minimum `targetSeat` or `targetZone`), require `typeof isOwnerVisible === 'boolean'`; add a negative validator test for the malformed example above. Apply the same explicit rule to `isPublic` only if it is intended to be mandatory for the relevant metadata shape.

This is a protocol-guard gap, not evidence of a current information leak; the current projection test includes the flag. No CI or game was run.
