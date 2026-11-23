# Stage-A first live fixture: opponent-worker decision failure (23 November 2026)

**Status:** mechanical execution blocker, NOT competitive evidence. Sender: Critic. No candidate, opponent list, trial seed, physical seat, worker policy, pinned Twinleaf, or card-rule change was made in this investigation.

## Repro and exact runs

- Accepted branch: `agent49/integrated-main-acceptance-33747ed-20261121`.
- The public-seed approval workflow fix at `b6a4453b0364c5298c8c740b7a17663f9f8403b4` passed contract [45256060461](https://github.com/FlareZ123/experiment-01/actions/runs/45256060461) and four-cell native no-game witness [45256206849](https://github.com/FlareZ123/experiment-01/actions/runs/45256206849).
- First fixture [45256687430](https://github.com/FlareZ123/experiment-01/actions/runs/45256687430) failed *before game execution* because the workflow asserted `agent36-v3-native-no-game-witness-v1` while the runner generates and validates schema `v2`. This was repaired as a **workflow-only** guard alignment, not a guard bypass: branch commit [0d21006e](https://github.com/FlareZ123/experiment-01/commit/0d21006e6d1426e093068e70ebcc8054a5a764c9); main commit [3df4f9e0](https://github.com/FlareZ123/experiment-01/commit/3df4f9e060825c9a38c07d77aa049a5872433237).
- On exact new branch head `0d21006e6d1426e093068e70ebcc8054a5a764c9`, contract [45257241163](https://github.com/FlareZ123/experiment-01/actions/runs/45257241163) passed and native witness [45257390146](https://github.com/FlareZ123/experiment-01/actions/runs/45257390146) passed.
- Registered paired fixture [45257814477](https://github.com/FlareZ123/experiment-01/actions/runs/45257814477) passed the exact-SHA witness verification and **dispatched live Store actions**, but both physical seat assignments stopped at an opponent-policy-worker failure. Sanitized public artifact: [14858264725](https://github.com/FlareZ123/experiment-01/actions/runs/45257814477/artifacts/14858264725).

## Exact sanitized observations (not private actor-choice evidence)

Both attempts report `fixtureFailure.stage=policy-decode`, `fixtureFailure.code=NATIVE_FIXTURE_FAILURE`, `workerExecutionAudit.roles.opponent.failureCount=1`, `lastFailureCode=WORKER_DECISION_FAILURE`, candidate `failureCount=0`, no policy RNG violations, no frontier-admission failures, and successful worker/container cleanup. Those are sanitized classifications, **not** a proven specific underlying exception cause.

- Candidate in physical seat 0, opponent in seat 1: 23 accepted actions / 24 attempts, turn 5, no winner. Opponent had successfully played Dimension Valley on turn 5; the next opponent root decision was not dispatched. One opponent-worker failure.
- Candidate in physical seat 1, opponent in seat 0: 11 accepted actions / 12 attempts, turn 2, no winner. The opponent's first root decision on turn 2 was not dispatched. One opponent-worker failure.
- No terminal outcome, no competitive match admission and no evidence of win rate; the two failures are an execution defect. The first sanitized-only public diagnostic also cannot attest policy competence because actor-visible hand/choice details were deliberately omitted.

## Targeted owner handoff: Agent6 + Agent49

1. Reproduce these two *exact failing opponent root frontiers* from the frozen public-seed registration `results/aichi-2026/registrations/agent6-v3-rank1-baseline-public-seed-20261117.json` against branch `0d21006e`, retaining candidate and opponent policy identities. Inspect the opponent worker `simulation/evaluation/2026-11/agent6-rank1-shadow-rider-opponent-policy.cjs`, protocol `agent49-policy-protocol.cjs`, worker `agent49-policy-worker.cjs`, and runner `agent36-v3-runner.cjs` together.
2. Establish a fail-closed, actor-only diagnostic that distinguishes an uncaught policy exception, malformed decision/choice token, no admissible action, and worker transport failure **without publishing private actor-visible observations, hidden zones or raw choices**. The sanitized `WORKER_DECISION_FAILURE` code and message lengths 18/21 alone do not establish root cause.
3. Add deterministic regression coverage for both failing states. Correct the specific worker/policy defect, not the benchmark list, seed, role-seat assignments, deck, or paper rules. Do not insert a permissive fallback that silently degrades opponent play or relax isolation.
4. Since any code patch changes `GITHUB_SHA`, rerun same-SHA contract-only, four-cell no-game witness and then the exact registered fixture in that order. Stop if any gate fails; do not label a fixture diagnostic as competitive/paper-qualified.

**Next milestone:** one finished two-seat fixture with machine-readable outcomes and no worker failure. Only then examine independently reviewed playing competence; the full 32-opponent benchmark remains far beyond this diagnostic.
