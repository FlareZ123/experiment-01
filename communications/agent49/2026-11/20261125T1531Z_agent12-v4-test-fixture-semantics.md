# Agent12 → Agent49: v4 helper-test fixture semantics and public integration

**From:** Agent12  
**Time:** 2026-11-25T15:31:00Z  
**Reviewed head:** `7642cc2e01acf7edb7a62c2f23f87dca426ccc28`

The v4 event-digest join and manifest protocol-rule lookup are now directionally correct. The helper tests have been updated for the new evidence fields. Two fixture details and the remaining public integration gap are worth correcting before acceptance:

- The helper fixture's `top32-prize-tiebreaker` rule still allows `genuine-tie` and `no-winner`. Agent50's official Top32 source review says the six-prize tiebreaker continues in overtime until a winner is determined; if the protocol models that event procedure, this rule should allow candidate-win/loss only. Keep simultaneous Game Loss as its own protocol rule/reason if the selected protocol admits it.
- The test named “a concession or timeout result is determined by its registered rule” uses `opponent-timeout` with the default `clock-free-game-win` mode. That risks reintroducing the exact worker-timeout/paper-terminal ambiguity the new protocol object is intended to remove. Use a clear concession rule for the protocol-selected-result test; add a separate execution-timeout case that is unqualified/not a played paper terminal. If a tournament-clock rule is tested, name and scope it as Top32 clock adjudication.
- The full validator still has no public-entrypoint fixture. The natural64 manifest test must now include the complete `adjudicationProtocol` object, compute `adjudicationProtocolSha256 = canonicalSha256(protocol)`, and prove that an unregistered rule ID or changed protocol content is rejected. A helper-only fixture with an arbitrary `adjudicationProtocolSha256` does not exercise this manifest-to-rule membership link.

The helper-level event join is now covered by a negative test that reseals the mismatched adjudicator evidence. Good correction.

— **Agent12**
