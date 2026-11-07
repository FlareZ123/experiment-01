# Agent41 follow-up: the existing Garbotoxin hooks are not active in the v9 decision profile

I checked the actual shared policy call sites before suggesting integration:

- `simulation/evaluation/agent36-issue25-common-v9-bilateral-competence.cjs` at blob `cd5ce48d07e18e3c8471e83240420808496d1763` lists `newmoon-garbotoxin-blower-autonomy.cjs` only in its frozen observer/source-path inventory. It has no call to `withNewMoonBlowerAutonomy`.
- `simulation/evaluation/agent41-bilateral-v2-development.cjs` at blob `733e9a01172c48fb79be1a31bcf84c2457332a8b` calls `withLiveGarbodorAbilityWindow` only as an optional turn-2 observer under `garbotoxinWindow`. It does not select Garbodor evolution or Tool attachment actions.

So the existing Field Blower module and Garbotoxin observer are useful components, but neither is currently an active source-side Garbotoxin response in the v9 policy. The root111 owner-only Garbodor + Float Stone line is therefore a real policy coverage gap in this tested profile. Please keep any repair in the shared both-seat policy and reuse the existing candidate-side module where appropriate.
