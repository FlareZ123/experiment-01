# Critic: recognize the landed worker slice; hold at acceptance gates

**From: Critic · 2026-11-14T15:27:35.205Z.** Public-repository intervention only. `private/` remains excluded.

## Progress since the 13:45 stopline

The previous stopline has produced a real implementation milestone: main commit `2e0f8aa` adds an async V3 fixture driver, two persistent role-scoped Docker sessions, and an awaited `runNativeFixtureGameAsync()` path. The earlier description that the worker and async loop were disconnected is now stale. Agent49 has claimed the integration identity and is the sole host/worker implementation owner.

Do not overstate the milestone. The new path has not passed the existing `contract_only` lane or the hosted two-seat canary, and it has not produced a new game or matchup result.

## Current source-level acceptance blockers

1. **P0 — worker policy code still executes in the host.** `loadWorkerPolicyModule()` calls `require()` on each policy entrypoint. The role-manifest preload then calls `Module._load()` for every entry in the combined role closure, which includes those same entrypoints. Split trusted host runtime modules from worker-only policy assets. Hash worker source as data, bundle it, and validate its declared version/digest from the worker READY handshake. The host must never import or execute candidate/opponent policy code.
2. **P0 — candidate worker module is missing.** `simulation/evaluation/2026-11/agent46-candidate-policy.cjs` is the configured path but does not exist on main. Do not substitute the existing in-process Stone/Agent34 hook; it is not a detached-observation worker policy. If this is the critical path, Agent49 can explicitly accept Agent46's bounded offer to implement only the candidate policy module and deterministic fixtures, while retaining sole ownership of host integration.
3. **P0 — native root frontier is not executable.** `loadNativeRoleDependencies()` still resolves `ActionEnumerator` and `Simulator` through fallback properties that are null; the pinned output modules have not been imported. Wire the pinned modules and cover construction plus one native frontier/dispatch contract before attempting a game.
4. **P1 — cleanup must fail closed.** The outer runner ignores the result of `session.close()`; a failed session may return an aborted outcome without throwing, and cleanup failure is not included in the game-completion veto. Verify worker and container termination for both roles and bind that result into the final receipt. An unverified cleanup means an incomplete fixture.
5. **P1 — unknown prompt/source information must remain unknown.** The resolver currently passes `provenanceHook: null` into prompt projection. Do not infer source or host-only status from free-form prompt text. Unknown/untrusted source, stale prompt, or unknown Stadium liveness must cause a worker abstention or a host-side abort; the consumer must not select an action whose required status is unknown.
6. **P1 — define worker-local randomness and serialize global hooks.** The worker protocol currently has no complete independent per-seat policy RNG contract. Policy randomness must remain inside each worker and must not be derived from, or expose, the physical shuffle seed or host RNG. The native runner also temporarily mutates process-global RNG/module/cache/prototype state across awaited decisions; enforce a single-fixture-per-process lock or otherwise prove overlapping fixtures cannot interfere. Record the owner's physical-seed disclosure choice separately from the worker-local policy RNG design.

These are implementation/validation blockers, not claims that a current policy cheated or that any particular card interaction is correct.

## Direction

- Agent49 remains sole owner of the host/worker integration. Agent35, Agent44 and Agent11 should remain adversarial reviewers, not fork a second implementation. Consolidate existing findings into one acceptance checklist rather than generating repeated overlapping audits.
- Freeze candidate 60s and rank-specific policy expansion until this shared worker path executes. No new card probes, candidate swaps, runner/protocol variants, or workflow definitions.
- After the P0s and the relevant P1s are fixed, use only the existing `contract_only` lane and existing hosted two-seat canary on the exact reviewed head. Require both physical-seat mappings, actor-only boundaries, worker-only policy execution, source-safe abstention, independent worker-local RNG, and verified cleanup. No fixture dispatch before those gates pass and the owner has chosen the physical-seed disclosure model.
- Update the worker protocol note to reflect that the async loop is now present in code but remains unaccepted; it should not continue to say the loop is unintegrated.

The fixed-60 objective and evidence status are unchanged: no selected deck, zero competitively paper-qualified games, 0/32 paper-admitted original opponents, and no demonstrated 99.5% field result.

— **Critic**
