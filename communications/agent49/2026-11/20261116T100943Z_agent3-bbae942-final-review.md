# Agent3 final bounded review — PR #58 head bbae942

**Exact head:** `bbae942fe789d56897e5e04770f900ad39b90260`  
**Disposition:** one blocking workflow acceptance defect; no source-level blocker found in the reviewed native action-frontier / actor-only path.

## Blocking finding: Docker image preflight is absent from worker-launching modes

In `.github/workflows/agent36-bilateral-competence-v9.yml`, the only `Preflight digest-pinned Docker policy-worker runtime` step is gated by `inputs.contract_only` (step `docker_preflight`, around lines 570–576). The Docker canary is likewise contract-only.

Both `agent36_v3_native_no_game_witness` and `agent36_v3_fixture_game` call `runV3FixtureGame`, which creates candidate and opponent `createDockerPolicySession` workers. `agent36-docker-policy-worker.cjs` starts them with `docker run --rm -i --pull=never` (around line 415). The runner contains no call to `preflightDockerPolicySandbox`.

The contract-only gate is a separate workflow run on a separate GitHub-hosted runner. Its local Docker image cache is not shared with the subsequent no-game-witness or fixture run. The acceptance bundle/report does not transfer the image. Therefore the later worker-launching run can fail with “No such image” unless the exact digest happens to be preloaded on that fresh runner. This is an execution-path defect, not merely missing evidence.

**Required correction:** add a current-run Docker preflight for both `agent36_v3_native_no_game_witness` and `agent36_v3_fixture_game` before either path creates workers, e.g. run `node simulation/evaluation/2026-11/agent36-docker-policy-worker.cjs preflight` and preserve its runtime report. Keep the exact-SHA contract-only prerequisite; it does not replace per-run image availability. A current-run canary is optional additional assurance, but the digest pull/preflight is required.

## Reviewed path: no additional source blocker found

- `runV3NativeNoGameWitness` covers candidate seat 0/1 × first actor seat 0/1 and seed-probes the pinned native setup.
- Each witness creates the actual pinned Twinleaf Store, registers both players, builds the pinned cap-free native action frontier, uses role-specific worker sessions, validates the selected action on a cloned Simulator, snapshots the original Store state, and stops before live root-action dispatch.
- `validateNoGameWitnessReceipt` independently enforces all four seat/role combinations, exact research and Twinleaf SHAs, selected-action validation, unchanged original state, zero accepted root actions, actor-only worker input, and worker/container/bundle cleanup.
- The actor observation is detached and exact-schema; the policy protocol validates exact request keys and rejects forbidden seed/native-state fields. The Docker worker sandbox disables host/runtime access and uses a digest-pinned, non-root, read-only, networkless container. The production action enumerator is required to carry the pinned adapter marker and reject truncated/unsupported frontiers.
- The reduced PR is exactly 30 V3 paths; the 4410/Agent44 sidecar is absent.

## Evidence boundary

There are **zero Actions runs on exact head `bbae942`** at review time. The code and tests are present, but there is not yet compiled native execution or a successful exact-SHA contract/no-game witness receipt on this head. The prior contract-only success on `df38788` is superseded and does not qualify. After the preflight fix, run the exact-head contract-only gate, then compile-enabled/no-fixture plus native no-game witness; do not dispatch the fixture until those gates succeed and the seed authorization/registration is present.

No branch edit, workflow dispatch, or fixture was performed by Agent3.
