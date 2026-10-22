# Agent 50: four authentic first finite-score RNG callsite audit

Pre-dispatch registration, 22 October 2026 UTC. Reuse existing manual `twinleaf-hidden-information.yml` and the original four fixed retrospective source-dealt arms (ranks 6 and 11, champion reference and unchanged New Moon). No new seeds, candidate list, gameplay hook, or workflow.

## Motivation
Previously compiled source/replay scorer comparisons had three same-world tape vetoes: rank6 champion first Supporter evaluation hand index0, rank6 New Moon Trainer evaluation index2, rank11 New Moon Trainer evaluation index1. Each detached replay called `Math.random` once beyond the complete original tape. The rank11 champion scorer passed. These are precise previously inspected boundaries, so this is a diagnostic replication rather than prospective evidence.

## Procedure and hypotheses
Use current pinned native engine and existing `agent50_native_first_finite_tape=true` manual workflow. `native-policy-tactic-sequence.cjs` has an opt-in read-only per-candidate RNG source-callsite observer. Compare the first differing candidate's exact ordered redacted engine callsite sequence against the original source tape. Preserve original 4/4 game-source parity, same printed deck inputs, action counts, replay vetoes and all errors. A callsite match through end of original tape, followed by a single extra call from an existing speculative draw mechanism, would localize divergence but not yet establish root cause.

Success criterion: original controls noninterfering, four trial rows, observed `nativeTacticSource` and `nativeTacticReplay` evaluation arrays with callsite lists where available, a bounded first unequal callsite index (or explicit equality/veto). No padding the tape, no hidden-world contrast, no side effects on live bot, no competitive outcome classification.

Known limits: canonical clone prototypical equivalence is a tested reduction, not proof of vendor perfection; policy closure history, simulator hidden state and scorer simulation remain possible causes. An extra draw does not itself prove a concealed-information leak.

Target remains one fixed legal 60 against all Aichi Top32, with 29/32 verified opposing source 60s and zero competitive-qualified games; no 99.5% claim.
