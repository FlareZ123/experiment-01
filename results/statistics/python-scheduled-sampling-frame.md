# Python raw-game external sampling-frame coverage

**Agent 5, 18 October 2026. Evidence class: executable intake-integrity gate and synthetic regression.** No competitive game qualified. No fixed-deck strength inferred.

## Why this gate is necessary

The existing [Python raw-game intake](../../scripts/match_record_contract.py) verifies visible game IDs, source/deck hashes, winner/turn assertions, trace integrity and failure labels. Yet a batch could report **only the successful trials** from a larger planned run. Every included record might pass those checks, while the unreported losses and engine failures are never evaluated. A cryptographic digest of the observed games authenticates their serialization, **not the sampling denominator**.

This is selection/reporting bias, distinct from a false engine winner or a different opponent source. Any confidence calculation requires a fixed or otherwise statistically valid sampling process, competent gameplay and the full inclusion of eligible trials.

## Implemented optional external schedule binding

The backward-compatible `evaluate_raw_batch(..., expected_trials=...)` parameter accepts a nonempty list of independently supplied trial records. Every record fixes:

- `game_id`: nonempty unique string.
- `rank`: integer from 1 through 32.
- `seed`: 32-bit unsigned integer.
- `candidate_side`: physical engine seat `A` or `B`.

The validator rejects malformed or duplicated schedule entries, observed games not in the schedule, any mismatch of the immutable scheduled inputs, and scheduled games missing from the batch. It checks the same four fields on completed games **and on engine failures**. The actual first/second turn remains a separate observation from the original Store and earliest draw log; it is intentionally **not** guessed or preregistered from physical engine seat.

New output distinguishes `schedule_bound`, `scheduled_trial_count`, `all_scheduled_trials_accounted`, and `sampling_frame_input_integrity_promotion_eligible`. The latter requires trusted source/candidate inventory hashes, complete included traces, terminal outcome agreement, accounted schedule, and zero reported failures. The older `full_input_integrity_promotion_eligible` remains a narrow historical flag and **can be true in an unscheduled batch**; downstream consumers should require the new stronger flag when asserting precommitted trial coverage.

Legacy unscheduled callers continue to work and get `schedule_bound:false` and `sampling_frame_input_integrity_promotion_eligible:false`. This preserves archived diagnostic data without presenting its inclusion process as authenticated.

## Validation and provenance

- Source: [match_record_contract.py](../../scripts/match_record_contract.py)
- New regression: [test_trial_schedule_gate.py](../../tests/test_trial_schedule_gate.py)
- Existing manual-only CI workflow extended: [aichi-raw-evidence.yml](../../.github/workflows/aichi-raw-evidence.yml)
- **PASS:** [GitHub Actions 39091133679](https://github.com/FlareZ123/experiment-01/actions/runs/39091133679), commit `d558d2c34d74ba12bac7fa443ee398f904c3d385`.

Five new Python unit tests cover unscheduled diagnostic fallback, successful externally bound complete input, omitted and extra games, misbound rank/seed/physical seat, invalid schedules and a reported timeout that cannot promote. The existing statistical, raw-record, source-hash and Node/Python trace tests also passed in that manual CI run.

## Critical remaining boundaries

An `expected_trials` list supplied by the same party after seeing the results can itself be cherry-picked. A real campaign caller must source it from a **persisted, independent, frozen plan** (e.g. the existing candidate/opponent [Aichi comparison campaign](../../scripts/aichi-comparison-campaign.cjs)) and bind its digest to a trusted revision. The Python intake does not yet perform that production wiring or independently verify input-replay authenticity.

This coverage gate does not prove independent random trials, rule fidelity, hidden-information boundaries, competent policy, correctness of engine terminal state, true registration of missing Aichi Top-32 lists, or the validity of repeated looks at a non-anytime confidence interval. Failure-free reporting by itself is no competitive win-rate certificate.

**Benchmark unchanged:** 29/32 verified opponent inventories, ranks 23/25/28 missing, zero competitively qualified games, 99.5% target unproven.
