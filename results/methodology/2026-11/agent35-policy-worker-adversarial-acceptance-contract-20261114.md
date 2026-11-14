# Agent35 policy-worker adversarial acceptance contract

**Status: BLOCKED — no hosted OS-isolation canary has passed.** This contract is the acceptance boundary for the existing Docker worker path. It is not a second sandbox design or a fixture authorization.

## Purpose and scope

A V3 policy must make every strategic decision from its own information set while the host retains native Twinleaf state, physical randomization, prompt validation, action construction, legality checks and Store dispatch. The security claim is an OS-enforced process boundary, not an in-process argument convention.

The existing detached `actorObservation(state, seat)` is the base request view. It must be combined with a separately projected, actor-authorized prompt schema and bounded host-built action frontier. Never serialize native `State`/`Store`, a prompt object or validator closure, full-state diagnostics, `fullStateBefore`, `promptResolverContext`, hidden-zone object references, or engine objects.

## Required acceptance gates

### 1. Hosted runtime and effective isolation

- Use a currently supported Node LTS worker image, pinned by immutable digest and platform. Agent35 verified this candidate multi-platform index digest for the official image: `node:24.22.3-bookworm-slim@sha256:dc26ae92c9fb15cf6b1d63e20f0944b2efe0f115b20e00be48fb23fceb061c54`, with `--platform=linux/amd64`. This is a candidate only: verify the resolved image ID/RepoDigests, exact `node --version`, Node Permission Model behavior and hostile canary on the hosted runner before accepting it. Node 24.22.3 is the current LTS security release; Node 20 is EOL. Sources: [Node previous releases](https://nodejs.org/en/about/previous-releases), [Node EOL](https://nodejs.org/en/about/eol), [Node 24.22.3 release](https://nodejs.org/en/blog/release/v24.22.3), and [Docker Official Image tag listing](https://hub.docker.com/_/node/tags?name=bookwor&page=1).
- The host records its `/proc/self/ns/{pid,ipc,uts,net,mnt}` namespace inode links. The worker reports its own links. Assert every required namespace differs from the host. Do not treat command-line flag presence as proof; the hosted Docker CLI rejected `--pid=private` in run 43570845995.
- The policy root and bundle are read-only; only the explicitly bounded `/tmp` and `/dev/shm` tmpfs mounts may be writable. Run as an unprivileged UID/GID, drop all capabilities, set no-new-privileges, and enforce PID, memory, CPU, file-descriptor and core-dump limits. Verify effective configuration, not only the intended argument list.
- Set Docker shared memory explicitly to `--shm-size=16m` in both preflight and worker launch; do not rely on an implicit default shared-memory mount.
- The worker receives an allowlisted environment. No repository, Twinleaf, runner source, deck files, physical-seed files, private artifacts, Docker socket, host `/proc`, or host process filesystem is mounted.
- The Docker daemon must be local to the hosted runner. Reject nonempty `DOCKER_HOST` / `DOCKER_CONTEXT` overrides and verify the active Docker context endpoint is the local Unix socket. Do not forward user Docker context/TLS settings into the launcher: bind-mount sources are resolved on the daemon host, so a remote context changes the trust boundary.

### 2. Non-vacuous hostile capability canary

Run the same hostile policy in both physical-seat orientations. It may load Node built-ins; acceptance tests denied effects, not module resolution.

- Create readable mode-0444 host-only marker files for runner source, candidate deck, opponent deck, physical seed, and an opponent hidden-zone sentinel. Include their paths in the probe request. Every read must fail, and no marker contents may appear in stdout, stderr, artifacts or worker responses.
- Test host-network isolation against a host-gateway-reachable service, not host `127.0.0.1` alone. A container on the default bridge has its own loopback and would fail to reach host loopback even without `network=none`. A positive-control bridge probe should reach the service; the actual `network=none` worker must not.
- Probe host `/proc`, Docker socket, root writes, and host paths from the main worker, a child process and a worker thread. Child processes and threads must remain inside the same isolated mount/PID/network boundary or be denied by the Node Permission Model; the OS boundary remains primary.
- Keep the parent physical RNG sentinel installed while workers run. Verify the host's `Math.random` property remains the exact same function and can still be invoked by the host after worker exit. The worker must never receive the host function, seed, or engine closure. A zero call counter by itself is not evidence.
- **No seed-like field of any kind in argv, environment or IPC** until the owner explicitly resolves the seed-disclosure model. Do not add a `policyMarker` or other synthetic routing field; request ID, game ID, role, seat and decision ordinal are sufficient for routing. In the interim, use deterministic tie-breaking from visible request data or keep any experiment requiring randomized policy state blocked. Never pass the physical seed or a seed derived from it. If a separate policy RNG seed is later authorized, validate distinct effective xorshift states after canonicalization (including the 0 / 0x9e3779b9 alias).
- The worker's own ambient Node RNG is not a physical-RNG isolation control. The current Agent49 worker deliberately does not monkey-patch `Math.random`, `crypto`, WebCrypto, or `vm`; policy bundles must remain deterministic by source review and regression tests until an owner-approved policy-RNG model exists. Do not claim that the worker rejects all ambient entropy APIs. Physical-RNG noninterference is a host-process property: the engine's physical RNG function/stream must never be passed to or captured by the worker, and the host must verify it remains unchanged across worker calls.

### 3. Persistent worker and lifecycle

- Start one persistent worker per role per game, with a distinct role-only bundle root, policy version and digest for candidate and opponent. Never mount both role bundles into one process or reuse a shared worker. Send at least two sequential NDJSON requests to the same container and receive both responses before exit. Assert stable worker PID, role, seat, protocol version and request order; do not respawn once per decision.
- The production fixture loop must await worker decisions. Do not wrap that awaited loop in the current synchronous hooks: `withCandidateOpponentPolicyRoles` and `withPinnedResearchModuleLoads` reject thenables, `withFixtureScopedRolePin` asserts a synchronous callback, and `withOwnerQuickBallPromptContinuation` restores its temporary override in a synchronous `finally`. Remove same-process policy hooks from the worker path or redesign the required hooks as an explicit async lifecycle with awaited cleanup and concurrency-safe scope. Add a delayed-response regression proving role/seat routing remains correct and no temporary global hook escapes its intended scope.
- The host request includes a unique request ID and monotonically increasing decision ordinal. The worker returns a matching ID and exactly one typed response. Reject stale, duplicate, malformed, unknown-token and out-of-order responses.
- The host independently caps NDJSON line size, total bytes, message count, stdout/stderr accumulation and write queues, and enforces a finite per-request deadline. Worker-side limits do not bound host-side buffers.
- Require a finite default worker deadline; `timeoutMs=0` (currently the default) is not an acceptable production setting. A timeout or abnormal close must trigger explicit daemon-side container stop/removal, not only kill the local Docker CLI.
- Timeout, crash, malformed output, or container exit fails the game closed. It must not delegate to the in-process native AI or a full-State fallback.
- Killing the host Docker CLI is not sufficient cleanup: track each container by unique name/label and explicitly stop/remove it on timeout/error. Confirm no orphan remains.

### 4. Actor-safe request and native response validation

- Authenticate the pending prompt's player against the acting seat before building any request.
- Serialize only detached actor observation, actor-visible prompt choices, public prompt description, independently validated public event receipt, public catalog/config, and bounded action frontier. No seed-like field, RNG state, or randomization control may cross argv, environment, or IPC while the owner decision is pending.
- Use stable opaque choice/action tokens. Keep native card objects, prompt validators and token-to-object mappings in the host. The worker returns only typed intent/opaque token; the host resolves it and runs the original native validator and Store legality checks before dispatch.
- The host must verify the policy-bundle manifest and every file digest before launch, then compare the worker's READY digest against the locally expected digest. A worker echo of a supplied digest is not verification.
- Test both candidate-seat orientations and both roles. A policy must not see the opponent's concealed hand, deck order, face-down Prize identities, or an unchosen hidden prompt-choice set. The worker's structural schema is not itself proof of visibility: the host projector must not populate `opponentPublic.publicHand` or `opponentPublic.prizeSlots[].printing` unless those identities are actually public/revealed. Add both-seat sentinel tests that place hidden opponent hand and Prize identities in engine state and assert that neither reaches worker IPC.
- Treat omitted suppression state as **unknown**, not false. A decision that depends on a stateful Stadium/Tool-suppression effect must require a validated `publicTurnRestrictions.stadiumAndToolHaveNoEffectTurnsRemaining` or an equivalent source-attributed public projection; if unavailable, abstain. Static Stadium effects may be derived only from the public Stadium printing and public board under separately validated rules. If the optional per-Pokémon `abilitySuppressions` extension is used, require complete, source-attributed rows and abstain when the view is absent/incomplete. Prompt source classification and copied-attack provenance must come from trusted host-side typed effect provenance, never prompt-description text or worker-controlled fields; direct and copied Night Watch physical-random prompts remain host-side.
- Exercise root, setup, prompt continuation, fallback and all other strategic decisions through the worker. Physical shuffle/coin randomness and engine acknowledgements remain host-owned. A root-provider-only worker is insufficient. The existing synchronous role wrapper cannot await a worker Promise: the async fixture loop must own the await → native-neutral intent validation → host action construction → Store dispatch boundary. Keep the role composer as the single source of role/seat assignment, but version the worker audit separately; no in-process SimpleTacticsAi fallback.

### 5. CI and release evidence

- Reuse the existing Agent36 `contract_only` lane; do not create another workflow or add push-triggered work.
- A hosted run must pass on the exact reviewed main/PR head and exact image digest. Preserve the runtime preflight, effective namespace evidence, hostile canary report, two-request persistence receipts and cleanup result.
- A green canary establishes only the OS boundary. It does not establish policy competence, a complete native game, a matchup, paper legality, or competitive win rate.
- Keep the V3 fixture stopline in force until the canary, actor-safe IPC/native-validation integration, all-decision worker coverage, and the owner's separate physical-seed disclosure choice are complete.


## Added launcher regression

Agent35 added `tests/2026-11/agent35-docker-policy-worker-launcher-contract.test.cjs` and wired it into the existing manual `contract_only` lane before Docker preflight. It uses a fake Docker executable to check image/version metadata, supported namespace-default arguments, the constrained one-bundle mount, minimal container environment, and host secret/seed environment exclusion. It deliberately does not claim real container isolation.

The fake-launcher tests passed locally under Node v22.16.0 against a compliant stub before the latest shared-memory assertion was added. This validates the harness only; the repository's current Agent36 launcher was not executed by that stub, and no Docker daemon was available locally. The updated test is expected to fail against the current launcher until Agent36 updates the Node image, namespace arguments, preflight metadata, local-daemon checks and explicit `--shm-size=16m` bound.

## Current concrete blockers

1. Hosted run [43570845995](https://github.com/FlareZ123/experiment-01/actions/runs/43570845995) completed with 385/386 Node tests passing (one skipped), then failed in Docker preflight before the hostile canary. Docker rejected `--pid=private` with `invalid PID mode`. This is **not** a canary pass.
2. The current launcher also declares `clientVersion` / `serverVersion` but returns `dockerClientVersion` / `dockerServerVersion`, which are undefined after the namespace-argument failure is fixed.
3. The current host network probe targets host `127.0.0.1`, so it does not distinguish `network=none` from the default bridge. Host secret/seed marker files are mode 0600, making an accidental mount unreadable to UID 65532; the hidden-opponent sentinel is never written or probed. The current Agent36 canary source still names its request field `policySeed` and echoes it in the response, despite the seed-free direction. Rename this non-RNG routing marker to `policyMarker` and remove the production launcher comment that says a policy seed must be sent over IPC.
4. The current canary creates a fresh container for each seat × permission mode and sends one request, so it does not test persistent workers. The current timeout kills the Docker CLI child but does not guarantee daemon-side container termination/removal.
5. The current canary does not compare effective host/worker namespace inode values. Its current pinned Node 20.19.0 image is not a supported LTS security baseline. Agent44's local unshare canary now passes two sequential requests for each seat and permission mode, but it is local-only and does not prove the hosted Docker boundary.
6. The current canary still sends a `policySeed`-named field even though the owner decision is pending and the seed-free direction is explicit. `dockerEnvironment()` forwards DOCKER_HOST, DOCKER_CONTEXT, DOCKER_CONFIG, DOCKER_CERT_PATH and DOCKER_TLS_VERIFY without proving a local daemon. `spawnDockerPolicyWorker()` defaults to `timeoutMs=0` (unbounded) and only kills the CLI child on timeout. Agent49's standalone schema-v2 worker and protocol tests now exist (5/5 local test groups reported), but the protocol test is not in `contract_only` and the worker is not connected to Agent36's host decision loop. The current canary does not exercise actor prompt projection, typed intent, or host-side native prompt validation.

## Ownership boundary

Agent36 owns the Docker runtime, V3 async fixture-loop integration, host actorObservation projection, pending-prompt routing, and native action validation/dispatch. Agent44 is review-only for role/seat composition, actor-view and prompt-schema correctness, and physical-random prompt provenance. Agent49 owns the standalone worker protocol/schema and its tests, but not the host integration. Agent35 owns this adversarial acceptance contract and reviews the converged path rather than forking the runtime, projection or role composer.

**Disposition:** retain the current fixture stopline. No native game should be dispatched on the basis of the current Docker preflight or canary source alone.
