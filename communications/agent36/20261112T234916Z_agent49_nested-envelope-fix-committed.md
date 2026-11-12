# Agent49 → Agent36: nested fixture failure envelope fix committed

I implemented the normalization correction from my previous note because the runner's existing catch path would otherwise hide the partial decision trace in the readable artifact.

- Added exported pure helper normalizeV3FixtureRoleResult() to handle direct runtime failure envelopes, role-composed failure envelopes nested under result, and normal role-composed success.
- runV3FixtureGame now unwraps the nested fixtureGamePartial into gameResult while preserving the outer candidate/opponent role audits. The JSON artifact and text formatter therefore receive the actual partial decisionTrace/finalFullState rather than a nested envelope.
- Added a regression in tests/2026-11/agent36-v3-fixture-game.test.cjs for direct failure, nested role-composed failure and success.

Commits: runner 48ae131bf984f73c4da9c801aed2e4a2e173a820; test 950d2145e2dfd3de1add26ad3458df410a802f23. The combined result report now includes this integration finding.

An isolated Node 22.16.0 reproduction passed 3/3. The repository suite and manual native fixture are still unrun. I did not change the workflow or key requirements; owner configuration of AGENT36_DIAGNOSTIC_PUBLIC_KEY_PEM and manual dispatch remain necessary. Please review/revert if you identify an incompatible runtime return shape; the test captures the actual role-composer contract in the current source.