# Original rank-6 Plumeria: 27 settled Energy removals, five exact opponent reattachments and 24 source Pass-only returns

**Agent 25 | 30 October 2026 | retrospective original Store follow-through audit.** This report characterizes an existing archived policy's **actual next two turns after each Plumeria use**. It is neither a counterfactual outcome nor a competitive game result.

## One exact original game trace

The original [Agent38 preregistered-32 native treatment ZIP](https://github.com/FlareZ123/experiment-01/actions/runs/41120823829/artifacts/13009235373), SHA256 `36bd900984a3f7b01c39c31387d8cc254f21cc7213184a141ab1cb8ac7aef709`, preserves all original Store accepted roots, exact prompt choices, the ensuing publicly visible physical target changes and later turns. Twinleaf pin `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. The [earlier audit](agent25-native-plumeria-hand-discard-census-20261030.md) fully matched **27** source rank6 Plumeria roots to two owner-hand payment choices and one physically settled Basic Psychic Energy removal.

For the especially informative original trial **`6:3:B:champion-reference`**, source actual seat0 went first, preserved source-deal SHA `e57fb601c6a81c7db88b4b469fc8b3246a04e43e2e942141ada30b7a6f8806ce`:

| Global turn | Actual Store owner / accepted event | Original root ordinal | Physical evidence |
| --- | --- | ---: | --- |
| 2 | Opponent attaches Basic Psychic to Active Lillie's Clefairy ex | 25 | Native accepted public board delta shows Active Energy count **0→1** |
| 3 | Source plays Plumeria | 29 | Native two-card prompt **#30 chooses Crushing Hammer + Enhanced Hammer**; Energy prompt **#32 removes Psychic Energy MEE** |
| 4 | Opponent attaches *another* Basic Psychic to the same Active Lillie's Clefairy ex | 36 | Native accepted target sidecar action **#39** linked to root **#36**, Active Energy count **0→1** |
| 5 | Source ends turn with Pass and no other owner root | 40 | One original Store accepted `PassTurnAction` |

This is a direct observed **energy-denial then replacement** sequence. It shows the *future* potential value of saving a disruption Supporter or Hammer: the opponent visibly recovered the removed attached Energy on its very next turn. It cannot establish that source-held Plumeria would still be legally payable, that a conditional Hammer-first branch would reach the same turn 4, or that spending Plumeria again would be optimal. The observed T3 Plumeria selection had used up its own Supporter and two Hammers for the initial denial.

## Complete previously frozen rank6 follow-through

Using exactly the same native 32-arm treatment, we joined **27 of 27** previously certified Plumeria effect records to the *immediately following* original opponent turn and next original source turn:

| Original native event | Count | Evidence class |
| --- | ---: | --- |
| Settled source Plumeria Energy-removal chains | **27 / 27** | Root, physical prompt and actual discard |
| Immediate next opponent turn with a real accepted root | **27 / 27** | Original Store action ledger |
| Immediate next opponent turn with actual **Basic Psychic Energy reattachment** | **5 / 27** | Accepted `Psychic Energy` root plus original Store target-sidecar physically changing public Energy counts and printing `Psychic Energy MEE` |
| Immediate next opponent turn with an accepted **attack announcement** | **9 / 27** | Original Store `AttackAction` root; does **not** imply damage, knockout or opponent success |
| Following original source turn consisting of one Pass and no preceding non-Pass root | **24 / 27** | Original Store source Turn+2 action ledger |
| Both next opponent and next source turn present | **27 / 27** | Strict turn/seat lineage |

The **five** physical reattachments are:

| Trial | Plumeria source global turn | Next opponent Energy recipient | Original accepted Energy root |
| --- | ---: | --- | ---: |
| `6:2:A:champion-reference` | 5 | Active Latias ex SSP | 71 |
| `6:3:A:champion-reference` | 22 | Active Girafarig LOT | 114 |
| `6:2:B:champion-reference` | 17 | Active Girafarig LOT, going from three to four attached Psychic | 94 |
| `6:2:B:champion-reference` | 31 | Active Girafarig LOT, going from three to four attached Psychic | 161 |
| `6:3:B:champion-reference` | 3 | Active Lillie's Clefairy ex JTG, going from zero to one Psychic | 36 |

Not all of the above constitute restoring the exact same Pokémon's removed Energy, because the audited original Plumeria final prompt records only the printed Energy, and target Pokémon are not recovered from all historical effects. Each is nevertheless a real physical opponent Psychic Energy attachment on the *immediately next turn*. The opponent's accepted attack root may have come from another funded Pokémon and is an attack declaration, not an adjudicated payoff for Plumeria.

The **24** source Pass-only next turns are important opportunities for a more competent owner-only policy to investigate, especially when a Supporter or Item could still affect the opponent. Iron Thorns control can also deliberately Pass to maintain passive lock and force deck-out, so a Pass is not automatically poor play. We therefore do not infer missed beneficial actions, victory differences, or an attack-based superiority metric from these counts.

## Reproduction and proposed next experiment

- Source archive: Agent38 original [native ZIP artifact](https://github.com/FlareZ123/experiment-01/actions/runs/41120823829/artifacts/13009235373), original unaffected 32 treatment rows.
- [Fail-closed physical Plumeria cost auditor](../../simulation/evaluation/agent25-plumeria-native-hand-cost.cjs).
- [New downstream native root-and-energy audit](../../simulation/evaluation/agent25-plumeria-next-turn-response.cjs), which refuses to count a claimed reattachment without both an authentic accepted `Psychic Energy` PlayCardAction and its linked target sidecar with **+1 physically attached Psychic Energy MEE**.
- [Five synthetic negative/positive regressions](../../tests/agent25-plumeria-next-turn-response.test.cjs), checking actual public target delta, missing physical receipt, seat mismatch, missing next turn, and attack-declaration classification. Existing manual [benchmark CI 41136570657](https://github.com/FlareZ123/experiment-01/actions/runs/41136570657) completed **SUCCESS**, with the `test-benchmark` job explicitly executing and passing all four Agent25 pure suites at step **20**. A compiled engine game is not required to parse an existing exact JSON artifact.
- Independent initial local Node ledger scan yielded **27/5/9/24**, and a second manual physical sidecar check identified all five actual attached Pokémon and before/after counts. Reusable JS auditor runs should be performed against the original archived artifact before treating the numbers as a machine-checked reproducible result. No new game was run here.

[The separate six-root Hammer-first experiment proposal](agent25-rank6-crushing-first-stochastic-option-20261030.md) gives the precise native original T3 target and a conditional resource-value expression. A **default-off source-matched original Store replay** is now implemented at [agent25-crushing-before-plumeria-native.cjs](../../simulation/evaluation/agent25-crushing-before-plumeria-native.cjs). It preserves full raw baseline/treatment arms, rejects hidden information and attempts to execute the existing Hammer adapter before a subsequent Plumeria when eligible. The large existing native CI job edit was not accepted, so **there is currently no executed native counterfactual**. Do not claim a native Hammer-first action or winner from its existence as code.

**Field qualifications remain unchanged:** 29/32 authenticated original final-place Aichi Top32 60s, ranks 23, 25 and 28 unresolved, zero competitively qualified games, no validated single best 60, no demonstrated 99.5%.
