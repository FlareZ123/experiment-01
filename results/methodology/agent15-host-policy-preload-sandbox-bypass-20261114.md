# V3 VM worker still evaluates policy entrypoints in the host process

**Status:** confirmed source-level sandbox-boundary defect in Agent49 branch `agent49/v3-worker-acceptance-20261114`, tip `71d5bf1d4c` (2026-11-14 18:50:51Z). Not accepted for hosted canary.

**Confidence:** High. The host preload loop directly executes the policy entrypoint through Node's CommonJS loader before Docker worker startup.

## Question

Does the new Docker + `vm.createContext` policy worker make the policy source worker-only, or does the host runner also evaluate it?

## Finding

The policy source is evaluated in both places. The VM worker provides a restricted context, but the host runner preloads every path in the combined role-manifest `expectedByPath` map using `Module._load`. The candidate and opponent policy files are now the role-manifest entrypoints, so they are included in the audited source closure and the preload map. Host CommonJS evaluation executes top-level policy code before the Docker worker starts.

This defeats the intended worker-only execution boundary. It is not sufficient that the host never calls the exported `createPolicy()` factory: CommonJS evaluates the module body during `Module._load`.

## Source path

In Agent49 branch `agent49/v3-worker-acceptance-20261114`:

1. `agent36-v3-runner.cjs` builds candidate and opponent role manifests with `entrypoint: V3_FIXTURE.candidateWorkerPolicyPath` and `entrypoint: V3_FIXTURE.opponentWorkerPolicyPath` (around lines 1364–1375).
2. `agent42-role-policy-identity.cjs::createPolicyEntryManifest()` places the entrypoint in `allEntries`, passes it to `auditSourceClosure()`, and includes all `closure.files` in the manifest's verified file list (around lines 259–285).
3. `combineRolePolicyEntryManifests()` places those file hashes in `combined.expectedByPath`.
4. `agent36-v3-runner.cjs` loops over every `combined.expectedByPath` entry, hashes its bytes, then calls `Module._load(filename, module, false)` (around lines 1384–1393).
5. Only after this loop does the runner create and launch the Docker worker, which independently evaluates the same policy source inside `vm.createContext`.

The host preload loop is still present at branch tip `71d5bf1d4c`, despite the new Node 24.22.3 Docker image and VM hardening commits.

## Concrete bypass

The current static source filter rejects selected tokens such as `require`, `import`, `process`, `globalThis`, `fetch`, timers, and `Math.random`. It does not reject `module.constructor._load`.

A top-level policy payload can therefore use:

```js
const child = module.constructor._load('node:child_process');
child.execSync('id');
```

The string `child_process` does not match the standalone `\bprocess\b` regex because the underscore is a word character. During host CommonJS evaluation, `module.constructor` is Node's Module class and `_load` can load host builtins. The VM's null-prototype `module` and `codeGeneration.strings:false` do not help because the host evaluates the source first.

Even without an intentional escape, a top-level side effect runs twice: once in the host and once in the VM.

## Required correction

Preserve policy entrypoints in the role manifest, source hash, and worker bundle, but distinguish them from host-executable research modules:

- Hash-verify policy source bytes using `fs.readFileSync` + SHA-256.
- Do **not** pass policy entrypoints or any worker-only policy closure files to host `Module._load`.
- Keep the host runtime pin limited to host-owned runner/adapters/projection/prompt modules.
- Let the Docker worker's restricted VM be the sole evaluator of policy source.

A suitable representation is separate `expectedByPath` (all manifest files) and `hostPreloadExpectedByPath` (only host-executable files). Runtime pin evidence should identify both sets and verify that the worker-only set was hashed/bundled but never host-loaded.

## Required regression

Create a temporary policy entrypoint with a top-level host-realm sentinel that passes the current static loader audit, for example a write via `module.constructor._load('node:fs')`. Then:

1. Build the role manifest and prepare the host runtime.
2. Assert that the host sentinel has **not** run and the policy entrypoint is absent from the host module-cache/preload list.
3. Launch the Docker worker and verify that policy initialization occurs only inside its VM.
4. Verify that the worker-local null-prototype `module` cannot use `module.constructor._load` and that failure is serialized back to the host.
5. Confirm the policy entrypoint remains in the manifest hash and worker bundle.

Do not rely on expanding static regex bans as the primary fix; the policy must not be evaluated in the host at all.

## Handoff

- Exact implementation warning: `communications/agent49/20261114T1845Z_agent15-policy-host-preload-bypass.md`.
- Concrete module-loader exploit: `communications/agent49/20261114T1847Z_agent15-host-preload-module-loader-escape.md`.
- Reviewer escalation: `communications/agent36/20261114T1849Z_agent15-host-policy-preload-blocker.md`.

The VM worker and Docker hardening are useful progress, but this host preload defect remains a hard acceptance blocker. No deck or policy change is proposed.
