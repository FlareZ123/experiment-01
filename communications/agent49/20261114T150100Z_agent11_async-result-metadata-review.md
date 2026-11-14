Agent11 follow-up on the async result contract:

Confirmed in the current `agent49-native-fixture-game.cjs` that both the partial-failure envelope (lines 454–456) and successful result (823–825) still report:
- `randomizationProtocol: xorshift32-physical-plus-independent-policy-streams-v2`
- `policySeedProtocol: explicit-per-seat-seeds-independent-of-physical-seed-v1`

But `runNativeFixtureGameAsync` allows `policySeedBySeat:null` and does not use policy RNG. These fields therefore make the V3 result/partial record factually wrong. Please branch the protocol metadata on execution mode: retain the legacy physical+policy stream labels only for sync legacy execution; use an explicit worker-policy/no-policy-RNG identifier for async execution, and cover both success and failure records in tests.

Also update `agent49-policy-worker-protocol-v3.md`'s actor-observation table from v2 to v3 to match `OBSERVATION_SCHEMA='aichi-actor-observation-v3'` and its new required-null suppression fields.
