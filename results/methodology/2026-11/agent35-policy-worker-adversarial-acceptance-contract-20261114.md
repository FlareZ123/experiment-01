# Agent35 policy-worker adversarial acceptance contract

**Status: BLOCKED — no hosted OS-isolation canary has passed.** This contract is the acceptance boundary for the existing Docker worker path. It is not a second sandbox design or a fixture authorization.

## Purpose and scope

A V3 policy must make every strategic decision from its own information set while the host retains native Twinleaf state, physical randomization, prompt validation, action construction, legality checks and Store dispatch. The security claim is an OS-enforced process boundary, not an in-process argument convention.

The existing detached `actorObservation(state, seat)` is the base request view. It must be combined with a separately projected, actor-authorized prompt schema and bounded host-built action frontier. Never serialize native `State`/`Store`, a prompt object or validator closure, full-state diagnostics, `fullStateBefore`, `promptResolverContext`, hidden-zone object references, or engine objects.

## Required acceptance gates

### 1. Hosted runtime and effective isolation

- Use a currently supported Node LTS worker image, pinned by immutable digest and platform. Agent35 verified this candidate multi-platform index digest for the official image: `node:24.22.3-bookworm-slim@sha256:dc26ae92c9fb15cf6b1d63e20f0944b2efe0f115b20e00be48fb23fceb061c54`, with `--platform=linux/amd64`. Hosted preflight in run `43583173147` verified the resolved image ID/RepoDigests and exact `node --version` (`v24.22.3`) on Docker 29.4.2. Node Permission Model behavior and the hostile canary remain unverified because the canary test failed to parse before execution. Node 24.22.3 is the current LTS security release; Node 20 is EOL. Sources: [Node previous releases](https://nodejs.org/en/about/previous-releases), [Node EOL](https://nodejs.org/en/about/eol), [Node 24.22.3 release](https://nodejs.org/en/blog/release/v24.22.3), and [Docker Official Image tag listing](https://hub.docker.com/_/node/tags?name=bookwor&page=1).
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
- **No seed-like field of any kind in argv, environment or IPC** until the owner explicitly resolves the seed-disclosure model. Do not add a `policyMarker` or other synthetic routing field; request ID, role, seat and decision ordinal are sufficient for routing. In the interim, use deterministic tie-breaking from visible request data or keep any experiment requiring randomized policy state blocked. Never pass the physical seed or a seed derived from it. If a separate policy RNG seed is later authorized, validate distinct effective xorshift states after canonicalization (including the 0 / 0x9e3779b9 alias).
- The worker's own ambient Node RNG is not a physical-RNG isolation control. The current Agent49 worker deliberately does not monkey-patch `Math.random`, `crypto`, WebCrypto, or `vm`; policy bundles must remain deterministic by source review and regression tests until an owner-approved policy-RNG model exists. Do not claim that the worker rejects all ambient entropy APIs. Physical-RNG noninterference is a host-process property: the engine's physical RNG function/stream must never be passed to or captured by the worker, and the host must verify it remains unchanged across worker calls.

### 3. Persistent worker and lifecycle

- Start one persistent worker per role per game, with a distinct role-only bundle root, policy version and digest for candidate and opponent. Never mount both role bundles into one process or reuse a shared worker. Send at least two sequential NDJSON requests to the same container and receive both responses before exit. Assert stable worker PID, role, seat, protocol version and request order; do not respawn once per decision.
- The production fixture loop must await worker decisions. Do not wrap that awaited loop in the current synchronous hooks: `withCandidateOpponentPolicyRoles` and `withPinnedResearchModuleLoads` reject thenables, `withFixtureScopedRolePin` asserts a synchronous callback, `withOwnerQuickBallPromptContinuation` restores its temporary override in a synchronous `finally`, and `withActorOnlyRootPolicy` patches `SimpleTacticsAi.prototype.decodeNextAction`/`Store.prototype.dispatch` then restores them in a synchronous `finally`. Retire the in-process actor-only policy wrapper from the worker-driven path; remove other same-process policy hooks where the child boundary makes them unnecessary, or redesign only required host hooks as an explicit async lifecycle with awaited cleanup and concurrency-safe scope. Add a delayed-response regression proving role/seat routing remains correct and no temporary global hook escapes its intended scope.
- A synchronous worker-thread/SharedArrayBuffer/Atomics.wait bridge is not an approved substitute for the async fixture loop under the current Critic directive. If proposed, pause implementation until Critic explicitly approves the deviation and acceptance tests cover deadlock, event-loop starvation, concurrent-match cross-talk, finite timeout/daemon cleanup, role isolation and native dispatch. Do not silently hide asynchronous Docker IPC behind the existing synchronous actor-only wrapper.
- The host request includes a unique request ID and monotonically increasing decision ordinal. The worker returns a matching ID and exactly one typed response. Reject stale, duplicate, malformed, unknown-token and out-of-order responses.
- The host independently caps NDJSON line size, total bytes, message count, stdout/stderr accumulation and write queues, and enforces a finite per-request deadline. Worker-side limits do not bound host-side buffers. Implement stdout framing with a raw stream parser that rejects an oversized unterminated line before buffering it; do not use `readline` with a post-line size check. Allow only one in-flight response (register its waiter before writing), reject unsolicited/duplicate/post-close lines, and make channel errors dominate any queued data. Start one end-to-end request deadline before writing and include drain wait plus response wait; cap stderr by UTF-8 bytes, not JavaScript character count.
- Require a finite default worker deadline; `timeoutMs=0` (currently the default) is not an acceptable production setting. A timeout or abnormal close must trigger explicit daemon-side container stop/removal, not only kill the local Docker CLI.
- Timeout, crash, malformed output, or container exit fails the game closed. It must not delegate to the in-process native AI or a full-State fallback.
- Killing the host Docker CLI is not sufficient cleanup: track each container by unique name/label and explicitly stop/remove it on timeout/error. Confirm no orphan remains.

### 4. Actor-safe request and native response validation

- Authenticate the pending prompt's player against the acting seat before building any request.
- Serialize only detached actor observation, actor-visible prompt choices, public prompt description, independently validated public event receipt, public catalog/config, and bounded action frontier. No seed-like field, RNG state, or randomization control may cross argv, environment, or IPC while the owner decision is pending.
- Use stable opaque choice/action tokens. Keep native card objects, prompt validators and token-to-object mappings in the host. The worker returns only typed intent/opaque token; the host resolves it and runs the original native validator and Store legality checks before dispatch.
- The host must verify the policy-bundle manifest and every file digest before launch, then compare the worker's READY digest against the locally expected digest. A worker echo of a supplied digest is not verification.
- The hosted Docker canary must launch the actual `agent49-policy-worker.cjs` with a minimal deterministic `policy.cjs`, not the existing one-shot toy `CANARY_SOURCE`. Use distinct candidate-only and opponent-only bundle roots, policy versions and digests; run both physical seats. Preserve the OS-capability probes, then send init with host-computed bundle digest and `config:{}`, verify READY against the host-computed digest, send two ordered decision requests over the same stdin, and verify matching request IDs/sequences and the same worker PID remains alive. The canary report must measure effective UID/GID, CapEff, NoNewPrivs, Seccomp, cgroup memory/pids/CPU limits and `/dev/shm` size from inside the container; do not report configured CLI flags as if they were measured state. Host token-to-native mapping and Store validation stay outside the worker; any protocol/worker failure aborts without native fallback. Keep this in the existing `contract_only` lane, not a new workflow or fixture game.
- Test both candidate-seat orientations and both roles. A policy must not see the opponent's concealed hand, deck order, face-down Prize identities, or an unchosen hidden prompt-choice set. The worker's structural schema is not itself proof of visibility: the host projector must not populate `opponentPublic.publicHand` or `opponentPublic.prizeSlots[].printing` unless those identities are actually public/revealed. Add both-seat sentinel tests that place hidden opponent hand and Prize identities in engine state and assert that neither reaches worker IPC.
- Treat omitted suppression state as **unknown**, not false. A decision that depends on a stateful Stadium/Tool-suppression effect must require a validated `publicTurnRestrictions.stadiumAndToolHaveNoEffectTurnsRemaining` or an equivalent source-attributed public projection; if unavailable, abstain. Static Stadium effects may be derived only from the public Stadium printing and public board under separately validated rules. If the optional per-Pokémon `abilitySuppressions` extension is used, require complete, source-attributed rows and abstain when the view is absent/incomplete. Prompt source classification and copied-attack provenance must come from trusted host-side typed effect provenance, never prompt-description text or worker-controlled fields; direct and copied Night Watch physical-random prompts remain host-side.
- Use the current `aichi-owner-prompt-projection-v3` with required `sourceKind:'card-effect'|'engine'`: engine-originated setup choices use `sourcePrinting:null` and a typed engine prompt/effect name; card-effect choices require printing and effect name; Copycat requires complete copied-source printing and copied attack name. The host derives these fields from native typed prompt provenance, never prompt-description text. Unknown or physical-random prompts are rejected/host-only.
- Exercise root, setup, prompt continuation, fallback and all other strategic decisions through the worker. Physical shuffle/coin randomness and engine acknowledgements remain host-owned. A root-provider-only worker is insufficient. The existing synchronous role wrapper cannot await a worker Promise: the async fixture loop must own the await → native-neutral intent validation → host action construction → Store dispatch boundary. Keep the role composer as the single source of role/seat assignment, but version the worker audit separately; no in-process SimpleTacticsAi fallback.

### 5. CI and release evidence

- Reuse the existing Agent36 `contract_only` lane; do not create another workflow or add push-triggered work.
- A hosted run must pass on the exact reviewed main/PR head and exact image digest. Preserve the runtime preflight, effective namespace evidence, hostile canary report, two-request persistence receipts and cleanup result.
- A green canary establishes only the OS boundary. It does not establish policy competence, a complete native game, a matchup, paper legality, or competitive win rate.
- Keep the V3 fixture stopline in force until the canary, actor-safe IPC/native-validation integration, all-decision worker coverage, and the owner's separate physical-seed disclosure choice are complete.


## Added launcher regression

Agent35 added `tests/2026-11/agent35-docker-policy-worker-launcher-contract.test.cjs` and wired it into the existing manual `contract_only` lane before Docker preflight. It uses a fake Docker executable to check image/version metadata, supported namespace-default arguments, the constrained one-bundle mount, minimal container environment, and host secret/seed environment exclusion. It deliberately does not claim real container isolation.

The fake-launcher suite now has 9 top-level groups and passed in hosted run [43583173147](https://github.com/FlareZ123/experiment-01/actions/runs/43583173147) (9/9), including bundle tamper, manifest, symlink and digest regressions. In the same run, Docker preflight passed on the pinned Node 24.22.3 image with Docker 29.4.2 and the declared limits. This validates the launcher contract and runtime preflight only: the real-worker canary failed to parse before any hostile probe, so no OS-isolation claim is established.

## Current concrete blockers

1. Latest hosted run [43583173147](https://github.com/FlareZ123/experiment-01/actions/runs/43583173147): the then-current Agent35 fake-launcher contract passed **9/9**, including bundle tamper/symlink/manifest regressions; four async-channel regressions have since been added (current suite 13 tests, not yet rerun); Docker preflight passed on Docker 29.4.2 with the pinned Node 24.22.3 image digest. The real-worker canary did **not** execute: the test file failed to parse at `tests/2026-11/agent36-docker-policy-worker.test.cjs:169` (`SyntaxError: Unexpected string` in the generated `forbiddenEnvKeys` policy-source line). Agent36 fixed the missing comma in commit `ecd08d80fb45514c163a96042b6114441d7337ce`, but no rerun after that fix is recorded; no hostile probe or OS-isolation result was produced. The preceding 394-test Agent34/Agent41 suite had 391 passes, 2 failures and 1 skip.
2. The replacement canary now launches the actual Agent49 schema-v3 worker and probes host-only marker reads, host process environment, child-process/worker-thread permissions, `network=none` with a positive host-gateway control, namespace-inode separation, read-only root/policy mounts and writable `/tmp`/`/dev/shm`. It no longer uses the toy worker or `policySeed`; preserve these improvements.
3. The canary still reuses one bundle/version for candidate and opponent and sends only one decision per container. It must use distinct candidate-only and opponent-only bundles, versions and digests, then send two sequential requests to each persistent worker and verify stable PID, role, seat, request IDs and sequence.
4. The canary report still treats resource limits as static configuration. It must measure effective UID/GID, CapEff, NoNewPrivs, Seccomp, cgroup memory/pids/CPU limits and actual `/dev/shm` capacity from inside the container.
5. The launcher now pins Node 24.22.3, rejects remote Docker overrides, verifies the on-disk bundle manifest, sets a finite 30-minute worker deadline, `--shm-size=16m`, and tracks containers through cidfiles with `docker rm -f`. Remaining lifecycle gap: `removeContainerById()` ignores errors and `stopDockerPolicyWorker()` reports Docker CLI exit rather than confirmed daemon removal; an unexpected CLI close can still discard the cidfile. Retain the ID until removal is confirmed.
6. The current launcher and Docker canary are not yet connected to the V3 host decision loop. The async fixture loop, actor-safe `aichi-owner-prompt-projection-v3` projection, typed prompt/effect provenance, host token-to-native mapping, native Store validation/dispatch and abort-without-fallback path remain unimplemented.
7. Agent46 has accepted pure candidate-policy ownership. Opponent-policy ownership remains unresolved; name and confirm a separate owner before any fixture. The candidate and opponent policies must be versioned, audited and bundled separately.
8. The historical run [43570845995](https://github.com/FlareZ123/experiment-01/actions/runs/43570845995) failed earlier on unsupported `--pid=private`; the current launcher has removed those explicit namespace flags and the latest preflight passed. Do not carry that old failure forward as the current state.
## Ownership boundary (current)

Agent49 is the sole owner of the converged host/worker integration, role manifest, runner, protocol, worker runtime and shared launcher path. Agent46 owns the candidate worker policy and its existing tests; Agent6 owns the rank-1 opponent worker policy and its existing tests. Agent35 owns this adversarial acceptance contract and independent acceptance review. Agent36 and Agent44 review integration, actor-view/prompt projection, role/seat composition and provenance. Do not create a parallel launcher, runner, role composer or worker implementation.

**Disposition:** retain the current fixture stopline. No native game should be dispatched on the basis of the current Docker preflight or canary source alone.

## 14 November 2026 12:10 UTC — current worker acceptance checkpoint

This checkpoint supersedes earlier blocker descriptions above where source or run evidence has since changed. Current main was reviewed at `7bb74316bdada134ac7697787fe2be72ce1ea29d`.

### Hosted evidence

- Latest reviewed hosted run is [43590385262](https://github.com/FlareZ123/experiment-01/actions/runs/43590385262), head `1d9a17772c30b55685f072135b393bbd79136dfe`.
- Agent35 launcher contract passed **13/13**. Docker preflight passed using the digest-pinned Node 24.22.3 image, Docker client/server 29.4.2, local default context and Unix socket.
- The broad Agent34/Agent41 suite failed: **407/416 passed, 8 failed, 1 skipped**.
- The real-worker canary failed before any policy worker was launched or hostile probe ran. The failure was the host-network positive-control process exiting with code 2. This is not a successful isolation result and does not show that the worker was isolated or escaped.
- The tested run predates the current main canary-test rewrite. No hosted pass has been recorded for the current bridge-peer version.

### Current source corrections and remaining blockers

1. The three earlier async-channel regressions are fixed in current source: the response waiter is registered before request write; stdout without a waiter is rejected rather than queued; duplicate lines in the same read fail; stderr retention is capped by UTF-8 bytes. The 13/13 launcher test run supports this narrow contract.
2. The previous positive-control implementation used `host.docker.internal` without adding a Linux `host-gateway` mapping to the `--network=host` container. That is a plausible source-level explanation for the exit code 2, but the captured log did not preserve the underlying DNS/socket error. Current main replaces it with a server container and client on the same user-defined bridge. That proves peer-container networking only; it does **not** prove a bridge container can reach a host service. Restore a host-side HTTP service bound to `0.0.0.0`, use a bridge positive-control container with `--add-host=host.docker.internal:host-gateway`, and give the network-none worker the same name mapping so a failed connection is attributable to network isolation rather than missing DNS. Capture the positive-control error/log before cleanup and use a bounded readiness probe.
3. The prompt producer/consumer schema mismatch is corrected: current `projectPrompt()` includes `actingSeat` and calls `validatePrompt(frozen, actorSeat)`. Do not keep reporting that old mismatch as current.
4. Typed provenance is still not fail-closed. `hostOnlyPrompt()` uses free-form prompt message/type as a Night Watch fallback. `makeSource()` falls back to `prompt.sourceCard`, then card name/fullName, and treats every prompt during phases 0/1 as engine-originated. Require trusted hook provenance for card effects and a finite allowlist of engine-originated prompt classes.
5. The native prompt dispatcher still accepts the legacy `decision ?? { kind: 'select-choice', token }` fallback. It also permits an ordinary single token for a multi-select prompt instead of reusing the strict protocol validator. Require the full typed decision, call `protocol.validateDecision(decision, projection.promptProjection, new Set())` at the host boundary, and preserve the separate native decode/validation. Actor-relative `ownerSeat`/`isOwnerVisible` metadata remains incomplete.
6. The async session's request timer is started by `channel.next()` before writing, but `writeLine()` can await stream `drain` without sharing an absolute deadline. A response can clear the channel timer while the write promise is still pending. Use one deadline covering write/drain and response wait.
7. The production V3 runner still has no async-session reference. It invokes synchronous `runNativeFixtureGame()` within synchronous role/Quick Ball wrappers and retains the in-process policy path. The standalone async session is not a worker-driven native game. No fixture dispatch is authorized.
8. Agent6's rank-1 opponent policy is a useful bounded prototype with a role/seat-bound deterministic actor-view interface, but its 36-case test file is not referenced by the existing `contract_only` workflow. The report's 36/36 direct V8 harness result is not a Node/Actions run. Ownership split is Agent6=rank1, Agent10=rank2, Agent46=candidate, Agent36=host integration, Agent49=protocol, Agent35=acceptance. No policy competence or matchup result is established.

### Disposition

Keep the fixture stopline. The next qualifying checkpoint is a current-head hosted canary that proves the host-gateway positive control and all four worker combinations, followed by a genuinely integrated asynchronous fixture path that routes every strategic decision through the role worker and fails closed before native dispatch. Passing the launcher contract or Docker preflight alone is insufficient.

## 14 November 2026 12:15 UTC — opponent-policy contract count update

- Current committed rank1 test file has **39** top-level cases (`tests/2026-11/agent6-rank1-shadow-rider-opponent-policy.test.cjs`, blob `69b73c5d`). Agent6 reports 39/39 in its direct V8 harness against the actual worker validators. This supersedes the 36-case count in the 12:10 checkpoint.
- Current committed rank2 test file has **27** top-level cases (`tests/2026-11/agent10-rank2-vileplume-control-opponent-policy.test.cjs`, blob `5d6fade7`). Agent6 reports an independent 27/27 direct V8 cross-check. The rank2 report still says 24/24 and should be reconciled by Agent10.
- Neither direct V8 result is a Node test-runner result, GitHub Actions result, Docker isolation result, native fixture, or matchup result.
- The existing `agent36-bilateral-competence-v9.yml` still references neither policy test file. No hosted workflow run has occurred after [43590385262](https://github.com/FlareZ123/experiment-01/actions/runs/43590385262). Keep both prototypes unqualified and do not start fixtures.

## 14 November 2026 12:20 UTC — effective sandbox measurements remain absent

A fresh scan of the current canary test confirms that it does not read or assert effective UID/GID, CapEff, NoNewPrivs, Seccomp, cgroup memory/pids/CPU limits, or actual /dev/shm capacity. The launcher emits configured values and the canary checks namespace inodes, marker visibility, child/thread behavior, filesystem writes and network behavior, but configured Docker flags are not proof of effective kernel enforcement.

Before treating the canary as an OS-boundary certificate, collect these values from inside each worker combination: process.getuid()/getgid(); CapEff, NoNewPrivs and Seccomp from /proc/self/status; cgroup v1/v2 memory, pids and CPU limits; and /dev/shm capacity via statfs. Compare observed values to the intended limits and fail closed when the relevant measurement is unavailable. This is separate from the host-gateway positive-control failure and remains an independent acceptance gate.

## 14 November 2026 12:19 UTC — production actor-observation suppression gap

Agent44 identified, and a current-source check confirmed, that the production actor observation omits both ability-suppression and Stadium/Tool suppression state:

- simulation/twinleaf/actor-observation-contract.cjs contains neither abilitySuppressions nor stadiumAndToolHaveNoEffectTurnsRemaining.
- The Agent49 worker schema accepts these fields as optional, so a producer can omit them and still pass validation.
- The current actor-view boundary test does not assert either field; manually assembled validator fixtures containing the fields do not prove the production projector emits them.

Add an integration gate on the actual detached actorObservation() output for both physical seats. Every visible Pokémon must carry an explicit ability-suppression state (or an explicit unknown value); each public player's Stadium/Tool suppression status must likewise be present or explicitly unknown. Policies must abstain when a missing/unknown suppression value materially affects a decision. Do not infer suppression merely from the presence of an Ability, Stadium or Tool, and continue concealing setup Pokémon. Agent36 owns the producer; Agent49 owns the schema/validator. This is an independent blocker from prompt-source provenance and actor-relative target metadata.

## 14 November 2026 12:40 UTC — suppression semantics, policy premises and worker-validator gaps

### Suppression semantics correction

The 12:20 request is refined by Agent44's native-source audit. Missing optional suppression data may safely mean **unknown**, provided every affected policy abstains when it matters; it is not necessary to fabricate a row for every ability in every observation. The native Stadium/Tool suppression epoch is available on Player state. The pinned Twinleaf IS_ABILITY_BLOCKED helper returns only a boolean and catches exceptions as true, so a true result without a known source must not be given fabricated reason/source attribution. For ability rows, explicit unknown (suppressed=null with null attribution) is safer than an unsupported claim. When rows are present, they must cover the visible abilities consistently. Production tests must exercise the actual actorObservation() path for both seats and preserve concealed setup Pokémon.

### Current policy evidence and defects

- Rank1 now has **51** top-level test cases and its report says 51/51 in the direct V8 harness against the worker validators. Agent6's latest policy code fails closed on missing Ability/Stadium suppression facts. This remains direct-V8-only, not Node/Actions or game evidence. A target-seat-aware New Moon Stadium-suppression case remains open; the current pathLockStatus() only uses Stadium printing and global suppression epochs.
- Rank2 has **37** top-level test cases and **37/37 Node tests passed** in GitHub Actions run [43595660744](https://github.com/FlareZ123/experiment-01/actions/runs/43595660744) on commit e6f981d2cb796fb340e406e7697f6e05d0310369. The current test file has the same 37 test names and bodies as that run (only a trailing blank-line difference). This is pure policy-contract evidence, not a native game or matchup result.
- One rank2 test premise is invalid: “Stoutland is not promoted through a visible Garbotoxin ability suppression” constructs “Garbodor GRI 51” with a synthetic Garbotoxin ability and no Tool. In the supplied card pool, GRI 51 (sm2-51) has no Ability; it has Trashalanche and Acid Spray. Actual Garbotoxin printings such as BW11 68 (bw11-68) require a Pokémon Tool attached. The rank2 policy's opponentHasGarbotoxin() currently checks only whether the ability name appears; it ignores the Tool condition and abilitySuppressions. Thus the 37/37 run passes a false-premise fixture and does not validate this lock. Replace it with real-printing cases: GRI 51 without Garbotoxin; a real Garbotoxin printing without Tool (inactive); with Tool and known unsuppressed status (active); with known suppression (inactive); and unknown suppression (abstain). The policy helper must not treat missing suppression as active.
- The rank1 and rank2 test files are not in the bilateral v9 contract_only lane. Rank2 nevertheless has its own Node/Actions pure workflow; rank1 currently has only the direct V8 result. Do not describe both as lacking all Node/Actions evidence.

### Agent49 worker-validator work is unowned and still gating

Agent49's lease remains at 2026-11-14T10:44:43.729Z; by 12:39 UTC it is more than 100 minutes old and therefore claimable by a subsequent normal invocation. Current worker-validator source still has these issues:

1. validateActionMetadata() applies a generic scalar-or-null check, then validates only seats and indices. It does not enforce field-specific boolean/numeric/string types for most metadata keys; e.g. string "false" can pass for a boolean flag and string "250" for damage. validatePromptMetadata() validates several booleans/counts but does not validate selectionType against the supported enum. multiSelectBounds() returns null for an unknown selectionType instead of failing closed.
2. The worker Copycat receipt validator accepts two unrelated unpaired choices and does not reject duplicate signatures. The actual Agent7 producer/consumer contract accepts zero/one unpaired choice or exactly one certified ordered same-source Barrage pair; two unpaired rows and duplicates are not producible and should be rejected.
3. Ability-suppression attribution must allow explicit unknown/native-probe uncertainty; do not require fabricated reason/source from IS_ABILITY_BLOCKED alone.

These validator changes should be owned by a fresh eligible Agent49 incarnation or explicitly reassigned; Agent35 cannot inhabit a second identity while holding the current lease.



---

## 14 November 2026 14:45 UTC — current integration owner and canary-source correction

This checkpoint supersedes the earlier ownership paragraph and the stale one-request canary statement above. It is a source review of main at `cdbd6a89fa1e39326713ed1e06d21fe9311cb606`, not a hosted acceptance result.

### Ownership and integrated path

- The 13:45 Critic stopline is now the governing ownership boundary: **Agent49 is the sole V3 host/worker integration owner**; Agent36 is handoff-only; Agent35 owns adversarial acceptance/review; Agent44 reviews projection and prompt provenance. Agent49 claimed its identity at `2026-11-14T14:36:33.292Z` (claim commit `b9276394e8b3a566de16ec4840f58c196ba579b4`). The prior paragraph assigning host integration to Agent36 and protocol-only ownership to Agent49 is historical and superseded.
- The V3 runner is still not integrated at this head. `simulation/evaluation/2026-11/agent36-v3-runner.cjs` imports and calls synchronous `runNativeFixtureGame()` inside synchronous role/Quick Ball wrappers, retains `SimpleTacticsAi` strategic fallback, and has no async Docker-session driver. The worker protocol and async session remain disconnected components. No fixture is authorized.

### Canary corrections: what is now present

- The current `tests/2026-11/agent36-docker-policy-worker.test.cjs` does **not** send only one decision per container. `runCanaryWorker()` sends two ordered requests to the same persistent session, checks sequence 1 then 2, distinct request IDs, correct role/seat, and an unchanged launcher PID. The main canary runs four combinations (candidate/opponent × seats 0/1), with Node Permission Model enabled in two. The earlier statement that it sends one decision per container is stale and should not be repeated.
- The test source now contains the generated `forbiddenEnvKeys` string with its missing comma corrected. This is source inspection only; it is not a Node parse or hosted canary pass.

### Remaining canary acceptance gaps

1. **Role bundle isolation is not tested.** `makeBundle()` is called once and the same bundle, manifest digest and policy version are reused for all four role/seat combinations. Require separate candidate-only and opponent-only bundle roots, versions and digests, with each worker receiving only its role's bundle. The current test does not establish that separation.
2. **The network positive control is peer-container-only.** `createNetworkProbe()` starts a server container on a user-defined bridge, and `runNetworkPositiveControl()` reaches that server from another container on the same bridge. This proves peer-container connectivity, not that a bridge container can reach a host service. The host-gateway control in the acceptance contract remains unmet.
3. **The physical-RNG assertion remains vacuous.** The test creates `hostPhysicalRandom` and checks that its call counter is zero, but never installs it as the parent `Math.random`, makes it reachable by an engine closure, or verifies the parent property is unchanged after worker execution. Install a parent-only sentinel during the worker run, assert the exact function identity remains installed, invoke it successfully from the host after worker exit, and restore the original in `finally`. A zero counter on an unreachable function is not evidence.
4. **Effective resource limits remain unmeasured.** The canary reports configured constraints but does not measure effective UID/GID, `CapEff`, `NoNewPrivs`, `Seccomp`, cgroup memory/pids/CPU limits, or actual `/dev/shm` capacity from inside each worker. Keep this separate from namespace and filesystem probes.
5. **The async request deadline still has a race.** In `agent36-async-docker-policy-session.cjs`, `decide()` starts `channel.next(requestTimeoutMs)` before `writeLine()` and awaits both with `Promise.all`. If the response arrives first, the channel clears its timer; if the write promise is still waiting for stream `drain`, the combined operation can remain pending without a deadline. Use one absolute deadline shared by write/drain and response wait.
6. **Daemon cleanup is not confirmed.** `removeContainerById()` ignores the Docker command's exit status, and `stopDockerPolicyWorker()` reports based on the local Docker CLI child state rather than a confirmed daemon-side removal. The natural-close handler can also remove the cidfile without verifying the container is gone. Retain the ID until daemon removal is confirmed and fail cleanup closed when it cannot be verified.

### Required disposition

- The latest hosted canary evidence still does not certify the current source. Run `contract_only` on the exact integrated/reviewed head after the above canary gaps and the worker-driven game loop are addressed; use the existing workflow only.
- Preserve the fixture stopline until the integrated V3 driver routes every strategic setup, root and prompt decision through persistent role-scoped workers, the host validates typed tokens before native dispatch, unsupported/abstaining/timed-out decisions abort without in-process fallback, both physical-seat boundaries pass, and the owner chooses the seed-disclosure model.
- No decklist, opponent-field, matchup or competitive qualification status changed. The fixed-60 decision board remains authoritative for those claims.


## 14 November 2026 14:52 UTC — actor-suppression projection status correction

The 12:19 checkpoint above is stale about the production projector: current `simulation/twinleaf/actor-observation-contract.cjs` now emits an `abilitySuppressions` row for each visible printed Ability when its name is enumerable, with `suppressed:null`, `reasonCode:null`, and `sourcePrinting:null` when the adapter cannot prove liveness. It also emits `publicTurnRestrictions.stadiumAndToolHaveNoEffectTurnsRemaining`. This is explicit unknown Ability state, not a claim that an Ability is live or suppressed.

The Stadium/Tool countdown default is grounded in the pinned engine: `ptcg-server/src/game/store/state/player.ts` at submodule revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` initializes `stadiumAndToolHaveNoEffectTurnsRemaining = 0` (line 127), so the producer's `?? 0` agrees with this revision's Player default.

The remaining gap is at the consumer/test boundary, not the existence of the producer fields: `agent49-policy-worker.cjs` validates `abilitySuppressions` and the Stadium/Tool epoch only when present, so both remain optional; its production-projection smoke calls the validator but does not assert the projected rows or epoch. `agent36-actor-view-boundary.test.cjs` also contains no assertions for these fields. If the integrated candidate/opponent policy consumes these facts, require the fields in the worker schema or prove policy abstention on omission/unknown, and add assertions against actual `actorObservation()` output for both physical seats. Do not promote a null suppression row to false/live; decision-critical liveness needs a source-attributed fact. If the selected policy does not consume the fields, retain the explicit unknowns and avoid expanding the integration unnecessarily.


## 14 November 2026 14:54 UTC — first shared async-driver review

Agent49's commit `1411ac7292429e762a1ffc1c5d308f95be3d4eac` adds `runNativeFixtureGameSteps()`, a synchronous compatibility driver and `runNativeFixtureGameAsync()`. This is a useful shared-core seam: both paths use the same generator, and the async test confirms that the resolver can handle a root and generic prompt without calling `SimpleTacticsAi.decodeNextAction()` or receiving a policy RNG source. It is **not yet V3 integration**: `agent36-v3-runner.cjs` still calls the synchronous API, and the new fake resolver returns native action objects directly rather than exercising worker protocol/token validation. No Node/Actions execution of this commit is recorded.

### Acceptance findings on the new core

1. **Global RNG is not concurrency-safe across awaits.** The generator installs `Math.random=physicalRandom` before its first yield and restores it only in its final `finally`. The async driver awaits the worker resolver while that global remains replaced. Two overlapping games in one process can replace each other's physical RNG and restore the wrong function. Either enforce a single-game-per-process invariant or scope the physical RNG to synchronous engine operations with safe restoration; add a delayed two-match cross-talk regression.
2. **The yielded event is a host-native context, not an IPC schema.** It includes `state`, `store`, `prompt`, `native`, `legacyBot`, and `legacyRandomSource`. The resolver may use these locally to construct projections and map tokens, but must never serialize or forward the yielded object wholesale. Prefer a clearly separated host context and a separately constructed worker request containing only detached actor observation, actor-authorized prompt projection, validated public event receipt, and bounded token frontier. The async event should not carry legacy bot or RNG fields.
3. **The generic prompt branch needs a host-only gate.** The core handles ShuffleDeckPrompt, CoinFlipPrompt and WaitPrompt itself; every other pending prompt is yielded. The current prompt adapter additionally classifies ShuffleHandPrompt, AlertPrompt, ShowCardsPrompt, ShowMulliganPrompt and InvitePlayerPrompt as host-only, plus physical-random Night Watch. The integrated resolver must apply a trusted host-only classification before worker dispatch. Night Watch classification must use typed provenance, never free-form prompt message/type.
4. **The new test is only a generator-core test.** Its fake resolver returns native `ResolvePromptAction` and `PlayCardAction` instances. It proves the bot decoder is bypassed but not that worker responses are validated, opaque tokens map to native actions, native prompt decode succeeds, or worker errors/abstentions/timeouts fail closed. Keep that scope explicit and test the real resolver in the existing contract lane once it is connected.
5. **Result metadata still describes the legacy policy RNG.** The async path permits `policySeedBySeat:null`, but the result continues to report `xorshift32-physical-plus-independent-policy-streams-v2` and `explicit-per-seat-seeds-independent-of-physical-seed-v1`. Record a distinct no-policy-RNG worker protocol for async games; do not leave a reproducibility manifest claiming streams that were not used.

Preserve the existing trace, root ledger, accepted-prefix and failure-snapshot semantics. A worker timeout/abort must still unwind the generator's `finally`, restore host state, and close/remove both role workers in the caller's outer `finally`. No fixture is authorized until the actual V3 resolver is integrated, actor-safe IPC and native dispatch are tested, the hosted canary passes, and the owner resolves seed disclosure.


## 14 November 2026 14:58 UTC — Agent49 follow-up corrections and remaining review gates

Two useful follow-up commits landed after the first generator review:

- `be30603019ac51c936af18747e7a32993f70f43e` adds `dispatch:false` preparation modes to `dispatchSelectedNativeAction()`, `dispatchPromptChoice()`, and `resolveHostOnlyPrompt()`. Each can now validate/build and return a native action without dispatching it, allowing the shared game generator to own the single real `Store.dispatch`. This resolves the helper API mismatch at source level **if the integrated resolver consistently passes `dispatch:false`**. The actual async game path still needs an exact-once real-dispatch regression across root, ordinary prompt and host-only prompt cases.
- `0112a307eab3efe0cecfdc71b629c4760928e579` removes legacy bot/random-source fields from async yield events; upgrades the actor-observation schema to v3; makes `abilitySuppressions` and the Stadium/Tool countdown required fields while accepting explicit `null`; and makes the producer emit explicit unknown values rather than omit those fields. This resolves the prior optional-schema gap. The production projection test currently asserts an empty Ability row for a Pokémon with no Abilities and a null epoch for a fixture with no countdown; it still does not exercise a visible Pokémon with an Ability through the real projector or assert the unknown row for both physical seats. The protocol document `agent49-policy-worker-protocol-v3.md` still labels actor observation as v2 and needs to match the new constant.

The generator review gates that remain open are: global `Math.random` stays patched across awaited resolver calls; raw `state`, `store`, `prompt` and `native` references remain in the host-local yield event and must never cross IPC; host-only prompt classification must precede worker routing; the fake resolver test does not exercise typed worker decisions; and async result metadata still names the legacy policy RNG streams even when `policySeedBySeat` is null. The V3 runner itself still calls synchronous `runNativeFixtureGame()`; no worker resolver or worker-session lifecycle is connected.

The Docker canary remains unqualified for separate reasons recorded above: its namespace baseline is a peer container rather than the host runner, it lacks role-specific bundles, a host-gateway positive control, a real parent-RNG sentinel and effective resource measurements. Do not infer acceptance from the helper changes or generator unit test alone.


## 14 November 2026 15:03 UTC — async pin, role-composer and fixture compatibility gates

The async runtime-pin work in `598ff51b3d19bca32d0b5169824b5b0c8ee16ed4` now keeps `Module._load` and the role-scoped `require.cache` exclusion active until an awaited callback settles. This is necessary for the async path, but both are process-global mutations. Agent11's review correctly identifies that overlapping fixture calls can overwrite each other's loader guard or observe the temporarily pruned cache; the generator also holds global `Math.random` across awaits. Require an enforced process-wide single-fixture lock or one fixture per host process, and an overlapping-call regression. Sequential pin tests do not establish concurrency safety.

The V3 call path remains blocked independently: `runV3FixtureGame()` still imports/calls synchronous `runNativeFixtureGame()`; `withCandidateOpponentPolicyRoles()` explicitly rejects Promise-returning callbacks and wraps in-process `withActorOnlyRootPolicy()`. The worker path must not execute that synchronous strategic wrapper. Preserve one role/seat assignment source by extracting/reusing the pure candidate/opponent seat mapping from the existing composer, then bind persistent worker sessions and produce equivalent privacy-safe role/session receipts. Do not create a second competing role composer.

The current `loadNativeRoleDependencies()` object also lacks required projection dependencies. The existing frontier expects `ActionEnumerator` and `Simulator`; prompt target projection expects `PlayerType` and `SlotType`. Pinned source paths are: `ptcg-server/src/advanced-bot/action-enumerator.ts` → `vendor/twinleaf/ptcg-server/output/advanced-bot/action-enumerator.js`; `ptcg-server/src/game/bots/simulator.ts` → `vendor/twinleaf/ptcg-server/output/game/bots/simulator.js`; `PlayerType`/`SlotType` are exported from `ptcg-server/src/game/store/actions/play-card-action.ts`, already loaded as `cardActions`. The pinned Simulator defaults to deterministic `ALL_HEADS`/`NO_SHUFFLE`; the frontier's clone check uses `simulator.store.dispatch()`, so the earlier clone-RNG concern is not established for this default path. The confirmed global RNG-across-await hazard remains.

Additional concrete compatibility/metadata defects:

- The async pin test fixtures in `tests/2026-11/agent49-fixture-scoped-runtime-pin.test.cjs` and the new async case in `tests/agent36-runtime-module-pin.test.cjs` contain two source backslashes before `n` in generated-source strings. A local Node reproduction confirms that the generated `module.exports=1;\\n` fails parsing with `SyntaxError: Invalid or unexpected token`. Restore the existing single-backslash newline escapes and run both tests.
- The observation-v3 required fields break existing fixture builders: Agent6's visible-Pokémon helper conditionally omits `abilitySuppressions`; Agent10's helper omits it entirely and omits the Stadium/Tool epoch. Add explicit unknowns to those test fixtures without weakening the production schema.
- `agent49-policy-worker-protocol-v3.md` still lists actor observation v2 while the worker constant is v3. Agent11 has also flagged that async success and partial-failure records still claim the legacy per-seat policy RNG protocol when async games use no policy RNG.
- Agent44 flagged `projectNativeAction()`'s unconditional `stadiumEffectLive:true` metadata. A Simulator-legal Stadium action is not a live-effect receipt; omit/set null until the host can prove recipient-specific liveness. Do not send an unverified boolean to the worker.

No Node or hosted CI pass has been recorded for these async pin changes. The new async game core, async pin wrappers, schema v3 and dispatcher preparation are still prerequisites rather than a connected V3 worker game. The canary and fixture stoplines above remain unchanged.


## 14 November 2026 15:06 UTC — worker artifact identity must replace legacy policy profile

Agent44's review identifies another hash-bound integration dependency: `buildFixturePolicyConstraints()` in `agent36-v3-runner.cjs` still records the policy profile as the Agent34 actor-only root policy plus Twinleaf `SimpleTacticsAi` baseline. Candidate/opponent artifact profiles also describe the legacy in-process fallback and carry `botOptionsAuditBySeat`. Once worker sessions make decisions, retaining these fields would attest a different policy from the one that actually played.

The worker-backed V3 artifact must bind the actual candidate/opponent bundle digests and policy versions in the pregame constraints, then attach a privacy-safe per-role session receipt (role, physical seat, session identity, request/decision/failure/abstention/timeout counts, worker lifecycle outcome) to the completed or partial game record. It must explicitly attest that no in-process strategic fallback ran. Do not treat the old SimpleTacticsAi profile or bot-options audit as a harmless label.


## 14 November 2026 15:20 UTC — review of the first connected async V3 path

Commit `2e0f8aaec43d8c358e29f4d82b01ac17e3b02d39` is a real integration step beyond the earlier resolver scaffold: `runV3FixtureGame()` is now async, creates two role-scoped sessions per game (one candidate, one opponent), calls `runNativeFixtureGameAsync()`, maps root/prompt decisions through dispatch-free host helpers, and attaches a worker execution audit. Agent44 corrected the session count: the four role/physical-seat combinations are covered across mirrored-seat trials, not four simultaneous sessions in one game. This is still **not accepted and has not been run**.

### Current hard blockers in the connected path

1. **No candidate worker policy exists.** `V3_FIXTURE.candidateWorkerPolicyPath` names `simulation/evaluation/2026-11/agent46-candidate-policy.cjs`, absent from the current tree. The existing `candidate-stone-star-alchemy-policy.cjs` is an in-process synchronous hook, not a v3 worker policy. Agent46's earlier bounded offer remains an ownership option; do not substitute the legacy hook.
2. **Worker policy code still executes on the host twice.** `loadWorkerPolicyModule()` uses `require(filename)`, and the shared role-manifest preload then `Module._load()`s every `combined.expectedByPath` entry, including worker policy entrypoints. Separate host runtime modules from hash-only worker policy data assets; the latter must only be imported inside the Docker worker. Agent11 and Agent44 have supplied the concrete `dataAssetPaths` split using the existing manifest format.
3. **Root action frontier dependencies remain null.** `loadNativeRoleDependencies()` still falls back to `gameActions.ActionEnumerator`/`SimpleTacticsAi.ActionEnumerator` and analogous Simulator properties, without importing the pinned output modules. The first root decision will fail `NATIVE_ACTION_FRONTIER_BINDINGS_MISSING` until the explicit ActionEnumerator, Simulator, PlayerType and SlotType imports are added.
4. **Typed prompt provenance is not connected.** `createV3WorkerDecisionResolver()` still defaults `provenanceHook=null`; `runNativeFixtureGameSteps()` has no `onStoreCreated` seam. The new Store observer must be installed immediately after Store construction and before the first AddPlayerAction/attack dispatch, not at the first yielded prompt. Install both the prompt provenance hook and Copycat multi-attack history tracker there, pass their detached outputs to the resolver, and restore them in the generator's `finally`. `makeSource()` and Night Watch classification still retain untrusted prompt/source-name fallbacks.
5. **Turn-stamped public event history is absent.** The resolver calls `publicEventReceipt(state, actorSeat, null, null)`, so opponent last-turn attack/turn fields remain null and the selected Agent6 policy's prior-Pale-Moon branch and certified Copycat choice set are disabled. Use the existing `copycat-multiattack-history.cjs` tracker and `agent7-copycat-history-root.cjs` receipt attachment; preserve null as unknown until tracker data exists.
6. **Role mapping still bypasses the existing composer.** The worker path derives candidate/opponent seat mapping directly from `V3_FIXTURE`. Extract/reuse the pure mapping from `withCandidateOpponentPolicyRoles()` so sync and worker paths share one source of role assignment; do not keep two independent mappings.
7. **Cleanup is not part of success qualification.** `session.close()` results are ignored, failed sessions can return `{aborted:true}` without throwing, daemon-side removal is not verified, and `gameCompleted` does not require zero cleanup failures. A game with an unclosed worker/container must be marked incomplete and excluded.
8. **Process-global hooks remain unsafe under overlapping fixtures.** `Math.random`, `Module._load`, `require.cache`, and the Underworld prototype hook remain active across awaits. Enforce one fixture per host process (or a process-wide lock) and test overlap rejection. The actual game runner also needs a mirrored-seat candidate test; current `V3_FIXTURE` binds candidate to one fixed seat.
9. **The execution receipt is incomplete.** The worker audit asserts `workerProcessPerRole:true` but does not record a per-role worker PID/session identity and verified close outcome. Bind the worker audit digest and cleanup result into the final application receipt/admission predicate.

The earlier async-pin fixture escaping regression, observation-v3 Agent6/Agent10 fixture omissions, stale v2 protocol documentation, and unverified `stadiumEffectLive:true` action metadata remain open. No hosted workflow run is recorded for this connected path; the existing contract-only lane does not yet execute both async pin regression files. No game fixture is authorized until these blockers are fixed and the exact head passes the non-fixture contract lane and hosted sandbox canary.


## 14 November 2026 15:23 UTC — RNG scope and seed-disclosure release gates

Agent3's review adds a narrower fix to the global RNG issue: retain the physical RNG as a closure and install it only around synchronous Store construction/engine dispatch calls, restoring the prior `Math.random` in a synchronous `finally`; assert those callbacks do not return thenables. While a worker resolver is pending, the host's `Math.random` must be the exact pre-game function. This does not remove the need for a single-fixture-per-process/overlap guard for `Module._load`, `require.cache`, and prototype hooks.

Agent44 also requires the integration owner to make an explicit seed-disclosure decision before any fixture/canary: conservative model is physical seed host-only, no policy seed, and only actor-authorized observations/actions cross IPC. Bind that decision to policy constraints and worker audit; test absence of seed-like fields in INIT, every DECISION request, environment, bundle, and worker-visible files. The worker's Node permission model does not block a policy's ambient `Math.random`; candidate/opponent policy bundles therefore need a deterministic-source audit until a separate policy RNG model is explicitly approved. Current worker audit booleans are not a substitute for the owner's recorded decision or end-to-end absence test.


## 14 November 2026 15:25 UTC — clarification: worker-local policy RNG is required, not optional

Correction/clarification to the prior deterministic-bundle note: the Critic's 13:25 directive already requires **per-seat policy RNG inside the worker**. The owner decision is about the independent RNG seed/source and disclosure/reproducibility model, not whether worker policies have any RNG. Do not interpret `policySeedDisclosedToWorker:false` as permission to omit policy RNG.

The required invariant is: physical RNG/seed remain in the host engine; each role/seat worker has its own policy RNG, independent of the physical seed and host RNG, with no mutable host-global `Math.random` swap. Prefer a narrow worker-local RNG API rather than ambient `Math.random`. The owner must explicitly choose worker-generated CSPRNG state or an independently supplied per-seat seed, and define what non-secret commitment/metadata is retained for reproducibility. The worker audit and tests must bind that choice and prove no physical seed or host RNG crosses IPC. This supersedes any reading of the earlier note that policy RNG should remain absent until a later approval.


The current worker protocol's recursive seed/random-field rejection is another concrete constraint: an independently supplied policy seed cannot simply be inserted into the existing INIT/config schema. If the owner chooses a pre-registered per-seat policy seed, introduce a narrowly scoped, versioned policy-RNG field that is explicitly distinct from the physical seed and never reaches the game engine; if the owner chooses worker-generated entropy, keep the seed inside the worker and define the reproducibility commitment/output. In either case, update protocol version, worker API, artifact metadata and tests together. Do not silently bypass the existing rejection.


## 14 November 2026 15:24 UTC — unknown Stadium liveness must fail closed in the consumer

Agent44's follow-through identifies a consumer-side gap: the selected Agent6 worker policy assigns every `use-stadium` action a fixed positive score and does not inspect `item.metadata.stadiumEffectLive` or the public suppression epoch. Therefore changing the host's fabricated `true` to `null` is insufficient if the action remains in the frontier; the policy may still choose it. Until the host can prove liveness, either exclude the action under a source-backed rule or make the worker abstain unless trusted metadata is explicitly `true`. This is a fail-closed metadata requirement, not an asserted card-interaction conclusion.


## 14 November 2026 15:26 UTC — correction: policy RNG must not be added to IPC

Correction to the preceding protocol note: Agent44's latest review clarifies the Critic's boundary more precisely. Keep recursive seed/RNG/entropy rejection on INIT and DECISION IPC. The worker should create its independent per-seat RNG state **inside `run()`**, then pass a narrow non-serializable RNG API only to `policyModule.createPolicy()`; do not put a policy seed or RNG capability into INIT/DECISION payloads, and do not patch ambient host `Math.random`. The initialization source (worker-generated CSPRNG state or an explicitly approved worker-local independent seed mechanism) and a non-revealing reproducibility commitment must be recorded in the worker audit. The earlier suggestion to add a policy-seed field to IPC is superseded and should not be followed.


## 14 November 2026 15:30 UTC — bounded Agent46 delegation scope

Agent44 corrected the delegation boundary under the Critic's 15:27 gate: Agent49 may explicitly accept Agent46's offer to implement only the missing candidate worker-policy module plus deterministic unit/contract fixtures for that module. This does not authorize a game/matchup fixture, candidate-60 changes, rank-specific policy expansion, or any host/worker integration edits. Agent49 remains sole integration owner; no parallel candidate implementation should begin without his explicit acceptance.


## 14 November 2026 15:32 UTC — reproducible worker-local RNG option (proposal only)

Agent3 proposed one concrete way to reconcile independent worker-local RNG with replay without disclosing physical or policy seed plaintext to the host: each role/seat worker generates its own 32-byte state using `crypto.randomBytes(32)` inside the worker, constructs the policy PRNG there, and passes only a narrow non-serializable `rng()` closure to `createPolicy()`. For exact replay, the worker could encrypt that state to a dedicated owner public key and write only bounded ciphertext plus a commitment/version; the host records ciphertext and hash after worker shutdown, while the private key remains offline. Role, seat, policy digest, RNG protocol version, commitment and escrow artifact hash would be bound into the worker audit. This is a proposal requiring explicit owner approval of the escrow/public-key model, not authorization to change protocol or run a fixture. If not approved, keep policies deterministic and block any experiment that depends on random policy draws.


The proposed encrypted RNG escrow also depends on owner configuration: the existing owner-controlled RSA public-key variable was unset in the earlier sanitized-only fixture run. Until the owner supplies/approves the dedicated public key and bounded ciphertext retrieval path, do not claim exact replay from a commitment alone; keep worker RNG plaintext inside the worker and block stochastic-policy evidence that cannot be reproduced.


## 14 November 2026 15:37 UTC — deterministic-policy interim for worker RNG

Agent3 proposed a low-risk interim: initialize independent CSPRNG-backed state inside each role/seat worker at startup and pass only its non-serializable `rng()` closure to `createPolicy()`; keep INIT/DECISION IPC seed/RNG-free and never patch ambient `Math.random`. For the current deterministic candidate policy, require `rngDrawCount===0` and record RNG protocol/version plus draw count. If any policy consumes a draw, mark that run non-replayable and ineligible for competitive evidence until the owner-approved escrow/independent-seed protocol and commitment are configured. This satisfies the worker-local RNG boundary without pretending a hash commitment alone makes a stochastic run reproducible; it does not lift the physical-seed stopline or authorize a fixture.


## 14 November 2026 18:46 UTC — Agent49 detached-worker branch review

**Reviewed refs:** main `eda8e9e3c787d9d2e8a45b4329465f4fc880256a`; branch `agent49/v3-worker-acceptance-20261114` at `e59c7c4f4523c3c1023bc5b8565cb5f5529eee46`. At that review the branch was diverged, 21 ahead / 51 behind. It subsequently advanced to `bd90b364f28c43f2ea59e456a48849e6049c9e84`; the 18:54 UTC comparison against main `993fa2a745f28beeecb65168fafba741a1ab1aa2` was **27 ahead / 100 behind**. This is branch-only evidence, not current-main evidence. Rebase/merge live main before treating branch tests as acceptance evidence or dispatching the existing contract lane. The new direct-binding guard and bundle-cleanup assertion do not remove the host-session transitive import described below.

### Improvements confirmed in the reviewed branch (do not reopen as current blockers)

- The role-specific Docker worker bundle contains the executable, pure protocol and one role policy. The host-side `loadWorkerPolicyModule()` is a source-text/hash audit only (no `require`), but the host manifest still treats each worker policy source as its `entrypoint` and preloads it; the worker executable also appears directly in `V3_FIXTURE_WORKER_PROMPT_CHAIN` and is imported by the host session. The current role manifest therefore does not yet establish policy-code isolation.
- The worker policy is evaluated in a restricted VM context. The branch denies ambient process/module, crypto, time, timer, networking and dynamic-code globals, routes `Math.random` and the explicit policy RNG through a worker-local CSPRNG-backed draw counter, and has hostile tests for `Math['random']`, module-loader access, Date, Intl, crypto and the denied-global surface. This is defense-in-depth inside the Docker worker, not a replacement for the OS boundary or hosted canary.
- The host allowlist is exact to the three pinned-engine `GamePhase.SETUP=1` constructor/message pairs: `ChooseCardsPrompt + CHOOSE_STARTING_POKEMONS` (including the repeated post-mulligan optional Bench form), `ConfirmPrompt + GO_FIRST`, and `SelectPrompt + WANT_TO_DRAW_CARDS`. Phase 0 is not an allowed setup phase.
- Frontier construction now runs inside a separate deterministic validation-RNG scope. The branch adds a regression that proves validation probes consume their own repeatable stream and leave the next physical shuffle RNG value unchanged.
- Worker close/abort paths now assert process termination and daemon-side container removal before reporting cleanup success.

### Current blockers confirmed in the reviewed branch

1. **P0 — worker policy and executable both still enter the host source closure.** The calls to `buildFixtureRoleEntryManifest()` pass `candidateWorkerPolicyPath`/`opponentWorkerPolicyPath` as the host `entrypoint`. The builder adds `entrypoint` to `researchEntries`, the identity manifest includes it in `manifest.files`/`expectedByPath`, and the runner preloads every `combined.expectedByPath` entry with `Module._load()`. Thus both worker policy source files are executed at module initialization in the host. The current test explicitly asserts `policyPath` is present in `manifest.files`, which certifies the wrong boundary. Separately, `V3_FIXTURE_WORKER_PROMPT_CHAIN` directly lists `agent49-policy-worker.cjs` as `role-scoped-worker-protocol`, and `agent36-async-docker-policy-session.cjs` imports `./agent49-policy-worker.cjs`; both pull worker-only `node:vm`/crypto/filesystem code into the host closure. `loadWorkerPolicyModule()` is not itself the execution leak—it reads source text, audits and hashes without `require`; the leak is manifest entrypoint/preload. Give the host manifest a host-owned orchestration entrypoint, put the role policy source in `dataAssetPaths`/worker bundle rather than host `manifest.files`, remove worker executable from `V3_FIXTURE_WORKER_PROMPT_CHAIN`, and change the host session to import the pure `agent49-policy-protocol.cjs`. Add builder guards for worker/policy paths absent from `commonRuntimeBindings`, `orderedPromptChain`, host `manifest.files` and `expectedByPath`; assert both remain only hashed data assets/worker-bundle files. Commit `71d5bf1d4c92` checks only direct common bindings and misses the ordered-chain path.
2. **P0 — the setup projection does not match the existing opponent policy contract.** `projectSimplePrompt()` currently labels each `WANT_TO_DRAW_CARDS` option with `String(value)` while the rank-1 policy requires `Draw N card(s)` and checks `expectedDrawCount = count - 1 - choiceIndex`. It therefore abstains on every such prompt. Project the exact label from the native option value, preserve the original `choiceIndex`, and ensure `count` excludes any synthetic cancel choice. Test the exact projection through both role policies under both physical-seat mappings.
3. **P0 — candidate setup decisions remain incomplete.** The candidate worker policy still routes generic Confirm/Select prompts only when there is exactly one choice and has no explicit deterministic handler for starting-Pokémon selection, `GO_FIRST`, or `WANT_TO_DRAW_CARDS`. The rank-1 opponent policy has handlers, but its starting-Pokémon branch hardcodes a Shadow Rider V preference. The narrow acceptance exception is only generic SETUP=1 protocol completeness: both role policies must return deterministic, legal decisions for initial `min:1` and repeated `min:0` starting-Pokémon prompts, `GO_FIRST`, and mulligan draw selection. Keep setup tests in the existing policy test files; do not add rank-specific strategy or change either 60-card list as part of this fix.
4. **P1 — Night Watch host-only classification still trusts free-form prompt text.** `hostOnlyPrompt()` currently falls back from `provenance.effectName` to `prompt.message`/`prompt.type`. This allows an unproven prompt label to enter the host physical-random resolver. Require trusted host-side typed card-effect provenance (and complete copied-attack provenance where applicable); missing/unknown provenance must abort/fail closed, not infer Night Watch from message text. Add regressions: unproven `message:'Night Watch'` must not invoke the physical RNG; direct Night Watch with typed provenance remains host-only; copied Night Watch is host-only only when its copied source/attack provenance is complete.
5. **P1 — request timeout does not cover the complete write/response operation.** `AsyncDockerPolicySession.decide()` starts `channel.next(requestTimeoutMs)` and awaits it with `writeLine()` in `Promise.all`. A response can clear the channel timer while the write promise is still waiting for stream `drain`, leaving the combined operation without a deadline. Use one absolute deadline for request write/drain plus response wait; on expiry abort the session and verify daemon cleanup.

### Explicit non-blocker correction

- **ShuffleHandPrompt length is not a current blocker at the pinned revision.** Agent15 checked Twinleaf gitlink `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`: `ShuffleHandPrompt.validate()` explicitly requires `result.length === player.prizes.length`, so the resolver's `owner.prizes.length` matches native validation. A pinned-tree search found only the class, serializer registration and silent-prompt classification; no producer/constructor call exists. Do not change this latent path to hand length based only on its class name. Revisit only if a real producer is introduced, with a source-backed payload contract and native regression. Keep it host-only.

### Required next sequence

- Rebase the reviewed branch on current main; give the host manifest a host-owned orchestration entrypoint, move each role policy source to hashed data assets/worker bundle, remove the worker executable from the host prompt chain, and change the host session to import only the pure protocol module.
- Fix the exact setup projection/policy cases and Night Watch typed-provenance routing, with focused existing-file regressions. Preserve the pinned ShuffleHandPrompt behavior; no change absent a real producer.
- Fix the absolute request deadline. Preserve the now-present validation-RNG regression and worker ambient-capability tests.
- Run only the existing `contract_only` lane and hosted two-seat canary on the exact rebased, reviewed head. No new workflow, alternate harness, or fixture dispatch.
- Keep fixture admission blocked until the hosted OS canary, complete worker decision routing, host-native validation, fail-closed cleanup, and the owner's separate physical-seed disclosure decision are satisfied.

No deck identity, opponent-field admission, matchup result, competitive game count, or win-rate claim changes from this branch review.


## 14 November 2026, 19:22 UTC — current-main worker branch review

**Reviewed branch:** `agent49/v3-worker-acceptance-20261114-current`, head `c6fb40d32c41d69cd206cda3443fd10bda4dba25`. At 19:21 UTC it compared **38 commits ahead / 123 behind** current main (then `99ba2b01a7914b77e2f9652677745dac3df3e4a2`). It is not merge-ready; rebase before any contract lane or fixture. No CI or fixture was dispatched during this review.

The newer branch resolves several earlier P0s:
- Host session now imports the pure `agent49-policy-protocol.cjs`, not the worker executable.
- Worker executable is a hashed data asset / Docker bundle member, no longer a host prompt-chain module; the latest commit adds a builder assertion rejecting worker executables in `orderedPromptChain`.
- Role policy entrypoints remain in the combined role manifest as hash-only source identity, but `preloadRoleHostModules()` excludes them from `hostExpectedByPath` and refuses to preload a policy already in `require.cache`. This is an acceptable identity model **only if** the entrypoints remain unevaluated in the host after all host dependencies are loaded; see the remaining cache gap below.
- Worker runtime now locks the global `Math` and `Object` bindings and their objects; local Node v22.16.0 VM harness confirms Math replacement fails, `Math.random()` reaches the draw trap, and string-based Function construction is blocked.
- The pinned worker image is Node `v24.22.3`, `linux/amd64`, digest `sha256:dc26ae92c9fb15cf6b1d63e20f0944b2efe0f115b20e00be48fb23fceb061c54`. The Docker canary now uses mode-0444 host markers (including hidden opponent zone), four role/seat combinations, two sequential requests per persistent worker, child-process/worker-thread probes, and a networked peer positive control.

### Remaining acceptance blockers on this branch

1. **P0 — `globalThis` binding remains replaceable.** The worker bootstrap locks `Math`, `JSON`, `Object`, `Array`, `Promise`, and `Reflect`, but not the `globalThis` property itself. A Node v22.16.0 VM reproduction using the current freeze loop shows `Object.getOwnPropertyDescriptor(globalThis,'globalThis')` remains writable/configurable; `globalThis.globalThis = {__agent49SafeRng:()=>0.5}` succeeds and redirects subsequent worker lookups for `__agent49SafeRng`, `__agent49PolicyModule`, and wrapper functions. Capture the real realm global and make its `globalThis` property non-writable/non-configurable before evaluating policy source. Add an ambient descriptor check and an adversarial replacement test. The earlier Math/Object rebinding findings are fixed; this remaining binding is not.

2. **P1 — worker-only require-cache check is pre-load only.** `preloadRoleHostModules()` verifies each policy entrypoint is absent from `require.cache` before loading host dependencies, then `Module._load()`s host modules and returns without rechecking. A host dependency could require a worker-only entrypoint during that loop. `fixtureRolePolicyCacheEntries()` filters to `hostExpectedByPath`, so `assertLoadedResearchModulesCovered()` would not see the extra worker-only cache entry. Recheck all worker-only paths after host preload and fail closed; add a regression where a host binding transitively requires the malicious policy probe. The source-only `loadWorkerPolicyModule()` audit is fine and should remain.

3. **P1 — deferred finalizers can evade zero-draw accounting.** `WeakRef` and `FinalizationRegistry` remain available in the VM context. A finalizer can call `Math.random()`/`__agent49SafeRng` after the immediate post-decision draw-count check, including after the final accepted response; worker EOF currently has no final draw-count check. Deny both globals in the sandbox (and test absence); retain the existing checks after initialization and each decision.

4. **P1 — request deadline still has a write/drain race.** `AsyncDockerPolicySession.decide()` has a 15-second response timer and aborts on timeout, so an async policy that never responds should be killed; this is stronger than the 30-minute worker lifetime ceiling. However, `Promise.all([writeLine(request), responsePromise])` lets an early response clear the response timer while `writeLine()` is still awaiting stream drain. Use one absolute deadline across write, drain, and response; abort the container if any stage exceeds it. Add a test where the response arrives before a deliberately blocked write drain.

5. **P1 — Night Watch host-only classification still falls back to free-form `prompt.message`/`prompt.type`.** Require typed effect/copy-attack provenance; missing or incomplete provenance must abort before host RNG and worker IPC. The direct message already sent on the earlier branch applies to this current branch too.

6. **P1 — Docker canary evidence has two remaining vacuities.** (a) `hostPhysicalRandom` is defined but never installed as parent `Math.random` or made reachable; `hostPhysicalRandomCalls===0` is therefore guaranteed. Install a parent-only sentinel during the worker runs, assert identity is unchanged and call count zero, and restore in `finally`. (b) `referenceNamespaceInodes` comes from the network-probe **peer container**, not the host process. The current namespace assertion proves difference from that peer, not from host namespaces. Collect `/proc/self/ns/{pid,ipc,uts,net,mnt}` in the test process and compare the worker directly to the host. Keep the peer network positive control; it serves a separate purpose.

7. **P0 setup completeness — candidate multi-choice setup remains unhandled.** The candidate policy's generic `ChooseCardsPrompt` path may cover initial starting-Pokémon min:1 and repeated post-mulligan min:0 if the native choice list is restricted to legal Basics, but no real setup regression proves it. Its `ConfirmPrompt`/`SelectPrompt` path still only acts when exactly one choice exists, so `GO_FIRST` and `WANT_TO_DRAW_CARDS` multi-choice prompts abstain. Add exact setup handlers and tests. Agent46 has been notified. The opponent policy still prefers Shadow Rider V for Active during the setup prompt; keep card-specific strategy outside the protocol-only setup slice. Agent6 has been notified.

8. **P1 — setup projection-to-policy integration remains unproven.** The projection now labels native draw options as `Draw N card(s)` and uses an exact phase-1 setup allowlist; this is a useful improvement. Add end-to-end tests proving candidate/opponent decisions against real projected prompts, both physical seats, initial min:1 and repeated min:0, plus all draw-count options and cancel/disabled behavior. Night Watch provenance is covered separately in item 5.

**Execution evidence:** local Node v22.16.0 harness verified the Math/Object freeze behavior and reproduced the original writable `globalThis` bypass; the corrected bootstrap succeeds. The existing `.github/workflows/agent36-bilateral-competence-v9.yml` has a `contract_only` mode that sets up Node 24.22.3 and explicitly runs both `agent49-policy-worker.test.cjs` and `agent36-docker-policy-worker.test.cjs` after the digest-pinned Docker preflight. Thus production VM unit tests are configured to run under Node 24 in that lane, but no current-branch run has executed. The Docker OS-isolation test uses the test-only `agent49-docker-canary-worker.cjs`; the added production-worker timeout/cleanup test separately executes the actual `agent49-policy-worker.cjs` inside the pinned Node 24 container. This environment has no Docker executable, so I did not run either container test locally. A successful production-worker decision/response/clean-close smoke remains useful. Do not claim Node 24 compatibility or a passing Docker canary until the hosted `contract_only` lane runs on Linux/amd64 with the exact image digest and its artifacts are reviewed.

### Next sequence

1. Rebase the branch on current main and retain the worker-executable prompt-chain guard.
2. Lock `globalThis`, deny deferred finalizer globals, add post-load worker-only cache assertion and transitive-import regression.
3. Close the absolute request deadline race and typed Night Watch provenance.
4. Finish candidate GO_FIRST/WANT_TO_DRAW_CARDS setup handlers and prove both roles' starting-Pokémon min:1/min:0 behavior; remove card-specific setup preference from the protocol-only path.
5. Repair the two Docker canary evidence gaps, then run the existing Node 24.22.3 Linux/amd64 `contract_only` lane. Only after all gates pass consider the two-seat hosted canary. No competitive fixture or deck claim before that.


### 19:27 UTC update — policy-source boundary redesign accepted; cache gap resolved

Reviewed Agent49 commits through `297a56eb8d584cd52e5168e80667318136d6f0ff`. The worker-policy boundary now has the correct shape:
- The role manifest uses a host-owned orchestration adapter entrypoint (`agent49-native-fixture-game.cjs`), not the role policy source.
- Candidate/opponent policy sources are separately hashed `dataAssets`, absent from host `manifest.files` and `expectedByPath`.
- Worker and Docker-canary executables are data assets, not host source modules or prompt-chain entries.
- Runtime preparation cross-checks each worker-only policy hash against its role-manifest data-asset hash.
- `preloadRoleHostModules()` blocks worker-only policy imports while loading host dependencies, restores `Module._load` in `finally`, and asserts worker-only paths remain absent from `require.cache` afterward.
- A regression deliberately creates a host module that requires the malicious worker-only policy and asserts `WORKER_ONLY_POLICY_HOST_IMPORT_BLOCKED` before the sentinel can execute.

This resolves the earlier policy-as-host-entrypoint P0 and transitive require-cache P1. The previous hash-only-manifest-entrypoint design is superseded; the new data-asset/host-adapter split is preferable. Do not reopen this issue unless the implementation changes.

At 19:26 UTC the branch was 51 ahead / 142 behind main; rebase remains mandatory before acceptance. Remaining blockers are: **P0 bootstrap regression** in the attempted `globalThis` lock (the `globals` loop includes `realmGlobal` and calls `Object.freeze(realmGlobal)`, which throws `TypeError: Cannot freeze` in Node v22.16.0 before the property is locked); exposed `WeakRef`/`FinalizationRegistry` were addressed by the 19:27 branch commits; request write/drain deadline race; Night Watch free-form provenance fallback; vacuous host-RNG canary and peer-not-host namespace reference; no Node 24 Docker smoke of the production VM worker; candidate `GO_FIRST`/`WANT_TO_DRAW_CARDS` abstentions and unproven starting min:1/min:0 behavior; opponent setup card-specific Active preference. No CI or fixture dispatched.


### 19:30 UTC update — globalThis lock attempt currently prevents worker startup

The branch's new global-binding patch is directionally correct, and the new tests check the descriptor and disable `WeakRef`/`FinalizationRegistry`. However, the setup loop includes `['globalThis', realmGlobal]` and calls `objectFreeze(value)` for every entry. In Node v22.16.0, `Object.freeze(realmGlobal)` throws `TypeError: Cannot freeze` for a contextified VM global proxy. This happens before the subsequent `defineProperty(realmGlobal,'globalThis',...)`, so the worker cannot reach policy load/READY and the binding remains writable. Local reproduction used the current setup ordering. The working correction is to define the `globalThis` property separately (non-writable/non-configurable, value equal to captured `realmGlobal`) and exclude `realmGlobal` from the object-freeze loop; a local Node v22.16.0 harness confirms this succeeds and replacement then throws TypeError. Agent49 was notified at `communications/agent49/20261114T192959Z_agent35-globalThis-freeze-bootstrap-regression.md`. This is now the highest-priority blocker.


### 19:35 UTC update — globalThis bootstrap and deferred-RNG fixes verified; setup landed on main

Reviewed Agent49 head `5a9339b627b45ecec918e1f8e51be8ce0071b261` (65 ahead / 167 behind main at 19:31). The globalThis regression from the prior update is now fixed:
- The loop still locks the `globalThis` property but skips `Object.freeze(realmGlobal)`; Math/Object/JSON/Array/Promise/Reflect remain frozen and their global bindings locked.
- A local Node v22.16.0 harness using the current loop succeeds, confirms non-writable/non-configurable `globalThis`, Math and Object bindings, and rejects replacement with TypeError.
- The sandbox now explicitly shadows `WeakRef` and `FinalizationRegistry` as undefined.
- Every successful response includes `policyDrawCount`; the host protocol/session requires it to equal zero. The worker checks after response write and again at stdin EOF, and failure audit includes the count.

Thus the globalThis bootstrap regression and deferred-finalizer concern are resolved on the branch. The earlier host policy source/data-asset and transitive require-cache issues are also resolved by the redesign recorded above.

**Current main setup progress:** Agent46's commit `df7367a9c31ed9247c1444a6e7cfd010da4eeffc` adds candidate setup handlers and tests for both physical seats: starting-Pokémon min:1, repeated min:0/empty selection, deterministic `GO_FIRST`, and all seven descending `WANT_TO_DRAW_CARDS` values plus sparse/invalid cases. This is now on main but not yet in Agent49's stale branch; rebase is required. The candidate policy trusts the host projection to exclude non-Basics via `prompt.options.blocked`; the explicit starting-Pokémon projection test still lacks a mixed Basic/non-Basic blocked-index case. Agent36 and Agent46 were asked to add the projection-to-policy regression.

Remaining acceptance gates:
1. P1 absolute request deadline still needs to cover write, drain, and response together; `Promise.all([writeLine,responsePromise])` retains the early-response/write-drain race.
2. P1 Night Watch classification still falls back from typed provenance to free-form `prompt.message`/`prompt.type`; Agent36 was asked to remove this fallback and test spoofed text.
3. P1 Docker canary host RNG assertion remains vacuous (`hostPhysicalRandom` is never installed as parent `Math.random`); Agent36 was asked to install a parent-only sentinel.
4. P1 Docker canary namespace reference still comes from the peer server container, not host `/proc/self/ns`; Agent36 was asked to compare against host namespace inodes.
5. P1 Node24 compatibility of the production VM worker remains untested: the Docker OS canary runs the test-only canary worker; production worker unit tests use local Node22. Add production worker INIT/READY + DECISION smoke under pinned Node24.22.3 image. Agent49 was notified.
6. Opponent setup still has a deck-specific Shadow Rider V Active preference; Agent6 was asked to keep this out of the protocol-only setup path.

No Docker executable is available locally; no Node24 Docker test, contract-only CI, or fixture has been run. At 19:31 the Agent49 branch was 65 ahead / 167 behind main and still requires rebase. No competitive claim is supported.


### 19:42 UTC update — production VM worker now has a Node24 timeout/cleanup smoke

Agent49 commit `a900fb20feaf` adds a Docker test that packages the actual `agent49-policy-worker.cjs` and protocol module with a deliberately non-settling async policy, runs it under the pinned Node 24.22.3 image, submits a decision request, requires the per-decision timeout, and verifies both worker process closure and container removal. This closes the earlier claim that Node24 Docker tests exercised only the test-only OS canary. It is a meaningful startup/VM/timeout/cleanup smoke.

A successful-response complement remains: run the production worker under the same image with a trivial policy that returns a legal deterministic decision; assert INIT/READY, successful DECISION serialization/host validation, `policyDrawCount === 0`, and clean close. Neither Docker test has been executed in hosted CI yet. The early-response/write-drain absolute-deadline race remains a separate host-session issue.


### 19:45 UTC update — frontier RNG correction and remaining prompt-fidelity gate

A side-by-side check of current main and Agent49's worker branch found one additional important integration delta:
- Agent49's branch wraps `buildNativeActionFrontier()` in `request.withValidationRandom()`, separating validation/search sampling from the physical game RNG.
- Current main still wraps the same frontier construction in `request.withPhysicalRandom()`. This is not a cosmetic difference: until the branch is rebased/merged, the physical RNG can be consumed by validation-only frontier construction. Preserve the branch's validation-only scope and do not run a fixture from current main as if this were fixed.

The pinned prompt projection also still derives `ShuffleHandPrompt` permutation length from `owner.prizes.length`. The correct length must come from the actual target hand being shuffled, using the target identity in the native prompt payload. Agent36 has been asked to inspect the pinned prompt shape and add an unequal hand/Prize-count regression through native prompt validation.

Agent46's candidate setup handlers are now on main; the missing test is the mixed Basic/non-Basic `options.blocked` projection-to-policy path. Agent36 and Agent46 were notified.

Node24 production-worker timeout/cleanup smoke was added by Agent49 commit `a900fb20feaf`; a successful decision-response smoke remains. Other open gates remain as listed above: absolute request deadline, typed Night Watch provenance, Docker canary parent-RNG sentinel and host namespace reference, and opponent setup strategy separation. No current-head CI or fixture has run.


### 19:50 UTC correction — retract two earlier findings; add audit propagation and microtask barrier

After reviewing Agent43's refreshed decision-board assessment, I retract my earlier claims that the session has an early-response/write-drain timeout race and that `ShuffleHandPrompt` uses the wrong permutation length. Agent43 reviewed the existing 15-second request deadline and pinned prompt payload and explicitly retracted both concerns. Do not spend further time on them absent new evidence.

Two P1 findings from the current review remain:
1. **Deferred Promise-microtask RNG:** immediate zero-draw checks may miss queued microtasks. Add a host-side macrotask barrier after policy bootstrap, initialization, each decision, and before EOF; recheck draw count after the barrier. Add a nested-`toJSON` regression that queues a microtask RNG draw after the immediate check.
2. **Attestation lost at session boundary:** `AsyncDockerPolicySession.decide()` validates `response.policyDrawCount === 0` but drops the field from its returned value; the runner records `undefined`/null. Preserve the validated count in the session return shape and per-role/per-decision audit, with a final-run-record test asserting numeric zero.

Agent49 and Agent36 have been notified. At 19:45 UTC Agent43's comparison reported the worker branch 79 ahead / 239 behind main (merge base `8d0f6f423fee1cd0e7815efa6f59624d8369d141`); it remains unmerged and requires rebase. The latest main decision board is now the authoritative status: current main still uses physical-RNG frontier construction; the branch's validation-only RNG fix is not integrated. Remaining gates are typed Night Watch provenance, Docker canary parent-RNG sentinel and host-namespace comparison, successful production-worker Node24 decision/response smoke, mixed Basic/non-Basic blocked-index projection-to-policy test, and opponent setup strategy separation. The production Node24 timeout/cleanup smoke exists but has not run. No CI or fixture dispatched.


### 20:37 UTC update — rebased2 branch review confirms the remaining acceptance gaps

Reviewed `agent49/v3-worker-acceptance-20261114-rebased2` at `0561dbd175129ddc1316fa65899c3e9f63806d9b`, compared with main `73594287c37a92c7efea1b2d7214060f4597e3bb`: **27 ahead / 40 behind** (merge base `cc2f04e28c3d11c6848a5ed2925defb72a15b447`). This is source review only; no CI, canary or fixture was dispatched. Agent35 sent the exact delta to Agent49 in `communications/agent49/20261114T203720Z_agent35-rebased2-acceptance-delta.md`.

The following remain open on that exact branch:

1. **Attestation propagation:** `AsyncDockerPolicySession.decide()` validates `policyDrawCount === 0` but omits the field from its returned object. The V3 resolver reads `response.policyDrawCount`, so per-decision role audit records undefined/null rather than numeric zero. Require a final-run-record regression.
2. **Deferred Promise microtasks:** the production VM worker checks the draw count immediately after awaited initialization/decision and after response write, but no host-side macrotask barrier runs before accepting the receipt. Existing ambient-capability tests do not include the nested-`toJSON` deferred draw. Add the barrier after bootstrap, initialization, each decision and before EOF, then recheck.
3. **Night Watch source classification:** `hostOnlyPrompt()` still falls back from typed provenance to free-form `prompt.message` / `prompt.type`. Only trusted `provenance.effectName` may classify Night Watch; add a spoofed-message/type test with missing or unrelated provenance.
4. **Action-frontier completeness:** the V3 runner still binds the upstream pinned `ActionEnumerator` and does not integrate Agent3's known-cap-free adapter or `assertKnownCapFreeAdapterAdmissionClear()`. The resolver sends only `actionFrontier` to the worker and discards the builder diagnostics. The current adapter gate and tests are synthetic-only and omitted from the existing `contract_only` list. This is a competitive-admission veto: until fixed, label the frontier incomplete/non-admitting and do not infer field strength. A passing known-cap gate would not prove every action family complete.
5. **Production Node 24 successful path:** the current Docker test suite has the production worker timeout/cleanup smoke, but no successful INIT/READY/DECISION/host-validation/clean-close smoke under the pinned Node 24.22.3 image. The test-only OS canary is not a substitute.

The host adapter / worker-only asset split, protocol-only import, and globalThis bootstrap correction are resolved on this branch; do not reopen them absent regression. The earlier write/drain deadline and ShuffleHandPrompt findings remain retracted.

The required next step is still a rebase onto current main, including Agent46's phase-1 setup patch already committed there, followed by only the existing `contract_only` lane on the exact reviewed head. The hosted two-seat canary remains downstream of the contract pass and the owner seed-disclosure decision. No fixture or competitive evidence is authorized by this review.


### 20:41 UTC update — latest branch fixes attestation and microtask gaps; action projector is now the critical blocker

Re-reviewed Agent49's branch after its new commits: head `25e946a29865d1d3fbb19007d3dbbe6bc97dadf3` (2026-11-14 20:41:03Z), compared with main `df64f32295138f6aa7ac9bfa3757ecee393dd40d`: **32 ahead / 47 behind**, merge base `cc2f04e28c3d11c6848a5ed2925defb72a15b447`.

**Two prior findings are resolved on this branch:**
- `AsyncDockerPolicySession.decide()` now returns the validated `policyDrawCount` field, so the runner can record numeric zero.
- The worker runtime now runs a host-side macrotask barrier after policy-source load, initialization and each decision. New tests cover deferred bootstrap/export-getter draws, deferred initialization and nested-`toJSON` decision serialization. The EOF settle/check remains.

Do not reopen these without a regression.

**Remaining gates on the latest reviewed head:**

1. **Typed Night Watch provenance remains unresolved.** `hostOnlyPrompt()` still uses `provenance?.effectName ?? prompt?.message ?? prompt?.type`. The free-form fallback can classify an untrusted prompt description as a physical-random host-only effect. Require trusted typed provenance and test spoofed message/type values with absent or unrelated provenance.

2. **Action-frontier admission is still incomplete, with newly confirmed projector gaps.** The runner still binds the pinned upstream `ActionEnumerator`; it does not construct Agent3's cap-free adapter or call either adapter/cap admission gate. The frontier builder returns local diagnostics, but the resolver sends only `frontier.actionFrontier` to the worker and discards those diagnostics. Agent3's new adapter emits `USE_TRAINER_ABILITY_ACTION` and `USE_ENERGY_ABILITY_ACTION`, while `projectNativeAction()` only handles `USE_ABILITY_ACTION`; those new actions are dropped as unsupported. In addition, all `ATTACK_ACTION` rows are currently projected as attacks by the Active Pokémon, which misattributes active Tool attacks and Bench-usable attacks. The projector needs source-aware metadata (or must fail closed and keep these actions unadmitted). The exact integration contract is in `results/methodology/2026-11/agent3-action-enumerator-coverage-matrix-20261114.md`. The adapter is still source-shaped and synthetic-tested only; it has not been validated against the compiled pinned Store.

3. **Contract-only coverage is incomplete.** The branch workflow's explicit test command omits `tests/2026-11/agent6-rank1-shadow-rider-opponent-policy.test.cjs`, `tests/2026-11/agent46-candidate-policy.test.cjs`, `tests/2026-11/agent3-action-enumerator-cap-audit.test.cjs`, and `tests/2026-11/agent3-known-cap-free-action-enumerator.test.cjs`. Add the applicable tests to the existing bounded lane; do not create a new workflow or dispatch PR #55.

4. **Production Node 24 success smoke is still missing.** The Docker suite has the production-worker timeout/cleanup test, but no successful INIT → READY → DECISION → host validation → clean close under the pinned Node 24.22.3 image. The test-only hostile OS canary does not substitute for this production worker smoke.

No CI, canary or fixture was dispatched. Agent35 sent the concise current-head review to Agent49 at `communications/agent49/20261114T2041Z_agent35-current-branch-review.md`. The 20:37 review's two fixed items are superseded by this correction; the earlier retracted write/drain and ShuffleHandPrompt findings remain closed.


### 20:44 UTC addendum — adapter Tool/Bench attacks can be silently misattributed and deduplicated

A further source-fidelity defect is present if Agent3's Tool/Bench attack additions are integrated unchanged:

- The adapter creates Bench and active-Tool attack candidates as plain `AttackAction(player.id, attack.name)`, with no source discriminator.
- The frontier's `actionSignature()` includes action type/name/hand index/bench index/target, but no attack source. Same-name Active/Bench/Tool attacks therefore collide and one is deduplicated.
- `projectNativeAction()` unconditionally reads `player.active` for every `ATTACK_ACTION`, so an added Bench or Tool attack is reported as belonging to the Active Pokémon.
- The current protocol has no explicit source contract for these new attack candidates; the generic `actorPrinting` field cannot safely be populated from the Active Pokémon when the true source differs.

The new `unsupportedCount` admission gate will not catch this class of error because these candidates are projected as supported ATTACK_ACTION rows. Require source identity to survive adapter enumeration, signature, projection and native dispatch, with same-name Active/Bench/Tool regression cases; otherwise keep ambiguous Tool/Bench attacks unadmitted. Do not fabricate source metadata. Exact review was sent to Agent49 at `communications/agent49/20261114T2044Z_agent35-attack-source-fidelity.md`.


### 20:45 UTC correction — cap-free adapter is now integrated; source fidelity remains unresolved

Reviewed Agent49 commit `08da0a84ac903a76be65d5a6da16cd47c756a208` (20:43:48Z). The V3 runner now:
- exposes the required card classes/enums from `loadNativeRoleDependencies`;
- constructs Agent3's pinned cap-free adapter for each root;
- calls `assertKnownCapFreeAdapterAdmissionClear()` with the actual frontier diagnostics;
- rejects local truncation and nonzero unsupported-action counts;
- preserves the per-root admission receipt in the role audit.

This resolves the previous finding that the adapter/gate was not integrated. The gate's nonzero `unsupportedCount` rejection is correct and fail-closed.

The following remain:

1. The adapter emits `USE_TRAINER_ABILITY_ACTION` and `USE_ENERGY_ABILITY_ACTION`, but `projectNativeAction()` still has no cases. The gate therefore rejects any root containing these legal candidates. This is safe, but incomplete; add typed projection and compiled-Store dispatch tests before claiming coverage.
2. Tool/Bench attack source ambiguity remains. The adapter constructs plain `AttackAction(player.id, attack.name)` for Bench and active-Tool attacks. `actionSignature()` does not include source identity, so same-name attacks collapse; the projector then attributes every `ATTACK_ACTION` to `player.active`. The unsupported-count gate cannot detect this because these actions are projected as supported. Preserve source identity end-to-end with same-name tests, or omit ambiguous sources.
3. Typed Night Watch provenance remains open: free-form `prompt.message` / `prompt.type` fallback is still present.
4. The explicit `contract_only` test command still omits the Agent3 adapter/cap-audit tests and the Agent6/Agent46 policy tests.
5. The production Node 24 successful decision/response/clean-close smoke remains absent.

At 20:44Z the branch compared as **38 ahead / 55 behind main**, merge base `cc2f04e28c3d11c6848a5ed2925defb72a15b447`. Rebase is still required before any contract run. No CI, canary or fixture was dispatched. Agent35 sent the updated status to Agent49 at `communications/agent49/20261114T2045Z_agent35-capfree-integration-review.md`.


### 20:48 UTC correction — core worker and canary gaps now closed on the branch

Reviewed Agent49 through `17ac0083f8057c3fcf4c3535059563dcadb66421` (20:47:10Z), compared with main at `ce1f9ebac414a8e1b87088605cb6ecf4428ab0f0`: **44 ahead / 58 behind**, merge base `cc2f04e28c3d11c6848a5ed2925defb72a15b447`.

The following earlier acceptance findings are now resolved on this branch:
- The validated numeric `policyDrawCount` is returned through `AsyncDockerPolicySession.decide()`.
- The production worker drains host microtasks after source load, initialization and each decision; nested-`toJSON` deferred-draw tests exist.
- Night Watch requires exact typed card-effect provenance plus the Trevenant & Dusknoir-GX SMP 217 source printing; free-form prompt text is not authority, and spoof/missing-provenance tests exist.
- The cap-free enumerator adapter is integrated, per-root pin/marker/diagnostics admission is enforced, and receipts are stored.
- The Docker canary now anchors namespace comparison to the host runner's own `/proc/self/ns` inodes and installs a parent-only `Math.random` sentinel.
- A successful production VM worker READY → decision → host validation → clean close smoke exists under the pinned Node 24.22.3 image.

Do not reopen these without a regression.

**Remaining gates:**

1. The adapter emits `USE_TRAINER_ABILITY_ACTION` and `USE_ENERGY_ABILITY_ACTION`, but the projector still has no corresponding cases. The new `unsupportedCount` gate correctly rejects roots containing them. This is safe but incomplete; add typed projections and compiled-Store dispatch tests.
2. Tool/Bench attack source fidelity remains unresolved. The adapter emits plain `AttackAction(player.id, attack.name)` objects for Bench and active-Tool attacks; `actionSignature()` ignores source, so same-name attacks collapse, and `projectNativeAction()` attributes every attack to the Active Pokémon. Preserve source identity end-to-end with same-name tests, or omit ambiguous sources.
3. The existing `contract_only` explicit Node test command still omits Agent3's adapter and cap-audit tests plus Agent6/Agent46 policy tests. Add the applicable existing files to the single lane.
4. The Docker canary positive control reaches a peer container on a bridge network, not a host-gateway-reachable host service. This is meaningful for bridge isolation but does not meet the exact host-gateway criterion in this contract. Add that positive control or document a technically equivalent reason to accept the peer control.
5. The branch remains 58 commits behind main and is not rebased. No hosted contract/canary run has yet been observed. Rebase and run only the existing contract-only lane on the exact reviewed head; no fixture authorization follows.

Agent35 sent this status correction to Agent49 at `communications/agent49/20261114T2048Z_agent35-acceptance-status-correction.md`. No CI, canary or fixture was dispatched by this reviewer.


### 20:52 UTC addendum — latest branch fixes more host/worker gates; remaining action and CI gaps are explicit

Reviewed Agent49's latest observed branch through `9ad7258a843c57e9b7877c3836b01b5a5a43c748` (20:49:57Z), compared with main at `194c68977c8bfa21f48fb2ad23dd7ad08172be8d`: **47 ahead / 64 behind**, merge base `cc2f04e28c3d11c6848a5ed2925defb72a15b447`.

The branch now also has the parent-RNG sentinel scoped with an exception-safe `try/finally`. The existing `contract_only` workflow does run the Docker preflight, four-combination OS canary, and the production Node 24 success/timeout tests after preflight. The Night Watch spoof tests and production-worker positive smoke are present. These are branch-level tests; no hosted run has been observed.

Remaining:

1. **Trainer/Energy ability actions:** `USE_TRAINER_ABILITY_ACTION` and `USE_ENERGY_ABILITY_ACTION` are emitted by the adapter but have no projector cases. The root admission gate correctly rejects roots containing them. Add source-aware typed projections and compiled-Store dispatch coverage before claiming completeness.
2. **Tool/Bench attack source identity:** adapter-generated Tool/Bench attacks are plain `AttackAction(player.id, attack.name)`; the frontier signature has no source component, so same-name source variants deduplicate, and the projector attributes every attack to `player.active`. This is not caught by the unsupported-action gate. Preserve source identity through signature/projection/native dispatch with same-name regressions, or exclude ambiguous variants.
3. **Canonical contract test list:** the explicit `contract_only` node-test command still omits Agent3's cap-free adapter and cap-audit tests plus Agent6/Agent46 policy tests. Add these existing files to the single lane.
4. **Native adapter validation:** the adapter's current tests are synthetic. The hosted contract lane compiles the pinned submodule, but it does not run a real compiled-Store fixture through the cap-free enumerator. The gate and source-shaped adapter therefore remain unvalidated against actual compiled Store behavior; no field-rate inference.
5. **Network canary positive control:** the probe server is on a custom bridge and the positive control joins that same custom bridge. A worker that accidentally falls back to Docker's default bridge would still fail to reach that peer and could falsely pass. Put the probe on the default bridge or use a host-gateway-reachable host service, then show a normal networked positive control can reach it while the worker cannot. Agent35 sent the specific false-pass analysis to Agent49 at `communications/agent49/20261114T2052Z_agent35-network-positive-control.md`.

The branch remains 64 commits behind main and has not been rebased. Rebase before running the existing contract-only lane on an exact reviewed head. No CI, canary or fixture was dispatched by this reviewer.


### 20:54 UTC P0 — latest compiled-state binding commit duplicates `nativeGamePhase`

Reviewed Agent49 commit `ab0061615239d62652b32dead858740c69234bdb`. It adds native State/Player/CardList types to the role manifests, but now both default binding arrays contain duplicate `nativeGamePhase` names:
- `V3_FIXTURE_COMMON_BINDINGS`: duplicate occurrences at runner lines 749 and 757.
- `V3_FIXTURE_WORKER_COMMON_BINDINGS`: duplicate occurrences at runner lines 812 and 820.

This is a deterministic manifest-construction failure. `buildFixtureRoleEntryManifest()` passes these arrays to `roleIdentity.createPolicyEntryManifest()`, which rejects duplicate binding names at `agent42-role-policy-identity.cjs:206-211` with `duplicate common runtime binding: nativeGamePhase`. Candidate/opponent manifest construction will abort before predeal/fixture execution. Remove one occurrence per array and add a uniqueness assertion for both defaults. Exact P0 sent to Agent49 at `communications/agent49/20261114T2054Z_agent35-duplicate-binding-p0.md`.

This does not invalidate the State/Player/CardList imports themselves; retain the new type bindings once each.


### 20:57 UTC correction — contract-only policy/adapter tests added; manifest P0 persists

Reviewed branch through `965d3ff87be88d0665640034f25924b16a0d4e06` (20:57:19Z), compared with main `dd689a0c2b529ca73571ff9f7523e08158318fa9`: **53 ahead / 84 behind**, merge base unchanged at `cc2f04e28c3d11c6848a5ed2925defb72a15b447`.

Agent49's `0da5867` workflow change adds the synthetic Agent3 cap-free adapter test and the Agent6 / Agent46 policy tests to the `contract_only` command. This closes the earlier omission for those three tests. The compiled ActionEnumerator/Simulator regression is placed in the full suite after submodule compilation (not in `contract_only`, which skips compilation); that is a reasonable separation. The new compiled regression covers the Basic-action family only and does not dispatch through Store or cover the remaining seven action families.

The duplicate-`nativeGamePhase` P0 remains unfixed on the latest `965d3ff` runner: both `V3_FIXTURE_COMMON_BINDINGS` and `V3_FIXTURE_WORKER_COMMON_BINDINGS` still contain the name twice. The existing manifest test in `tests/agent36-v3-runner.test.cjs` calls `buildFixtureRoleEntryManifest()` with the worker bindings, so the `contract_only` lane will still fail deterministically until the duplicate is removed.

Other remaining items are unchanged: Trainer/Energy ability actions fail closed as unsupported; Tool/Bench attack source identity and same-name deduplication are unresolved; the custom-bridge network positive control can false-pass a default-bridge worker; no hosted contract/canary run has occurred; branch remains 84 commits behind main. Agent49 received a coverage clarification at `communications/agent49/20261114T2057Z_agent35-native-regression-review.md`.


### 21:02 UTC update — Agent3 has resolved adapter-side attack-source ambiguity on main, but Agent49 branch is stale

Agent3's updated main-branch adapter (message `communications/agent49/20261114T2055Z_agent3-attack-source-metadata-fix.md`) now emits only the first same-name attack source in the pinned reducer's priority order (Active Pokémon → Bench useOnBench → active Tool) and attaches a non-writable, non-enumerable `action.__agent3AttackSource` record. The adapter's synthetic tests include same-name Active/Bench/Tool cases. Because native `AttackAction` carries only attack name and the reducer resolves the first match, these sources are not separate selectable actions; the name-based signature is therefore appropriate after adapter deduplication.

This resolves the adapter-side ambiguity on main, but **not on Agent49's branch**: its adapter still creates plain `AttackAction(player.id, attack.name)` and its projector attributes every attack to `player.active`. On incorporation, the projector must copy `action.__agent3AttackSource` into `publicMetadata.attackSource`; it must not infer the source from the active Pokémon. Agent49 was notified at `communications/agent49/20261114T2102Z_agent35-adapter-source-update.md`.

Agent3 also supplied exact integration points for the still-unsupported `USE_TRAINER_ABILITY_ACTION` / `USE_ENERGY_ABILITY_ACTION` cases and updated the adapter marker to require all four coverage flags plus `removedPerFamilyCap===8`. The current Agent49 branch does not yet contain those updates. The compiled native regression added by Agent49 covers only nine Basic hand actions; it does not yet validate the hand/Tool/Bench/Trainer/Energy families from Agent3's concrete probes.

At 21:01:17Z Agent49 branch was `84af00fa653eef56e311503388e1a6a389be3a79`, main `c99119955391d1e213278d4f2361891815361995`, **57 ahead / 101 behind**, merge base `cc2f04e28c3d11c6848a5ed2925defb72a15b447`. Rebase remains necessary.

Other open items: duplicate `nativeGamePhase` P0 in both manifest arrays; Docker canary positive control remains on a custom bridge and can false-pass a default-bridge worker; no hosted contract/canary has run. Contract-only now includes the synthetic adapter test and Agent6/Agent46 policy tests; the compiled native regression is in the post-compile full suite. The host Node runtime is already pinned to 24.22.3 by the dedicated contract-only setup-node step. No CI or fixture was dispatched.


### 21:04 UTC correction — contract-only host Node is already pinned

I retract the 20:59 concern that `contract_only` runs on an unpinned host Node. The complete workflow contains a dedicated **“Set up Node runtime for contract-only tests”** step at lines 149–154, conditioned to include `inputs.contract_only` and explicitly setting `node-version: '24.22.3'`. The later dependency-cache setup is the full-lane step and is correctly skipped for contract_only. No workflow change is required. Correction sent to Agent49 at `communications/agent49/20261114T2104Z_agent35-retract-node-pin-concern.md`.


### 21:10 UTC update — projector now supports typed attacks and Trainer/Energy actions, but branch adapter is incompatible

Reviewed Agent49 commits `f0e76ae`, `3ec9091`, `c00eb69`, `a521e9e`, and `a18b1a4`. The branch now:
- projects `USE_TRAINER_ABILITY_ACTION` and `USE_ENERGY_ABILITY_ACTION` as `use-ability` with hand/discard source metadata;
- requires typed `__agent3AttackSource` metadata for `ATTACK_ACTION`, projects the actual source printing and a structured `publicMetadata.attackSource`;
- validates exact bounded attack-source metadata in the worker protocol;
- tests synthetic active/Bench/Tool source projections and Trainer/Energy ability projections;
- dispatches all nine compiled Basic-action frontier tokens through `Simulator.store` and asserts the Bench state transition.

**New P0 adapter/projector mismatch:** the adapter file still on this branch is `5099a4cd9b57be50f38e4637a5270baeeffc6ca5`, which emits plain `AttackAction(player.id, attack.name)` and does not attach `__agent3AttackSource`. The new projector returns `null` for every attack without that marker; the admission gate then rejects roots with any legal attack. Thus the new synthetic projector test passes only because it manually attaches fake markers, and the compiled Store regression covers Basic plays only. Incorporate Agent3's updated marker-bearing adapter from main and add an adapter → compiled enumerator → projector integration test. Exact P0 sent at `communications/agent49/20261114T2108Z_agent35-adapter-projector-p0.md`.

The duplicate `nativeGamePhase` P0 remains in both manifest binding arrays. The custom-bridge Docker network positive control can still false-pass a default-bridge worker; exact `--network`-flag uniqueness is not asserted. Contract-only host Node is correctly pinned to 24.22.3 (the earlier concern is retracted). Contract-only includes synthetic adapter, Agent6 and Agent46 tests; the compiled Basic Store regression runs in the post-compile full suite. No hosted tests have run.

At 21:09:52Z the branch head was `a18b1a4efea100fd8283fcc706f735edfd354557`, main `894eeca37465ef4cf1556b81976b35959e1ca86c`: **64 ahead / 136 behind**, merge base `cc2f04e28c3d11c6848a5ed2925defb72a15b447`. Rebase is still required before any acceptance run.


### 21:11 UTC addendum — branch admission gate does not enforce adapter completeness marker

The current branch's `assertKnownCapFreeAdapterAdmissionClear()` checks marker presence/schema/immutability and engine pin, but does not assert `removedPerFamilyCap===8` or that all four advertised coverage flags are true (`includesAttachedToolPowers`, `includesToolAndBenchAttacks`, `includesHandAbilities`, `includesTrainerEnergyDiscardAbilities`). The marker happens to contain true values, but the gate does not enforce them. Agent3's updated main-branch gate checks these exact fields; incorporate it with the marker-bearing adapter. Sent to Agent49 at `communications/agent49/20261114T2111Z_agent35-adapter-marker-gate.md`.


### 21:14 UTC correction — Agent49 merged latest main; adapter/projector marker mismatch closed in code

Reviewed merge commit `3ce5234ec3954a0c7821a8123e22ee16384b1204` (21:12:20Z). The branch now contains Agent3's marker-bearing adapter (`__agent3AttackSource`) and the updated admission gate enforcing `removedPerFamilyCap===8` plus all four coverage flags. The adapter marker fields match the projector/protocol schema, and the projector now handles Trainer/Energy abilities. This closes the earlier markerless-adapter and marker-gate findings at the source-code level.

**One integration-test gap remains:** the adapter tests assert that adapter-produced actions have markers, while the frontier tests manually attach synthetic markers. No test yet feeds an actual `createKnownCapFreeActionEnumerator()` output through `buildNativeActionFrontier()`. Add a single adapter→frontier regression with `unsupportedCount===0` and source metadata equality. The compiled native test dispatches all nine Basic actions through Store, but does not yet exercise compiled attack or ability families. Request sent at `communications/agent49/20261114T2114Z_agent35-adapter-frontier-integration-test.md`.

At 21:13:17Z branch head `3ce5234ec3954a0c7821a8123e22ee16384b1204` compared with main `894eeca37465ef4cf1556b81976b35959e1ca86c` was **65 ahead / 1 behind**, merge base `1dfef3e8176ad58f3cd6840ded571fe4773d2c2e`. The branch is no longer 100+ commits behind; it has merged the current main line.

The remaining P0 is the duplicate `nativeGamePhase` binding in both default manifest arrays, which makes the existing `tests/agent36-v3-runner.test.cjs` manifest test fail. The Docker canary still uses a custom-bridge peer positive control and the launcher test checks only presence (not uniqueness) of `--network=none`; the default-bridge false-pass remains. Contract-only host Node is correctly pinned to 24.22.3. Contract-only includes the synthetic adapter and Agent6/Agent46 tests; the compiled Basic Store test is in the post-compile full suite. No hosted tests have run.


### 21:15 UTC addendum — adapter marker test stops before inherited enumerate()

The current Agent3 adapter test asserts `__agent3AttackSource` on direct `enumerator.attackActions(state, player)` results. The V3 frontier consumes `enumerator.enumerate(state, player)`. Its existing patched-vs-original deep-equality test does not assert the non-enumerable marker (deep equality ignores it). Therefore it remains unproven that the inherited pinned `enumerate()` method preserves action object identity/marker rather than cloning or spreading the actions. Agent35 requested an enumerate-level marker-retention assertion and same-name dedupe check from Agent3 at `communications/agent3/20261114T2115Z_agent35-enumerate-marker-retention.md`. The requested Agent49 adapter→frontier integration test also covers this gap.


### 21:19 UTC P0 — contract_only also omits the vendor submodule required by its manifest test

The workflow skips “Check out the pinned Twinleaf submodule” whenever `inputs.contract_only` is true, and the preceding `actions/checkout@v4` uses the default `submodules: false`. However, `tests/agent36-v3-runner.test.cjs` calls `buildFixtureRoleEntryManifest()` with `V3_FIXTURE_WORKER_COMMON_BINDINGS`, which includes direct `vendor/twinleaf` paths. `createPolicyEntryManifest()` reads each direct vendor dependency with `fs.readFileSync()` in `addVendorDependency()` (around `agent42-role-policy-identity.cjs:295-302`). Thus, after the duplicate `nativeGamePhase` names are removed, the same contract-only test will fail ENOENT because the pinned submodule source is absent. The contract lane need not compile Twinleaf or install npm dependencies, but it must check out the pinned submodule source and record its SHA if it builds a manifest containing vendor bindings. Agent49 notified at `communications/agent49/20261114T2119Z_agent35-contract-only-submodule-p0.md`.


### 21:26 UTC — reusable test designs now available

Agent7 supplied a minimal adapter→frontier integration test skeleton at `communications/agent49/2026-11/20261114T212251Z_agent7-adapter-frontier-test-skeleton.md`: use the real adapter's `enumerate()` output, pass the exact enumerator to `buildNativeActionFrontier()`, assert source metadata, token identity, protocol validity and zero unsupported actions. Agent16 supplied a real Expanded-legal Bench-attack witness at `communications/agent49/2026-11/20261114T211334Z_agent16-alakazam-bench-attack-native-witness.md`: Alakazam ex 151/SV3pt5 65 (`sv3pt5-65`), Dimensional Hand, Bench slot 2, two Psychic Energy, active with no attacks; expected `bench-pokemon` source and 120 damage to opposing Active if supported by pinned engine. Both handoffs were relayed to Agent49 at `communications/agent49/2026-11/20261114T2126Z_agent35-ready-made-frontier-tests.md`. The Alakazam witness is a rules/engine regression, not a claim about Top32 representation.


### 21:30 UTC — Alakazam Bench-attack witness verified against supplied card pool

Inspected the uploaded `card-list.zip` directly. `cards/en/sv3pt5.json` contains `sv3pt5-65` (Alakazam ex) with `legalities.expanded = Legal`; `Dimensional Hand` costs Psychic + Psychic, deals 120 damage, and explicitly permits use while Alakazam is on the Bench. This validates Agent16's proposed generic Bench-source regression fixture against the project's primary local card-pool source. It is not evidence that Alakazam appears in Aichi Top32. Verification relayed to Agent49 at `communications/agent49/2026-11/20261114T2130Z_agent35-verified-alakazam-witness.md`.


**Fixture legality refinement:** Alakazam ex is a Stage 2 evolving from Kadabra, so the compiled Bench fixture should represent the Kadabra → Alakazam ex evolution stack before attaching the two Psychic Energy. A standalone Alakazam ex in a Bench slot would not be a legal board state. Refinement sent at `communications/agent49/2026-11/20261114T2131Z_agent35-alakazam-evolution-stack.md`.


**21:36 UTC correction to evolution stack:** the full legal Stage 2 stack is `Abra (sv3pt5-63) → Kadabra (sv3pt5-64) → Alakazam ex (sv3pt5-65)`; all three are Expanded Legal in the supplied card pool. The 21:31 note mentioning only Kadabra → Alakazam ex was incomplete. Corrected full-stack instruction sent to Agent49 at `communications/agent49/2026-11/20261114T2136Z_agent35-correct-full-alakazam-stack.md`.


## 14 November 2026, 22:37 UTC — contract-only path exists; branch still fails preflight and canary has a network false-pass

Reviewed Agent49's rebased2 branch at `3ce5234ec3954a0c7821a8123e22ee16384b1204`, the older `...-current` branch at `ebd637463a5d48c77c90c4161ffcf74c6c11bd3d`, and the current main workflow (main was `fbb7e705d6f852b05ec100fb6be9bb41dd12a507` after this reviewer's direct handoff). The branch comparison at review time was **65 commits ahead / 232 behind main**. Do not confuse the old `...-current` branch with `...-rebased2`.

### CI coverage correction

The recent claim that there is no worker acceptance workflow is too broad. The existing `.github/workflows/agent36-bilateral-competence-v9.yml` already has a `contract_only` lane that runs the V3 runner, policy-worker protocol, launcher contract, Docker preflight, and Docker policy-worker test. The Docker test includes separate production-worker Node 24 positive-decision and timeout/cleanup smokes. The workflow is already at the 25-input GitHub.com limit. **Do not add another workflow or input.** There is no hosted run on the reviewed branch, so the evidence gap is execution on the exact accepted ref, not absence of a CI entry point.

### Deterministic contract-only preflight blockers

1. In the reviewed runner, `V3_FIXTURE_COMMON_BINDINGS` and `V3_FIXTURE_WORKER_COMMON_BINDINGS` each contain `nativeGamePhase` twice. The role manifest builder rejects duplicate common binding names. The `tests/agent36-v3-runner.test.cjs` manifest test therefore fails before Docker preflight.
2. The same workflow skips pinned Twinleaf checkout when `contract_only` is true, but that runner test builds manifests from `V3_FIXTURE_WORKER_COMMON_BINDINGS`, whose vendor dependency closure reads compiled files below `vendor/twinleaf/ptcg-server/output/`. After the duplicate is fixed, a clean contract-only checkout will fail ENOENT unless it initializes the pinned submodule. Initialize the submodule for this lane without compiling it or installing its dependencies.

### Network canary false-pass and measurement gaps

The reviewed Docker test's probe server is attached to a newly created custom bridge, and the positive-control client joins that same custom bridge. The worker probes the server's private IP and is expected not to connect. A worker regressing to Docker's default `bridge` cannot reach a peer on the separate custom bridge either; its network namespace is still distinct from the host. The current negative assertion can therefore pass with network access. This is a test false-pass, not evidence that the current worker has network access.

Move the server and positive-control client to Docker's default `bridge`; keep the positive-control success assertion. Add a worker-side `node:os.networkInterfaces()` check for no non-loopback interface and assert the effective `HostConfig.NetworkMode` is exactly `none`. The launcher assertions currently check that `--network=none` is present, but not that it is the sole network-mode flag.

The OS canary still packages `agent49-docker-canary-worker.cjs` (a test-only worker); the separate production VM-worker smoke verifies READY, one decision, zero policy draws, and clean close but does not run the OS probes. The canary also does not report effective UID/GID, `CapEff`, `NoNewPrivs`, `Seccomp`, cgroup memory/pids/CPU limits, or measured `/dev/shm` size; the report's constraints are configured values. The acceptance contract's effective-state and production-worker requirements remain open unless the owner explicitly accepts and documents an equivalent combined proof.

### Source corrections already present — do not reopen without regression

The reviewed branch contains the host macrotask barrier and nested-`toJSON` deferred-RNG regression; `AsyncDockerPolicySession.decide()` propagates numeric `policyDrawCount`; the production worker has Node 24 success and non-settling timeout/cleanup tests; and the parent physical-RNG sentinel is installed/restored around the canary. These are source-level corrections, not hosted acceptance.

### Native adapter/frontier integration remains unproven

The cap-free adapter test exercises its own `enumerate()` output and marker; the frontier tests use synthetic enumerators. There is still no test that passes the actual adapter-produced enumerator through `buildNativeActionFrontier()` and checks source metadata plus zero unsupported actions. The compiled Store regression dispatches the nine Basic-action tokens only; it does not cover the attack, Trainer-ability, or Energy-ability families. Agent7's adapter→frontier test skeleton and Agent16's legal Alakazam Bench-attack witness remain useful inputs.

**Disposition:** no hosted contract-only run or fixture was performed by this reviewer. Fix the duplicate bindings, contract-only submodule checkout, and network topology; close the effective-isolation/worker-canary and adapter→frontier/compiled-action-family gaps; rebase/selectively carry the reviewed work onto current main; then run the existing contract-only workflow on the exact reviewed branch. No competitive game, matchup, deck-selection, or win-rate claim follows from these engineering tests.


## 14 November 2026, 22:41 UTC — hosted contract-only run exposes two worker-source defects

Critic dispatched run **43648110534** on `agent2/v3-global-binding-lock-20261114` at `d319fa5e71c9593735b8ebb05d0262cfbb831925` with `contract_only=true`. I retrieved the failed-job tail through the GitHub Actions log tool. The run is a **failure**, not acceptance evidence, and it is not the canonical Agent49 branch.

Three independent test failures appeared before Docker preflight:

1. An unrelated actor-only policy test failed at `tests/agent34-actor-only-root-policy.test.cjs:1613`: a post-Timeless Max Geist route was returned where the fixture expected `null` because Fairy Zone liveness was described as unknown. This needs separate policy-owner adjudication; do not mask it in the worker integration.
2. The real role-manifest test rejected one unresolved `computedEnvSites` row in `simulation/evaluation/2026-11/agent36-docker-policy-worker.cjs`. The source is `assertLocalDockerSelection()` reading `process.env[key]` while iterating the two-key allowlist `['DOCKER_HOST','DOCKER_CONTEXT']`. Static reads of `process.env.DOCKER_HOST` and `process.env.DOCKER_CONTEXT` preserve the fail-closed behavior and make the audit statically provable.
3. The launcher-closure regression failed because `inspectContainerExists()` and `removeContainerById()` call `dockerBinary()`. There is no module-level function; `dockerBinary='docker'` is only a string parameter local to `spawnDockerPolicyWorker`. Use the reviewed literal/constant `'docker'` or pass the string into the helpers.

The Docker preflight and OS canary did **not** execute because the launcher-contract step failed. The same two worker-source defects are present in the reviewed Agent49 `3ce5234` branch. The workflow also skipped pinned Twinleaf checkout in contract-only mode. On the canonical Agent49 branch, the duplicate `nativeGamePhase` bindings remain an additional earlier manifest failure; the contract-only submodule omission remains a subsequent failure after the manifest defects are corrected.

Agent49 received the exact source-level diagnosis at `communications/agent49/20261114T224050Z_agent35-worker-closure-launcher-root-cause.md`. Do not rerun this unchanged head. The only useful next run is after the worker-source defects and canonical-branch manifest/submodule blockers are fixed, on the exact reviewed Agent49 ref; then the Docker preflight and canary must actually execute. No fixture or competitive claim follows.


## 14 November 2026, 22:44 UTC — Agent2 global-binding patch review

Reviewed Agent2's commits individually, not its divergent branch. Commit `799c22440171e99aba437d3cd6388bf302e821ff` changes only the worker setup (+4/-1); commit `d319fa5e71c9593735b8ebb05d0262cfbb831925` changes only the policy-worker test (+25). The canonical Agent49 `3ce5234` worker already has the implementation semantics: `globalThis` and the global `Math` binding are locked non-writable/non-configurable, and `Math.random` closes over the captured `safeRng`. The implementation commit is therefore redundant on the canonical branch.

The test commit adds missing explicit `Object.defineProperty` replacement attempts against `globalThis` and `Math`, plus a direct descriptor probe for `Math.random`. Existing Agent49 tests cover assignment replacement and some descriptors but not these redefinition attempts. **Recommendation: port/adapt only the test additions**, not Agent2's broader branch or unrelated runner/prompt/RNG changes. Agent49 was notified at `communications/agent49/20261114T224321Z_agent35-agent2-binding-patch-review.md`.

The Agent2 branch's hosted run 43648110534 remains failed on independent manifest/launcher and actor-only test issues and never reached Docker preflight/canary. The binding test addition is useful coverage, not a CI pass or worker acceptance.


## 14 November 2026, 22:49 UTC — two-layer canary accepted; expanded run failures routed by owner

### Canary architecture correction

Re-read Agent49's 19:16 separation rationale. A more privileged test-only Node worker is appropriate for probing the Docker OS boundary; running those probes through the restricted production VM would instead test the VM boundary and could mask container access. The separate Node24 production-worker smoke tests the actual restricted VM protocol/lifecycle. **Accept this as a two-layer proof**, not a defect, provided both paths use the same reviewed `spawnDockerPolicyWorker` constraints, effective container configuration, bundle verification, and cleanup path. Do not weaken the production VM. This supersedes the earlier tentative requirement that the OS canary itself use the production executable.

The actual canary gaps remain: custom-bridge topology false-passes a default-bridge regression; no non-loopback-interface probe; no unique network-flag/effective `HostConfig.NetworkMode=none` assertion; no measured effective UID/GID, CapEff, NoNewPrivs, Seccomp, cgroup memory/pids/CPU limits, or /dev/shm size.

### Additional failures visible in the expanded failed-job tail

The 650-line tail for run 43648110534 exposes further failures on the Agent2/current-main snapshot, beyond the initial three:

- `agent36-actor-view-boundary.test.cjs`: own-hand visibility assertion failed (`actual: false`).
- `agent36-docker-policy-bundle-integrity.test.cjs`: three tampering tests failed with EACCES while attempting to mutate read-only bundle files or create a symlink.
- `agent36-native-action-frontier.test.cjs`: expected metadata omitted `targetSeat` and `targetZone`, while actual output included them.
- `agent49-native-fixture-game.test.cjs`: async fixture generator hit its 3,000-action cap in turn 1 (2,999 seat-0 actions, one seat-1 action) without a natural terminal.

These are separate current-main/Agent2-snapshot test failures, not consequences of the two Agent2 binding commits and not automatically present on older Agent49 3ce. The host/fixture failures were routed to Agent36 at `communications/agent36/20261114T224716Z_agent35-host-path-contract-only-failure-triage.md`; the actor-only root-policy assertion remains separate ownership. Run 43648110534 remains failed; no Docker preflight/canary ran because launcher closure verification threw `ReferenceError: dockerBinary is not defined`.


## 14 November 2026, 22:50 UTC — Agent2 binding regression is green inside an otherwise red run

Expanded the same failed-only job log to the policy-worker test step. In run 43648110534, `restricted VM pins globalThis and Math bindings against policy replacement` passed (177.87 ms), and the worker-local RNG independence/reporting test passed (37.49 ms). This is positive hosted evidence for the **test-only** Agent2 addition. It does not change the overall failed conclusion: the broader contract-only test command had independent failures, the launcher-closure test failed, and Docker preflight/canary did not run. Port the test-only regression onto the canonical Agent49 branch; do not carry the divergent branch wholesale.


## 14 November 2026, 22:51 UTC — role manifest host/data-asset separation verified

A fresh source review of Agent49 branch `3ce5234` confirms the intended host/worker boundary is present: the host entrypoint is `agent44-role-scoped-policy-composition.cjs`; the host imports the pure `agent49-policy-protocol.cjs`; the production `agent49-policy-worker.cjs` and test-only `agent49-docker-canary-worker.cjs` are separately hashed `dataAssets`, not host `manifest.files` or `expectedByPath`; and the runner verifies both are excluded from the host prompt/common-binding chain. Host preload verifies policy hashes/cache absence, temporarily guards `Module._load`, and checks transitive imports do not execute the policy. This is a positive source-level result and should not be reopened without contrary evidence.

The remaining role-manifest blockers are narrower: duplicate `nativeGamePhase` entries in the two common-binding arrays on 3ce, and the host launcher's single computed environment lookup (`process.env[key]`) that failed the manifest audit on the Agent2/current-main run. The production worker executable is already correctly treated as a data asset; do not "fix" the audit by adding it to host closure.


### Pinned Twinleaf checkout reference

The current main `.gitmodules` declares path `vendor/twinleaf`, remote `https://github.com/twinleafgg/twinleafgg.git`; the Git tree pins submodule commit `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` (mode 160000). The contract-only checkout fix must initialize this exact path/pin. No upstream interaction or submodule change was made.


### Fastest path to a first real OS-canary result

In the existing workflow, the Docker launcher-contract step runs under `always() && contract_only`; Docker preflight is gated only on launcher-contract success; Docker canary is gated only on preflight success. Neither depends on the broad contract-only Node suite or the role-manifest test outcome. Therefore the minimal first-canary unblock is to fix the `dockerBinary()` launcher ReferenceError and pass the launcher-contract step. The canary can then execute even while unrelated suite/manifest tests remain red; the overall workflow must still be reported failed until those are fixed. This sequencing was handed to Agent36 at `communications/agent36/20261114T225210Z_agent35-canary-unblock-sequencing.md`.


### Correction to earlier submodule recommendation

The workflow description explicitly says `contract_only` runs without compiling Twinleaf, and the full lane's compile step performs `npm ci && npm run compile` inside `vendor/twinleaf/ptcg-server`. Therefore the missing `output/` files are generated artifacts: **submodule checkout alone is not a fix**. Preserve the contract-only no-compile semantics by using a temporary fixture root/stub vendor files for the pure manifest contract test, and keep the actual compiled-vendor binding verification in a compile-enabled existing path. This supersedes the earlier suggestion to initialize the submodule without compiling. The correction was broadcast at `communications/broadcast/2026-11/20261114T225420Z_agent35-correct-contract-only-build-dependency.md`.


## 14 November 2026, 22:57 UTC — remaining V3 runner blockers reverified on 3ce

A targeted source pass confirms the following older README blockers are still present on the reviewed Agent49 3ce branch; they should not be treated as resolved by the worker protocol fixes:

- **LF framing:** `agent49-docker-canary-worker.cjs` writes `JSON.stringify(value)+'\\n'` (two source backslashes, so the emitted bytes are literal backslash+n rather than byte 0x0A). The production Node24 success-smoke policy source in `agent36-docker-policy-worker.test.cjs` also uses `.join('\\n')`, producing invalid source; the timeout-smoke policy correctly uses `.join('\n')`. Fix the first two literals to actual LF.
- **Stadium liveness mismatch:** `projectNativeAction()` emits `kind:'use-stadium'` without `publicMetadata.stadiumEffectLive`, while `assertTrustedActionSelection()` rejects every selected stadium action unless that field is exactly true. The current path exposes a token that it will later reject. Keep the fail-closed intent; move supported-effect liveness filtering/annotation into frontier construction so passive/no-op stadiums are not exposed and live supported effects are selectable.
- **Validation RNG scope:** `withValidationRandom()` wraps frontier construction and adapter admission only. The subsequent `dispatchSelectedNativeAction(..., dispatch:false)` revalidation probe is outside the scope. Wrap only that pre-dispatch validation probe in the deterministic validation RNG scope; keep the real Store dispatch on physical RNG. No evidence yet that a current action actually consumes randomness here.
- **Simulator error classification:** `buildNativeActionFrontier()` catches every thrown value from Simulator dispatch and increments `rejectedCount`. Only the pinned `GameError` should count as an expected illegal action; unexpected TypeError, missing-card, assertion, or reducer failures must propagate or produce a fail-closed validation diagnostic. The reviewed runner binding list does not expose `GameError` yet.

These are host/fixture acceptance blockers, separate from Agent49's worker VM implementation. No card-specific or competitive conclusion follows.


## 14 November 2026, 23:04 UTC — reconcile stale 3ce canary with current-main Docker test

A cross-ref review clarified that the 3ce branch's external `agent49-docker-canary-worker.cjs` and its literal-backslash-n defects are branch-specific. Current main has no such file: its Docker test uses the actual `agent49-policy-worker.cjs` as `WORKER_SOURCE`, runs the privileged OS-probe policy through the production worker with the Node permission model disabled for the appropriate combinations, and builds policy source with actual LF separators. The worker's `writeLine()` also emits an actual LF. Both main and 3ce currently use the same Docker limits (UID/GID 65532, cap-drop all, no-new-privileges, pids 64, memory 512m, CPUs 1, shm 16m, read-only root/bundle, network none).

The 3ce branch has a stronger host/worker protocol split (`agent49-policy-protocol.cjs` as the host dependency; production worker executable as a data asset) than current main, which imports `agent49-policy-worker.cjs` for host protocol validation. Preserve the 3ce pure-protocol/data-asset boundary while reconciling its stale canary/test framing with the current-main LF-correct test design; do not blindly replace one architecture with the other. The custom-bridge positive control and missing effective security measurements remain in both test designs.


## 14 November 2026, 23:06 UTC — PR49/PR50 role-option overlap reviewed against 3ce

Agent41's PR49/PR50 handoff is partly redundant on the canonical 3ce branch. `buildFixtureRoleIdentities()` already accepts separate candidate/opponent policy options, defaults them to the frozen V3 constants, and passes them to the real identity helper. Its existing test already asserts candidate `{quickBallRoot:true}`, opponent `{}`, and the two `policyOptionsSha256` values. PR49's injected-helper seam and PR50's production diff are unnecessary on 3ce. The only useful PR50 test delta is an explicit assertion that the resulting `candidateIdentity.policySha256` and `opponentIdentity.policySha256` differ. Agent49 was advised to port only that assertion, optionally importing the frozen constants; no production patch or injection seam is needed.


## 14 November 2026, 23:17 UTC — Critic supersedes PR49/PR50 follow-up

Critic closed PRs #49 and #50 as duplicate/superseded, not merged, and confirmed the role-option correction and real-builder regression already exist on main. The 3ce branch already contains the separate candidate/opponent option binding and option-digest checks. **Withdraw Agent35's earlier suggestion to add PR #50's separate `policySha256` inequality assertion**; do not reopen or recreate role-option work. This correction was sent to Agent49 at `communications/agent49/20261114T231734Z_agent35-withdraw-pr50-assertion-recommendation.md`. Resume the existing single-owner worker stopline and focus only on distinct acceptance blockers.


---

## 15 November 2026, 00:24 UTC — canonical mainline and first hosted Docker canary

### Reviewed head

Agent49 reclaimed the sole host/worker implementation role and created branch agent49/v3-worker-acceptance-20261115-mainline. Reviewed head: dfd8584caa118ac49e1e8db1042078b9a5165ef4, commit title “Agent49: rebase V3 worker integration and close isolation gates”. It is based on main at 1f845ac5990dc7beb6147804729655e50f1cfba7. Main has since advanced with Agent35 review and synthesis commits; rebase before the next canonical run.

The new head materially closes several earlier blockers: host-owned role entrypoint and worker-only policy data assets; host preload exclusion; VM-restricted policy loading with locked globals and nested-microtask barrier; numeric zero policyDrawCount propagation; absolute startup/request deadlines covering stdin drain and response; static Docker environment reads and fixed CLI cleanup; LF-correct framing; default-bridge network positive control; effective NetworkMode=none and no non-loopback interface assertions; mixed Basic/non-Basic setup projection coverage; deterministic validation RNG around frontier construction.

### Hosted contract-only run 43657711184

Run 43657711184 (workflow run 218) was dispatched on the exact dfd8584 head with contract_only=true. It did not check out or compile Twinleaf and did not execute a game.

- Docker launcher contract: 17/17 passed.
- Docker preflight: passed on Node v24.22.3 and Docker 29.4.2 using the pinned Node image digest.
- Docker OS canary: passed for both physical seats. The default-bridge positive-control peer was reachable from its control container; the policy worker's inspected NetworkMode was none; no non-loopback interfaces were present; host marker/process and child/thread isolation checks passed.
- Production VM worker positive smoke: READY, one ordered decision, zero policy RNG draws, clean close — passed.
- Production async-timeout smoke: failed at tests/2026-11/agent36-docker-policy-worker.test.cjs:635 because the timeout cleanup receipt exposes stopped but not processClosed. stopDockerPolicyWorker() computes stopped as !stillRunning() and verifies containerRemoved; add processClosed explicitly from the same observation and assert it in the abort receipt. This is currently a receipt-schema failure, not evidence that the process remained alive.
- Broad pure-policy suite: failed on tests/agent49-actor-potential-knockout.test.cjs:129, where a public Weakness case expected the Finish attack but chooseActorRootIntent returned pass/no-supported-owner-visible-root. The failing test imports the actor-only root policy and public potential-knockout helper, not the Docker worker; keep it visible and route it to the relevant policy owner rather than masking it.

The hosted canary artifact is 14138897621. The canary's hostNamespaceInodes are correctly read from the runner host's /proc/self/ns entries, not from the peer server container; retire the earlier stale claim. The custom-bridge network false-pass is fixed on this head by using the default bridge for the server and positive control, inspecting effective NetworkMode, and asserting loopback-only worker interfaces.

### Remaining acceptance blockers on dfd8584

**Manifest duplicate finding — retracted.** Agent44 independently counted the actual arrays at dfd8584; Agent35 then parsed the branch source and confirmed 35/35 unique names in V3_FIXTURE_COMMON_BINDINGS and 48/48 unique names in V3_FIXTURE_WORKER_COMMON_BINDINGS, with nativeGamePhase once in each. The arrays are passed separately to createPolicyEntryManifest(), not concatenated. Agent35 had conflated the one occurrence in each separate array and incorrectly reported a duplicate. No binding change or duplicate-specific test is required.

**P1 — selected-action validation RNG.** withValidationRandom() wraps frontier construction only. After the worker responds, dispatchSelectedNativeAction(..., dispatch:false) constructs a fresh Simulator and dispatches the chosen action on its clone outside that scope. Wrap only this pre-dispatch validation probe in withValidationRandom(); keep the later real Store dispatch on physical RNG. This is an unisolated boundary, not evidence that a current action consumes randomness.

**P1 — Stadium liveness.** projectNativeAction() emits use-stadium without publicMetadata.stadiumEffectLive, while assertTrustedActionSelection() rejects every selected Stadium token unless that metadata is true. The frontier can therefore expose a token the consumer later refuses. Keep the fail-closed consumer; move exact live-effect/support classification into frontier construction so verified live effects are exposed and passive/no-op/unknown effects are filtered.

**P1 — Simulator exception classification.** buildNativeActionFrontier() catches every exception from Simulator clone dispatch and increments rejectedCount. This can hide TypeErrors, missing bindings and engine regressions as ordinary illegal actions. Catch only the pinned engine's verified illegal-action error type(s); propagate unexpected errors and test that a TypeError escapes.

**P1 — native action-family evidence.** The new compiled native integration test exercises nine Basic hand actions only. Active/Bench/Tool attacks and Trainer/Energy abilities are covered by synthetic fake-action tests, not by the pinned native engine through adapter → frontier → policy-visible token → selected-action revalidation → Store dispatch. Add real compiled witnesses (including the previously documented Alakazam ex evolution-stack Bench attack) and a real ability action where supported.

**P1 — effective sandbox measurements.** The canary now proves network none, loopback-only interfaces, namespace isolation, host marker inaccessibility, and process/thread behavior. Its report still presents configured UID/GID, capabilities, no-new-privileges, cgroup, and /dev/shm limits without measuring all corresponding effective values. Add observed UID/GID, CapEff, NoNewPrivs, Seccomp, cgroup-v2 memory/pids/CPU values, and actual /dev/shm capacity; separate requested settings from measured effective state.

### Acceptance decision

The new head is a meaningful improvement and the first hosted Docker canary evidence exists, but the integration remains **not accepted**. The workflow is red, the production timeout cleanup receipt test fails, the real manifest contains duplicate binding names, and the native action path has unresolved RNG, Stadium, exception-classification and action-family gaps. The run is contract-only; it provides no Twinleaf compilation, game, matchup or win-rate evidence. No claim toward 99.5% is justified, and no fixture should run until canonical hosted acceptance passes and the owner explicitly resolves physical-seed disclosure.

Agent49 remains the sole host/worker implementation owner. Agent35 remains an adversarial reviewer; no worker/host implementation was changed by Agent35.


### 15 November 2026, 00:30 UTC — exact pinned error and Stadium implementation path

A follow-up read of the pinned Twinleaf source resolves the error-class question. At pin a9905a76a6c4103ba4b6cb9a49e86bad795c5c05, ptcg-server/src/game/game-error.ts exports GameError as a plain class with a public message string; it does not extend Error. Its compiled output path is vendor/twinleaf/ptcg-server/output/game/game-error.js. Bind this exact export as nativeGameError and classify expected Simulator rejection with error instanceof native.GameError. Do not classify by a generic Error check or swallow unknown exceptions. Update synthetic frontier fixtures to throw a fake GameError for expected illegality and assert that TypeError/ordinary Error propagate.

There is also a concrete Stadium-liveness route that reuses the existing gate: buildNativeActionFrontier() successfully dispatches each candidate through a fresh Simulator before projectNativeAction(). A USE_STADIUM_ACTION that reaches projection has therefore passed the cloned native dispatch. After the GameError classifier is in place, projectNativeAction() can mark that surviving item with publicMetadata.stadiumEffectLive=true. Passive/no-op Stadiums whose pinned card implementations throw GameError(CANNOT_USE_STADIUM) are filtered before projection; a supported live effect such as Tropical Beach remains selectable. Preserve the consumer's fail-closed assertion and add pinned positive/negative regressions (Tropical Beach positive; Sky Field and Dimension Valley passive/no-op negatives). Keep this validation-only Simulator dispatch inside withValidationRandom().


### 15 November 2026, 00:36 UTC — typed Night Watch provenance regression closes the old fallback concern at unit level

The dfd8584 mainline replaces the earlier free-form host-only fallback with installPromptProvenanceHook(), which records typed source-card/effect provenance around the pinned Store.callReduceEffect -> Store.prompt path. hostOnlyPrompt() treats Night Watch as host-owned only when the active typed provenance identifies effectName Night Watch and the exact Trevenant & Dusknoir-GX SMP printing. makeSource() rejects missing/invisible source provenance and unsupported Copycat prompts. The current prompt-projection tests cover exact Night Watch positive classification, prompt-text spoofing, missing provenance, untrusted prompt.sourceCard, and Copycat fail-closed behavior.

This resolves the prior provenance-forgery concern at the unit/contract level; it is no longer an identified source-code blocker on dfd8584. The actual pinned Store hook still needs to be exercised in a compiled native game, which the contract-only run did not perform.


### 15 November 2026, 00:37 UTC — host-only prompt resolver audit

The dfd8584 prompt projection has two additional uncovered host-only cases:

- The earlier claim that ShuffleHandPrompt's owner.prizes.length is wrong was a false positive and is retracted. Agent44 checked the pinned prompt validator: ShuffleHandPrompt.validate() explicitly expects a result length equal to player.prizes.length despite the class name, so the current resolver's prize-count permutation is correct. Add a regression where hand size differs from prize count to lock this surprising native contract; do not change the resolver to hand.cards.length.
- InvitePlayerPrompt is classified host-only by hostOnlyPrompt(), but resolveHostOnlyPrompt() has no InvitePlayerPrompt branch and falls through to UNSUPPORTED_HOST_ONLY_PROMPT. If this networking prompt cannot occur in the local paper fixture, remove it from the host-only allowlist; otherwise define and test an explicit safe resolution.

Current prompt-projection tests cover Night Watch provenance, generic host-only cases, and prompt choices, but have no ShuffleHandPrompt or InvitePlayerPrompt coverage. These are separate from the now-improved typed Night Watch provenance path.


### 15 November 2026, 00:39 UTC — retraction of false duplicate-binding P0

The preceding P0 duplicate-binding paragraph is superseded and retracted. The independent Agent44 correction is valid. A fresh source parse of branch agent49/v3-worker-acceptance-20261115-mainline at dfd8584 counted 35/35 unique names in V3_FIXTURE_COMMON_BINDINGS and 48/48 unique names in V3_FIXTURE_WORKER_COMMON_BINDINGS; nativeGamePhase appears once in each. createPolicyEntryManifest() receives one array per call, and the two arrays are not concatenated. This was an Agent35 review error caused by conflating occurrences across the two arrays. Do not modify the bindings on this basis. All other separately stated acceptance gates remain open.


### 15 November 2026, 00:40 UTC — VM binding-lock implementation is present; descriptor/redefinition tests are not

The dfd8584 worker implementation locks the globalThis and Math bindings and freezes Math.random, but the current tests/2026-11/agent49-policy-worker.test.cjs does not include the narrow regression additions from Agent2 commit d319fa5. Comparing the test files confirms that d319fa5 adds a probe of the globalThis, Math, and Math.random property descriptors, plus Object.defineProperty replacement attempts for globalThis and Math. Port those test cases/request IDs only (probe-global-bindings, force-globalthis-redefine, force-math-redefine); do not merge the divergent Agent2 implementation branch. This is a regression-coverage gap, not evidence that the current lock implementation is absent.


### 15 November 2026, 00:42 UTC — GameError must be message-allowlisted, not blanket-swallowed

GameError is the correct pinned exception class boundary, but it is generic: its constructor accepts a GameMessage value. Do not treat every GameError instance as ordinary illegal-action rejection. Use error instanceof native.GameError plus an explicit allowlist of verified expected-illegality GameMessage values (at minimum the pinned ILLEGAL_ACTION code; do not assume CANNOT_USE_STADIUM, which Agent44's pinned scan did not identify). Rethrow unknown GameError messages so unsupported effects, missing card implementations and engine regressions remain visible. Add both an allowed expected-illegality test and an unrecognized-GameError propagation test.


### 15 November 2026, 00:43 UTC — exact Simulator constructor and dispatch error boundary

Agent44's pinned-source review further narrows the classifier. Simulator construction itself throws GameError(GameCoreError.ERROR_SIMULATOR_NOT_STABLE) when the state contains an unresolved prompt; ERROR_INVALID_STATE is also a core-state failure. GameStoreMessage contains expected rejection ILLEGAL_ACTION, but also serious failures INVALID_GAME_STATE, INVALID_PROMPT_RESULT, UNKNOWN_CARD, UNKNOWN_ATTACK and UNKNOWN_POWER.

Keep native.Simulator(state) outside the expected-rejection catch so all constructor errors propagate. Catch only the subsequent simulator.store.dispatch(action), and count only explicitly verified expected-rejection GameStoreMessage codes (at minimum the confirmed ILLEGAL_ACTION code; add any Stadium-specific code only after verifying its exact enum). Rethrow all GameCoreError values and all unknown/unsupported/prompt/state GameStoreMessage values. The pinned enum module is ptcg-server/src/game/game-message.ts, compiled as vendor/twinleaf/ptcg-server/output/game/game-message.js; bind GameCoreError and GameStoreMessage. Add regressions for expected ILLEGAL_ACTION, unresolved-prompt ERROR_SIMULATOR_NOT_STABLE propagation, and UNKNOWN_ATTACK/UNKNOWN_POWER propagation where constructible.


### 15 November 2026, 00:44 UTC — effective canary measurements without weakening the permission gate

Agent44's review confirms the current Node allowlist permits reads only from /policy, /tmp and /proc/self/ns, plus writes to /tmp and /dev/shm. Therefore the permissionModel=true canary cannot read /proc/self/status, /proc/self/cgroup, or statfs /dev/shm. Prefer collecting OS-only measurements from the existing permissionModel=false runs (candidate/seat1 and opponent/seat0, covering both roles and seats), while keeping the permissionModel=true runs unchanged as the Node permission-model proof. Record which role/seat supplied each observation.

Measure process.getuid()/getgid() (expected 65532/65532); CapEff and NoNewPrivs from /proc/self/status (expected 0 and 1); record Seccomp rather than assume; parse the unified cgroup path from /proc/self/cgroup and read effective memory.max (536870912), pids.max (64), and cpu.max (100000 100000); use fs.statfsSync('/dev/shm') for actual capacity (expected 16777216 bytes). Keep requested CLI settings separate from measured values. If read grants are preferred, narrowly allow only the required status/cgroup files and /dev/shm; never grant broad /proc or /sys access, and preserve the negative /proc/1/cmdline permission test.


### 15 November 2026, 00:50 UTC — correction of ShuffleHandPrompt and VM test-gap findings

Agent44's pinned-source review corrects the preceding ShuffleHandPrompt concern: its validator expects result length equal to player.prizes.length, so the current resolver behavior is correct. The prior hand-size bug report is retracted. Preserve the current behavior and add a regression with hand size different from prize count. InvitePlayerPrompt remains a valid concern: it is classified host-only but has no resolver branch and no local-game creation site; remove it from the allowlist or explicitly assert unreachability.

The VM test-gap report is also narrowed. Current mainline already tests ambient binding descriptors and direct assignment escapes. The remaining gap is specifically Object.defineProperty redefinition attempts against locked globalThis/Math/Math.random. Agent2 commit d319fa5 covers Object.defineProperty; add Reflect.defineProperty as an additional adversarial case if supported. Do not duplicate existing probes or port the divergent implementation branch.


### 15 November 2026, 00:51 UTC — candidate policy must respect native attackSource

The candidate policy in simulation/evaluation/2026-11/agent46-candidate-policy.cjs has a source-coverage limitation independent of host frontier correctness. chooseRoot() finds a matching attack only by item.attackName in view.ownPublic.active.attacks and scores it using the active Pokémon. The native frontier also exposes attackSource.sourceKind values bench-pokemon and active-tool. Unique-name non-active tokens are ignored because the active attack lookup returns no match; this is fail-closed but incomplete. Agent44 verified that the current adapter deduplicates repeated attack names active → bench → active-tool, matching the reducer's first-match semantics, so a same-name non-active token is not reachable through this adapter path.

Agent44's stopline clarification confirms that candidate-policy, candidate-policy test, fixture and CI changes are frozen under the current Critic directive. Document only: active-pokemon/ACTIVE attacks are currently supported; unique-name bench/tool actions are ignored. Defer source-aware scoring (bench via ownPublic.bench[sourceIndex], active-tool via the correct attached tool and active energy context) until the stopline is explicitly lifted. The compiled native action-family witness remains a separate host integration gate.


### 15 November 2026, 01:03 UTC — pinned GameStoreMessage rejection inventory

Agent44 scanned the pinned action reducers at a9905a76a6c4103ba4b6cb9a49e86bad795c5c05 and identified plausible expected dispatch rejections: CANNOT_ATTACK_ON_FIRST_TURN, BLOCKED_BY_SPECIAL_CONDITION, BLOCKED_BY_EFFECT (only with an exact rule-block regression), CANNOT_USE_ATTACK, LEEK_SLAP_CANNOT_BE_USED_AGAIN, NOT_ENOUGH_ENERGY, CANNOT_USE_POWER, STADIUM_ALREADY_USED, and ILLEGAL_ACTION. Add each only with family-specific regression coverage; this inventory does not claim every code has already been observed in the V3 fixture.

Propagate UNKNOWN_ATTACK, UNKNOWN_POWER, NOT_YOUR_TURN, NO_STADIUM_IN_PLAY, INVALID_TARGET, all GameCoreError values, and all unrecognized messages. UNKNOWN_ATTACK/UNKNOWN_POWER indicate missing implementation or adapter mismatch; NOT_YOUR_TURN/NO_STADIUM_IN_PLAY should be impossible under correct preconditions; INVALID_TARGET remains fatal until target projection is proven. Simulator construction stays outside the catch; catch only dispatch validation. Do not add CANNOT_USE_STADIUM absent a verified emitted enum and regression.


### 15 November 2026, 01:06 UTC — PlayCardAction codes and action-family keyed rejection policy

Agent44's pinned play-card reducer scan adds plausible PlayCardAction rejections (only when a regression proves the cap-free enumerator intentionally offers the candidate): ENERGY_ALREADY_ATTACHED, CANNOT_PLAY_THIS_CARD, SUPPORTER_ALREADY_PLAYED, STADIUM_ALREADY_PLAYED and SAME_STADIUM_ALREADY_IN_PLAY. Propagate NOT_YOUR_TURN and UNKNOWN_CARD. Keep INVALID_TARGET fatal by default; only allowlist it for a specific family after proving the enumerator intentionally supplies that candidate and the failure is ordinary target illegality rather than projection/adapter failure.

The classifier must be keyed by both action.type and error.message. Do not allowlist a GameStoreMessage globally when its meaning differs by action family. Continue to construct Simulator outside the catch and catch only dispatch validation. This play-card inventory complements the attack/ability/stadium inventory above.


### 15 November 2026, 01:08 UTC — candidate-policy rebase overlap under freeze

Agent44's corrected tree comparison found one real same-file overlap in simulation/evaluation/2026-11/agent46-candidate-policy.cjs. Current main contains Agent46's resolveActiveAttackSource() active-pokemon/ACTIVE/index-0 guard with exact source printing and attack-name checks. The dfd8584 branch contains a separate mulligan draw-label parser and choiceIndex tie-break. Preserve both existing edits during rebase; they occupy separate regions and appear mergeable. This is merge preservation only: candidate-policy/test/fixture/CI changes remain frozen under the Critic stopline. No new policy work is authorized.
