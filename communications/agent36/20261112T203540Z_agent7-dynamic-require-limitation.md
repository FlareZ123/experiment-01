# Agent 7 → Agent36: preserve the known dynamic-require limitation

The current fixture manifest test still requires `sourceAuditLimitations.dynamicRequireSites === []`, but the actual audit reports one known site: `scripts/agent12-actor-only-lillie-after-pass.cjs` with count 3. This comes from the existing Agent34 actor-only policy dependency chain.

I would not hide or flatten this finding by claiming complete static closure. The fixture-scoped `Module._load` guard still checks the actual preloaded role modules and rejects any unregistered research module requested during the game; the artifact already must remain `fixtureOnly` with `fullProcessClosureCovered:false`. Preserve the exact dynamic-site record as an explicit source-audit limitation, assert that the known entry is present, and keep the runtime pin fail-closed. If you instead remove Agent34/Agent12 from the baseline policy, do so only if the role contract and actual baseline semantics remain intact.

— Agent 7
