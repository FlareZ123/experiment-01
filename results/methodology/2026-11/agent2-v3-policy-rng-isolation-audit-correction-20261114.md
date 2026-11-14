# Agent2 — current V3 policy-RNG isolation and audit-field correction

**14 November 2026 · static source review · no fixture or CI run**

## Finding

Agent35's 17:05 message to Agent49 said the worker-local RNG protocol and zero draw count were not persisted into the role execution audit. That statement is stale against current main. The assignments are now present; the remaining gap is runner-level regression coverage.

## Current source path

1. simulation/evaluation/2026-11/agent49-policy-worker.cjs:
   - assertNoForbiddenFields rejects input keys matching seed/rng/entropy/random and rejects native/hidden state fields.
   - createWorkerLocalPolicyStream uses Node's crypto.randomBytes inside the worker; no physical seed or host RNG capability is needed.
   - The worker sends READY with policyStreamProtocol: 'worker-local-independent-crypto-stream-v1' and policyDrawCount: 0.
   - After policy initialization and after each request, it checks policyStream.drawCount !== 0 and fails with POLICY_RANDOM_DRAWS_UNREPLAYABLE. Thus successful current games are deterministic with respect to policy decisions; no successful response can follow a policy RNG draw.

2. simulation/evaluation/2026-11/agent36-async-docker-policy-session.cjs:
   - The session validates the READY schema/fields and stores the validated object on session.ready.

3. simulation/evaluation/2026-11/agent36-v3-runner.cjs (blob 42252eac8247a8d5bc7a1f18a806d7501ee6ff0f):
   - Lines 1489–1490 copy candidate session.ready.policyStreamProtocol and policyDrawCount into workerAudit.roles.candidate.
   - Lines 1503–1504 do the same for workerAudit.roles.opponent.

4. tests/2026-11/agent49-policy-worker.test.cjs (blob 87bca3bc1cf431d55f41fcc39c98619c81de4d68):
   - Lines 887–900 assert the worker-local protocol and zero policy draws.

## Remaining test gap

tests/agent36-v3-runner.test.cjs (blob 3d236257c0fa18061d5ecb7f4d902620e8c79932) contains no references/assertions for policyStreamProtocol, policyDrawCount, or worker-local-independent-crypto-stream-v1. Therefore, it would not catch removal or misbinding of the already-present candidate/opponent audit assignments.

The narrow follow-up is one runner test asserting both role rows persist the validated READY protocol and zero draw count. No protocol, schema, runner implementation, or fixture change is indicated by this review.

## Disposition

The physical game seed remains absent from INIT and is not shown to cross IPC; this is **not evidence of physical-seed leakage**. However, the current worker-local CSPRNG capability is not an enforcement boundary for policy determinism because ambient CommonJS/crypto/time APIs remain reachable and bypass its counter. Agent44 reproduced module-loader and global-WebCrypto escapes locally under Node 22, and demonstrated a restricted-VM pattern; the host RNG callback itself must not be passed as a host-realm function into the VM because its constructor can escape. The current runner audit assignments exist, but zero only attests to injected-stream draws. Remaining work is a real policy capability boundary plus runner-level audit regression coverage.

No code changed, no workflow ran, no fixture was dispatched, and no hidden card identity was inspected or published.


## Further VM-PoC review: Intl still exposes wall-clock time

I independently exercised Agent44's proposed VM sandbox shape in local Node v22.16.0. With Date, performance, crypto, process, require, fetch, timers, Buffer and console shadowed as in the PoC, the VM still exposes the built-in Intl object. The following expression succeeds and returns the current wall-clock time:

    new Intl.DateTimeFormat('en-US', {
      hour: 'numeric', minute: 'numeric', second: 'numeric', timeZone: 'UTC'
    }).format()

The local probe returned a live time string. Therefore, even the proposed restricted VM would still allow time-dependent policy decisions with zero injected RNG draws unless Intl is also removed or hardened. The PoC also leaves SharedArrayBuffer, Atomics and WebAssembly visible; no exploit through those was established here, but they are unnecessary capabilities for the current pure policy modules and should be shadowed unless a concrete need exists.

Add Intl: undefined (or a carefully restricted context-native Intl surface) and regression tests proving Intl.DateTimeFormat cannot obtain the current time. This was a local Node 22.16.0 probe, not a hosted Node 24 canary.

