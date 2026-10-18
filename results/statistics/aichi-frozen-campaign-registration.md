# Aichi champion-reference source campaign: first full preregistered trial frame

**Agent 5, 18 October 2026 UTC. Evidence class: source-derived deterministic trial registration and compiled-independent Node/Python intake tests.** This is a prospective experiment plan, **not any completed game or win-rate claim**.

## Registered source sample

Committed JSON: [`champion-reference-published-field-v3-20261018.json`](../aichi-2026/registrations/champion-reference-published-field-v3-20261018.json).

This file fixes one reference deck unchanged across **all 29 currently published exact-print Aichi opponents**, with **one independently derived trial seed per physical A/B seat** for each rank, for **58 predeclared trial IDs**. Ranks 23, 25 and 28 remain absent by their verified-source status and cannot be silently replaced. The campaign also includes rank1 against itself as a reference mirror. The manifest is a *published-field baseline*; it does **not** satisfy full Top32 coverage or the 99.5% target.

| Registered property | Value |
| --- | --- |
| Candidate | `champion-reference` (unchanged published rank1 Shadow Rider reference) |
| Phase | `published-field` |
| Seed protocol | `decorrelated-slots-v3` |
| Planned repeats | `1` |
| Published opponent ranks | `29` |
| Physically distinct candidate slots | `A`, `B` at every available rank |
| Total predeclared games | **58** |
| Campaign plan digest | `21fd5c47f6168f127f2e3dcad4b9d42bd79ed0c4b3801b261b5d8d667ef10cbf` |
| Frozen schedule SHA-256 | `c4470115fe0953deaffbaeb605dc78a9f7a99d98eed114266729f242a3807219` |

The registered `expected_trials` array exposes per-game `game_id`, rank, 32-bit seed and candidate physical seat for direct use by [Python's fail-closed raw-game intake](../../scripts/match_record_contract.py). The `game_id` equals the verified common campaign's `trialId`; its invariant does **not** predict which participant takes the actual first turn. That requires engine first-draw proof and must be stratified after observation without excluding games.

## Provenance and reproducibility

1. [Source-verified exporter](../../scripts/aichi-frozen-trial-schedule.cjs) calls the existing common campaign verification rather than trusting caller-supplied trial arrays. It allows only the **entire phase for one printed candidate** and reconstructs all rank/repeat/physical-seat cells. There is no selected-success filter, trial whitelist or mutable denominator option.
2. [Four Node regression tests](../../tests/aichi-frozen-trial-schedule.test.cjs) assert all rank-seat cells, rank11 inclusion in the separate pilot phase, deterministic seed/IDs and resistance to corrupted caller plan data. [Manual raw-evidence CI 39092326266](https://github.com/FlareZ123/experiment-01/actions/runs/39092326266) **passed** at source head `feafe1efc91f971fe930afc25e300cc8427fe91d`. An earlier [39092262681](https://github.com/FlareZ123/experiment-01/actions/runs/39092262681) intentionally preserved red test incorrectly expected source reconstruction to reject a filtered caller trial array; the verified function safely **ignores** that array and emits the original complete authoritative plan. Test was corrected rather than weakening source behavior.
3. The existing **manual-only** [raw-evidence workflow](../../.github/workflows/aichi-raw-evidence.yml) gained an optional `emit_frozen_source_schedule` flag to print one canonical JSON registration. [Successful CI 39092404413](https://github.com/FlareZ123/experiment-01/actions/runs/39092404413), head `7aca5468e6a31ba09a8de4d7812706fb94ad2f9b`, emitted the manifest from the actual repository source files. The exact emitted object was committed separately at Git revision **`365b6fb28c18ee7e31dd34a09cbe65b083308289`**. That commit is the prospective experiment-registration boundary; do not retroactively count previous game archives as samples of this schedule.

## What future runs must do

Before launching these trials, pin the **game engine revision, candidate bot policy, each opponent bot policy, effective research hooks, source print resolutions and execution code revision** separately. Preserve every listed `game_id`, including errors, unfinished games, mirrors and actual turn-order imbalances. Apply the `expected_trials` array when invoking Python `evaluate_raw_batch` and require both `schedule_bound` and `all_scheduled_trials_accounted` before using any statistical summary. A run omitting a trial must retain that trial as a reported failure instead of deleting it.

This registration does not ensure the implementation will execute these trials, that outcomes will be engine- and action-replay-authentic, that source matches paper rules, or that the bot opponent and candidate policies are competitively competent. The v3 seeds are reproducible and physically decorrelated, but this alone is no independence proof. Ordinary fixed-confidence intervals should not be repeatedly inspected as though they were anytime-valid.

The 29 published lists remain distinct from the missing three, and zero competitive games are independently qualified. The unchanged reference is subject to the known conditional rank1 mirror ceiling and is **not** a credible demonstrated final target deck.
