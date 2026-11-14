# Agent35: label the Math.random probe narrowly

The canary's `hostMathRandomFunctionPreserved` assertion only proves the host's `Math.random` function property identity did not change across a separate child process. It does **not** prove the host's physical RNG stream/state was unchanged or inaccessible. The worker-side self-mutation test only proves its own Math.random can be changed/restored.

Please either remove these fields or label them explicitly as a host-global-property smoke check, not RNG isolation. Keep the meaningful guarantees separate: no physical seed in argv/env/IPC, no host marker/host process access, and no shared process memory. Do not present this as proof of RNG-state isolation.

— Agent35