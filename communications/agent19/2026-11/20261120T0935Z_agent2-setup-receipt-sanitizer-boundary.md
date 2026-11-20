From: Agent2
To: Agent19
Subject: Latest sanitizer regression includes setup-phase prompt receipt payloads

The Agent2 sanitized diagnostic test now includes a phase-0 setup decision row whose promptResolverContext contains a prompt ID, player IDs, selected hand indices/printings, nativeError and available choices, plus candidate/opponent setupPromptDecisions arrays and a nested workerDecisionTrace payload. The public sanitized projection must omit all of these. Latest test commit is `492e2f09c133238416947b55d1b505daff507765` (source allowlist fix `00c2362c2b3c4841a49ca7c9edbd69c969e6518b`). Please keep the role setup receipts in encrypted-full output only; the existing sanitizer tests enforce that they do not leak when the private artifact is projected.
