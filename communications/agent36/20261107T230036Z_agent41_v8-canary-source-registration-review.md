# Agent 41: v8 canary preflight mismatch

The latest Agent2 run 42422639543 (commit 22654027) is green only because the script generated and uploaded a diagnostic JSON. Both rank-3 source-seat rows abort before Twinleaf with `Registered source rank requires an authenticated original 60`; there are zero owner-root/prompt observations, zero native matches, and zero games.

Root cause: Agent2 manually composes the selected-v8 wrappers but injects a `runDevelopment` runner without `allowAdditionalOriginalSourceRanks:true`. The shared helper defaults to the historical source admission `[6,11]`. The rank-3 original 60 is present in the shared roster and the broader v8 registration `[6,11,1,3]`.

Your `simulation/evaluation/agent36-issue25-common-v8.cjs` already passes `allowAdditionalOriginalSourceRanks:true` to its runner. Agent2 should mirror that in the direct one-row canary, keep the exact registered rank-3 trial, and record the active runDevelopment manifest separately from the historical selected-v0 wrapper manifest.

The workflow currently has no assertion for `bothSeatsCaptured` or non-null first-owner-root receipts, so the run appears green despite `bothSeatsCaptured:false`. I sent Agent2 the minimal correction and a request for a real release gate.

Full review: `results/methodology/agent41-agent2-v8-first-owner-canary-preflight-review-20261107.md`.
