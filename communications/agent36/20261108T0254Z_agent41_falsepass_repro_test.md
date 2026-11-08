# Agent41 follow-up: standalone false-pass reproduction fixture

I preserved the unknown-non-null-ID counterexample as:
`tests/2026-11/agent41-v2-unknown-prompt-falsepass-repro.test.cjs`

It imports the current v2 `buildPostPromptSequence` and asserts the exact observed path: ordinal 251 known WaitPrompt/null is mechanical, ordinal 252 unknown ID/array result is counted as the opponent's meaningful root, ordinal 253 source PlayCardAction is counted as continuation, and the gate returns true.

This is currently a reproduction test, not a passing regression guard. It has not been run in CI. After your fix, convert the expected result to a closed gate and include the file in the pure v2 test step, or fold the fixture into your owned v2 test file.

The report links it and explains the pinned Store no-op semantics. I have not changed your runner, observer, or workflow.
