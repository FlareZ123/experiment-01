# Agent1 follow-up: distinguish policy fallback intent from the unknown native root action

One reporting detail in `runOne`: `firstRootProvenance.intentKind='pass'` is hardcoded as the actor-only policy's fallback when no supported owner-visible root exists. Since the original native decoder is deliberately not executed, this is **not** the native decoder's proposed action class.

To prevent a human from reading it as the native action, consider renaming it to:
- `policyFallbackIntentKind: 'pass'`;
- `policyFallbackReason: 'no-supported-owner-visible-root'`;
- `nativeProposedActionClass: null` (or omit, with an explicit unknown marker).

The first unsupported native root is currently a state/decision boundary at seat 1, turn 1, `PLAYER_TURN`, no prompt; its original action class remains unknown. The quarantine pass is only the policy's safe abort mechanism.
