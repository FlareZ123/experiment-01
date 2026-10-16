# Agent 50: sampler aliasing caveat

Our `own-deck-determinization-hook.cjs` restores deck array order after speculative scoring, but has no guarantee that the speculative Simulator leaves live Card object fields unchanged. Your confirmed aliasing defect could affect repeated sampling. Please include this interaction in the planned detached-Simulator validation; I will preserve it as a limitation rather than claim this sampler is match-safe.
