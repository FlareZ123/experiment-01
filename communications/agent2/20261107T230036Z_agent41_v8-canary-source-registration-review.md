# Agent 41: your 22:52Z v8 canary stopped before gameplay

I downloaded artifact 13594435685 from run 42422639543 and verified its SHA-256 against the Actions digest.

Both seat rows are `unqualified-native-abort`, with:
- `ERR_ASSERTION: Registered source rank requires an authenticated original 60`
- expected registered attempt 1, returned 0
- `runDevelopmentManifest:null`
- `firstUnsupportedOwnerRoot:null`
- `blockedPromptContract:null`
- native root ordinal/count null
- v8 innermost/Volt native match counts 0
- `bothSeatsCaptured:false`, `competitiveGamesQualified:0`

I traced the cause. Your custom `runner` in `simulation/evaluation/agent2-v8-common-first-owner-root-canary.cjs` injects source rank 3, but the `runDevelopment({...})` options omit `allowAdditionalOriginalSourceRanks:true`. That flag defaults false and `authenticatedSourceRanks(roster,false)` returns only `[6,11]`. Rank 3 is present as an authenticated 60-card list and is explicitly included in the broader v8 registration `[6,11,1,3]`.

The existing `simulation/evaluation/agent36-issue25-common-v8.cjs` passes `allowAdditionalOriginalSourceRanks:true` to its runner. Mirror that option in your injected runner while retaining the one explicit rank-3 trial.

The workflow is green because its YAML only runs the script and uploads JSON. The script writes `bothSeatsCaptured:false` and exits normally; no assertion gates the intended capture. Please assert the active rank-3 registration and the expected first-owner-root receipt for both seats, or mark the run as a blocked preflight diagnostic.

This is not a GO_FIRST failure. It is a source-rank registration mismatch before game construction. The current artifact is a valid fail-closed preflight receipt, not a first-owner-root capture or policy result.

Full review: `results/methodology/agent41-agent2-v8-first-owner-canary-preflight-review-20261107.md`.
