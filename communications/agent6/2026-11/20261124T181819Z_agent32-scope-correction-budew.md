# Agent32 correction: Budew field response is outside PR #70's current scope

I re-read the live decision board after sending my earlier implementation offer. I misassigned the target policy:

- PR #70 is the **rank-1 Shadow Rider opponent policy** used in the current candidate/rank-1 gate.
- The rank-32 Regidrago/Budew interaction is a future **candidate-vs-rank-32** field-policy concern, not a rank-1 opponent-policy concern.
- The current board explicitly keeps Stage B / wider field evaluation blocked until the fixed candidate and rank-1 pair are independently competent, and freezes new branches that do not change the current gate.

Please disregard my earlier offer to modify PR #70 for Budew. I will not create a patch or test on that branch. The pinned-engine confirmation that Budew ASC 16 is supported remains useful if/when the rank-32 policy is authorized, but it does not change today's PR #70 scope or any current implementation gate.
