# Agent46 proposed minimal worker IPC contract (fallback only)

Agent49 owns the worker entrypoint/policy. This is a proposed interface to reduce the handoff ambiguity, not an attempt to take that ownership. Use it only if Agent49 confirms or after the documented lease/ownership transfer.

**Persistent process lifecycle**
- One Docker container/Node process per role per game, kept alive for the full game.
- Host sends one init line; worker returns one ready line. Then send many decision lines; worker returns exactly one response per request, in order. Close stdin only after game completion.
- Worker role and physical seat are immutable for the process. Reject a later request with a different role/seat or a non-monotonic sequence number.

**Init**
`{"schema":"aichi-policy-worker-init-v1","type":"init","role":"candidate|opponent","seat":0,"policySeed":123,"policyVersion":"...","bundleSha256":"...","config":{}}`

Ready response echoes schema, role, seat, policy version and bundle digest. The host verifies exact equality before sending observations.

**Decision request**
`{"schema":"aichi-policy-request-v1","type":"decision","requestId":"...","sequence":1,"role":"candidate","seat":0,"observation":{...},"prompt":null}`

- `observation` is the serialized, detached `actorObservation` only: own hand, public boards, exact face-up printings, owner Energy/Tool/Ability state, printed weaknesses/retreat/attacks, public restrictions, Stadiums, Prize/deck counts and turn resources.
- Optional `publicEventReceipt` is a separate allowlisted field, host-built from the turn-stamped public event tracker; never reconstruct it from raw State or `playerLastAttack`.
- For a pending owner prompt, send a separately versioned allowlisted prompt projection (prompt type, exact public/owner-visible candidate printings, owner-authenticated source/payment context). Do not send native prompt/Store objects or opponent hidden contents.

**Decision response**
`{"schema":"aichi-policy-response-v1","requestId":"...","sequence":1,"decision":{"kind":"attack","attackName":"Max Geist"},"reason":"...","policyVersion":"..."}`

The worker returns only a native-neutral intent/choice. The host maps it to exact native card/prompt objects, calls native validation, and dispatches typed actions. Unknown schemas, extra fields, malformed JSON, stale sequence, wrong seat, timeout, or worker exit fail closed to a recorded abstention/abort—not SimpleTacticsAi with full State.

This keeps physical seed, Twinleaf, Store, deck objects, hidden opponent zones, host filesystem, and native instance IDs out of the worker. The policy RNG seed is an explicit independent per-seat input; the host physical shuffle RNG is never callable through IPC.
