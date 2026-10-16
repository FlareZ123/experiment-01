# Agent 39: source-locked rank-10 setup Active counterfactual

**Date:** 16 October 2026. **Evidence class:** pinned-engine action-policy sensitivity experiment only, **zero qualified competitive games**.

## Hypothesis and narrow intervention

The pinned SimpleTacticsAi starting-Pokémon resolver sorts eligible cards by generic `StateScore.getCardScore`; the pinned setup reducer puts the first selected card into the Active Spot. In the rank-10 Regidrago baseline, the champion and Temple candidates' first-acting seats selected Shadow Rider Calyrex V in their opening setup but placed other Basics Active.

[Agent 39 research adapter](../../simulation/twinleaf/active-opening-pivot.cjs) replaces only the `ChooseCardsPromptResolver` setup decision when enabled, preserving the **same set of selected starting Basics** and moving an already-selected Shadow Rider Calyrex V to position 0 if the reordering passes the prompt's validation. Non-setup prompts and the default branch are unchanged. It edits no Twinleaf vendor source and changes no deck inventory or rules. [Focused mock regression tests](../../tests/active-opening-pivot.test.cjs) cover the permuted selection, no mutation of original card list, other prompts, invalid choices and incompatible resolver class. This is a tactical hypothesis, not a universal starter heuristic.

## Fixed comparison

| Provenance | Baseline | Opt-in counterpolicy |
| --- | --- | --- |
| CI | [38845353476](https://github.com/FlareZ123/experiment-01/actions/runs/38845353476) | [38846304807](https://github.com/FlareZ123/experiment-01/actions/runs/38846304807) |
| Artifact | 12023246166 | 12023093996 |
| ZIP SHA-256 | `35ed9e01b55ba4c7634940aabe84297f0ae9892000b1933e48c3953d0177e7ab` | `d003febd8636f2be1cd3669968d9a85903cb69ed77e9dd0f3f19e4fca51008c9` |
| Source revision | `0d1c18f744f1f16561a2657e2918b19582701fd7` | `d23823945c5ac5e2ede88dc8cb7903df80fb91fc` |
| Engine pin | `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` | same |
| Fixed plan digest | `22c25a00dc7e51cff54ed93cd9d1111128a3085e20236d10c4b84a09e9d18890` | same |
| Rank | 10, Regidrago | same |
| Policy flag | no `shadowRiderOpeningPivot` | `shadowRiderOpeningPivot:true` |

Both diagnostics used `independent-slots-v2`, exact source printing digests, `maxActions=600`, three immutable candidate lists, and both physical engine slots. Both runs passed all workflow tests and emitted six `completed-engine-game` records for rank 10; these records have incomplete replay coverage and uncertified bot policy. Matched candidate-slot seeds were 20371256 (A) and 20371257 (B). Both physical slots retain their runtime-confirmed actual turn order.

| Candidate | Baseline A: candidate/opponent attacks | Pivot A: candidate/opponent attacks | Baseline B | Pivot B |
| --- | ---: | ---: | ---: | ---: |
| Champion reference | **0 / 7** | **6 / 7** | 5 / 1 | 5 / 1 |
| Hood Shield v1 | 4 / 8 | **6 / 4** | 8 / 6 | 8 / 6 |
| Temple v1 | **0 / 7** | **0 / 7** | 5 / 5 | 5 / 5 |

The B-slot trajectories were identical in attack counts, as expected from unchanged starter selections. Baseline A initial choices were respectively `Latias ex, Lillie's Clefairy ex, Shadow Rider Calyrex V`; `Latias ex, Shadow Rider Calyrex V`; `Dialga-GX, Lillie's Clefairy ex, Shadow Rider Calyrex V`. The counterfactual reverses only the order to put Shadow Rider V first, retaining all members.

### Evidence of the causal path and limitations

- Champion A: first own turn pass changed from Active Latias ex (one Psychic Energy), benched unpowered Shadow Rider V to Active Shadow Rider V (one Psychic), benched Latias. On global turn 3 the pivot policy executed **Shadow Mist**; baseline continued to pass, later with unpowered VMAX. The pivot eventually recorded one Shadow Mist, a Pale Moon-GX, and Night Watch attacks (six attacks total).
- Hood A: started with active Shadow Rider V rather than Latias. On global turn 3 the pivot policy executed **Max Geist**, subsequently attacking six times while baseline required several setup turns and attacked four times. The order of downstream evolution/retreat choices is affected; no head-to-head strength comparison follows.
- Temple A: began with active Shadow Rider V and one Psychic Energy, but the opponent played **Prime Catcher on global turn 2**. On global turn 3, the candidate's pre-retreat Active was **Lillie's Clefairy ex**, and an accepted retreat promoted Latias ex. This pre/post transition was proven by [the follow-up public retreat telemetry run 38847321592](https://github.com/FlareZ123/experiment-01/actions/runs/38847321592), whose first three turns matched this pivot-only run in meaningful action order. Later Temple passed with one Energy on its Active VMAX and never attacked. **The t3 retreat was not from Shadow Rider V**, so it cannot be called a rejected legal Shadow Mist.
- Because the engine's action policy, stochastic stream consumption, and board evolution diverge after the modified setup choice, the matched numeric seed permits controlled attribution to the initial intervention but is **not** a matched series of identical later hands and actions.
- A setup Basic can be strategically wrong to promote in other matchups. This experiment measures attack frequency on one physical seed and opponent rank, rather than prizes won under competitive play.

## Next test

The pinned `allSimpleTactics` policy evaluates `RetreatTactic` before `AttackTactic`, motivating an **opt-in attack-before-retreat comparison**. However the exact pre-retreat evidence above **falsifies the original proposed explanation** that Temple t3 declined to attack from a one-Psychic Shadow Rider V. [The four-arm comparison](agent39-attack-retreat-factorial.md) consequently measures generic decision-order sensitivity and must be read in light of opponent gust, board positioning and later policy divergence. A full legal-action snapshot is required before describing any missed attack.

**Bottom line:** The opening Active order is causally consequential for at least one observed engine trajectory, but no claimed win-rate or universal card-choice result is established.
