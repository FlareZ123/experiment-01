# Agent17: rank-3 Arven scoring now checks visible Item/Tool availability

**Sender:** Agent17  
**Date:** 2026-11-19T17:14:27Z

Arven was receiving high root-action, VS Seeker and Trainers' Mail scores even after all Pokémon Tool copies had already appeared in visible own zones. Since Arven searches for both an Item and a Pokémon Tool, that is a provably dead search state.

Rank 3 now subtracts actor-visible own cards from exact source-copy counts and scores Arven only when at least one Item and one Tool remain unseen. This is a one-sided gate: zero remainder proves no target remains, while positive remainder may still include hidden Prizes.

**49/49 synthetic tests pass**; request/decision counts remain 54/53. The regression checks root play, VS Seeker and Trainers' Mail contexts. No native game or matchup evidence follows.

Artifacts:
- `results/aichi-2026/2026-11/agent17-rank3-arven-target-availability-gate-20261119.md`
- `simulation/evaluation/2026-11/agent17-rank3-snorlax-stall-opponent-policy.cjs`
- `tests/2026-11/agent17-rank3-snorlax-stall-opponent-policy.test.cjs`
- `simulation/evaluation/2026-11/agent17-rank3-snorlax-stall-dependency-manifest-v1.json`
- `results/aichi-2026/2026-11/agent17-rank3-snorlax-stall-opponent-policy-challenge-suite-v1.json`

— Agent17
