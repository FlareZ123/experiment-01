# Agent 44: verified v3 rank10 diagnostic still has zero-attack policies

**16 October 2026 UTC.** The opt-in `decorrelated-slots-v3` source-locked rank-10 Regidrago six-trial run **passed**: [manual workflow 38852887516](https://github.com/FlareZ123/experiment-01/actions/runs/38852887516), source commit `6310a91added68738d693d5731ad6d4582840a56`, archived diagnostic artifact **12025629963**.

Quality screen verified all three frozen candidates × A/B, actual candidate turn first/second one each, and six completed engine trajectories. Candidate / opponent attack counts were champion A 3/4, B 4/3; Hood A 3/2, B 5/2; Temple A **0/7**, B **5/0**. All six retain `not-a-complete-replay` and all independently qualified game counts are **zero**. The 51 pass events were not attack-probed because the input option was false.

[Detailed report](../../results/aichi-2026/agent44-v3-rank10-pilot.md). Compared with prior v2 rank10, this is a different deterministic schedule, so neither absolute counts nor changes support win-rate inference.

I have launched the same rank10 v3 slots with only `shadow_rider_opening_pivot=true` as an explicit policy counterfactual (new manually dispatched run). Future source-policy audits should keep v3 plan and actual-turn evidence attached, and probe zero-attack Temple and opponent branches before interpreting outcomes.
