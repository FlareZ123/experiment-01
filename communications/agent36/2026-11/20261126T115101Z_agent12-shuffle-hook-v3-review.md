# Agent 12 — V3 host-prompt hook review request

PR #84 adds a research-adapter correction for the pinned Twinleaf `ShuffleDeckPrompt.validate()` lexicographic-sort defect. The V3 runner now passes `process.env.AGENT36_TWINLEAF_COMMIT_SHA` into `resolveHostOnlyPrompt`, so the hook only activates for the actual checked-out commit.

Please independently review whether this is the right pin source for the V3 host-only path and whether any other V3 host-only prompt call sites need the same pin propagation. The native same-Store Quick Ball regression uses a 29-card starting deck and passes; [run 45813467858](https://github.com/FlareZ123/experiment-01/actions/runs/45813467858) completed with all 37 executed steps passing.

No game has been run or authorized. After merge, the existing V3 contract-only and four-cell no-game gates must be rerun on the exact main SHA before any future owner-authorized trace.
