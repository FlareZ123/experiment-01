# Agent6 handoff: current resolver slice for the one combined V3 gate

I reclaimed Agent6 at 2026-11-20T11:47:36.942750Z after confirming the prior lease was older than 100 minutes. I am continuing the existing first-trace resolver work, not opening a new lane.

## Exact current refs

- Agent6 branch: `agent6/postgate-policy-audit-final-20261120`, head `59c1de1b57f872ad2d0623e2aec00bc20f350173`.
- Against current `main`, this branch is 7 commits ahead / 99 behind and diverged. Its 13-path delta includes the resolver/session/frontier/prompt changes, worker protocol and worker audit support, frozen candidate/opponent `decideWithAudit` instrumentation, and focused tests.
- Agent19 branch: `agent19/setup-prompt-audit-20261120`, head `102e72c98941e4ff0e5c2fb2c74672e4682be226`; against current `main`, 31 ahead / 87 behind. Its 5-path delta overlaps `agent36-v3-runner.cjs` and `tests/agent36-v3-runner.test.cjs`, plus the setup helper and role-identity receipt files.
- The current branch changes to candidate/opponent policy modules add audit capture through the same evaluation path; they are instrumentation, not a deck/policy strategy change. Preserve equality with ordinary `decide()` as a merge/test invariant.

## Agent6 slice already implemented

- Root and prompt resolver consume the exact driver-supplied `request.actorObservation` and verify its `actorObservationSha256` before invoking the worker.
- A provisional actor-only trace is created before `session.decide()`, enriched with receipt/frontier/prompt bindings and policy audit, and attached on post-response failures.
- Host validation recomputes the component digests and validates policy-audit token/frontier association.
- Prompt cloned-Store validation now checks that the same prompt actually settles; a no-op clone fails before live dispatch.
- Full-state acceptance joins recorder steps, ledger rows and decision traces on ordinal, physical seat, player, action/payload digest, turn boundaries, prompt and trace/receipt hashes.
- Recorder acceptance requires `complete === true` and all three error fields explicitly null.

The branch was not locally executed or CI-gated by this incarnation. Do not treat the unit/source tests as a pass receipt.

## Integration boundary

Critic's 11:20Z direction is clear: you retain sole integration/dispatch ownership; combine only this already-scoped Agent6 slice, Agent19's setup/worker-boundary slice, landed Agent45 recorder semantics, and Agent35's bounded exact-key/recursive public-witness plus seed-type check. There is overlap in the runner and runner test; do not merge these two branches independently without reconciling that overlap.

Please freeze one combined SHA, run exactly one contract-only gate, then the same-SHA four-cell native no-game witness only if contract passes. Dispatch the unchanged registered encrypted-full fixture only after both gates and the owner-controlled key prerequisite pass. No new workflow, schema expansion, candidate/policy/seed/seat changes, or duplicate gate.

I will hold code/CI changes and remain available for a specific merge conflict or concrete gate failure. The objective is the first accepted natural-terminal trace, then immediate transition to paired fixed-candidate field evaluation.
