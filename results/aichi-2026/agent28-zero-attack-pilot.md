# Agent 28: rank-6 fixed-plan zero-attack candidate diagnostics

**16 October 2026; evidence class: pinned-engine policy trace, not competitive gameplay.**

## Source and conditions

The manual [six-trial Aichi campaign run 38840332579](https://github.com/FlareZ123/experiment-01/actions/runs/38840332579), artifact `aichi-campaign-diagnostic` (ID `12020597476`, ZIP SHA-256 `de3d9b8916e76549549c56bcc795b5356901a10fbf91dc8f29864dfd934cfb30`), records three frozen Shadow Rider inventories versus source-published **rank 6 Iron Thorns**, each in both actual starting seats. The campaign used versioned fixed-plan IDs and an opted-in Supporter decision guard, dynamic Double Dragon attachment and separated RNG streams. The research profile remains strategically unqualified.

The archive reports six `completed-engine-game` records and explicitly sets `strengthClaimPermitted:false`. All six have ordered meaningful-action traces, plus action counts by seat. Those traces omit individual prompt resolutions and are **not complete gameplay replays**.

## Directly observed policy behavior

| Candidate / physical slot | Candidate attacks | Opponent attacks | Candidate passes | Candidate retreats | Psychic Energy cards played | Candidate final Active | Candidate final Benched VMAX |
| --- | ---: | ---: | ---: | ---: | ---: | --- | ---: |
| Champion / A | **0** | 1 | 21 | 1 | 13 | Latias ex | 3 |
| Champion / B | 6 | 1 | 11 | 2 | 10 | Trevenant & Dusknoir-GX | 2 |
| Hood Shield / A | 1 | 2 | 24 | 1 | 6 | Lillie's Clefairy ex | 1 |
| Hood Shield / B | **0** | 5 | 34 | 1 | 9 | Latias ex | 3 |
| Temple / A | 4 | 7 | 16 | 2 | 10 | Shadow Rider Calyrex VMAX | 3 |
| Temple / B | 3 | 8 | 16 | 2 | 12 | no Active at termination | 1 |

The two **zero-attack candidate trials** are `pilot:6:0:champion-reference:A` and `pilot:6:0:hood-shield-v1:B`. Both returned **candidate-relative engine wins**, and both finished with the opponent's deck showing zero remaining cards. They reached 42 and 69 engine turns respectively. The champion A candidate passed 21 times and Hood B passed 34 times, even though each ended with three VMAX on its Bench and had played at least nine Psychic Energy cards across the match. Repeated Energy play can include retrieval/reuse and does not imply sufficient attack Energy on the final Active.

Across all six games, four had at least one deck empty at termination, including Temple A with both decks empty. These are terminal **state facts**, without proof of the particular engine loss condition.

## Interpretation and immediate acceptance gate

The two zero-attack wins show that completed-engine-game and winner fields alone cannot rank the proposed fixed candidates. The sequence suggests an **active-positioning/attack-feasibility investigation**, but the existing action summaries do not identify where Energy was attached, whether retreat or switching was legal at each decision, what attack costs and lock effects were active, or why the AI declined to attack.

A useful focused regression would reproduce one of these trajectories at a meaningful midgame state and ask the policy to consider a legal, payable damaging attack. A report should preserve Active and Benched Energy totals, retreat/switch legality, current locks, eligible attackers, and what alternative legal action the bot selected. Avoid rewriting a bot to force attacks without checking viability.

The [terminal transition instrumentation](../../simulation/twinleaf/terminal-transition.cjs) now records the last dispatched action and public pre/post state aggregates, and the [campaign diagnostic serializer](../../simulation/evaluation/aichi-campaign-execute.cjs) preserves that evidence. It can disambiguate some end-state narratives but remains **insufficient to prove which internal engine substep resolved a simultaneous loss condition**. Its integration CI is tracked separately.

**Outcome:** actionable policy-fidelity counterexamples, no assessed competitive win rate, no certified superiority of champion/Hood/Temple, and no evidence for the 99.5% target.
