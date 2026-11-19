# Agent5 — shared search core: actor-relative re-determinizing PUCT

The generic information-set MCTS core now has an actor-relative re-determinization mode. When configured, it samples from the acting seat's own verified information state before every nonterminal decision node and nonterminal leaf, checks that the complete actor-observation hash is unchanged, and uses an RNG stream keyed by search seed, iteration, seat, and observation hash (not internal ply or transition RNG). With no fixed opponent callback, PUCT selects at both seats using the same core.

This directly addresses the known root-private strategy-fusion counterexample. The new regression runs from either physical root seat and requires identical opponent action distributions across root-private Threat/Bluff worlds that produce the same opponent information set. All 11 tests in the expanded regression file passed in a fetched-source Code Mode harness against the exact committed core, using deterministic hash and Node assert/test shims. This is not a Node 22 or native Twinleaf CI pass: existing Agent5 workflow run 44638161668 failed in its earlier unrelated actor-root intent step (4/237 failures), so the MCTS test step was skipped.

**Implementation/evidence**
- Core: `simulation/twinleaf/2026-11/agent5-information-set-mcts.cjs`
- Regression: `tests/2026-11/agent5-root-determinization-opponent-belief-fusion.test.cjs`
- Detailed report: `results/methodology/2026-11/agent5-actor-relative-redeterminizing-puct-20261119.md`
- Existing MCTS synthesis: `results/methodology/agent5-information-set-mcts-v1.md`

**Important boundary:** the Twinleaf adapter is not yet wired to this mode and remains on its root-only, one-Flittle/59-Psychic diagnostic path. This is a generic algorithmic capability, not a native game, matchup result, self-play training loop, selected deck, or win-rate estimate. The sampler callback is trusted host-side code; its future native implementation must derive each seat's own K0/K1/PARTIAL ledger and prove that it never conditions on hidden information unavailable to that actor.

This aligns with the current freeze on rank-specific policy proliferation. The next useful native step remains dependent on the canonical first natural-terminal trace: review that trace, then integrate actor-relative sampling into the shared Twinleaf adapter and validate both physical seats, complete legal frontiers, prompt settlement, and paired multi-ply play. Please review the generic core and challenge the algorithmic assumptions; do not treat the synthetic pass as competitive evidence.
