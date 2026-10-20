# Agent 17: source-locked natural-starter sharp zero-loss raw evidence

**20 October 2026. Evidence type: conditional mathematics, implementation, compiled synthetic regressions.** No competitively qualified games were measured.

## Why this API is needed

The prior `evaluate_balanced_raw_batch()` requires a fixed identical positive game count for every one of 64 rank × actual-start cells, optionally for each of 128 rank × actual-start × physical-engine-seat cells. In a prospective campaign with fixed deck and policy and genuinely random fair starting turns, exact counts in every cell are extremely unlikely. The [natural-start feasibility analysis](agent17-natural-start-128-cell-power-20261020.md) quantified this: a ten-game allocation to each of the 64 rank × physical-side groups produces exact 5/5 starts in all groups with probability only **1.0725989934374377 × 10⁻³⁹**.

This new tool permits exogenous random starts while preserving a *fully predeclared and enumerated game schedule*, exact source fingerprints, zero omissions, native first-turn proof and a fixed total experiment horizon.

## Implementation

[Sharp unequal-count all-win calculator](../../scripts/aichi_zero_loss_counts.py) independently implements the mathematical KKT allocation already represented in Agent 2's [JS general-rank bound](../../scripts/aichi-field-zero-loss-bound.cjs). For a prospective target averaging cell win probabilities uniformly, the composite null `mean cell loss >= 0.005` imposes a minimum aggregate failure mass across the cells. The all-win likelihood `product (1-q_i)^(n_i)` is maximized by allocating failure risk to lesser-tested cells. Empty cells can absorb all the null failure mass in many cases, making the p-value equal to 1 regardless of wins elsewhere.

The [raw v2 batch adapter](../../scripts/aichi_raw_global_gate.py) now exports `evaluate_natural_start_zero_loss_raw_batch()`. It uses the same shared `_verify_frozen_source_raw_batch()` structural preflight as the existing balanced gate. That preflight demands all **32 exact source decks**, immutable source-deck inventory seal, exact candidate fingerprint, a separately supplied complete `expected_trials` with unchanged trial ID, rank, unique global RNG seed and physical candidate side, engine first-draw proof of actual first turn, a full action trace hash and an engine-terminal-bound finished outcome for every scheduled game. Failed, incomplete, or missing games fail closed. The batch's `predeclared_total_games` must agree with the independent caller horizon and full schedule length.

Two analyses are returned from the **same full set of accepted raw games**:

- **Uniform 64-cell rank × actual-start target**, using actual observed cell counts even when they differ.
- **Uniform 128-cell rank × actual-start × physical-engine-seat target**, using native physical candidate-side and actual starter without conflating gross side totals and crossed cells.

Both are **all-win-only** tests. If even one completed game is a loss or tie, `sharp_all_win_null_probability = null` and `statistical_threshold_met = false`. Such a result does not mean the underlying deck is weak; a different valid statistical test is required for nonzero nonwins. These outputs do not certify the credibility of source/engine/bot, randomization, tournament clock, or independent game sampling.

## Verified synthetic contrasts

The combined new-and-existing manual [CI **39476486816**](https://github.com/FlareZ123/experiment-01/actions/runs/39476486816) **PASSED** at main commit `d56ea766ba54de4f07ee9845da0bd072aa70cd65`.

Five new actual raw-v2 synthetic tests in [`test_aichi_raw_global_gate.py`](../../tests/test_aichi_raw_global_gate.py) plus six pure [sharp-null tests](../../tests/test_aichi_zero_loss_counts.py) establish:

| Synthetic all-win 640-game allocation | 64-cell p-value | 128-cell p-value | Claim limit |
| --- | ---: | ---: | --- |
| 10 per rank/start, candidate always physical side A | 0.0404363249 | **1.0** due to 64 unseen physical cells | Valid target-specific arithmetic only |
| Five per 128 cell | 0.0404363249 | 0.0404363249 | Counts coincide for both targets |
| Per rank physical A first/second 8/2; physical B first/second 2/8 | 0.0404363249 | **0.2762516677** | Aggregate seat/start margins hide interaction |

The compiled tests additionally reject post hoc declared-count mismatch, a source inventory substitution and a false starter proof. A valid one-nonwin record returns no all-win p-value. No existing balanced API caller was changed.

## Qualification and use

This function is available for a **future prospectively registered, failure-inclusive and independent** campaign with real native decisions, provided its target weights have been specified before results are observed. Conditional-on-cell-count inference assumes the realization of starting seat/turn does not use or leak eventual game outcomes or select favorable deck states. Merely stamping `predeclared_total_games` or listing externally supplied expected trials is inadequate proof that registration actually preceded the run.

The uniform 128-cell target is primarily a *position-bias stress diagnostic* for simulation, not a universally required paper-format estimand. Reports should identify which of the 64/128 targets is being used. Opponent policy competence, real printings, actual attacker response, major lock effects, independent game sampling, paper rules and official timing remain gatekeepers.

**As of this report:** 29/32 exact Aichi Top32 lists publicly recovered, ranks **23, 25, 28** missing, **zero competitive-qualified games**, no validated single 60 and no demonstrated 99.5%.
