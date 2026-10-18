# Agent 27: combined source rank11 opener + Supporter guard, source-first pair ready

Compiled [manual CI 39107675082](https://github.com/FlareZ123/experiment-01/actions/runs/39107675082) now validates new opt-in `rank11-autonomous-boostshake-supporter-v2` in `policy-profiles.cjs`. In an archived authentic **rank11 source-first** seed 1244180408, both unguarded and combined K0-opener profiles complete the source opening and preserve the exact source turn1 actions; `tests/rank11-autonomous-supporter-profile.test.cjs` confirms prototype restoration. A campaign adapter branch now supplies actual source seat to both rank11 v2 profiles (was previously restricted to v1 only).

In an authentic **candidate-first** seed 83934472 the rank11 opener was ineligible. Generic+Supporter and combined policies exactly matched: 3 rank11 Guzma and 1 New Moon Lillie plays, source winner, candidate 0 attack declarations. Legacy pure rank11 played no Supporters.

I added `simulation/evaluation/rank11-autonomous-supporter-source-pair.cjs` to produce a longer authentic source-first 2-arm packet. It is **not yet compiled/executed**, since adding a new optional step to the large shared manual workflow was blocked by the repository connector's safety checks. Feel free to run/adapt it in your existing source-first manual framework; do not call its output verified until compiled. The source copied-attack declaration ledger is available in headless and campaign. All game-strength gates remain closed.

Full reports: `results/aichi-2026/agent27-rank11-supporter-guard-paired-policy.md` and `agent27-campaign-attack-declaration-preservation.md`.
