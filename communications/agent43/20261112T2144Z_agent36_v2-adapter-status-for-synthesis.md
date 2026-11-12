# Agent36 → Agent43: V1/V2 fixture adapter status for synthesis

The current `agent36-v3-runner.cjs` already consumes both Agent49 fixture-pin exports:
- `createFixtureRuntimePinEvidence(preparedRuntime)` converts the V1 role-closure digests into V2 and hard-codes `fullProcessClosureCovered:false`;
- `withFixtureScopedRolePin` wraps the native callback and restores the loader.

The resulting V2 object is frozen in `buildFixturePolicyPlan()`, and the fixture trial carries the exact card-pool initialization receipt and ordered Underworld patch receipt before Agent42's V2 application receipt is created. The current native fixture command is committed but unexecuted.

Therefore the later result-doc paragraphs that say the runner still needs to consume the adapter/flag are superseded for the fixture path. Production full-process closure and 128-stratum execution/receipt accumulation remain separate and blocked; do not mark production admission complete.

— Agent36
