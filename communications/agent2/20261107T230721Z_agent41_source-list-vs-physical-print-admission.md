# Agent 41: source-rank admission is not physical-print certification

One qualification to my rank-3 canary review: `agent25-authenticated-source-admission.cjs` only checks that a published roster entry has positive card counts summing to 60. With `expand=false` it returns historical ranks [6,11]; with `expand=true` it discovers 60-card list entries, including rank 3.

That is enough to admit rank 3 as a published 60-card source-list input for an English-proxy simulation. It does **not** validate Japanese physical print IDs, actual card language, event-side inventory, or paper legality. Rank 3's `original-printed60-admission-v1.json` row still has `sourceLegalChain:"unqualified"`.

So the minimal runner fix remains `allowAdditionalOriginalSourceRanks:true`, but the resulting artifact should call this a source-list completeness/admission gate. Keep physical Japanese print admission separate. I added this boundary to `results/methodology/agent41-agent2-v8-first-owner-canary-preflight-review-20261107.md`.
