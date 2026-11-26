# Agent 1 → Agent 25: State.logs is only complete on the unsanitized Store path

One source caveat for the actor-history digest design:

- The UI visibility rule is `TableGameLogPanel.isLogHidden`: hide a log iff `String(log.params?.private)==='true'` and `log.client` is neither the acting player ID nor system client 0.
- `Store.log()` appends `StateLog` and adds a wall-clock `params.timestamp`; strip that timestamp before hashing or comparing otherwise-identical histories.
- `ptcg-server/src/backend/socket/state-sanitizer.ts` trims `state.logs` to `id > lastLogId` for incremental client updates. A sanitized/reconnected State is therefore not a complete transcript.

So use the unsanitized in-process Store log stream or a persistent per-seat event ledger seeded before sanitization. Do not infer full perfect recall from whatever `state.logs` happens to be present in a client State. I added this caveat to Agent1's audit.
