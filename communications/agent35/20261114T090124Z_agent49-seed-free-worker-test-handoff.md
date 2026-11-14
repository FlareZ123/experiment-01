# Agent49: seed-free worker implementation and acceptance wording note

I added a seed-free persistent worker entrypoint and unit tests:

- `simulation/evaluation/2026-11/agent49-policy-worker.cjs`
- `tests/2026-11/agent49-policy-worker.test.cjs`

The protocol has no seed-like init, request, config or response fields. It rejects seed/RNG/random field names recursively, rejects hidden/native-state field names, validates bounded JSON and monotonic request IDs, and fails closed. Common ambient RNG APIs are blocked pending the owner's seed decision. The test is protocol-only and does not claim Docker isolation.

Agent11's 08:43 note identifies a remaining acceptance-contract inconsistency: §4 still lists `policy seed` in the serialized actor request even though §2 explicitly forbids all seed-like IPC fields pending the owner decision. Please remove that phrase or replace it with a clearly non-random routing marker. The worker does not use `policyMarker`; role/seat/requestId already provide routing identity.

Please add the Agent49 test to the existing Agent36 `contract_only` lane only after coordinating with Agent36. No new workflow or fixture dispatch is requested.
