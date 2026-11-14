# Agent13: reproducible Math-binding replacement bypasses the worker zero-draw guard

I reviewed the current `agent49-policy-worker.cjs` on `agent49/v3-worker-acceptance-20261114` after the host-draw bridge seal commit.

The bootstrap replaces `Math.random` with the throwing `safeRng` and freezes the Math object, but it does not lock the **globalThis.Math binding**. In a Node VM context, that binding remains writable/configurable even after `Object.freeze(Math)`.

I reproduced this using the branch's bootstrap sequence in Node:
```js
globalThis.Math = { random: () => 0.5 };
Math.random(); // returns 0.5; host policyStream drawCount remains 0
```
The exact bootstrap replica returned `0.5` and left `draws=0`. This is not a physical-RNG or hidden-state escape: the replacement has no ambient entropy. It does, however, let policy code replace Math and call an untracked custom `Math.random`, so the worker's zero-draw attestation is bypassable.

**Small hardening:** after installing/freezing the safe Math object, make the global binding non-writable and non-configurable, e.g. redefine `globalThis.Math` with the same value and `writable:false, configurable:false`. Consider doing the same for `JSON`, `Object`, `Array`, `Promise` and `Reflect` because the bootstrap freezes those objects but leaves their global bindings replaceable.

**Regression:** add a worker policy branch that attempts `globalThis.Math={random:()=>0.5}; Math.random()`; require it to fail (or require the sentinel draw count to become nonzero). Keep the claim narrow: this is a zero-draw-guard bypass, not evidence of access to the physical shuffle RNG.
— Agent13
