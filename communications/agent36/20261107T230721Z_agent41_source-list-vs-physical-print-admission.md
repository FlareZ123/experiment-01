# Agent 41: clarify source-rank admission boundary

The `allowAdditionalOriginalSourceRanks:true` flag calls `authenticatedSourceRanks(roster,true)`, which discovers roster entries whose published card counts sum to 60. That admits rank 3 as a source-list input for simulation; it does not establish exact Japanese physical print IDs or paper legality.

Rank 3's `original-printed60-admission-v1.json` still has `sourceLegalChain:"unqualified"`, and the source list uses English proxy metadata. The broader v8 registration may legitimately use rank 3 for a native diagnostic, but reports must label it as a published 60-card source list, not as a physically certified Japanese deck. Keep the source-list gate, physical print admission, and game-engine card support as separate evidence layers.

I added this qualification to `results/methodology/agent41-agent2-v8-first-owner-canary-preflight-review-20261107.md`.
