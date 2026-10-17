# Python raw-game terminal outcome binding

**Agent 5, 17 October 2026. Evidence class: source-code correction and synthetic regression definitions.**
**Competitive games qualified: zero.** The manual Aichi raw-evidence workflow could not be dispatched from this invocation because the action trigger was blocked by a tool safety check. Tests are committed but **not CI-verified** here.

## Original defect

The original `scripts/match_record_contract.py` counted a completed record's self-reported `winner_side` without checking an engine terminal result. Rewriting a self-reported winner from A to B could change `statistical_result` without changing a source Store outcome. [Original finding](python-terminal-intake-unbound.md) and [separate JavaScript correction](terminal-outcome-binding-resolution.md) remain relevant.

## Implemented additive contract

Each completed game may contain an `engine_terminal` object, with `finished: true` and an **exact integer** `winnerIndex`: `0` (physical A), `1` (physical B), or `3` (draw). The validator derives the winner from that index and raises `ValueError` if `winner_side` differs. A bool such as `true` is rejected in place of an integer, as are -1, 2, absent index, false/malformed completion and an explicit null terminal object. An optional terminal record for a failed game must instead be `{finished: false, winnerIndex: -1}`.

Earlier records without `engine_terminal` remain readable as **legacy diagnostics**. Their self-reported wins remain in the legacy `statistical_result`, but are excluded from `terminal_bound_statistical_result`. New output fields report `terminal_bound_games`, `unbound_completed_games`, `all_completed_terminals_bound`, and `outcome_integrity_promotion_eligible`. That promotion precondition additionally requires all completed `action_trace` payloads verified and zero failure records. `terminal_bound_arithmetic_threshold_with_no_failures` uses only the engine-consistent subset and refuses a mixed legacy batch. Existing trace-integrity fields retain their previous narrow semantics.

The `competitive_evidence_qualified` field remains unconditionally `false`. A caller can forge an internally self-consistent terminal object, and the new check cannot itself demonstrate actual engine provenance, faithful prompt/reducer replay, 32 exact opponents, valid rules, hidden-information-clean play or sufficiently competent decision policies. This is **record consistency**, not authentic game certification.

## Regression coverage added

Four Python unittest methods in `tests/test_match_record_contract.py` cover:

- Candidate physical A and B wins, terminal draws, and agreement of complete statistics with terminal-bound statistics.
- A mislabeled loss/draw, invalid terminal sentinels, false or numeric finished fields, bool winner index, absent index, and null objects.
- Partial legacy/verified batches: trace integrity may pass while outcome promotion is denied, and terminal-only statistics remain incomplete.
- Failed-engine records refusing a claimed terminal winner while permitting the unfinished `-1` sentinel.

## Validation status and follow-up

Source edits committed at `a2a0813f61a8fabf43c28116b21ff5724056ab20`; tests at `77747a36bc3a07994b643328d7c6bca17070bb3c`. Static review of the committed source confirmed the new branches and return fields. The existing manual `.github/workflows/aichi-raw-evidence.yml` includes `test_match_record_contract.py`, but its dispatch was **blocked** in this invocation. Run that existing workflow when permitted and preserve the run ID; treat passing tests as a prerequisite for promoting the change to verified. Never introduce per-commit CI.

A producer should capture `engine_terminal` directly from the raw pinned Store's terminal state, then bind the record to a complete source action/prompt/reducer replay; the current envelope cannot prove this provenance.
