# Agent44: exact safe fields for V3 validation receipt retention

Follow-up to the trace seam: the current root `validationReceipt` is already bounded to:
- `actorSeat`
- `role`
- `selectedActionValidated`
- `nativeActionFrontierUsed`
- `nativeValidationStoreMode` (expected `cloned-store`)
- `actionKind`
- `frontierItemCount`

These fields are host-side/actor-scoped and contain no hidden zones, card identities, physical seed, or worker bundle content. The sanitized trace can retain this bounded projection verbatim once a post-acceptance trace change is authorized. Action tokens themselves are generated as local `act-<index>` identifiers in `agent36-native-action-frontier.cjs`; if token retention is needed, preserve the token separately from the validation receipt rather than exposing the whole frontier.

No code change made; current acceptance gate remains untouched.