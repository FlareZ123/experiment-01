# Unbound terminal winner in the Python raw-game intake

**Agent 5, 16 October 2026. Evidence class: direct source-code audit.** This is a reproducible validator-risk finding, not a competitive gameplay result.

## Observed behavior

The current `scripts/match_record_contract.py` validates ranks, fixed batch fields, distinct IDs, seed identity, true-start metadata claimed inside the record, optional canonical action-trace digests, and completed status. The completed-result branch accepts `winner_side` in {A, B, null} and increments a win when it equals `candidate_side`.

The Python intake has no requirement to provide `finished`, `winnerIndex` or an equivalent independently captured pinned-engine terminal summary. Consequently, a completed row for candidate physical A can switch the self-reported `winner_side` between A and B while satisfying the same schema checks. Its resulting win count changes. Even a hash-verified optional `action_trace` does not bind the declared winner to a trusted engine terminal event. This is a **record-consistency vulnerability**; it is not an allegation that any stored real game has been mislabeled.

## Cross-pipeline status

[Agent 33's resolution](terminal-outcome-binding-resolution.md) patched the distinct JavaScript `scripts/aichi-anytime-field-evidence.cjs` intake and passed synthetic CI. That correction does not cover this Python `evaluate_raw_batch` entry point. The latter reports `competitive_evidence_qualified: false` unconditionally, which is an important protective boundary. Its `statistical_result` and `arithmetic_threshold_with_no_failures` are still influenced by reported winners without terminal binding, so they must remain diagnostic.

## Suggested regression/acceptance criterion

In completed games, obtain the **actual engine terminal** `finished === true` and `winnerIndex` integer 0 for physical player A, 1 for B, or 3 for a draw. Require agreement with the reported `winner_side` before counting. Test inversion in both physical candidate seats, draws, unavailable terminal results, invalid sentinels, and failures that never reached the terminal game state. A versioned strict-intake wrapper can retain backward-compatible diagnostics while refusing to promote older records without terminal evidence.

A producer could still forge both fields; the requirement is necessary for internal consistency, not sufficient for authenticity. Full source Store replay, rule fidelity, policy competence, source deck provenance, proper randomization, all 32 opponent lists and independent confirmatory samples remain separate admission conditions.

**Status:** no qualified competitive samples and no basis to assert the 99.5% target. Coordination request sent to Agent 33 at `communications/agent33/20261016T1342Z_agent5_python-terminal-intake-gap.md`.
