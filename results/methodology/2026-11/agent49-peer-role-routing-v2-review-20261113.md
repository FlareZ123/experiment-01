# Agent49 review: peer-role routing boundary v2

**Date:** 13 November 2026  
**Status:** Source-level review complete; repository tests and native fixture not run.

## Conclusion

**Agent47's v2 correction resolves the deterministic nested-wrapper accounting defect.** The candidate wrapper is installed inside the opponent wrapper. It sees opponent-seat calls first and deliberately delegates them to the outer opponent wrapper. V2 records this expected peer-role dispatch separately from unexpected non-owner bypass, then requires the candidate's peer-delegation count to reconcile with opponent handled calls.

The reviewed source contains no remaining defect in this specific role-routing contract. This does not establish a test pass, native-game result, policy-competence qualification, paper legality, matchup performance, a final deck, or a 99.5% win rate.

## Implementation and test coverage

- **Agent47 v2 implementation:** commit `5e20ae54581ee1016b4ee4661b3b1057ce18b9d6`.
  - `simulation/twinleaf/agent34-actor-only-root-policy.cjs` records `peerRoleDispatchEnabled`, `ownerDecisionCalls`, and `peerRoleDelegations`.
  - `simulation/twinleaf/agent44-role-scoped-policy-composition.cjs` enables peer routing only in the inner candidate wrapper, emits `aichi-actor-only-execution-boundary-v2`, and reconciles candidate peer delegations against opponent handled calls.
  - Both unexpected bypass counters and all native/full-state fallback counters must remain zero.
  - `simulation/evaluation/2026-11/agent42-role-policy-identity.cjs` binds the v2 boundary and digest into the application receipt.
  - `simulation/evaluation/2026-11/agent43-independent-outcome-competence-v3.cjs` independently validates the v2 schema, role flags, safe-integer counters, digest, and routing reconciliation. Digest-valid semantic mismatches are integrity failures.
- **Two-seat integration regression:** `tests/agent34-actor-only-root-policy.test.cjs` invokes `withCandidateOpponentPolicyRoles()` and tests both candidate seat 0/opponent seat 1 and the mirrored candidate seat 1/opponent seat 0. Each orientation asserts one selected root decision per role, one expected candidate peer delegation, one opponent handled call, zero unexpected bypasses, and a valid v2 boundary. The mirrored-seat coverage was added by Agent44 in commit `36daf0f0eab675bb131be0da58d62ebdd5f4353d`.
- **Independent V3 consumer regression:** Agent49 added a test in `tests/2026-11/agent43-independent-outcome-competence-v3.test.cjs` (initial commit `30ce732ae9acd3e53e5cb38b1eab16134575f4f6`; strengthened in `ef9c8c9970699dc7a63c1277f91f138a78c78af8` and `f3d418b188a9528b251bcc45ce1802a6478225d5`). Four digest-valid mutations cover candidate delegation-count mismatch, nonzero opponent peer delegation, candidate peer routing disabled, and opponent peer routing enabled. The test rehashes the boundary and receipt, asserts the exact evaluator failure, preserves factual game-outcome admission and receipt validity, and denies actor-only verification/eligibility and comparative policy competence.
- **Factual trace preservation:** Agent42 receipt creation hashes an invalid boundary rather than rejecting the factual result. Agent36's `agent36-v3-runner.cjs` carries the boundary and both role audits into the trial/artifact without requiring `valid===true`, and creates the factual application receipt when the game completed and a role result exists. Existing Agent36 tests cover an invalid unsupported-prompt boundary and preservation of partial failure traces. This is source/test-contract evidence only.

## PR #46 integration

PR #46 (`agent48/v3-expanded-format-contract-clean-20261113`) is based on `90316042071cbe8555d6d97a562372b7f3d21c7a`, before the v2 commit. Its branch snapshot therefore still displays v1 boundary fields. Hunk-level inspection shows the PR adds format/date, field-status, and fixture-marker changes in Agent42/Agent43 and their tests; it does **not** edit the inherited actor-boundary schema lines. Agent44 independently confirmed that a normal three-way merge should preserve main's v2 changes. No peer-boundary conflict or need for a manual v2 port has been established. GitHub's `mergeable` field fluctuated across reads, so inspect the actual merge result rather than relying on a cached Boolean.

The PR's cited Node22 run `43431203459` succeeded at 13:09:22Z, before the v2 commit and Agent49 regression. Its existing `.github/workflows/agent48-expanded-format-contract-ci.yml` includes both Agent42 and Agent43 test files. Obtain checks on the combined main+PR tree after v2 is present; do not treat the old green run as validation of v2.

## Remaining execution boundary

- Read-only Actions API evidence at 15:14Z: latest PR run was `43431203459` (13:09:22Z, success, pre-v2); latest `workflow_dispatch` run was `42740669498` (10 November 02:08:32Z). No current bridge-only or Agent36 V3 fixture dispatch was present.
- This session has no workflow-dispatch action. Local `git ls-remote` also failed because `github.com` could not be resolved; there is no local repository checkout for running the Node suites.
- The existing Agent36 manual fixture workflow already includes the Agent34, Agent50, Agent43, and Agent36 tests. The owner-managed diagnostic public-key variable is required for its encrypted fixture artifact. No workflow or receipt layer was added.
- Unsupported owner prompts can still fall back to `SimpleTacticsAi.decodeNextAction(state)` with full `Store.state`. Any such fallback must keep actor-only eligibility false. The v2 routing fix does not resolve this separate information-boundary limitation.

**Disposition:** accept v2 role-routing logic at source-review level. Next validation is existing Node22 CI on the combined PR tree, followed by the owner-controlled bridge and native fixture. Preserve factual traces even when actor-only qualification fails. No competitive or 99.5% claim is supported.
