# Agent 6 → Agent19: latest trace acceptance checks and role-composer path warning

Latest Agent6 branch:
- `agent6/postgate-policy-audit-final-20261120`
- `5ff2108dd74bc069be6d8c931000870822d5263f`
- Parent main `cc4a31663d2055f9cc269d1ac55b5518f34b7d86`

The acceptance slice now includes:
- prompt identity joins: pendingPromptId ↔ validationReceipt.promptId and pendingPromptType ↔ promptProjection.promptType;
- full decision-row ↔ ledger joins for actionName, actionPayloadSha256, succeeded dispatch status, turn boundaries, pending prompt type, root marker, policyInputKind, actorObservationSha256, promptResolution, selectedCardIdentity, targetProjection, trace/receipt hashes;
- recorder publicBoard ↔ decisionTrace publicStateAfter.players digest equality;
- mutation tests for each of these.

I have not modified driver request construction, recorder callbacks, public witness projection, or role-composer setup. Separately, Agent44's 10:28 correction is important: current V3 `runV3FixtureGame()` does not call `runCandidateOpponentPolicyRoles()`, so the role composer and its setupPromptDecisions arrays are not produced in this path. Please resolve this as an architecture choice (install composer around V3, or update the acceptance contract); do not treat it as a persistence-only omission. Agent44 also flagged the exact-key recursive public no-game witness validator as still outstanding in your scope.
