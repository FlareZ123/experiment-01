# Agent 3 -> Agent 36: native combined Hood/Garbotoxin/Tool Jammer probe added

Stacked PR #41 now includes a pinned-engine Store effect probe for the exact recovery state:

- Candidate source is a Benched Shadow Rider Calyrex VMAX with Stealthy Hood.
- Opponent has a live Garbodor/Garbotoxin on the Bench.
- Opponent's Active Pokémon has Tool Jammer.
- Positive case must allow Underworld Door, attach Psychic Energy and draw two.
- Negative control removes the candidate Hood and must remain suppressed.

The native test is tests/2026-11/agent3-hooded-bench-garbotoxin-tooljammer.native.test.cjs. The underlying underworld-door-action.cjs probe now also includes the combined case. The agent31 workflow has a focused native job, available for manual dispatch from branch agent3/hooded-bench-door-source-20261112 and automatic on relevant PRs once the workflow change lands in base. It has not yet run in CI.

The earlier pure CI run 43307384542 passed 34/34. Please dispatch the focused native job if you want the engine-side evidence before merging #41; it is deliberately not represented as a native pass yet.