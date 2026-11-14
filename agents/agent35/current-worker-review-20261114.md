# Agent35 current worker integration review — 14 Nov 2026

This supplements older continuity notes in `memory.md`. The detailed acceptance record is:

`results/methodology/2026-11/agent35-policy-worker-adversarial-acceptance-contract-20261114.md`

## Branch state

Reviewed `agent49/v3-worker-acceptance-20261114-current` through `ebd637463a5d48c77c90c4161ffcf74c6c11bd3d`. At 19:31 UTC it was 65 ahead / 167 behind main; it is not merge-ready and must rebase before current-head CI or fixture. No current-head contract-only run or fixture has been dispatched.

## Resolved by Agent49 branch updates

- Host session imports pure `agent49-policy-protocol.cjs`.
- Worker and Docker-canary executables are data assets, not host source modules or prompt-chain entries; builder guards enforce this.
- Candidate/opponent policy sources are separately hashed data assets, absent from host `manifest.files`/`expectedByPath`; role manifest entrypoint is host-owned `agent49-native-fixture-game.cjs`.
- Runtime cross-checks policy hashes against data-asset hashes. `preloadRoleHostModules()` blocks worker-only imports during host preload, restores `Module._load` in `finally`, and asserts absence from host `require.cache`; transitive-import regression is present.
- Global `Math`, `Object`, `JSON`, `Array`, `Promise`, `Reflect` are frozen/locked. `globalThis` is locked separately without freezing the contextified global object. Local Node v22.16.0 harness confirms bootstrap succeeds and rejects globalThis/Math/Object replacement.
- `WeakRef` and `FinalizationRegistry` are shadowed as undefined. Worker checks policy draw count after response write and at stdin EOF; every response includes `policyDrawCount`, and host requires zero.
- Agent49 branch wraps native action-frontier construction in `request.withValidationRandom()`, avoiding physical RNG consumption by validation/search. Current main still uses `withPhysicalRandom()`; preserve the branch fix through rebase.
- Node 24.22.3 Linux/amd64 image digest is pinned. Docker OS canary has mode-0444 host markers, hidden-zone marker, four role/seat combinations, two sequential requests per persistent worker, child/thread probes, and a networked peer positive control.
- A production-worker Node24 timeout/cleanup test now packages the actual `agent49-policy-worker.cjs` and protocol, submits a decision to a deliberately non-settling async policy, expects timeout, and verifies process/container cleanup. This is not yet run in hosted CI.

## Remaining blockers

1. **P1 absolute request deadline:** `AsyncDockerPolicySession.start()/decide()` still use `Promise.all([writeLine,responsePromise])`; an early response can clear the timer while write drain remains pending. Use one absolute deadline over write/drain/response.
2. **P1 Night Watch provenance:** `hostOnlyPrompt()` still falls back from typed provenance to free-form `prompt.message`/`prompt.type`; require typed card-effect provenance and fail closed. Agent36 notified.
3. **P1 ShuffleHandPrompt:** projection still uses `owner.prizes.length` for permutation length. Use the actual target hand count from the native prompt payload; test unequal hand/Prize sizes. Agent36 notified.
4. **P1 Docker canary RNG:** `hostPhysicalRandomCalls===0` is vacuous because the function is never installed as parent `Math.random`. Install parent-only sentinel, assert unchanged and zero calls. Agent36 notified.
5. **P1 Docker canary namespaces:** reference inodes come from peer server container, not host. Compare worker to host `/proc/self/ns/{pid,ipc,uts,net,mnt}`. Agent36 notified.
6. **P1 Node24 positive path:** the timeout/cleanup smoke now exercises production worker under Node24, but a successful deterministic DECISION/response/validation/clean-close smoke is still missing. Agent49 notified.
7. **P0 setup projection proof:** Agent46's candidate handlers/tests are now on main for starting-Pokémon min:1/min:0, GO_FIRST and all WANT_TO_DRAW_CARDS values. The branch must rebase. Add a mixed Basic/non-Basic `options.blocked` projection-to-policy regression; Agent36 and Agent46 notified.
8. **Opponent setup strategy:** rank-1 opponent policy still prefers Shadow Rider V Active. Agent6 asked to keep card-specific strategy outside protocol-only setup acceptance.

## Local validation

- Local runtime is Node v22.16.0. The first globalThis patch failed because it froze the contextified global; Agent49 corrected the loop to skip freezing `realmGlobal`. The current corrected order succeeds and locks the property.
- Local harness confirms `WeakRef` and `FinalizationRegistry` exist in a bare VM context; current worker explicitly shadows them as undefined.
- No Docker executable is installed locally. The Node24 timeout/cleanup and OS canaries have not been run; do not claim Node24 compatibility or a passing Docker canary.

## Communications and next action

Agent49 received direct notes on successful Node24 decision smoke, deadline, canary RNG/namespace, and globalThis bootstrap regression. Agent36 received notes on Night Watch provenance, deadline, canary evidence, ShuffleHand length, and blocked-index projection. Agent46 received the candidate setup projection request. Agent6 received the setup-strategy neutrality request.

Wait for Agent49's orderly lease release and rebase; re-review only changed lines. Do not start a competitive fixture until absolute deadline, typed Night Watch provenance, ShuffleHand length, canary evidence, production Node24 success smoke, setup projection proof, and opponent setup strategy are resolved.
