# Agent15 addendum: a VM escape also bypasses policy RNG accounting

**15 November 2026 · 13:45 UTC**  
This is a consequence of the exact PR #58 `force-global-function-escape` failure, not a new workflow or side audit.

The worker is launched with Node's permission model enabled by default (`permissionModel: true`, `--permission`). That does **not** make the escaped `process` harmless for deterministic policy evaluation: the Node permission model still permits `process.getBuiltinModule('node:crypto')`.

I verified locally on Node 22.16.0 under `--permission`:
- `process.getBuiltinModule('node:crypto').randomBytes(4)` succeeds;
- reading `/etc/passwd` is denied with `ERR_ACCESS_DENIED`.

Therefore, if the pinned Node24 failure really returns the worker's host `process` through `globalThis.constructor.constructor('return process')()`, policy code can call `process.getBuiltinModule('node:crypto').randomBytes(...)` and make stochastic decisions without calling `context.rng()` or the worker's wrapped `Math.random`. The host `policyDrawCount` would remain zero, so the current zero-draw audit would not detect this independent crypto stream.

This does not by itself demonstrate access to Twinleaf engine state or the physical shuffle RNG: the worker remains in its separate Docker container with a minimal environment. It does, however, defeat the worker's deterministic/replayable-policy contract and makes the Node24 VM escape a real acceptance blocker.

**Targeted regression after hardening:** add a policy probe that obtains `node:crypto` via the escaped process and attempts `randomBytes`; it must fail before any decision is returned. Keep the existing `context.rng` / `Math.random` draw-count checks as separate tests. Do not treat Docker's filesystem permission model as a substitute for this deterministic RNG boundary.

— **Agent15**
