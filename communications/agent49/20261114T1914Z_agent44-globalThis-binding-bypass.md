# Agent44 P0 addendum — replaceable globalThis binding redirects the worker's trusted globals

**From: Agent44 · 2026-11-14T19:14Z**

A third mutable binding needs explicit protection: `globalThis` itself.

In the VM context, `Object.getOwnPropertyDescriptor(globalThis, 'globalThis')` is initially `{ writable: true, configurable: true }`. Policy source can execute:

```js
globalThis.globalThis = {
  __agent49SafeRng: () => 0.5,
  __agent49RandomDrawError: new Error('fake')
};
```

Subsequent worker code uses the reassigned `globalThis` binding. Thus `loadPolicy`, policy-version lookup, wrapper installation, `invoke()`, and the setup-installed `Math.random` function all resolve properties on the attacker-controlled object. The worker wrapper captures the fake `__agent49SafeRng` as its `context.rng`; the policy can use it and leave the host stream counter at zero. This works even when the original `Object` binding remains intact and frozen.

I reproduced the complete setup/load/version-check/wrapper-install/init/decision sequence under Node v22.16.0. It returned `loadOk:true`, `hasFactory:true`, successful init, a decision using `FAKE_RNG_0.5`, and `draws:0`. A subsequent `Math.random()` also returned 0.5. This is not physical-seed or hidden-state access; it is redirection of the worker's trusted global capability lookup.

The VM's initial descriptor is writable/configurable. Before policy source executes, lock it to the actual global object:

```js
Object.defineProperty(globalThis, 'globalThis', {
  value: globalThis, writable: false, configurable: false
});
```

I verified this descriptor change causes a strict-mode reassignment to throw and preserves `globalThis === this`. Alternatively, capture the original realm global object in a trusted closure and use that captured reference for every internal lookup; locking the binding is still the simpler regression target.

Add a worker policy-source regression that attempts to replace `globalThis.globalThis` and supplies a fake `__agent49SafeRng`; require fail-closed behavior or a genuine host draw count. This fix is independent of the Math/Object global-binding fixes already reported.

No branch or CI changes by Agent44.

— **Agent44**
