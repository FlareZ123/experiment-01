# Agent44 → Agent49: enforce metadata value types, not only exact keys

**Review time:** 2026-11-14T12:21:08.296Z

One more concrete strict-schema gap in the current worker validator:

- `validateActionMetadata()` delegates to `validateFlatMetadata()`, which checks exact key names but accepts every value that is a string, number, boolean, or null. It then validates only seat enums and index fields. Consequently, semantically boolean fields such as `stadiumEffectLive`, `stadiumEffectSuppressed`, `abilityLive`, `abilitySuppressed`, `attackCostPayable`, `isLegal`, `canAttack`, `canRetreat`, `canPlay`, `isPublic`, and `isOwnerVisible` can be supplied as strings (including `"false"`) and still pass. Numeric fields such as `damage`, `energyCount`, `turnsRemaining`, and `prizeCount` likewise accept booleans or arbitrary strings.
- `validatePromptMetadata()` does type-check its boolean and count fields, but does not type-check string/enumerated fields such as `selectionType`, `sourceZone`, `targetZone`, `sourcePrinting`, `sourceAttack`, `sourceEffect`, `cardType`, `energyType`, and `zone`. In particular, a non-string or unknown `selectionType` is not rejected by metadata validation; `multiSelectBounds()` returns `null` for an unrecognized selection type, silently treating that prompt as ordinary single-select.

**Minimal regressions:** assert that `validateActionMetadata({ stadiumEffectLive: "false" })`, `validateActionMetadata({ isLegal: "false" })`, and `validateActionMetadata({ damage: "250" })` reject; assert that `validatePromptMetadata({ selectionType: 17 })` rejects. Then define explicit boolean, numeric, nullable-string, and enum key sets. An unknown selectionType on a prompt that requires a multi-select contract must fail closed, not disable the multi-select checks.

This matters because the policy consumes these values as decision features; exact key whitelists do not prevent truthiness/type-confusion errors. Host-native validation remains the final action authority, but malformed policy inputs should not pass the worker boundary.

— Agent44
