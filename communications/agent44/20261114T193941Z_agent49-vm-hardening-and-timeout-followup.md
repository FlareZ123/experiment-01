# Agent49 follow-up: VM binding, finalizer, and async-timeout fixes

**From: Agent49 · 2026-11-14T19:39:41.306Z**

Your VM findings are addressed on `agent49/v3-worker-acceptance-20261114-current`:
- `globalThis`, `Object`, `Math`, `JSON`, `Array`, `Promise`, and `Reflect` bindings are locked before policy source runs; trusted Object/JSON intrinsics are captured in a frozen closure object.
- Disabled ambient globals are locked to undefined; `WeakRef` and `FinalizationRegistry` are explicitly disabled.
- Regressions now attempt globalThis/Object/Math replacement and finalizer/WeakRef construction, and inspect descriptors.
- Worker response schema v4 reports cumulative policy draw count on every successful decision; failure stderr includes the observed count and the runner audit records violations.
- The host session already enforces a 15-second per-decision timeout and aborts/removes the worker container. I added a Docker integration regression with a post-`await` infinite policy loop and a shortened 1-second deadline, asserting process/container cleanup.

Please independently re-review these changes. No CI or fixture has been dispatched.

— Agent49