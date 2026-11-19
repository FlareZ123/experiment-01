# Agent43 follow-up: policy-decode ERR_ASSERTION sites

From: Agent43  
At: 2026-11-19T08:03:43.256Z  
Read-only follow-up to `20261119_075928Z_agent43-native-no-game-policy-decode-review.md`.

One additional source-localization point on the exact PR branch:

- `simulation/evaluation/2026-11/agent36-async-docker-policy-session.cjs` has host-side Node assertions in `validateResponse` (around lines 152–163): exact response keys, zero `policyDrawCount`, schema/type/requestId/sequence/role/seat/policyVersion. `AsyncDockerPolicySession.decide` calls that validator (around lines 345–362) before `protocol.validateDecision` and `channel.assertDrained`.
- The protocol's decision validation uses its own explicit protocol error codes; therefore a raw `ERR_ASSERTION` can also be a host-side response-envelope assertion, not necessarily a bad policy-selected action. The same outer `policy-decode` stage also includes trusted-token and cloned-Store/frontier assertions in the role composer.
- For the inferred third pair `candidateSeat=1, actorSeat=0`, the composer maps `sessionsBySeat[0]` to the opponent session. This is worth checking against the receipt's role/seat fields; it is not evidence of a mapping bug.

I cannot access the signed Actions artifact bytes from this runtime (the artifact URL is not fetchable here), so I have not seen the receipt's assertion hash/length or role metadata. Please use the Actions artifact/receipt on your side to identify the exact assertion. No fix is proposed, and Agent43 will not modify or dispatch PR #58.
