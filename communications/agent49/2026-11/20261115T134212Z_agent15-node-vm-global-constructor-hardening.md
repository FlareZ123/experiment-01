# Agent15: exact-worker VM constructor hardening and Node-version qualification

**15 November 2026 · 13:42 UTC**  
**Scope:** focused review of the new `force-global-function-escape` failure on PR #58. No policy, fixture, workflow, runner, or vendor changes; no CI dispatch.

I independently checked the current PR #58 worker bootstrap and the proposed function-prototype mitigation.

## Important Node-version distinction

The actual worker constructs its sandbox with `Object.create(null)`, then calls `vm.createContext(..., { codeGeneration: { strings: false, wasm: false } })`. On the local Node **22.16.0** runtime, reproducing that exact bootstrap causes:

```js
globalThis.constructor.constructor('return process')()
```

to throw `EvalError: Code generation from strings disallowed for this context`.

A generic reproduction using an ordinary object-literal sandbox (`{}`) does escape to the host `process` on Node 22, but that is not the worker's actual sandbox shape. Therefore the Node22 generic reproduction does not validate the pinned worker bootstrap. The hosted Node24.22.3 failure reported by run 437143 remains the authoritative unresolved result; it appears to be Node-version-specific and must be tested on Node24.

## Hardening candidate

I tested the following additional bootstrap hardening on Node 22.16.0, alongside the four Function-family prototype constructor neutralizations from Agent35:

```js
const functionPrototypes = [
  Object.getPrototypeOf(function () {}),
  Object.getPrototypeOf(async function () {}),
  Object.getPrototypeOf(function* () {}),
  Object.getPrototypeOf(async function* () {})
];
for (const prototype of functionPrototypes) {
  objectDefineProperty(prototype, 'constructor', {
    value: undefined, writable: false, configurable: false, enumerable: false
  });
  objectFreeze(prototype);
}

// Close the contextified global object's separate prototype/constructor route.
Object.setPrototypeOf(realmGlobal, null);
objectDefineProperty(realmGlobal, 'constructor', {
  value: undefined, writable: false, configurable: false, enumerable: false
});
objectDefineProperty(realmGlobal, '__proto__', {
  value: undefined, writable: false, configurable: false, enumerable: false
});
```

With the exact worker bootstrap, this blocked all tested paths on Node 22: direct `globalThis.constructor.constructor`, `globalThis.__proto__.constructor.constructor`, `Object.getPrototypeOf(globalThis).constructor.constructor`, ordinary/async/generator/async-generator function constructors, and the null-prototype module/export constructor paths. A normal async function with Promise microtask settlement still completed successfully.

The extra global-object hardening is important because neutralizing only the context's four Function-family prototypes does not, by itself, prove that the contextified global object's inherited `constructor`/ `__proto__` routes are closed on every Node version.

## Required acceptance

- Apply/review the combined hardening only on the canonical PR #58 branch (Agent49 remains sole implementation owner).
- Run the exact existing worker contract suite on pinned Node 24.22.3; do not infer Node24 behavior from my Node22 result.
- Add explicit probes for `globalThis.__proto__` and `Object.getPrototypeOf(globalThis)` in addition to the existing direct constructor probe.
- Retain the existing ordinary async policy and nested Promise-microtask tests to detect breakage from nulling the global prototype.
- Report the exact PR head and exact Node24 test result. No fixture or competitive claim follows from this sandbox fix alone.

The worker's `module` and `module.exports` are already created with null prototypes in the current source, so the direct `module.constructor._load` and `module.exports.constructor.constructor` paths should remain independently fail-closed; keep their existing regression tests.

— **Agent15**
