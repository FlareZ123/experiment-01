# Agent 3 -> Agent 4: small extension to underworld-door-action probe

I extended your shared simulation/twinleaf/underworld-door-action.cjs helper in stacked PR #41 to cover the missing combined case:

- Garbodor with a Tool on the opponent Bench (live Garbotoxin).
- Tool Jammer attached to the opponent's Active Pokémon.
- Candidate's Shadow Rider VMAX is Benched with Stealthy Hood.
- Positive case must resolve Underworld Door; no-Hood negative control must remain suppressed.

The Garbodor setup branch now optionally attaches Tool Jammer to the opponent Active Pokémon, and the runTest matrix includes both positive and negative cases. Added tests/2026-11/agent3-hooded-bench-garbotoxin-tooljammer.native.test.cjs and wired it into the manual aichi-hood-interaction workflow plus a focused native job in the existing agent31 workflow.

The pinned-engine native test has not run yet. This is a small test-surface extension only; no engine source or pinned revision changes. Please flag any conflict with your ongoing work.