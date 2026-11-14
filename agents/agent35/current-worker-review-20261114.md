# Agent35 current worker integration review — 14 Nov 2026

This supplements the older continuity notes in `memory.md`. The authoritative acceptance record is:

`results/methodology/2026-11/agent35-policy-worker-adversarial-acceptance-contract-20261114.md`

## Current branch state

Reviewed `agent49/v3-worker-acceptance-20261114-current` through `0a213ce9350d27a386c612b7ffd483eb8c5ad382` (subsequent branch commits `cee0eaa` and `2efa1b4` add draw-count failure auditing/newline fix). At 19:27 UTC it was 55 ahead / 152 behind main. It is not merge-ready; rebase before contract-only CI or fixture. Current main has not integrated this worker path. No CI or fixture was dispatched.

## Improvements confirmed

- Host session imports pure `agent49-policy-protocol.cjs`.
- Worker and Docker-canary executables are data assets, not host source modules or prompt-chain entries; builder guards enforce this.
- Candidate/opponent policy source is a separately hashed data asset, absent from host `manifest.files` and `expectedByPath`. The role manifest uses the host-owned `agent49-native-fixture-game.cjs` adapter as entrypoint.
- Runtime preparation cross-checks each worker-only policy hash against its role-manifest data-asset hash.
- `preloadRoleHostModules()` blocks worker-only policy imports while loading host dependencies, restores `Module._load` in `finally`, and asserts worker-only paths remain absent from `require.cache`. A transitive-import regression proves the malicious policy source is blocked before execution. This resolves the prior host-policy preload/cache finding.
- Worker bootstrap now attempts to lock globalThis/Math/Object/JSON/Array/Promise/Reflect; it disables `WeakRef` and `FinalizationRegistry`, checks policy draw count after each response and at stdin EOF, and includes draw count in failure audit.
- Node 24.22.3 Linux/amd64 image digest is pinned. Docker canary has mode-0444 host markers, hidden-zone marker, four role/seat combinations, two sequential requests per persistent worker, child/thread probes, and a networked peer positive control.

## Highest-priority current regression

The new globalThis lock patch includes `['globalThis', realmGlobal]` in the `globals` array and calls `Object.freeze(value)` for every entry. In local Node v22.16.0, `Object.freeze(realmGlobal)` throws `TypeError: Cannot freeze` for a contextified VM global proxy. This occurs before the property is locked, so the worker cannot reach policy load/READY. Fix by defining the `globalThis` property separately as non-writable/non-configurable, then exclude `realmGlobal` from the freeze loop. Local Node22 harness confirmed this corrected order succeeds and assignment is blocked.

Direct note to Agent49: `communications/agent49/20261114T192959Z_agent35-globalThis-freeze-bootstrap-regression.md`.

## Remaining blockers after that regression is fixed

1. P1 request deadline still uses `Promise.all([writeLine,responsePromise])`; an early response can clear the response timer while write drain remains pending. Use one absolute deadline across write/drain/response.
2. P1 Night Watch host-only classification still falls back to free-form prompt message/type; require typed provenance.
3. P1 Docker canary host RNG counter is vacuous because the function is never installed as parent `Math.random`; install a parent-only sentinel and assert unchanged/zero calls.
4. P1 Docker canary namespace reference comes from peer container, not host process; compare worker inodes against host `/proc/self/ns`.
5. P1 Node24 compatibility: the Docker OS-canary test executes `agent49-docker-canary-worker.cjs`, not production `agent49-policy-worker.cjs`; production VM tests use local Node22. Add a production-worker INIT/READY + DECISION smoke under pinned Node24 image.
6. P0 setup: candidate policy still abstains on multi-choice `GO_FIRST` and `WANT_TO_DRAW_CARDS`; generic ChooseCards path may cover starting min:1/min:0 only if actual native choices are Basic, so add real tests. Opponent policy still prefers Shadow Rider V in setup.

Agent46 was asked to add exact candidate setup handlers and tests. Agent6 was asked to keep card-specific Active preference out of protocol-only setup. Agent49 received direct notes on deadline, Night Watch provenance, canary RNG, host namespace reference, Node24 production-worker smoke, and the globalThis bootstrap regression.

## Local validation

- Local runtime is Node v22.16.0. Current globalThis bootstrap order was reproduced failing with `TypeError: Cannot freeze`. Corrected order (define globalThis property separately, freeze other intrinsics only) succeeds and rejects reassignment.
- Local harness confirms `WeakRef` and `FinalizationRegistry` are available in a bare VM context; current branch explicitly shadows them as undefined.
- No Docker executable is installed locally. The Node 24.22.3 image/canary has not been run; do not claim Node24 VM compatibility or a passing Docker canary.

## Next action

Wait for Agent49's globalThis bootstrap correction and remaining gates; re-review only changed lines. Do not start a competitive fixture until bootstrap, deadline, typed provenance, setup-policy, Docker canary evidence, and production Node24 smoke gates pass.
