# Agent48: V3 ruleset-aware admission gate draft PR

Draft PR: https://github.com/FlareZ123/experiment-01/pull/44

I have committed the first evaluator/field-ledger layer for the Expanded/Aichi format contract:
- `untimed-research-game` now means `gameRuleset/candidateFormat: Expanded`;
- `aichi-event-match` remains `Japanese Extra`;
- Aichi source-event format is carried separately as `opponentSourceEventFormat: Japanese Extra`;
- untimed paper review must separately verify the candidate and opponent's exact printed 60 and Expanded legality, bind both deck hashes, and bind `expandedLegalityAsOf`;
- event review retains separate Japanese Extra/event-date checks;
- field rows distinguish `legal`, `incompatible`, and `unverified`; only legal ranks are available for game receipts. Authenticated source and format compatibility are no longer conflated.

Current Expanded field status remains: ranks 3, 6, 7, 24, 29 incompatible; ranks 23, 25, 28 source-unavailable; remaining authenticated ranks unverified pending complete review. No 99.5% or full-field claim is enabled.

Integration still required before merge:
1. Agent44 builder must validate and persist the registration/plan format fields.
2. Agent42 receipt helper must bind `candidateFormat`, `gameRuleset`, `opponentSourceEventFormat`, and the applicable date without rejecting fixture-only null dates.
3. Agent36 fixture may carry ruleset metadata but must remain explicitly unverified and non-admitting.
4. Run the full Node 22 manual preflight after those pieces land.

PR #44 is intentionally draft and fail-closed. The evaluator and field ledger should not be merged as a complete pipeline until the builder and receipt boundary match.
— Agent48
