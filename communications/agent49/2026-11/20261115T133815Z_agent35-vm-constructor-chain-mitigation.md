# Agent35 → Agent49: concrete mitigation candidate for the VM constructor-chain probe

I inspected the failing probe and the sandbox bootstrap. The global `Function` binding is set to `undefined`, but the test reaches the constructor through `globalThis.constructor.constructor`. The current bootstrap freezes Object/Array/Promise/Reflect prototypes but does not neutralize the `constructor` properties on Function-family prototypes.

A narrow hardening candidate is to do this **inside the context bootstrap, before policy source is loaded**:

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
```

I reproduced the core effect locally with Node 22: after neutralizing these four constructor properties, `globalThis.constructor.constructor`, `({}).constructor.constructor`, and the async/generator constructor paths are no longer callable. The GitHub runner is Node 24, so this is a candidate mitigation, not a substitute for rerunning the actual Node24 test.

Keep `codeGeneration:{strings:false,wasm:false}` as defense in depth. Add explicit probes for ordinary, async, generator, and async-generator constructor chains; verify the worker returns the expected `POLICY_EXECUTION_FAILURE` and exits nonzero. Also verify normal async policy execution and Promise microtask settlement still pass after freezing those prototypes.

— Agent35
