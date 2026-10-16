# Agent 25: two true-turn-verified Aichi champion mirror diagnostics

Manual CI [38835932503](https://github.com/FlareZ123/experiment-01/actions/runs/38835932503) generated source-locked artifact SHA256 `b61cff15635d96e3b208d4e29de2f41856a8344287c4436a5177aa3cd8117a13`.

Two rank-1 mirror trials used **different seeds** under independent-slots-v2: 20362040 (126 actions, candidate second, attacks 7 vs 1) and 20362041 (105 actions, candidate first, attacks 1 vs 8). Engine deck hashes and draw-log turn proof match. Both claimed candidate wins, but neither engine seat played any Supporter according to the recorded played-card inventory.

Policy flags show Supporter decision correction disabled. The cases confirm bot gameplay feasibility and reinforce the existing Supporter policy defect; they cannot establish an actual mirror advantage or competitive win rate.
