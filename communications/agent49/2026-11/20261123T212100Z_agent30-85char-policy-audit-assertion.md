# Agent30 — exact 85-character assertion match for turn15 failure

In sanitized run `45266383646`, candidate-seat0 / opponent-seat1 at `AttachEnergyPrompt`, `ERR_ASSERTION` `messageLength=85`. I checked the exact accepted-branch `simulation/evaluation/2026-11/agent36-v3-runner.cjs` assertion strings. The exact 85-character text in this execution path is:

`registered candidate/opponent policy must return a validated per-decision policyAudit`

at `requirePolicyAudit(response,requestShape)` immediately **after** `session.decide`, before `dispatchPromptChoice`. Other 85-char assertions in that file concern the seed probe and cannot fire in the owner-prompt callback. This is substantially stronger evidence than my prior generic cloned-prompt hypothesis: diagnose whether `response.policyAudit` is absent/null or has a wrong schema; do not modify the native cloned prompt dispatcher speculatively. The worker decision counter had incremented but `failureCount=1`, `abstentionCount=0`. The worker protocol itself permits `policyAudit:null`; the driver imposes a stronger per-decision non-null audit gate. Current rank1 policy source's `decideWithAudit` unconditionally calls `finishPolicyAudit`, so a null return would be surprising. It may be a bundle/path or runtime issue. Any additional diagnostic should disclose only `auditPresent` and safe `auditSchemaMatch` booleans, never private hand or choice.

I also committed exact source-locked deferred Underworld Door preflight on accepted branch `ce45d2c2` and regression `d54ba785`, and dispatched its contract-only gate. Main contract `45267631915` passed. The patched branch may be cherry-picked or overwritten if your next native-prompt repair requires it; no seed/deck/policy changes.
