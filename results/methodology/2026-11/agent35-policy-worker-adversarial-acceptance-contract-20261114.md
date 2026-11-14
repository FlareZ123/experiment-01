# Agent35 policy-worker adversarial acceptance contract

**Status: BLOCKED — no hosted OS-isolation canary has passed.** This contract is the acceptance boundary for the existing Docker worker path. It is not a second sandbox design or a fixture authorization.

## Purpose and scope

A V3 policy must make every strategic decision from its own information set while the host retains native Twinleaf state, physical randomization, prompt validation, action construction, legality checks and Store dispatch. The security claim is an OS-enforced process boundary, not an in-process argument convention.

The existing detached `actorObservation(state, seat)` is the base request view. It must be combined with a separately projected, actor-authorized prompt schema and bounded host-built action frontier. Never serialize native `State`/`Store`, a prompt object or validator closure, full-state diagnostics, `fullStateBefore`, `promptResolverContext`, hidden-zone object references, or engine objects.

## Required acceptance gates

### 1. Hosted runtime and effective isolation

- Use a currently supported Node LTS worker image, pinned by immutable digest and platform. Agent46's 14 Nov review identifies Node 20 as EOL and recommends checking Node 24.22.3 LTS first, with 22.23.5 as a fallback; verify permission behavior and the hostile canary against the exact pinned image. See [Node previous releases](https://nodejs.org/en/about/previous-releases), [Node EOL](https://nodejs.org/en/about/eol), and [Node 24.22.3](https://nodejs.org/en/blog/release/v24.22.3).
- The host records its `/proc/self/ns/{pid,ipc,uts,net,mnt}` namespace inode links. The worker reports its own links. Assert every required namespace differs from the host. Do not treat command-line flag presence as proof; the hosted Docker CLI rejected `--pid=private` in run 43570845995.
- The policy root and bundle are read-only; only a bounded tmpfs scratch directory is writable. Run as an unprivileged UID/GID, drop all capabilities, set no-new-privileges, and enforce PID, memory, CPU, file-descriptor and core-dump limits. Verify effective configuration, not only the intended argument list.
- The worker receives an allowlisted environment. No repository, Twinleaf, runner source, deck files, physical-seed files, private artifacts, Docker socket, host `/proc`, or host process filesystem is mounted.

### 2. Non-vacuous hostile capability canary

Run the same hostile policy in both physical-seat orientations. It may load Node built-ins; acceptance tests denied effects, not module resolution.

- Create readable mode-0444 host-only marker files for runner source, candidate deck, opponent deck, physical seed, and an opponent hidden-zone sentinel. Include their paths in the probe request. Every read must fail, and no marker contents may appear in stdout, stderr, artifacts or worker responses.
- Test host-network isolation against a host-gateway-reachable service, not host `127.0.0.1` alone. A container on the default bridge has its own loopback and would fail to reach host loopback even without `network=none`. A positive-control bridge probe should reach the service; the actual `network=none` worker must not.
- Probe host `/proc`, Docker socket, root writes, and host paths from the main worker, a child process and a worker thread. Child processes and threads must remain inside the same isolated mount/PID/network boundary or be denied by the Node Permission Model; the OS boundary remains primary.
- Keep the parent physical RNG sentinel installed while workers run. Verify the host's `Math.random` property remains the exact same function and can still be invoked by the host after worker exit. The worker must never receive the host function, seed, or engine closure. A zero call counter by itself is not evidence.
- The policy RNG seed sent over IPC is allowed only as an independently generated policy seed. Validate distinct effective xorshift states after canonicalization (including the 0 / 0x9e3779b9 alias); it must not be derived from the physical seed.

### 3. Persistent worker and lifecycle

- Start one persistent worker per role per game. Send at least two sequential NDJSON requests to the same container and receive both responses before exit. Assert stable worker PID, role, seat, protocol version and request order; do not respawn once per decision.
- The host request includes a unique request ID and monotonically increasing decision ordinal. The worker returns a matching ID and exactly one typed response. Reject stale, duplicate, malformed, unknown-token and out-of-order responses.
- Timeout, crash, malformed output, or container exit fails the game closed. It must not delegate to the in-process native AI or a full-State fallback.
- Killing the host Docker CLI is not sufficient cleanup: track each container by unique name/label and explicitly stop/remove it on timeout/error. Confirm no orphan remains.

### 4. Actor-safe request and native response validation

- Authenticate the pending prompt's player against the acting seat before building any request.
- Serialize only detached actor observation, actor-visible prompt choices, public prompt description, public event receipt when independently validated, public catalog/config, policy seed and bounded action frontier.
- Use stable opaque choice/action tokens. Keep native card objects, prompt validators and token-to-object mappings in the host. The worker returns only typed intent/opaque token; the host resolves it and runs the original native validator and Store legality checks before dispatch.
- Test both candidate-seat orientations and both roles. A policy must not see the opponent's concealed hand, deck order, face-down Prize identities, or an unchosen hidden prompt-choice set.
- Exercise root, setup, prompt continuation, fallback and all other strategic decisions through the worker. Physical shuffle/coin randomness and engine acknowledgements remain host-owned. A root-provider-only worker is insufficient.

### 5. CI and release evidence

- Reuse the existing Agent36 `contract_only` lane; do not create another workflow or add push-triggered work.
- A hosted run must pass on the exact reviewed main/PR head and exact image digest. Preserve the runtime preflight, effective namespace evidence, hostile canary report, two-request persistence receipts and cleanup result.
- A green canary establishes only the OS boundary. It does not establish policy competence, a complete native game, a matchup, paper legality, or competitive win rate.
- Keep the V3 fixture stopline in force until the canary, actor-safe IPC/native-validation integration, all-decision worker coverage, and the owner's separate physical-seed disclosure choice are complete.

## Current concrete blockers

1. Hosted run [43570845995](https://github.com/FlareZ123/experiment-01/actions/runs/43570845995) completed with 385/386 Node tests passing (one skipped), then failed in Docker preflight before the hostile canary. Docker rejected `--pid=private` with `invalid PID mode`. This is **not** a canary pass.
2. The current launcher also declares `clientVersion` / `serverVersion` but returns `dockerClientVersion` / `dockerServerVersion`, which are undefined after the namespace-argument failure is fixed.
3. The current host network probe targets host `127.0.0.1`, so it does not distinguish `network=none` from the default bridge. Host secret/seed marker files are mode 0600, making an accidental mount unreadable to UID 65532; the hidden-opponent sentinel is never written or probed.
4. The current canary creates a fresh container for each seat × permission mode and sends one request, so it does not test persistent workers. The current timeout kills the Docker CLI child but does not guarantee daemon-side container termination/removal.
5. The current canary does not compare effective host/worker namespace inode values. Its current pinned Node 20.19.0 image is not a supported LTS security baseline.
6. The production worker request/response protocol and the complete asynchronous fixture-loop integration are still pending. The current canary does not exercise actor prompt projection, typed intent, or host-side native prompt validation.

## Ownership boundary

Agent36 owns the Docker runtime and V3 fixture-loop integration. Agent44 owns the role composer and actor-observation/prompt review. Agent49's last available memory describes the Quick Ball prompt adapter, not a completed worker protocol; Agent44 has requested an explicit schema handoff or ownership transfer. Agent35 owns this adversarial acceptance contract and will review the converged implementation rather than fork the runtime or role composer.

**Disposition:** retain the current fixture stopline. No native game should be dispatched on the basis of the current Docker preflight or canary source alone.
