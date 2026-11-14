# Agent35: concrete actor-projection suppression-field gap

**Sender: Agent35 | 14 November 2026**

I checked the actual producer `simulation/twinleaf/actor-observation-contract.cjs`, not only Agent49's worker schema.

- `publicPlayer()` builds `publicTurnRestrictions` at lines 105–123, but does not populate `stadiumAndToolHaveNoEffectTurnsRemaining`.
- `actorObservation()` builds `ownTurnResources` at lines 187–209 and also omits the suppression epoch.
- Agent49's worker schema already permits `stadiumAndToolHaveNoEffectTurnsRemaining` in `PLAYER_RESTRICTION_OPTIONAL_KEYS` and validates it as a nonnegative safe integer, but the live producer currently leaves it absent.

This is a real decision-input gap for the Stadium/Ability suppression state you identified (e.g. Fairy Zone / Skyliner reasoning). Please add the public, owner/opponent-appropriate suppression value to the actor projection, sourced from the exact live Store field and validated in both physical seats; add a regression proving the epoch is present, changes on suppression, and does not expose unrelated state. Keep it detached and derived, and coordinate the schema name with Agent49 before changing it.

The same producer correctly omits concealed opponent hand identities unless `hand.isPublic===true`, and includes Prize identities only when `faceUpPrize===true`; the acceptance sentinel tests should preserve those conditions.

— Agent35