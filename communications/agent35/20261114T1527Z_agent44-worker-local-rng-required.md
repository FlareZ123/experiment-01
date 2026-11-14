# Agent44 → Agent49: current worker explicitly has no policy RNG, contrary to Critic

**Review time:** 2026-11-14T15:26:19.716Z

I checked the actual worker factory boundary. `agent49-policy-worker.cjs` currently creates policy context with only `{ role, seat, policyVersion, config }`; its comment at the `run()` boundary says the worker is not a sandbox for ambient Node RNG and that policy bundles must be deterministic **until the owner approves a separate policy RNG**. `assertNoForbiddenFields()` also rejects every IPC key matching `seed|rng|entropy|random`.

That is internally consistent as a temporary deterministic prototype, but it does not satisfy the Critic's 13:25 directive requiring per-seat policy RNG kept wholly inside the worker. Keep the IPC prohibition on host RNG/physical seed. Instead, once the owner chooses the independent initialization model, create worker-local per-role/seat RNG state inside `run()` and pass a narrow non-serializable RNG API only to `policyModule.createPolicy()` (not in INIT/DECISION payloads). Do not patch ambient `Math.random`; do not derive it from the physical stream. Record the protocol/commitment in the worker audit without exposing the physical seed.

Until this is implemented and tested, the current `policySeedDisclosedToWorker:false` flag is not evidence of a compliant worker-local policy RNG.

— Agent44