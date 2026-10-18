# Decision 110: prospective source-ranked tactic score contrast

**Agent 49, 18 October 2026.** The next controlled experiment narrows the stock/fully detached Twinleaf divergence to one genuine source-bot decision. Predeclared before compile/CI execution; evidence class **mechanism diagnosis**, not game-performance evaluation.

## Prior authenticated facts

[Compiled fixed source CI 39027244574](https://github.com/FlareZ123/experiment-01/actions/runs/39027244574) observed the first different chosen bot action at global decision **110** (turn 13, player seat 1): stock `PlayCardAction` on hand index 1, fully detached `AttackAction('Apex Dragon')`. Their next observed predecision source-zone states diverged at ordinal **111** over an unresolved `ChooseAttackPrompt`. A single-v2-corrected decision-110 fork on the stock source state did **not** change selected action, despite full-profile alternate winner. [The compiled six-treatment scalar rollback](agent49-selected-field-causal-contrast.md) independently failed to reproduce the divergence. The timing and process still remain unclear.

## Experiment

Observe **original** `SimpleTacticsAi.decodeNextAction` without altering calls, actions, branch decisions or PRNG. During **only** actual decision ordinal 110, wrap actual compiled pinned `SimpleTactic.prototype.evaluateAction`, `getStateScore`, and `SimpleTacticsAi.prototype.isValidAction` to record (i) each scored tactic/action and its returned score or lack thereof; (ii) baseline state score uses; (iii) final post-tactic acceptance/rejection; (iv) selected action; (v) own hand, Active and Energy, and full source-zone SHA-256 before that decision. Every method delegates synchronously once to its exact original implementation and returns the original value.

Run three independent **sequential executions of the same fixed source deal and seed**: unobserved pinned source control; pinned with read-only score observer; full-game post-super detached/reconciled clone profile with read-only score observer. Actual 60s are rank1 Shadow Rider (seat0) and rank10 Regidrago (seat1), seed `20261049`, pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, root-action cap 350 and the same five existing compatibility/policy flags as previous Agent49 audits. Never compare under different source deck hashes or first-turn seats.

Falsification / interpretation:
- If read-only pinned trace changes the unobserved `selectTrajectory` fingerprint, instrumentation itself fails qualification.
- If the candidate's predecision zone digest differs at ordinal 110, diagnose the earlier source-state drift before blaming score evaluation.
- If zone digest is the same and recorded tactic candidates/scores/validations first disagree at a specific evaluation, preserve the **earliest** difference and likely rejected/accepted action context; this isolates where the model disagreement is *observed*, not why it occurred.
- If all recorded tactic/validation calls agree yet selected actions disagree, identify missing instrumentation or a non-tactic policy hook; do not manufacture a cause.
- A terminal winner difference remains unqualified source-bot output, never a win-rate observation.

Source [read-only observer](../../simulation/twinleaf/decision-tactic-evaluation-observer.cjs), [pure regressions](../../tests/decision-tactic-evaluation-observer.test.cjs), [source runner](../../simulation/twinleaf/decision-tactic-score-source-contrast.cjs). Add steps to the existing **manual-only** `twinleaf-decision-history-rollback.yml` job. Do not create another per-commit workflow. Actual results will be appended with run ID/commit and both positive and negative evidence.
