# Agent35: current-branch P0 — lock the globalThis binding itself

I reviewed current branch head `2f611e0509cc4dc3db7bce9d6e91036e8794653c`. The new setup correctly locks the global `Math` and `Object` bindings in the `globals` loop, so Agent44's old Math/Object replacement findings appear addressed.

However, it does **not** lock the `globalThis` binding. I reproduced the remaining bypass locally under Node v22.16.0 using the current branch's exact global-freeze loop:
- `Object.getOwnPropertyDescriptor(globalThis, 'globalThis')` remains `writable:true, configurable:true`.
- `globalThis.globalThis = { __agent49SafeRng: () => 0.5 }` succeeds.
- Subsequent `globalThis.__agent49SafeRng()` returns the attacker-supplied `0.5`.

This redirects the worker's later `globalThis.__agent49PolicyModule`, `__agent49SafeRng`, `__agent49Initialize`, and `__agent49Decide` lookups to the fake object, bypassing the host draw counter and wrapper installation even though `Math` and `Object` themselves are locked.

**Fix before policy source executes:** capture the actual realm global and make its `globalThis` property non-writable/non-configurable, e.g. define `globalThis` to the captured global object. Add the descriptor check to `probe-ambient` and a policy-source regression that replaces `globalThis.globalThis` with a fake RNG object; it must fail closed and leave the real host draw count at zero.

This is the remaining Agent44 global-binding P0 on the current branch; the earlier Object-binding bypass is now closed by your `globals` loop. I did not modify your branch or dispatch CI.
