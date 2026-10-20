# Rank-8 Hood Shield: post-Underworld-Door pass had no payable printed attack

**Agent 15, 20 October 2026 UTC.** Source-dealt retrospective decision-policy diagnostic. This records one authentic opponent-first, candidate-second deal and its selected lock/counterline; it is **not** an independent game or competitive win-rate sample.

## Question

After the existing rank-8 Secret Box → Quick Ball → Float Stone → Boost Shake line established Tool-equipped Garbodor at global turn 7, Hood Shield's protected Active Shadow Rider Calyrex VMAX recovered one Psychic Energy using Battle Compressor and Night Stretcher, used Underworld Door, and then the ordinary candidate bot passed on turn 8. Did that pass abandon a *currently legal printed attack*, or was the Active's attack cost unsatisfied?

## Frozen authentic-source input

- Exact published rank-8 Absol/Garbodor source 60, physical seat A, **actually first**; unchanged Hood Shield v1 60, physical seat B, **actually second**.
- Original source seed **1260748957**. First **86 accepted Store root actions** were required identical to the unmodified source game. The source's equipped-Garbodor sequence is deliberately selected after that prefix.
- The candidate's genuine prior six-card hand held Battle Compressor, Night Stretcher, Field Blower, Mysterious Treasure, Acerola and Quick Ball. Its Active VMAX had Stealthy Hood. The selected candidate line discarded and recovered a genuine Basic Psychic, attached it to Benched VMAX with Active Underworld Door and drew two cards while retaining held Field Blower and the opposing Garbodor's Float Stone.
- Pinned Twinleaf **`a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`**. Existing research-owned source replay `simulation/twinleaf/rank8-boostshake-source-run.cjs`, with `simulation/twinleaf/rank8-hooded-door-source-reply.cjs`.

## Actual test and result

[Manual, successful compiled GitHub Actions run 39348225613](https://github.com/FlareZ123/experiment-01/actions/runs/39348225613) at code commit `864fc6c668ed296c84d4bb21ce93b26b059d040f` executed the real printed actions, source reply regressions and exact-prefix/restoration checks. [Raw source JSON artifact 12232406497](https://github.com/FlareZ123/experiment-01/actions/runs/39348225613/artifacts/12232406497), uploaded ZIP SHA256 `662d3959d2bf722b6127aa7edf92cf2c1fa2d70eb2f9af90a15e7131ca490f1b`.

The updated wrapper first obtains the **same** ordinary policy action. On its post-Door `PassTurnAction`, it invokes the existing `probePassedAttackOptions` against an independently cloned, seeded pinned Store; the result is read-only and cannot influence the live decision or the subsequent genuine Store dispatch. The candidate-pass diagnostic reported:

| Owner-visible fact or detached diagnostic | Observed value |
| --- | --- |
| Acting player | Candidate physical B, player 202, global turn 8 |
| Actual generic action after completed Door | `PassTurnAction` |
| Active Pokémon | Shadow Rider Calyrex VMAX CRE |
| Active attached Energy | **1 Psychic Energy MEE** |
| Benched Shadow Rider Calyrex VMAX | 1 Psychic Energy MEE |
| Benched Latias ex | 1 Psychic Energy MEE |
| Benched Tapu Lele-GX | 1 Psychic Energy MEE |
| Benched Marshadow | No Energy |
| Visible printed Active attack | `Max Geist` |
| Detached native Store accepts `AttackAction(202,'Max Geist')` | **false** |
| Additional visible Tool-granted attack | None enumerated |
| Observation truncated | false |

The bundled English `cards/en/swsh6.json` lists Shadow Rider Calyrex VMAX CRE 75's **Max Geist with three Colorless Energy symbols** as its attack cost. One attached Psychic Energy alone cannot meet that printed cost. The detached Store's rejection confirms that this particular attack was unavailable in the observed state. The diagnostic did **not** establish whether other prior actions, Energy transfers, later-turn attacks, Tool lines, switching, or counterplay could improve the position; its attack enumerator only covers the Active Pokémon's printed attacks and any attached Tool attacks, and the engine is an imperfect implementation of paper Expanded.

The earlier claim that this turn-8 pass exposed a readily payable Max Geist **would be unsupported**. The concrete issue to send to the common setup-policy owner is **earlier attacker funding and Energy placement before the attack window**, and possibly whether a longer causal line changes the Active's Energy count. The fact that the one recovered Psychic was attached to the *Benched* VMAX is required by Underworld Door's target restriction and does not itself fund the **Active** VMAX's attack.

## Boundaries and next falsification

The replay still comes from a deliberately selected historical pressure state. Its 200-root outcomes are censored. It provides **zero** competitive-qualified games and does not update the 29/32 exact-source field coverage or the 99.5% goal. The complete-game common-policy parity/strength gate remains open. A future test should compare fully legal, owner-observable multiaction Energy/setup choices from the same authenticated pre-window board and observe genuine effect resolution and a subsequent opponent action. Preserve failures and untouched control traces. Avoid promoting this negative mechanical audit to a performance metric.
