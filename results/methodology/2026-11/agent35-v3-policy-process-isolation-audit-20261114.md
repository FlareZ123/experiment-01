# V3 policy process-isolation audit: actor-only arguments are not a sandbox

**Agent 35 · 14 November 2026**

## Question

Does the current V3 actor-only policy wrapper prevent policy code from obtaining hidden game information, or does it only constrain the state argument and native-action path?

## Finding

**The current actor-only execution boundary is not an OS/process security boundary.** Policy code runs in the same Node.js process as the V3 runner and can use Node built-in modules. The physical shuffle seed is a literal in the public runner source, and the candidate/opponent deck inputs are public repository files. A policy module can therefore read the runner/deck files at runtime unless trusted policy code is assumed not to do so.

This is a capability and architecture finding, **not evidence that the current candidate or opponent policy actually read files or exploited hidden information**.

## Source evidence

1. `simulation/evaluation/2026-11/agent36-v3-runner.cjs` loads `agent34-actor-only-root-policy.cjs`, `agent44-role-scoped-policy-composition.cjs`, and `agent49-native-fixture-game.cjs` with ordinary CommonJS `require` calls (top-level imports around lines 3–18). Its `V3_FIXTURE` object contains the public physical seed at line 548 and public candidate/opponent deck paths at lines 539–540. `runCandidateOpponentPolicyRoles()` invokes the role composer around lines 158–190, and the fixture calls it around lines 1056–1069.
2. `simulation/twinleaf/agent34-actor-only-root-policy.cjs` obtains `SimpleTacticsAi.prototype.decodeNextAction` and its original method inside `withActorOnlyRootPolicy()` (around lines 1216–1260), then installs a replacement on that same prototype (around line 3554). This is an in-process method wrapper, not a separate policy process.
3. `simulation/evaluation/agent36-runtime-module-pin.cjs` intercepts CommonJS loads of research-owned files, but its `pinnedLoad()` explicitly skips `Module.builtinModules` and `node:` requests (around lines 105–130). Its own header explicitly says it cannot account for dynamic filesystem, eval, or ESM imports. It does not prevent a policy from calling `require('node:fs')` / `require('fs')` and reading a public file.
4. `simulation/evaluation/agent36-source-closure-audit.cjs` is a lexical source-closure report, not an execution sandbox. It follows literal relative CommonJS imports, records dynamic-require limitations, and deliberately does not classify `node:` built-ins as external package imports. It does not block filesystem access or process introspection.
5. The actor policy itself uses ordinary CommonJS `require` and `process.env` (for example, the top of `agent34-actor-only-root-policy.cjs`). The policy runtime therefore already has the Node module/process environment; there is no separate restricted execution context in the inspected call path.

## Consequence for the seed/RNG remediation

Agent36's main commit `fb514b277a3033b4a36120cb41843ded52b1ac14` correctly removes the former physical-seed-XOR policy RNG stream. Contract-only run [43561723505](https://github.com/FlareZ123/experiment-01/actions/runs/43561723505) passed the new stream-independence regression. That closes the specific `Math.random()` inversion route for the current explicit fixture seeds.

It does **not** close the separate source/filesystem route: the physical seed remains public in `agent36-v3-runner.cjs`, and the policy code can read that file from the same process. Thus the remaining issue is not merely post-game reconstructability. Under the current process model, a policy with filesystem access can reconstruct the physical shuffle during the game.

## Recommended resolution

- **For a credible actor-only information-set guarantee:** run each policy in a separate OS-sandboxed process/container. Send only serialized actor observations, public prompt context, and a constrained action protocol over IPC. Keep the physical seed, shuffled deck order, engine objects, and opponent hidden zones in the engine process. Give the policy only the explicitly allowlisted public card/catalog data it needs; do not mount runner source, deck JSONs, private artifacts, or seed-bearing environment variables into the policy sandbox.
- A Node `vm` context or CommonJS module-load hash pin alone is not a security boundary. A short-term static ban on filesystem/process APIs may catch accidental violations, but it cannot provide the same guarantee as OS-level isolation.
- Add a deliberately adversarial canary policy that attempts to read the runner source and deck inputs. The test should pass only when the sandbox denies those reads; merely documenting the attempt or scanning source text is not sufficient.
- Until process isolation exists, describe the current contract narrowly as an **actor-observation argument/dispatch boundary under trusted policy code**, not as proof that policies cannot access hidden information. Do not treat a valid argument-level audit as a secure information-set result.

## Limitations

- This is a source-level architectural review; no malicious policy probe was executed.
- The inspected code does not establish that any current policy reads files, uses dynamic imports, or cheats.
- This finding does not change any candidate list, matchup result, paper legality status, or win-rate estimate.

---

## 14 November 2026 05:58 UTC — confirmed `Math.random` descriptor-capture bypass

A second, more direct live RNG escape exists in the current `decodeWithPolicyRandom()` implementation in `simulation/evaluation/2026-11/agent49-native-fixture-game.cjs`:

```js
function decodeWithPolicyRandom(bot,state,randomSource) {
  const previous=Math.random;
  Math.random=randomSource;
  try {
    return bot.decodeNextAction(state);
  } finally {
    Math.random=previous;
  }
}
```

The policy executes between the two global assignments. Because `Math.random` is a configurable property, policy code can redefine it with a setter during `decodeNextAction()`. The `finally` assignment then invokes that setter with `previous` — the physical RNG function — allowing the policy to capture and retain it:

```js
Object.defineProperty(Math, 'random', {
  configurable: true,
  get() { return policyRandom; },
  set(value) {
    capturedPhysicalRandom = value;
    Object.defineProperty(Math, 'random', {
      value, writable: true, configurable: true, enumerable: false
    });
  }
});
```

I executed a minimal reproduction in the local Node **v22.16.0** runtime using the exact `decodeWithPolicyRandom` save/swap/restore sequence and a deterministic physical RNG. I repeated it with `'use strict'` enabled (matching the production CommonJS module); `Object.getOwnPropertyDescriptor(Math, 'random').configurable` was `true`, and the capture still succeeded. The result was:

```json
{"result":"decoded","restored":true,"leaked":true,"firstPhysicalDraw":0.01,"physicalDraws":1}
```

The physical RNG was restored for the engine, while the policy retained a callable reference to it. On a later decision the policy can call the captured function and obtain physical random outputs. With xorshift32, one raw output reveals the PRNG state; even a cryptographic physical RNG is compromised if the policy can call its function directly. This bypass does not require filesystem access, a public seed, or the former XOR derivation.

**Status correction:** Agent36's `fb514b2` commit correctly removes the direct XOR-derived policy stream. The specific XOR inversion is fixed, but **physical RNG isolation is not fixed** because the current global `Math.random` save/swap/restore hands the physical function to policy code through a mutable property setter. The contract-only run 43561723505 did not test hostile mutation of the global Math object.

**Required correction:** do not expose the physical RNG function in the same JavaScript realm as policy code. The robust fix remains a separate OS-sandboxed policy process with its own per-game/seat policy RNG. A temporary global dispatcher is not a secure substitute if policy code can mutate globals or schedule asynchronous callbacks. Add a regression/canary that performs the setter capture above and passes only when the policy cannot obtain or invoke the engine's physical RNG.

This is a confirmed source/runtime capability, not evidence that any current policy exploited it. No new native game was run.


## 17 November 2026 00:15 UTC addendum — current V3 Docker worker path

**Scope and conclusion.** The original same-process finding above was correct for the earlier V3 path it inspected. It is superseded for the current canonical V3 worker architecture at PR #58 source head `ca613a09fa0daf773bab516d69bf29ec197a6eee`: the V3 runner now delegates strategic decisions to separate Docker worker processes. This is a source-level architecture audit, not an accepted no-game witness, hostile-container penetration test, or competitive game result. The legacy synchronous `runNativeFixtureGame()` compatibility API still calls `decodeWithPolicyRandom()`; do not generalize this V3 correction to legacy callers.

### Engine/worker separation

- `runV3FixtureGame()` builds separate candidate and opponent policy bundles and starts one `createDockerPolicySession()` per role. It calls `runNativeFixtureGameAsync()`, whose awaited resolver delegates root and owner-prompt decisions; the legacy synchronous decoder is not used on this path.
- `buildRoleWorkerBundle()` copies exactly three SHA-256-verified files into a disposable bundle: `worker.cjs`, `agent49-policy-protocol.cjs`, and that role's `policy.cjs`. The bundle is verified against its manifest before launch. The repository, Twinleaf source, candidate/opponent deck files, physical seed and host process paths are not copied or mounted.
- The Docker invocation mounts only that bundle at read-only `/policy`; it uses `--network=none`, `--read-only`, `--cap-drop=ALL`, `no-new-privileges`, a non-root UID, CPU/memory/PID/file-descriptor limits, and bounded writable tmpfs paths. The container receives only fixed `HOME`, `LANG`, `TZ`, and `PATH` variables. The host environment used to launch the Docker CLI is not forwarded as the container environment.
- The engine retains native Store/state, physical RNG, seed, shuffled deck order and both hidden zones. The V3 resolver sends only JSON over worker stdin/stdout: detached actor observation, actor-owned prompt projection, public event receipt and typed action frontier. The worker init has empty config and no seed or policy-seed field. The host retains native action objects and token maps; these are not serialized to the worker.
- The worker VM disables host/runtime globals (including Date, performance, crypto, process, require, filesystem/network APIs and timers) and counts policy RNG draws; this VM is defense-in-depth, not the security boundary. The separate container is the process/OS boundary. The worker's own CSPRNG stream is not derived from the physical RNG; policy draws remain rejected by the current replay contract.

### Actor-visible payload review

- `actorObservation()` returns a deeply frozen detached view. It contains the acting player's hand and own board/resources; both players' public board, discard, Lost Zone, Stadium, public hand when explicitly public, face-up Prize identities, public restrictions and public counts. Opponent concealed hand, deck identities and face-down Prize identities are not read into the view. During setup, opponent Pokémon identities are represented only as occupied/concealed slots. The V3 caller supplies no owner-K1 snapshot, so that optional field is null.
- Prompt projection checks card visibility against the actual owner/zone before exposing card printings. Hidden opponent hand/deck/face-down Prize identities are rejected for card-choice prompts. Prize-slot prompts expose slot/count metadata, not card identities. Prompt choices are mapped back to native objects only in the host process.
- The public event receipt excludes hand/deck/Prize contents, raw markers, native instance IDs and un-timestamped attack history. It contains public attack history and owner-visible board/ability-use/KO facts.
- The typed action frontier projects actor-hand cards and public targets. Hidden target printings and concealed hand/deck/Prize indices are omitted; only legal action tokens and bounded public metadata are sent. The protocol enforces exact top-level/nested schemas and recursively rejects keys naming seed/RNG/entropy, native state/store, hidden zones, opponent hand/Prizes or deck order.

### Remaining limits and next validation

1. This source review does **not** prove noninterference of every native ActionEnumerator/Simulator frontier under arbitrary mutation of opponent concealed zones. A future focused metamorphic test should hold public state fixed, mutate only opponent hidden hand/deck/face-down Prize identities, and assert actor observation, public receipt, prompt projection and serialized frontier remain identical wherever paper-visible legality is unchanged. Do not infer a leak merely from the absence of that test.
2. The review does not test container escape resistance against a kernel/runtime exploit. It establishes the configured mount/network/permission boundary from source, not a formal sandbox guarantee.
3. The current canonical branch had not passed its exact-SHA no-game witness at this review point. Existing Docker launcher/worker-isolation canary receipts (17/17 launcher checks and 3/3 worker isolation checks on the immediately preceding `f66a07c` head) are bounded engineering evidence only; they do not transfer into a witness acceptance receipt and do not establish gameplay.
4. The old physical-RNG setter-capture reproduction remains relevant to any in-process policy path. It does not provide a route from the isolated V3 policy worker to the engine process's physical RNG function.

**Decision:** mark the pre-Docker same-process exposure as superseded for the current V3 Docker worker path, while retaining the historical finding and legacy-API warning. Do not mark the overall actor-only boundary accepted until the exact-head contract, compiled no-fixture suite and four-way native no-game witness pass on the same SHA.


## 17 November 2026 00:23 UTC addendum — scope of the existing Docker canary

A follow-up read of `tests/2026-11/agent36-docker-policy-worker.test.cjs` confirms that the existing Docker canary is a real adversarial host-access probe, not merely a configuration assertion. Its test policy attempts to read host-side sentinel files representing the repository, candidate deck, opponent deck, physical input and opponent hidden zone, plus the Docker socket; it also attempts to read a sentinel from the host runner's `/proc/<pid>/environ`. It probes a reachable Docker-bridge positive-control server, child-process and worker-thread creation, and namespace visibility. The test runs candidate/opponent roles in both seats, with the Node permission model enabled and disabled in alternating cases. It verifies that child processes/threads remain inside the worker namespaces when the Node permission model is disabled, and checks effective network mode, namespace inodes, read-only rootfs and policy mount, non-root UID, dropped capabilities, no-new-privileges, resource limits, tmpfs flags, forbidden environment keys, and that the host physical-random callback was never invoked. The bridge positive control confirms the network probe itself works when networking is enabled.

The reported 3/3 isolation-canary pass on `f66a07c` therefore provides meaningful runtime evidence for the configured Docker boundary, including operation without the Node permission model. It still does not establish kernel-escape resistance, hidden-state noninterference of every native action-frontier calculation, or exact-head no-game-witness acceptance. Keep those claims separate. The current PR head `ca613a09` changed the native-fixture failure projection after that canary run; the Docker worker launcher, worker session, and canary test are unchanged in the reviewed diff, but no exact-head acceptance receipt is implied.
