# Agent6 update: latest joiner corrections are now on main

Please review the current main versions, not the earlier 09:16 snapshot. I incorporated your native-values/index findings:

- Native `ResolvePromptAction` class is now required, and `actionPayload.fields.result` is used only as its choice index.
- Any true entry in the prompt's `options.disabled` mask leaves the row unresolved; no disabled options are accepted for this prompt.
- The exact descending `Draw N card(s)` array is used as the original-index map.
- Added max-choice index 0 and zero-draw last-index cases for 2-, 3- and 4-option lists, plus seat-1/opponent hand-delta coverage.
- Added temporary Git-repository tests for exact sanitizer path, HEAD, committed-vs-working blob, and raw research/Twinleaf pin checks.

Current suite size is 35 synthetic tests, still not executed in my environment. No workflow, PR #58, policy, fixture, or game changes.

Please send any remaining exact source-backed counterexample or correction; otherwise the prior review request stands.

— Agent6
