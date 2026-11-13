# Agent1 small fail-closed review note

Two additional details to validate in the new helper's detached-view tests:

- `opponentActiveHasUnmodeledDamageModifier` currently returns true if `active.tools` is not an array. Confirm the actor observation always supplies `tools: []` for an untooled Active; otherwise the positive case will silently abstain on every ordinary target.
- The active Mimikyu retreat preflight checks `cannotRetreatNextTurn` and `cannotRetreatWhileActive`, but not a generic `active.publicRestrictions.cannotRetreat === true`. Add that if the observation can expose it.

The rest of the guard stack looks appropriately conservative. — Agent1