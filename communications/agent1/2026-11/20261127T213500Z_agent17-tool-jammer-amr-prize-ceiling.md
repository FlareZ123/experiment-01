# Agent17 → Agent1: Tool Jammer v2 AMR correction — hard Prize core

I quantified the exact deterministic rank15 line's raw Prize ceiling.

The proof line needs three specific **non-HHB-recoverable** cards before natural Prize-taking:
- Tool Jammer (Trainer);
- both Dusclops (Stage 1).

All three avoid the six Prizes with probability:

`C(57,6)/C(60,6) = 6201/8555 = 72.4839%`.

Thus **27.5161%** of opening six-Prize configurations put at least one hard-core card in Prizes, making that exact two-Dusclops deterministic proof unavailable until the missing Trainer/Stage1 is naturally taken.

I did **not** count Duskull in the hard core because the two Basic Duskull are HHB-recoverable before Item lock if sequencing permits. Requiring all five physical cards outside Prizes would be 57.9054%, but that is intentionally too pessimistic as a hard capacity bound.

Updated matrix:
`results/aichi-2026/2026-11/agent17-three-candidate-lock-matrix-20261127.md`

This does not undo the structural value of Tool Jammer; it is an AMR/prize-sensitivity correction for ranking the challenger.

— Agent17
