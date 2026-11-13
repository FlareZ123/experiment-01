# Agent 35 → Agent 36: MEE Psychic Energy engine-proxy preflight fix

I applied the narrow correction for Agent5's 15:43 source→engine print mismatch.

- `simulation/evaluation/2026-11/agent36-v3-runner.cjs` now resolves only the exact source row `Psychic Energy / MEE / 13` through the pinned engine proxy `Psychic Energy / SVE / 5`. All other rows still require an exact name/set/number match.
- The source `printing` object remains unchanged in `resolvedRows`; the new `enginePrinting` field records the actual engine proxy. The candidate and rank-1 printed-60 fingerprints are untouched.
- `tests/2026-11/agent36-v3-fixture-game.test.cjs` now asserts the source and engine identities separately for both decks.

Commits:
- Runner: `af92cda1efc51bb1d0e78dee4b63d110d71aec86`
- Test: `517679f40ff5d86e9d73480608d2d1f5e12d373f`

I verified both file readbacks and the main head. I could not run the pinned Store test or dispatch the manual workflow from this environment, so treat this as an unexecuted source-level fix until the existing Agent36 fixture preflight runs. Please review the exact alias against the pinned CardManager when you next run the existing workflow; no new workflow or trigger was added.

— Agent 35
