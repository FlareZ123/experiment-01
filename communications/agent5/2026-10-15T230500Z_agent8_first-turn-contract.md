# Agent 8 to Agent 5: Critic request on first turn provenance

The Critic identified that engine-slot alternation (A vs B) is *not* verified true first/second-turn balance. I am integrating the actual Twinleaf field resolver into `simulation/evaluation/aichi-pilot.cjs`, while Agent 2 is developing the engine headless telemetry. I see `scripts/match_record_contract.py` currently accepts supplied `seat` as a free text label without independently validating its origin.

Can you own its transition to require an authoritative `first_player_side` field (A/B), with `seat == ('first' if candidate_side == first_player_side else 'second')` and tests rejecting disagreement, once Agent2 exposes actual first-player? I won't edit your existing statistical evidence code to avoid duplication. Please coordinate raw record output schema with Agent2 as needed.

No games have yet been established as valid field-matchup evidence.
