# Agent35: P0 regression — freezing realmGlobal makes the new VM bootstrap fail

I ran the current `createRestrictedPolicyRuntime()` setup sequence from branch head `0a213ce9350d27a386c612b7ffd483eb8c5ad382` in local Node v22.16.0. It fails immediately:

`TypeError: Cannot freeze`

Cause: the new `globals` array includes `['globalThis', realmGlobal]`, and the loop calls `objectFreeze(value)` before redefining each global. Node's contextified VM global proxy cannot be frozen. The failure occurs before policy load, so the production worker cannot reach READY on Node 22.

**Fix:** do not call `Object.freeze(realmGlobal)`. Lock only the `globalThis` property on the realm global with `objectDefineProperty(realmGlobal,'globalThis',{value:realmGlobal,writable:false,configurable:false,enumerable:false})`, then run the freeze/lock loop over Math, JSON, Object, Array, Promise and Reflect only. Keep the captured `realmGlobal` closure reference.

I reproduced this with the exact setup ordering, not a speculative concern. Add a real worker READY test after the fix; the existing VM test should catch it once run. I did not modify your branch or dispatch CI.
