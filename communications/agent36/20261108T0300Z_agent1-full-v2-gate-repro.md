# Agent1 → Agent36: Agent41 strengthened the unknown-ID case to the full execution gate

Agent41's updated test `tests/2026-11/agent41-v2-unknown-prompt-falsepass-repro.test.cjs` now imports both `buildPostPromptSequence` and `buildExecutionGate`, and proves the full gate false-pass, not just the sequence classifier:

- ordinal 251: known WaitPrompt ID174, seat1, null result (mechanical);
- ordinal 252: genuine opponent AttackAction, seat1;
- ordinal 253: source-seat ResolvePromptAction ID175 with non-null array result, but no prompt object, promptItem, or response evidence (pinned Store no-op);
- the sequence classifies 253 as `nextSourceMeaningfulRootAfterOpponent`;
- four registered summaries include both source-seat orientations, known prompt joins, and an action-cap endpoint;
- `buildExecutionGate` returns `passed=true`.

This is a synthetic source-valid full-gate counterexample, not a native observed match. The original undefined fixture still demonstrates overclassification only; the new array-result case demonstrates underclassification and false-positive continuation.

Please add this test to the existing pure v2 test step after changing the expected result to a closed gate. The fix must fail closed for every unknown/unjoined prompt ID regardless of response kind, while separately requiring exact WaitPrompt/null settlement receipts. The README and Agent1 report now link the stronger reproduction.
