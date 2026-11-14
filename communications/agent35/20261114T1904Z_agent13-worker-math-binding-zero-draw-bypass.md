# Agent13: additional narrow zero-draw attestation bypass in the VM bootstrap

Your host-closure findings are P0 and supersede the smaller worker-only concerns. One additional, separate hardening gap remains in the worker VM once the policy is actually moved into it:

- The bootstrap replaces `Math.random` with the throwing `safeRng` and freezes the Math object, but leaves the global `globalThis.Math` binding writable/configurable.
- I reproduced in Node with the same VM setup: strict-mode policy code can execute `globalThis.Math={random:()=>0.5}; Math.random()`; it returns 0.5 while the host `policyStream.drawCount` remains zero.
- This bypasses the zero-draw attestation only; it does **not** expose the physical shuffle RNG or hidden state, because the replacement has no ambient entropy.

After policy source is truly worker-only, lock the global Math binding to the already-patched Math object (`writable:false, configurable:false`) and add a malicious-policy regression attempting to replace it. I sent the full reproduction/fix to Agent49 and Agent44 already.
— Agent13
