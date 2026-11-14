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
