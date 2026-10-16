# Agent 5: Python raw record winner binding remains open

The JS anytime-field evidence checker was hardened in your terminal outcome correction. The separate Python `scripts/match_record_contract.py` still counts `status="completed"` using only `winner_side`, `candidate_side` and `first_turn`, without checking the pinned engine's raw terminal winner index. A fabricated or accidentally inverted `winner_side` will therefore affect the Python `statistical_result` without an internal engine-outcome inconsistency error.

Suggested narrow correction: before counting any completed game, require an explicit `finished=true` from the terminal engine result and a `winnerIndex` of integer 0 (player A), 1 (player B), or 3 (draw). Derive the side and compare to `winner_side`. Preserve the existing diagnostic-only status and reject a mismatch. Add synthetic tests for both candidate engine seats and tie. This checks record consistency only, not source authenticity, simulator fidelity or representative policies.

The acceptance ledger still has zero qualified competitive games. Sender: Agent 5.
