# Agent 17: strict physical-seat and actual-starter balanced raw evidence

**20 October 2026.** This is a validation-tool extension, not competitive performance evidence.

## Problem and scope

The existing `scripts/aichi_raw_global_gate.py` validated 64 rank × actual-start strata. A 640-game all-win record could satisfy all 64 with **ten games in each**, yet place the candidate in **engine seat A in every game**. Under a physical-seat-sensitive engine or policy, this is an avoidable confound. Agent 42 independently reported this kind of real-start/seat confounding in retrospective bilateral comparisons; Agent 2 separately established the 128-cell statistical sample calculation.

## Implemented

The same `evaluate_balanced_raw_batch()` function now accepts **`require_physical_seat_balance=True`**, defaulting to `False` for existing consumers. When enabled, it requires the externally declared `predeclared_games_per_cell` trials in **each of 128 rank × actual-start (first/second) × physical candidate-side (A/B) cells**. It still uses the established independently supplied `expected_trials` schedule, source-list inventory hash, fixed candidate fingerprint, unique global seeds, actual engine first-draw proof, action trace integrity, full finished-game and engine terminal proof, and no failures.

The statistical calculator remains `balanced_global_test()`. Each of its 64 rank/start cells then contains exactly twice the strict physical-cell horizon. Under the **prospectively defined equal-weight 128-cell estimand**, the existing Poisson-binomial upper-tail bound is applicable to the full balanced game sample; five games per physical cell yield 640 games, ten per rank/start cell. No reweighting of observed starts is done.

Result metadata explicitly reports `physical_seat_balance_required` and all `physical_seat_cells` with counts. Legacy callers without the option preserve their 64-cell behavior. A requested strict check **fails closed** on missing or unbalanced physical cells.

## Tests and verified outcome

Four new synthetic regressions in `tests/test_aichi_raw_global_gate.py` test:
1. all 128 cells represented at five games each, 640 synthetic wins, arithmetic threshold met while `competitive_evidence_qualified=False`;
2. a 640-win sample that passes the prior 64-cell gate while putting the candidate in seat A for every game; strict 128-cell gate rejects it;
3. an independently **declared**, internally consistent schedule deliberately unbalanced across physical seats; strict 128-cell gate rejects it;
4. a false first-player assertion in a physical-seat-B game; native first-draw contract rejects it.

The existing manual-only [balanced field evidence workflow **39472837653**](https://github.com/FlareZ123/experiment-01/actions/runs/39472837653) **PASSED**, head `baaf53bc532cfeb26123178151e48b4d231f61b5`, including the complete existing Python/Node validation suite and the four new cases. No push-triggered workflow was introduced.

## Important limitations

- Balance across cells is an **audit of recorded sample allocation**. A purported preregistration reconstructed after observing outcomes or starts is still invalid. Honest external registration and independent random seed selection remain mandatory.
- A balanced dataset does **not** establish that the simulator randomized first turn correctly, the policy was genuinely actor-information-safe, opponent decisions were competent, the printed cards/rules were correctly implemented, or the official tournament clock was modeled.
- This flag tests the deliberately equal-weight 128-cell target. Another target population or weighting would require a distinct preregistered estimand and valid inference.
- An equalized sample obtained through outcome-dependent retries, favorable seed selection, or censoring remains unsuitable. Preserve every attempted arm and evidence of how cells were recruited.
- As of this change, exactly **29/32 source lists** are independently documented (23, 25, 28 missing), there are **zero competitively qualified games**, and 99.5% remains an unproven research target.

**Next executable handoff:** When a genuinely actor-only, source-responsive two-player runner is available, make its preregistered trial archive carry actual first-turn proof and actual physical candidate seat, and run both 64-cell and opt-in 128-cell screens without relabeling old retrospective cases. See `simulation/evaluation/agent42-four-cell-coverage.cjs` for the complementary diagnostic on paired candidate/source comparisons.
