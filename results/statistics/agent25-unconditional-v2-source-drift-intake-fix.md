# Agent 25: distinguish all-registered bilateral attempts from matched source-deal evidence

**19 October 2026 UTC. Evidence: source-reviewed additive reporting change, pure regressions passing manual CI.** No new game simulated, no candidate winning percentage estimated. This implements one reporting separation anticipated by [Agent39's mulligan treatment analysis](agent39-mulligan-posttreatment-source-alignment.md) and the [Critic's prospective selection correction](../../communications/broadcast/20261019T0936Z_critic_bilateral_selection_gate.md) within [Agent2's original unconditional census](../aichi-2026/agent2-v2-unconditional-paired-census.md).

## Previous pitfall

The existing `auditUnconditionalBilateralCensus()` validated every registered source/engine input and counted all rows, but its only positive report-level reviewability flag, `pairedAttemptCensusReviewable`, required **all pairs** to have the same *post-setup* source physical fingerprint. A legitimate candidate-dependent mulligan and opponent optional bonus draw can change that fingerprint after the experimental inventory treatment. This made a complete prospectively registered comparison display `HOLD-UNALIGNED-OR-INCOMPLETE` regardless of whether every candidate arm and both real starting seats were faithfully observed.

The original paired flag remains appropriate for *matched same-physical-deal mechanical counterfactuals*. It cannot serve as the only flag for intent-to-test accounting, where an unequal source starting position may be a legal treatment consequence.

Further, the original per-rank `pressureCells` grouped **all** unaligned pairs as `unaligned-start-or-deal`, obscuring that one of the two authentic, unaligned source continuations may independently show opponent pressure. Existing per-arm raw `sourcePressureEvidence` was retained but had no rank-level decomposition.

## Additive, backwards-compatible output

`simulation/evaluation/agent2-bilateral-unconditional-census.cjs` now also returns:

- `allRegisteredAttemptsAccounted`: exact strict registered-arm coverage and row verification, **no alignment selection**.
- `actualStartsPerCandidateAndRankObserved`: strict authenticated first-draw/real starter coverage for both candidates, both ranks and both actual starts.
- `unconditionalAttemptCensusReviewable`: conjunction of the preceding two. This authorizes only **audit of complete registered attempts**, not winning-strength inference or policy competence.
- `pairs[].unalignedTerminalPressureCell`: descriptive pressure contrast among **two-engine-terminal** but *initial source-unaligned* arms, or `null` when aligned or incomplete.
- `byRank[rank].unalignedTerminalPressureCells`: separate `both-witnessed`, `first-only-witnessed`, `second-only-witnessed`, `neither-witnessed` totals in that unaligned, two-terminal category.

Unchanged: `pairedAttemptCensusReviewable` and `pairedAttemptCensusVerdict` remain strict same-source-position checks; `byRank.pressureCells` retains original categories and `unaligned-start-or-deal`; the original strict mechanical prompt/turn-lineage audit still runs and still rejects malformed provenance, unknown printings, invalid starts or policy hash drift. No statuses are coerced into winners. Action caps, engine errors and missing registered arms remain explicit. Because one player may influence the other's source pressure through their own setup, **neither an aligned nor unaligned terminal-pressure cell certifies a causal deck advantage**.

## Pure regression and CI

Two new cases in `tests/agent2-bilateral-unconditional-census.test.cjs` cover:

1. The source fingerprint differs, both engine arms terminal and only the reference source pressure is witnessed: unconditional report flag remains **true**, strict same-deal report remains **false**, and independent source-pressure labels remain preserved in `unalignedTerminalPressureCells['first-only-witnessed']`.
2. The source fingerprint differs and one arm is action-capped: the complete attempted game remains counted, `engineWinner` stays `null`, and no fabricated terminal-pressure negative is emitted.

Existing tests now additionally assert all attempts **false** when an arm is absent, and **true** under an otherwise complete but source-unaligned cohort. [Manual source-statistics CI 39275134002](https://github.com/FlareZ123/experiment-01/actions/runs/39275134002) **PASSED** at head `68964ca8a880f65b5f41486f5ba6ef6ecc320ef2`. It ran the maintained pure `aichi-global-field-gate.yml` workflow and the existing Agent2 test list; no compiled Twinleaf game was dispatched.

Source patch commit `d41d43987048070fd9b3a3f512c1981578dda65b`; regression commit `68964ca8a880f65b5f41486f5ba6ef6ecc320ef2`. This is an additive change to an existing Agent2-owned intake, communicated to that owner rather than duplicating a new gate.

## Boundaries

This output must not be used to infer that different source-start fingerprints share a matched randomized treatment assignment without separately auditing the pre-mulligan randomization and lawful source compensation path. The code does **not** prove actual paper setup, all hidden-information decisions, source skill or official match clock. Its positive new flag means the reported, authenticated sample is complete, and nothing more.

Dataset state still 29/32 published exact Top32 60s, **zero competitive-qualified games**. The requested 99.5% single fixed deck remains unverified.
