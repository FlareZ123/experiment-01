# Agent2: bounded privacy review of the d216eeb sanitized no-game artifacts

**Date:** 2026-11-21T15:46Z  
**Scope:** privacy-only review of public artifacts from runs 44914976302 and 44915035016, plus the exact d216eeb source path. No code, tests, workflow, PR, fixture, or game action was changed or dispatched.

## Disposition

**No concrete hidden-information or secret-seed disclosure was found in the reviewed artifacts or the corresponding d216eeb worker input path.** This is a bounded review of a predecessor SHA, not current-head acceptance and not policy-competence evidence.

Reviewed artifacts:
- Run 44915035016, research SHA `d216eeb32c0104f7d10ff681205847c93a891f54`:
  - artifact 14711243031: four `native-no-game-seat-witness.json` rows;
  - artifact 14711143852: `runtime.json`.
- Run 44914976302, same research SHA:
  - artifact 14711475787: `canary-report.json` and `runtime.json`;
  - artifact 14711565566: contract-only receipt.

## Findings

1. **The four public witness rows contain no raw actor observation, prompt projection/options, action payload/frontier, selected token/card, policy audit, native Store/state, hand/deck/prize/discard, opponent private zone, or worker request/response.** Their keys match the frozen row allowlist. An independent local check of all four rows found no forbidden keys; role/root/prompt/worker counts reconcile, the inactive role has zero decisions in each cell, all four rows declare no game and no live dispatch, and cleanup is verified.

2. **The only seed material in the witness rows is the public physical witness seed `seed` and derived `seed32`.** The runner's validator explicitly permits those two keys only at the witness-row root, verifies `seed32` against the first UInt32LE of SHA-256(seed), and rejects seed/RNG fields elsewhere. This is consistent with the owner's public-reproducibility decision. The values are not passed to the worker.

3. **Source corroboration at d216eeb supports the actor-only boundary.**
   - `agent36-async-docker-policy-session.cjs` sends an init containing role, seat, policy version, bundle hash and empty config; decision IPC contains only actor observation, actor prompt projection, public event receipt and typed action frontier.
   - `agent49-policy-protocol.cjs` recursively rejects keys matching seed/RNG/entropy/random and native/hidden-state fields.
   - `agent49-policy-worker.cjs` creates a worker-local CSPRNG stream; its comment and protocol keep physical-game RNG/seed out of IPC. Policy RNG draws are rejected (successful responses must attest zero draws).
   - `agent36-docker-policy-worker.cjs` creates a hash-checked explicit policy-file bundle; its documented mount boundary excludes the repository, Twinleaf, decks, physical seed and host process paths.

4. **Minor public-artifact data minimization only:** the runtime/canary reports expose `dockerEndpoint=unix:///var/run/docker.sock`, a bridge probe IP/port, an ephemeral container name, and host namespace inode identifiers. These are runner-environment fingerprints, not credentials or game/private data, and I found no exploitable disclosure. If these reports are retained as public artifacts long-term, consider replacing them with coarse values (local Unix socket, positive-control pass, isolated namespaces) while preserving the image digest and enforced constraint evidence. This is not a blocker and I am not proposing a pre-gate patch.

## Boundary

Run 44915035016 produced four no-game witness rows but failed its then-current postflight contract; no game was executed. These artifacts predate current PR #58 head `c58f81e4cbf39046e0f797454b723e98bdcaed0d`. Do not treat them as acceptance for the current head, a fixture result, or evidence of competitive play. Agent49 retains sole implementation/dispatch ownership; Agent44's current-head acceptance review remains separate.

No action is required before the existing exact-head gate sequence. The only optional follow-up is the low-priority runtime-metadata minimization above after the current critical path clears.

— Agent2
