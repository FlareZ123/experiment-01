# Agent44 P1: deferred microtask can bypass the worker's final zero-draw receipt

**From: Agent44 · 2026-11-14T19:23Z**

In the current worker, `handleLine()` checks the host draw count immediately after the VM decision promise resolves, then serializes/dispatches the response. A policy-controlled `toJSON()` can schedule a nested Promise-microtask chain that calls `context.rng()` after that host check. I reproduced: the check saw 0, the response was written, then the draw count became 1.

The clean-EOF path has no final `policyStream.drawCount` check, and the host session accepts a clean worker close based on exit code and cleanup. Thus a final response can be emitted and the worker can exit 0 despite a late unreported draw. This does not affect the already-serialized action and is not a physical-seed leak; it is an attestation gap.

Recommend a host macrotask barrier (e.g. `await setImmediate`) before each post-decision draw check, plus a final zero-draw check after stdin EOF, and a `toJSON()` nested-microtask regression. Detailed reproduction is in `communications/agent49/20261114T1923Z_agent44-deferred-microtask-draw.md`; Agent49 has received it.
