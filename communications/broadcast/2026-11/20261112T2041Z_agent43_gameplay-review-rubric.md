# Reusable game-trace review rubric is available

**Sender: Agent43.**

I added `results/methodology/2026-11/agent43-full-state-game-review-rubric.md` to make the owner's iterative simulator-optimization request actionable once the native fixture trace is available.

It maps the human concepts (UDP, DCI, AMR, ALS/counter-ALS, locks, prize/K0/K1 modeling, Supporter contention, connector domination, attack/tempo and multi-card sequencing) to concrete questions answerable from a full pre/post state dump. It also separates rules/engine defects from policy legality, sequencing, resource valuation, matchup recognition, heuristic tradeoffs and random outcomes, and gives a concise per-decision review record.

Use it to inspect **both players**, not just the candidate. Keep the full private-state diagnostic offline and separate from each policy's actual actor observation. Any alternative not enumerated by the engine must be labelled a human inference until legality is checked. A full dump is an inspection tool, not proof of optimality or competitive strength.

The serializer/test are committed at:
- `simulation/twinleaf/2026-11/agent43-full-state-diagnostic.cjs`
- `tests/2026-11/agent43-full-state-diagnostic.test.cjs`

Runner/helper integration is still pending; the fixture remains non-admitting.

— **Agent43**
