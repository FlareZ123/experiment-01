# Agent 36: pre-execution source integrity for dynamically loaded CommonJS modules

**1 November 2026, normal research.** Evidence class: executable source-provenance regression and compiled pure tests. No original-source game or competitive win evidence.

## The independent gap

The frozen bilateral runner's lexical source closure currently reports **276 statically traced local modules, 110 literal environment names (7 above the 103-key reviewed inventory), and 115 unparsed lexical dynamic-require sites** in [manual stats CI 41351156265](https://github.com/FlareZ123/experiment-01/actions/runs/41351156265). The existing postgame [runtime attestation](../../simulation/evaluation/agent41-runtime-research-module-attestation.cjs) reports loaded research modules after a native match, including modules absent from the static lexical graph. That is useful *detection*, but a dynamically reached, previously unregistered module can already have executed and influenced a match before a postgame receipt catches it. A source hash that covers only the statically reachable dependency list cannot independently certify such a runtime.

A credible frozen research policy therefore needs a check **before each dynamically reached research module executes**, with an exact code fingerprint tied to an independently frozen manifest. A clean postgame loaded-module report cannot substitute for that pre-execution gate.

## Research-owned prototype

[Reversible CommonJS module-load pin](../../simulation/evaluation/agent36-runtime-module-pin.cjs) exports `withPinnedResearchModuleLoads(repositoryRoot,expectedByPath,execute)`. It does the following, scoped to synchronous Node CommonJS modules:

1. Validates a root-relative, canonical manifest mapping each known research `.js`, `.cjs`, or `.json` path to exact SHA-256. The caller must supply this from a **separately preregistered** immutable manifest, never generate its own expected digest after results.
2. Attests research modules already loaded into `require.cache` *before* invoking the callback. Installs a reversible `Module._load` hook that resolves each `require`, checks original physical source bytes against the expected SHA-256 **before** executing the target module and fails closed on unregistered research files, changed bytes, canonical path aliasing or a research-relative path escape. It intentionally excludes the separately pinned Twinleaf vendor tree, installed packages and Node builtins.
3. Rechecks every observed research file at run end for changed bytes. Restores the original `Module._load` descriptor in `finally`, including exceptions. Reports observed research module paths and preloaded/require/end check counts as developmental metadata.

This makes **one concrete previously unparsed dynamic CommonJS branch** fail closed before its side effect, while retaining the existing research code/vendor separation.

## Regressions and compiled evidence

[Eight pure tests](../../tests/agent36-runtime-module-pin.test.cjs), executed as a step inside the existing manually dispatched [benchmark statistics workflow](../../.github/workflows/aichi-benchmark-stats.yml), passed **8/8 on GitHub Actions run 41351156265**, at head `c9fc0a64756e604b13a0f1e4f8a1d147329fe3ea` (checked-in hardened guard commit `f442d6d5cdb0c9181d8f7762ade774793a73677a`, eight-test suite commit `bbf4249724ab003d47d910e16f735980aa0b2203`). Positive case imports a registered dynamically chosen child and obtains the expected value. Negative cases reject an unregistered dynamically imported file *before* its marker-writing source executes; reject changed source before first load; reject already-cached unregistered source at installation; reject loaded source altered during the game; prove original global loader restored after exception; reject noncanonical frozen manifest aliases; and reject research-relative imports escaping the repository before their external marker-writing source executes.

**The overall manual workflow is red by design:** the later, separate `agent16-transitive-policy-source-inventory.test.cjs` still requires reviewer action on the current 110-versus-103 environment-key delta. Do not mistake a locally passing suite for a historical frozen-v2 source clearance. The new two-site Rondo null-default regression repair and the earlier [five passed external profile-byte tests](agent36-external-profile-anchor-gap-20261101.md) are separate work.

## Boundary and release action

- **Not integrated into the common native game runner.** This code is opt-in and makes no performance claims or adjustments to gameplay or candidate 60s.
- Repeated source file reads and a process-global CommonJS hook have measurable overhead and global side effects in any concurrent Node process. Benchmark and isolate a full panel under a fresh immutable profile before opting in. The code requires synchronous games and intentionally refuses asynchronous callback completion.
- The guard cannot see ESM `import()` execution, `eval`, `Function`, arbitrary `fs.readFileSync` data inputs, native code, module-internal monkeypatches after loading, or future files never imported on this trajectory. It does not establish paper rules, opponent policy competence, card legality, official clock fidelity, or unknown source opponent 60s.
- Its expected hash map is **not inherently trusted**: a mutable caller supplying both arbitrary code and matching arbitrary hashes could defeat the claim. Store the map in a separately preregistered, tamper-evident source registration and attest its bytes via the independent profile-byte checker. Run unchanged candidate and opponent 60s with a complete frozen policy and recorded physical source deals, then preserve every interrupted/aborted path. Never retrofit a modern live dependency closure into the historical Agent41 v2 frozen result.

The current env source delta has seven known names after a new Agent31 `AGENT31_GUZMA_FORCED_KO_DEV` opt-in was added to the `agent43-guzma-prompt-continuation.cjs` dynamic branch on 1 November; the other six were separately classified [here](../../communications/broadcast/20261101T2052Z_agent36_six_policy_closure_key_provenance.md). That new live conditional also introduces a research module dynamically loaded by literal `require('./agent31-forced-guzma-ko-frontier.cjs')` inside a branch and exemplifies why a static scan plus postgame loaded hash is insufficient as a proof of run-time frozen code identity.

**Benchmark state unchanged:** 29/32 authenticated original opposing decklists; 0 competitively qualified full games; no demonstrated fixed-deck 99.5% Aichi Top32 win rate.
