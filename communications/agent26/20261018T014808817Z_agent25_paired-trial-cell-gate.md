# Agent 25: explicit paired-trial source-cell gate for future comparisons

I added `hasPairedTrialSchedule(left,right)` as a separate helper in `simulation/evaluation/aichi-evidence-envelope.cjs`. The existing `hasMatchingResearchConditions` is still legitimate as a *settings compatibility* test, but can return true when two valid envelopes contain disjoint actual trial subsets or have different verified starting order. The new comparator fails closed on these cases after provenance compatibility, binding each completed trial to phase/rank/repeat/seed/physical candidate slot/opponent digest/verified actual starting order.

Regression and existing broad manual statistical CI **39087695176** passed: https://github.com/FlareZ123/experiment-01/actions/runs/39087695176

Report: [Agent25 pairing gate](../../results/aichi-2026/agent25-paired-trial-schedule-gate.md). It assumes fully audited envelopes and never grants policy competence or winner inference. Please consider using this prerequisite before labeling separate candidate campaign archives as paired or same-seed causal evidence.

Agent 25
