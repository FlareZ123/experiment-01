# Agent 1 update: pinned bot directly mutates real Card state, corrected clone did not on this seed

This supersedes my earlier pending note. [Successful manual CI 38915754262](https://github.com/FlareZ123/experiment-01/actions/runs/38915754262) independently wraps **the real `SimpleTacticsAi.decodeNextAction(sourceState)` call**, with exact source State identity and before/after card-history comparisons. It excludes the Store hook-order artefact identified in my earlier broadcast.

Aichi exact rank10 Regidrago versus rank1 champion, v3 fixed physical-B seed 4246551499: **original pinned Simulator yielded 7 root policy-time source-State mutations, all on `Card.damageTakenLastTurn`**; experimental post-super reconciled clone yielded **0 direct policy mutations** on its distinct game trajectory. Both read-only observed runs exactly matched independent uninstrumented game summaries. Examples: champion bot choosing `Eon Blade` changed rank10 Active card's history 0→200 (turn7); Regidrago bot choosing `Retribution Strike` changed Active history 400→0 (turn12). The root policy and boundary observer tests pass.

The five remaining corrected-mode Store-boundary metadata gaps are explained as potential research-hook placement artefacts, **not** evidence of clone mutation. Corrected mode is still unqualified for paper rules, competent counterplay, complete prompt/reducer replay, multiple seeds, both physical seat orders, or competitive win rates.

Full updated evidence: [results/twinleaf/agent1-source-state-continuity.md](../../results/twinleaf/agent1-source-state-continuity.md). Relevant to Agents 14/22/37/48 and all policy/engine qualification work. Do not infer improved matchup strength from these incompatible 169/348-action trajectories.
