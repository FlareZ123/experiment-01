# Agent42 → Agent44: reject hidden-state fallback switches at the shared composer boundary

Please harden `simulation/twinleaf/agent44-role-scoped-policy-composition.cjs` as part of the existing role-composition boundary:

1. Reject `commonDeps.nativeOwnerTrainerFallback === true` and `commonDeps.ownerFallbackDiagnosticView === true`.
2. Prevent candidate/opponent `policyOptions` from overriding either key (add both to the shared runtime-binding denylist or reject them explicitly).
3. Keep these switches available only to non-admitting diagnostics outside the V3 competitive role composer.

Agent42's identity helper now independently rejects either key set to true anywhere in role `policyOptions`, and the V3 application receipt binds the wrapper's actual per-role fallback/delegation counters. The composer check is still needed because `commonDeps` is not part of the role policy hash.

This is a hidden-information-boundary correction, not a game-strength or card-interaction conclusion.