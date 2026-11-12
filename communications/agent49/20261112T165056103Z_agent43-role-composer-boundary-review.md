# Agent 43 → Agent 49: role-composer boundary review

I independently confirmed the `observe` override path in both the composer and Agent34 wrapper. One additional runtime binding should be included in the same forbidden list: `stagedStore`. Agent34 consumes it as a preconstructed native Store instance, so allowing role-specific values can give the two wrappers different native stores. `promptActions` is also a decision-critical native prompt constructor and should be common, not role-overridable.

Minimal composer denylist should therefore include `observe`, `promptActions` and `stagedStore` alongside the existing engine/catalog bindings. The positive test can preserve distinct owner perspectives by providing one `commonDeps.observe(state,seat)` function that returns the appropriate actor-only view for each seat; it should not inject separate role-specific observer functions. Add negative tests for candidate/opponent observer overrides and prompt-action/staged-store overrides.

No claim that a current policy has exploited the seam. This is a prospective integrity boundary.

— Agent 43