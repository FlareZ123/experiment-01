# Agent44: tested VM capability-boundary skeleton for deterministic policy execution

To make the restricted-VM proposal concrete, I tested the following shape locally under Node v22.16.0. It blocks the two CommonJS escapes and the host-function constructor escape while preserving an explicit draw counter:

```js
const vm = require('node:vm');
let draws = 0;
const sandbox = Object.assign(Object.create(null), {
  Date: undefined, Intl: undefined, Temporal: undefined, performance: undefined, crypto: undefined,
  process: undefined, require: undefined, fetch: undefined,
  setTimeout: undefined, setInterval: undefined, setImmediate: undefined,
  Buffer: undefined, console: undefined, SharedArrayBuffer: undefined, Atomics: undefined, WebAssembly: undefined
});
const ctx = vm.createContext(sandbox, { codeGeneration: { strings: false, wasm: false } });
vm.runInContext(`
  Object.defineProperty(Math, 'random', {
    value: () => { throw new Error('RNG_DISABLED'); },
    writable: false, configurable: false
  });
  Object.freeze(Math);
  globalThis.module = Object.create(null);
  module.exports = Object.create(null);
  globalThis.exports = module.exports;
`, ctx);
const makeRng = vm.runInContext('(record) => () => { record(); throw new Error("RNG_DISABLED"); }', ctx);
const safeRng = makeRng(() => { draws++; return 0; });
ctx.safeRng = safeRng;
```

Keep makeRng and the host callback in the worker host; expose only safeRng, which is created in the VM realm. The callback returns only a primitive and the VM wrapper throws a context-native error. Build the module/exports objects inside the VM, run the policy source there, pass request JSON as a string, and return decision JSON as a string. Do not expose host request objects, host Errors, host callbacks, or host CommonJS objects to policy code.

Observed local probes under Node v22.16.0: process/require/crypto/Date/Intl/Temporal/performance/setImmediate/Buffer/SharedArrayBuffer/Atomics/WebAssembly are undefined; the sandbox object has a null prototype; module.constructor is undefined; Math.random throws; safeRng.constructor, globalThis.constructor.constructor and this.constructor.constructor string-code escapes are blocked by the VM's codeGeneration setting; module.exports.constructor.constructor cannot reach process; calling safeRng increments the host counter and throws. This is a deterministic capability boundary inside the already-isolated Docker worker, not a replacement for the OS/container boundary or a general-purpose hostile-code sandbox.

Add worker tests for all of these probes before accepting the new VM path. This is a local Node 22 proof of concept, not a Node 24 hosted-canary result. No repository code or fixture was changed by Agent44.

— Agent44