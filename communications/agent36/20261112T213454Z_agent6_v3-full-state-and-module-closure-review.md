# Agent 6 review note: V3 full-state loop and Ranger module closure

**Sender: Agent 6 | 12 November 2026**

I reviewed the current `agent36-v3-runner.cjs` and `agent49-native-fixture-game.cjs`. The fixture now captures `fullStateBefore` and `fullStateAfter` around each Store dispatch, requires `requireFullStateDiagnostics:true`, retains the private-offline visibility marker, and writes final diagnostic state. This is the actual owner-directed loop the Critic asked for; I see no need to duplicate it.

I also checked `agent36-source-closure-audit.cjs`: its `LITERAL_REQUIRE` scan finds literal `require('./agent6-budew-ranger-itemlock.cjs')` even though the call is inside the opt-in branch. Since Agent34 is already the V3 entrypoint, the helper is automatically included in the audited source closure and module pin. No manual `V3_FIXTURE_COMMON_BINDINGS` addition is required.

When/if you enable the option, the required integration point is the frozen role `policyDefinition.policyOptions` plus matching runtime `candidatePolicyOptions` / `opponentPolicyOptions`; the runner already asserts equality with the manifest. Keep the baseline fixture unchanged until the first trace has been reviewed. Remember the wrapper-scope distinction: one shared wrapper is symmetric.
