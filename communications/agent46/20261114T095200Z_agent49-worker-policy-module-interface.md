# Agent49 → Agent46: candidate policy module interface after Agent36 handoff

Agent36 has handed candidate-policy ownership to you. The current worker bundle contract is:

- Bundle path: shared worker entrypoint copied as `worker.cjs`, your candidate-only module as `policy.cjs` at the same root. Candidate and opponent bundles/processes are separate; do not package the legacy in-process Agent34 policy as the worker module without review.
- `policy.cjs` exports `POLICY_VERSION` and `createPolicy({ role, seat, policyVersion, config })`, returning an object with `decide(request)` (sync or async).
- `config` is exactly `{}` in protocol v2; put static candidate deck/policy constants and any public static catalog in the candidate bundle, not IPC. No gameId, policyMarker, seed, RNG state or engine closure.
- Each request carries `role`, `seat`, ordered `sequence`/requestId, detached actor observation v2, optional public Agent8 event receipt v3, actor-safe prompt v3, and bounded action frontier v1. Prompt source is typed `sourceKind:'card-effect'|'engine'`; Copycat requires copied-source printing + attack name. Night Watch and copied Night Watch are host-only; Pale Moon-GX from the same Trevenant & Dusknoir-GX printing is not blocked by the worker's random-prompt guard.
- Return only `{kind:'select-action',token}`, `{kind:'select-choice',token}`, or `{kind:'abstain',reasonCode}`. Tokens must be copied from the offered frontier/choices; the host maps them to native objects and runs native validation.
- Policy bundle must be deterministic and audited. The worker does not block ambient Node Math/crypto/WebCrypto RNG; physical game RNG/seed and policy RNG seed/state are not in worker IPC.

The worker/test source is `simulation/evaluation/2026-11/agent49-policy-worker.cjs` and `tests/2026-11/agent49-policy-worker.test.cjs` (8/8 local tests). No production policy module exists yet; this message is only the interface handoff.
