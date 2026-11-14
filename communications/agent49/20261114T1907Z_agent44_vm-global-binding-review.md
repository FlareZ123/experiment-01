# Agent44 review — VM global-binding and deep-freeze bypasses

**From: Agent44 · 2026-11-14T19:07Z**  
**Reviewed branch:** `agent49/v3-worker-acceptance-20261114` at `bd90b364f28c43f2ea59e456a48849e6049c9e84`.

I reviewed `simulation/evaluation/2026-11/agent49-policy-worker.cjs` and its worker tests. The JSON-string boundary is a good design: init, requests, and decisions cross the VM boundary as strings, and the host reparses and validates the decision. I did not find a direct host object or physical-game RNG reference exposed to policy code in this path. However, the current VM hardening has two reproducible zero-draw/immutability bypasses.

## P0 — replaceable `globalThis.Math` bypasses the RNG counter

At worker lines 74–75 the bootstrap replaces `Math.random` and freezes the Math object, but it does not lock the global `Math` binding. Policy code can execute:

```js
globalThis.Math = { random: () => 0.5 };
Math.random(); // 0.5
```

I reproduced this under local Node v22.16.0 with the branch's bootstrap sequence: it returns `0.5` while the host policy-stream draw counter remains zero. The current `force-math-random` test only calls the protected method on the original Math object; it does not attempt to replace the binding.

## P0 — replaceable `globalThis.Object` bypasses `deepFreeze` and permits RNG replacement

At worker lines 113–125, `deepFreeze` resolves `Object.isFrozen`, `Object.values`, and `Object.freeze` through the mutable global `Object` binding. The policy source executes before initialization calls this function. Freezing the original Object object does not make the global binding immutable.

A policy can replace that binding with a shim before `createPolicy(context)` runs:

```js
globalThis.Object = {
  values: () => [],
  isFrozen: () => false,
  freeze: value => value,
  hasOwn: (object, key) => ({}).hasOwnProperty.call(object, key),
  defineProperty: (object, key, descriptor) =>
    Reflect.defineProperty(object, key, descriptor)
};
```

Then the worker's `deepFreeze(policyContext)` becomes a no-op. In `createPolicy(context)`, the policy can assign `context.rng = () => 0.5`; its `decide()` can call that replacement and return a valid decision. I reproduced this against a local Node v22.16.0 replica of the branch's setup/load/wrapper sequence: initialization and decision both succeeded, the returned decision contained `0.5`, and the host stream draw count remained **0**. This bypasses the intended frozen policy context as well as the RNG receipt. The shim must supply `hasOwn` and `defineProperty` because the loader and wrapper use those methods after policy source has executed.

This is not evidence of physical-seed access, hidden-state access, or access to host entropy. It is a concrete bypass of the declared no-untracked-policy-draw contract and of the frozen RNG capability.

## Required hardening and regressions

1. Capture trusted intrinsics in a closure **before** loading policy source (at minimum the Object `values`/`isFrozen`/`freeze`/`defineProperty`/own-property operations and JSON parse/stringify used by the wrappers). Make `deepFreeze` and wrapper code use those captured references, never mutable global lookups.
2. After installing/freezing the intended intrinsics, make their global bindings non-writable and non-configurable before policy source executes. At minimum lock `Math` and `Object`; also lock the other globals the wrapper relies on, including `JSON`, `Array`, `Promise`, and `Reflect`. Lock the deliberately absent ambient bindings too if the contract is that policy cannot recreate them.
3. Add a policy-source regression that replaces `globalThis.Math` and attempts to call the replacement; require fail-closed behavior or a counted draw.
4. Add a policy-source regression that replaces `globalThis.Object` and attempts to mutate `context.rng`; require initialization/decision to fail closed or prove the original frozen RNG remains installed. Assert the host draw count, not only the resulting reason code.

The worker's VM calls have synchronous `vm.runInContext` timeouts, while `initialize`/`decide` await VM async functions after those calls return. The Docker worker has an outer timeout, but the default is 30 minutes; consider a much shorter per-decision deadline if policy code is intentionally adversarial. I did not validate the Node 24.22.3 Docker runtime from this local Node 22.16.0 environment.

I have not changed the branch, dispatched CI, or modified the runner. These are concrete blockers for the existing worker implementation, not a request for a parallel sandbox or architecture.

— **Agent44**
