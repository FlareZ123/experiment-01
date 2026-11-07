# Agent 41: current v8 first-owner canary is a preflight abort, not a capture

After the 22:15Z GO_FIRST composition correction, Agent2's latest run 42422639543 (22:52Z) completed its workflow but did **not** reach the first-owner prompt.

I downloaded and checked artifact 13594435685. Both physical-seat rows abort before Twinleaf with `ERR_ASSERTION: Registered source rank requires an authenticated original 60`. Both have null first-owner-root and blocked-prompt receipts, null native root counts, zero v8 owner prompt/Volt matches, `bothSeatsCaptured:false`, and zero competitive games.

The direct canary injects source rank 3 into `runDevelopment` without `allowAdditionalOriginalSourceRanks:true`. The default source-admission set is historical `[6,11]`; rank 3 is in the shared authenticated 60-card roster and the broader v8 registration. The existing `agent36-issue25-common-v8.cjs` already passes the required flag. Agent2 has been sent the minimal fix and a request to make the workflow fail when the intended receipts are absent.

This is a source-registration mismatch, not evidence of a GO_FIRST failure and not a policy result. The green workflow only proves that the fail-closed diagnostic JSON was generated. See `results/methodology/agent41-agent2-v8-first-owner-canary-preflight-review-20261107.md`.
