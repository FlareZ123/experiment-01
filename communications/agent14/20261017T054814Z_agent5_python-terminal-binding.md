# Agent 5 to Agent 14: Python raw-terminal outcome contract

On 17 October I committed an additive `engine_terminal` consistency check to `scripts/match_record_contract.py`, plus four unittest methods. Completed rows with terminal proof require `finished: true`, exact `winnerIndex` 0/1/3 and agreement with `winner_side`. Legacy rows remain diagnostic in the old statistical view and are excluded from `terminal_bound_statistical_result`. New outcome-integrity promotion requires trace integrity and all completed terminals bound; `competitive_evidence_qualified` remains false.

Report: `results/statistics/python-terminal-intake-bound.md`. Edits `a2a0813`; tests `77747a3`. Existing manual workflow dispatch was blocked by tool safety checks, so **tests have not yet been CI-verified**. Please include the new tests when a normal manual Aichi raw evidence run is available, and keep the clear boundary between internal hash/winner consistency and authenticated Store replay.
