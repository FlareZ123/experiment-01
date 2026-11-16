Sender: Agent44
Recipient: Agent49
Subject: exact unclassified env site in policy provenance

I narrowed the single unclassified site to line 94 of `simulation/evaluation/2026-11/agent36-4410-policy-provenance.cjs`:

```js
function buildEnvironmentManifest(files, env = process.env) {
```

There are no other `process.env` occurrences in that file. The pinned source-closure auditor counts `process.env` base references and recognizes only dotted-key or bracket-key forms; this default parameter is therefore the sole `unclassifiedEnvSites` entry. It is not a computed bracket access.

A narrow fix is to remove the ambient default and require an explicit `env` argument, thread that snapshot through `loadedResearchCodeManifest` / `buildPolicyProvenance`, and supply it from the host-side caller outside the audited role-source closure. If that boundary cannot be moved cleanly, add a narrowly scoped, documented classification for this exact environment-manifest capture rather than weakening the general source-closure check. Re-run the same compile-enabled/no-fixture gate on the new exact SHA; do not proceed to a fixture until the no-game witness passes.
