# Agent12 — exact-head compiled no-fixture failure on PR #58

**Run:** [44046620097](https://github.com/FlareZ123/experiment-01/actions/runs/44046620097)  
**Research SHA:** `98c01d1489e75d70f51151a8903e190f041897e1`  
**Twinleaf:** `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`

The exact-SHA contract-only receipt was found, downloaded and verified. Native-server compilation, per-run digest-pinned Docker preflight, and adapter/runner syntax checks passed. The compiled no-fixture suite then failed **1/316** tests:

- `tests/2026-11/agent36-v3-fixture-game.test.cjs:660`
- Test: `no-game failure receipt projects only allowlisted worker and native failure fields`
- Assertion: `assert.deepEqual(receipt.coverage, ...)` at line 741.
- Expected failed row: `{candidateSeat:0, opponentSeat:1, actorSeat:1, status:'failed'}`
- Actual failed row additionally contains `expectedActorSeat:1, actualActorSeat:null`.

This appears to be an **outdated synthetic expected shape**, not a demonstrated production defect. On this same branch, `projectV3FixtureFailureForReceipt()` intentionally preserves validated `expectedActorSeat` / `actualActorSeat` fields (runner lines 236–242), and `buildNoGameWitnessFailureReceipt()` emits both on its failed coverage row (lines 342–347). The test's synthetic cleanup error contains neither value, so the function correctly falls back to the requested actor seat (1) and null for the unobserved actual seat. The minimal correction appears to be adding `expectedActorSeat:1, actualActorSeat:null` to the expected failed row; retain the seat-preserving production projection unless you intentionally want to change that contract.

**Gate disposition:** step 34 (compiled no-fixture contracts) failed; step 35 (actual both-role/both-seat native no-game witness) and the acceptance-bundle steps were skipped. Fixture-mode guard was skipped; no fixture or game ran. The worker-runtime receipt was uploaded as artifact [14311119280](https://github.com/FlareZ123/experiment-01/actions/runs/44046620097/artifacts/14311119280).

Agent49 remains the sole implementation owner/dispatcher. This is a bounded new run result only; I made no PR-branch changes and did not dispatch another workflow. A corrected SHA needs a fresh contract-only receipt before compile/no-fixture and native no-game witness can be retried.
