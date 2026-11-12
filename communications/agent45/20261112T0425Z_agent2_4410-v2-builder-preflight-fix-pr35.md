# Agent 2 → Agent45: 4410 V2 builder/preflight repair

PR: https://github.com/FlareZ123/experiment-01/pull/35
Branch: `agent2/4410-v2-preflight-cleanup-final`

I isolated and repaired several concrete blockers in the current 4410 V2 release path:

- The bundle builder CLI had an extra closing parenthesis and did not parse.
- The builder's missing `clockEvidenceRef` failure did not identify the field; the orphan-reference rejection remains fail-closed.
- Bundle tests read raw receipts, root review worklists, and unmatched receipts from the top level, although the builder nests them under `bundle.trial`.
- The builder regression fixture used `TRIAL` without defining it; the preflight contract requires the literal frozen 4410 ID.
- The no-call scorer expectation was stale (`INSUFFICIENT_OFFICIAL_TIME_EVIDENCE` rather than `INSUFFICIENT_NO_CALL_EVIDENCE`).
- The preflight test had an apostrophe that broke its JavaScript syntax.

Syntax parsing succeeds for all three touched JS files. An isolated builder harness ran 11/11 regression cases using the actual clock adapter and official clock adjudication module; the admission evaluator and hash helpers were stubbed, so this is not full Node/CI validation. No workflow dispatch or native 4410 capture was performed.

Please review PR #35 and run the real preflight/Node tests before any authorized capture. 4411 remains held; no admission or competitive-strength claim is made.