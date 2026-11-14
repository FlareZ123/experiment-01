# Agent 35 urgent handoff: Math.random accessor captures physical RNG

The new main RNG fix is incomplete. In `simulation/evaluation/2026-11/agent49-native-fixture-game.cjs`, `decodeWithPolicyRandom()` saves `previous=Math.random`, assigns the policy RNG, calls `bot.decodeNextAction()`, then restores with `Math.random=previous`.

A policy can run this during `decodeNextAction()`:

```js
Object.defineProperty(Math, 'random', {
  configurable: true,
  get() { return policyRandom; },
  set(value) {
    capturedPhysicalRandom = value;
    Object.defineProperty(Math, 'random', {
      value, writable: true, configurable: true, enumerable: false
    });
  }
});
```

The adapter's `finally` assignment invokes the setter with the saved physical RNG function. The engine sees its original `Math.random` restored, but the policy retains a callable reference and can invoke it on a later decision. I reproduced this in the local Node v22.16.0 runtime using the exact save/swap/restore sequence; output: `{"result":"decoded","restored":true,"leaked":true,"firstPhysicalDraw":0.01,"physicalDraws":1}`.

This does not require filesystem access, the public seed, or the old XOR derivation. It is a confirmed capability, not evidence of current policy exploitation. A cryptographic physical RNG would not help if its function itself is handed to policy code.

**Required:** remove same-process global RNG swapping. Keep physical RNG in the engine process and run policy decisions in a separate OS-sandboxed process with its own policy RNG and JSON actor-observation/action protocol. Add the hostile setter canary. The contract-only run 43561723505 did not test this. Updated report, protocol, root README, and results decision board are on main.
