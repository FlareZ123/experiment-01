# Agent49 review: peer-role routing boundary v2

**Date:** 13 November 2026, 14:45 UTC  
**Review scope:** Agent47's role-routing correction at `5e20ae54581ee1016b4ee4661b3b1057ce18b9d6`, its receipt/evaluator propagation, and the existing fixture test contract.

## Conclusion

**The v2 correction resolves the deterministic false-negative in the previous nested-wrapper accounting.** The candidate wrapper is the inner wrapper and is deliberately the only wrapper allowed to route an opponent-seat decode to the outer opponent wrapper. That expected delegation is now counted separately from unexpected non-owner bypass. The v2 boundary requires candidate peer delegations to equal opponent handled decisions, requires the opponent's peer-delegation count to be zero, and still requires both unexpected bypass counters and all other fallback counters to remain zero.

I found no remaining source-level blocker in this specific routing contract. This is not a test pass, native-game result, policy-competence qualification, or competitive result.

## Reviewed implementation

- `simulation/twinleaf/agent34-actor-only-root-policy.cjs`: records `peerRoleDispatchEnabled`, `ownerDecisionCalls`, and `peerRoleDelegations`. Only the candidate wrapper's configured peer-routing branch increments `peerRoleDelegations`; a non-peer/non-owner call increments `nonOwnerSeatBypassCalls`.
- `simulation/twinleaf/agent44-role-scoped-policy-composition.cjs`: assigns peer routing to the candidate wrapper only, emits `aichi-actor-only-execution-boundary-v2`, and checks candidate delegation count against opponent handled-call count. It continues to reject nonzero unexpected bypass and fallback counters.
- `simulation/evaluation/2026-11/agent42-role-policy-identity.cjs`: the v2 boundary and its digest are included in the policy-application receipt.
- `simulation/evaluation/2026-11/agent43-independent-outcome-competence-v3.cjs`: independently checks the v2 schema, digest, role-specific peer-routing flags, safe-integer counters, and routing reconciliation. A digest-valid but inconsistent routing summary is an integrity failure, not merely a warning.

## Integration coverage

`tests/agent34-actor-only-root-policy.test.cjs` now exercises `withCandidateOpponentPolicyRoles()` with one candidate-seat decode and one opponent-seat decode. It asserts that each role returns its own action, that the candidate records one peer delegation, that the opponent records one handled owner decision, that both unexpected bypass counts remain zero, and that the resulting v2 boundary is valid. This directly covers the nested-composer path; it is stronger than the synthetic-audit-only test in `tests/2026-11/agent50-v3-actor-only-boundary.test.cjs`.

The existing `agent36_v3_fixture_game` manual workflow already includes the Agent34 integration test plus the Agent50 boundary, Agent43 evaluator, Agent42 receipt, and Agent36 fixture tests. No workflow or receipt layer is needed.

## Additional independent evaluator regression

I added one focused test to `tests/2026-11/agent43-independent-outcome-competence-v3.test.cjs` in commit `30ce732ae9acd3e53e5cb38b1eab16134575f4f6`.

The test creates digest-valid receipts while independently corrupting four routing conditions: candidate peer-delegation count mismatch, nonzero opponent peer-delegation, candidate peer-routing disabled, and opponent peer-routing enabled. It rehashes the boundary and application receipt, then asserts the specific evaluator failure, preserves factual game-outcome admission, and denies actor-only boundary verification and comparative policy competence. This specifically tests the V3 consumer rather than only the composer summarizer. Follow-up commits `ef9c8c9970699dc7a63c1277f91f138a78c78af8` and `f3d418b188a9528b251bcc45ce1802a6478225d5` strengthen the reason assertions and add the opponent-flag case.

## Remaining execution boundary

- Agent47 reports only a small local nested-routing smoke; the repository Node test suites and native fixture have not been run against this commit.
- The existing manual fixture remains owner-controlled and requires the configured public diagnostic key. No workflow dispatch was available in this session.
- Unsupported owner prompts still have a fallback path that supplies full `Store.state` to `SimpleTacticsAi.decodeNextAction`. Any such fallback must continue to make the actor-only boundary ineligible. The v2 routing fix does not resolve that separate information-boundary issue.
- A passing fixture/test would still be engineering evidence only. It would not establish paper legality, deck-aware opponent competence, a matchup result, a selected fixed 60, or any 99.5% win rate.

**Disposition:** accept the v2 role-routing logic at source-review level; run the updated test set in the existing manual fixture lane when the owner-controlled key is configured; preserve any factual native trace even if a separate fallback counter makes the policy boundary invalid.


## PR #46 integration dependency identified (14:55 UTC)

- PR #46 head `94e3a2b18489fcafb19715d4ba940ef100207894` still contains the v1 actor-boundary schema in three files also modified by Agent47's mainline v2 commit: Agent42 receipt identity, Agent43 V3 evaluator, and the Agent43 V3 test. The PR diff overlaps all three paths. Main has v2 at `5e20ae54581ee1016b4ee4661b3b1057ce18b9d6` and the added evaluator tamper regression at `30ce732ae9acd3e53e5cb38b1eab16134575f4f6`.
- GitHub currently reports PR #46 `mergeable:false`; its body still describes main's intervening changes as non-overlapping documentation/communications. Sent Agent48 a direct handoff to rebase/merge current main and preserve v2 plus the new regression before another merge review; notified Agent47. No PR branch or metadata was modified by Agent49.


### Exact main-since-base overlap correction (15:02 UTC)

A base-SHA comparison against PR #46's actual base `90316042071cbe8555d6d97a562372b7f3d21c7a` shows **four**, not three, PR-touched files changed on main since that base: Agent42 receipt code, Agent43 V3 evaluator code, `tests/agent42-role-policy-identity.test.cjs`, and `tests/2026-11/agent43-independent-outcome-competence-v3.test.cjs`. The exact four are the two production files plus the Agent42 receipt test and Agent43 V3 evaluator test. The other PR-touched files `agent12-balanced-field-ledger-validator.cjs`, Agent44 builder/test, and Agent49 field-validator test are unchanged on main since the PR base; the PR-only CI workflow does not exist on main. Agent48's rebase should preserve all four mainline updates.


## Factual trace preservation review

The Agent36 runner also satisfies the requested source-level preservation contract: it copies `roleResult.actorOnlyBoundary` into the trial without requiring `valid===true`, retains both role audits and the boundary in the artifact, and creates the factual application receipt when the game completed and a role result exists—not only when the actor-only boundary is eligible. Agent42's receipt helper hashes an invalid boundary instead of throwing; the Agent36 test explicitly constructs an unsupported-prompt failure boundary and verifies it remains hashable. The runner's failure-envelope tests preserve partial traces before rethrow. This is source/test-contract evidence only; no native game or test suite was executed here.


### PR #46 mergeability correction (15:10 UTC)

The full PR-branch file snapshots contain v1 boundary fields because they are based on the pre-v2 base, but inspection of the actual PR diff hunks shows the PR adds format-contract hunks in those files and does **not** modify the v1 boundary schema lines. Those v1 lines are inherited from the merge base, not PR changes. GitHub's current PR metadata now reports `mergeable:true` (earlier `false` was transient). Therefore there is no demonstrated textual conflict or evidence that a normal three-way merge would overwrite main's v2 changes. The correct validation is to merge/rebase normally, then inspect the resulting merge tree for v2 and run the existing Node22 PR CI on that exact result. The earlier warning that PR46 could overwrite v2 was too strong; retain the four-file main-since-base inventory, but do not treat it as a merge blocker.


### PR #46 mergeability-state instability (15:11 UTC)

The GitHub `mergeable` field has fluctuated `false → true → false` while PR head `94e3a2b18489fcafb19715d4ba940ef100207894` and base `90316042071cbe8555d6d97a562372b7f3d21c7a` remained unchanged (latest observation: `false`). Do not treat either snapshot as conclusive. The diff-hunk inspection still shows that PR #46 does not edit the v1 boundary schema lines; those are inherited from its base, while the PR adds format-contract hunks. Therefore the specific claim that the PR would overwrite v2 is unsupported, but the overall mergeability state remains unresolved. Require a normal rebase/merge and inspect the resulting tree plus exact-head CI before treating the integration as complete.


### Independent Agent44 merge review and CI freshness (15:13 UTC)

Agent44 independently inspected the same actual PR hunks and confirmed that PR #46 does not change the inherited v1 boundary lines; the stale v1 branch snapshot is not a v2 overwrite. Agent44's 15:11:18Z check reported `mergeable:true` and `mergeable_state:clean`. My connector reads fluctuated, so use a fresh PR snapshot rather than treating one cached Boolean as authoritative. No manual v2 port or conflict-resolution patch is required for this boundary issue.

One remaining validation detail: PR #46's cited Node22 run `43431203459` predates the 14:31 v2 main commit. Ensure the existing PR workflow runs on the combined main+PR tree after the v2 changes are present (e.g. synchronize the PR branch once for the substantive code update, or otherwise obtain checks on the merge ref) before relying on that old green run. The workflow already includes the Agent42 and Agent43 test files, including the new routing regression.


### Mirrored physical-seat integration coverage

Agent44 subsequently added candidate-seat-swapped coverage to `tests/agent34-actor-only-root-policy.test.cjs` in commit `36daf0f0eab675bb131be0da58d62ebdd5f4353d`. The same role-composition regression now exercises both candidate seat 0/opponent seat 1 and candidate seat 1/opponent seat 0, asserting one selected root decision per role, one expected candidate peer delegation, one opponent handled call, zero unexpected bypasses, and a valid v2 boundary in both orientations. This closes the seat-orientation coverage gap noted during the initial source review. The test remains unexecuted in this session.
