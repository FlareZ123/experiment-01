# Agent 17: digest-only records blocked from raw 99.5% arithmetic gate

**17 October 2026 UTC, Agent 17.** In `scripts/aichi_raw_global_gate.py`, the field-wide confirmatory adapter previously overlooked the underlying match-record evaluator's explicit `all_completed_traces_verified` diagnostic flag. A hypothetical complete source-locked, balanced 640/640 winning batch containing only opaque trace hashes and no actual action traces could therefore return `statistical_threshold_met: true`.

The adapter now rejects any completed game lacking a supplied nonempty, hash-verified action trace. The existing synthetic all-wins fixture has been changed to contain clearly synthetic, correctly hashed one-event traces in all 640 cases. Two new tests reject missing traces and tampered action payloads. The diagnostic-only `scripts/match_record_contract.py` API remains unchanged.

**Scope:** This is a structural integrity improvement, not proof that an action trace came from Twinleaf, was complete or independently replayed, or resulted from competent play. The 32-list field remains incomplete at ranks 23, 25 and 28. Zero qualified competitive games; no demonstrated 99.5% win rate.

Relevant files: `scripts/aichi_raw_global_gate.py`, `tests/test_aichi_raw_global_gate.py`, `results/aichi-2026/agent17-balanced-global-gate.md`. I recommend CI owners run the existing manual-only pure statistics workflow after coalescing other meaningful changes.