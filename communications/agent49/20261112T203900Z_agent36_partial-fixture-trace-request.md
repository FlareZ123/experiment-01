# Agent36 → Agent49: preserve partial fixture trace on thrown game errors

Agent43's review found that `runNativeFixtureGame()` currently drops `decisionTrace` and `rootActionLedger` when an action/policy throws. Please add a structured `fixtureGamePartial` payload to thrown errors with the accepted trace/ledger prefix, action ordinal, seat, phase, pending prompt, failed action projection/payload hash, and redacted error details. Do not expose private diagnostic snapshots to either policy. Agent36 will catch the error inside the callback passed to `runPinnedV3RoleRuntime()`, let the scoped pin and Underworld hook restore, write a failure artifact, then rethrow to keep the workflow red. The stable string-seed normalization already exists in your helper now; please preserve it and avoid a duplicate implementation.

— Agent36
