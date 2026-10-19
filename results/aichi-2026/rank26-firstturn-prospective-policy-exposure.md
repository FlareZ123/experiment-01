# Rank26 real-deal first-turn policy exposure: preregistered 24 independent source seeds

**Agent 4, 18 October 2026, before execution.** Evidence objective: expose actual opening conditions and source root-action selection rates, without selecting for a successful seed. This is a policy-reachability and competence audit, **not a game-win-rate study**.

## Frozen sample and comparison

Use existing `deriveSlotSeeds(20261105, 'pilot', 26, repeat)` with **repeat 40 through 51 inclusive**, each seat A and B, for 24 actual source deals with distinct 32-bit seeds. This seed domain is separate from the retrospective seed 49957955 and the existing rank26 source-window hunt bases (20261017 through 20261020). Every seed and both seats are included **without regard to starting player, opening Meloetta, opponent Bench, card availability or whether the intervention fires**. Keep a complete record of no-opportunity draws.

Both registered 60s are unchanged: rank26 Meloetta vs rank6 Iron Thorns from `planAichi(26)` under the frozen `allowEquivalentBasicEnergies:true`, `allowJapanesePromoHooks:true` conversion flags. Frozen compiled Twinleaf submodule `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Actual physical ranks and starting seats must be verified by the original engine draw log and a root Store snapshot. The source bot profile is `rank26-autonomous-cologne-pump-propagation-v3` with the same fixed other hooks for both arms.

Each exact deal has a **paired control** (v3) and **intervention** (identical v3 + source-only Mail Scout v1 + first-turn Farewell Letter v1 + DCE reservation late-Lightning fallback v2). Both arms have a bounded `maxActions:120` and strict prompt validation. Interventions may use the **owner hand and public board**, never hidden deck/Prize identities. They do not re-stage source physical cards or insert missing pieces. The control and intervention source action paths can diverge after decisions; equal seed establishes the common initial shuffle, not equal final deck order.

## Primary predeclared outcomes

For all 24 deals record actual first player, whether rank26 was first, both initial Active Pokémon, initial opponent Bench size, rank26 initial owner hand (for auditing, not fed to the bot), and source first-turn action list with separate records for actual Items, Energy attachments, Farewell Letter ability, root attack declarations, and passes. Record exact source-owner Hand/Bench-restricted policy actions and whether the intervention saw held DCE. Count eligible/unexposed source-first conditions with **all 24 deals as denominator**, plus the true source-first subset. A source-second deal is a zero-opportunity for the *first-player Meloetta donk* objective, but remains in the sampling denominator.

Use root observable printed attack/copy-action information where available; never conclude no attack from a missing root `AttackAction` alone because delegated attacks can evade that collector. Record Engine-side Prize counts and `finished` only as supplementary incomplete diagnostics. `winner:-1` or action-limit snapshots must never be counted as a game outcome. A failing source conversion, early lock, no opener or an unexpected chosen action remains an explicit negative observation, without replacing seeds.

## Run and falsification

`simulation/twinleaf/rank26-prospective-firstturn-cohort.cjs` will assert the registered 60 count for each player, pinned submodule, exact seed equality, actual starting-player draw-log validation, deck identity hashes, original root consistency and source profile version. Its JSON will archive all 24 source snapshots and 48 actual engine game-trace summaries. Max total 5,760 engine action steps; this is a controlled manually dispatched workload in the existing `aichi-damage-pump-fidelity.yml` workflow behind a new opt-in input, with no per-commit job and no automatic repeated run. A red assertion is a failed test to be diagnosed, not grounds for dropping a seed.

A successful run establishes a prospective, unfiltered **sample of action-selection exposure** under a partially qualified simulator and generic opponent policy. It does **not** establish that any full deck meets the 99.5% objective or that these source policies reflect elite player performance. Opponent policy, first-turn attack and complete response remain to be audited.


## Compiled outcome, 19 October 2026

**The preregistered campaign executed successfully.** [Manual-only CI run 39181632217](https://github.com/FlareZ123/experiment-01/actions/runs/39181632217), exact head \`801a44d7392d352e21732bb5149acde8f277dd64\`, pinned Twinleaf \`a9905a76a6c4103ba4b6cb9a49e86bad795c5c05\`. The complete JSON is archived in [artifact 12156642489](https://github.com/FlareZ123/experiment-01/actions/runs/39181632217/artifacts/12156642489), \`rank26-prospective-firstturn-policy-cohort-unqualified\`. The downloaded archive was independently parsed as a 24-case JSON with **24 distinct seeds** and both seats for repeats 40 through 51. The frozen comparison scripts assert matching source deck hashes, real first-draw log, start positions, source profile and action caps.

| Preregistered source observable | Observed |
| --- | ---: |
| Genuine independent seed/seat cases | 24 |
| Meloetta side actually playing first | 9 |
| First-player Meloetta initially Active | 0 |
| First-player Meloetta initially on Bench | 0 |
| First-player Meloetta Active with opponent lone Active | 0 |
| Variant first-turn Cologne selected | 0 |
| Variant first-turn Trainers' Mail selected | 0 |
| Variant first-turn Farewell Letter selected | 0 |
| Variant first-turn DCE card plays | 0 |
| Variant first-turn basic Lightning card plays | 2 |
| Variant first-turn root \`AttackAction\` | 0 |
| Variant first-turn observed opponent Prizes below six | 0 |
| First-turn control/variant action-trace differences | **0/24** |
| Action-capped paired continuations | 23 |
| Engine-terminal paired continuations | 1 |

**Primary conclusion: a genuine no-intervention opportunity census.** All 24 paired **recorded first-turn** action summaries are identical, and every variation audit reports zero Farewell selections, zero Mail selections and an empty DCE-reservation decision list. Source-first plays occurred in nine physical deals, but **none had Meloetta ex initially in play in either Active or Bench**. As the three opt-in first-turn hooks require an Active Meloetta, their zero observed actions do **not** falsify what they would do in a qualified active-Meloetta window. A retrospective seed 49957955 previously triggered these branches; that selected source seed is disjoint from this preregistered cohort and must remain a distinct mechanical test. No first-turn Crisis Punch or actual Prize gain was established here.

Among the nine source-first opening hands, seven contain at least one Trainers' Mail. **Four** of those seven contain neither Risky Ruins nor Canceling Cologne in the audited original hand (seeds \`2046029502\`, \`4158340325\`, \`2818295704\`, \`1839183531\`). They therefore satisfy the source Mail scout's **hand-resource** gate but fail its \`Meloetta ex\` Active requirement. The other public-board, actual root and prompt requirements still must be checked before claiming those four were legal action opportunities. This is a concrete policy **coverage** hypothesis: the current Mail-only support is restricted to an already established attacker, while source-first draws can begin on other Basic Pokémon. A broadened owner-information-safe search policy should face genuinely held-out deals after this development set, rather than reclassifying these four as performance data.

For audit, the nine genuine source-first positions are:

| Seed | Physical seat | Source initial Active | Source initial Bench |
| --- | --- | --- | --- |
| 2540626718 | B | Crobat V | Exeggcute |
| 2046029502 | A | Squawkabilly ex | Empty |
| 1001048889 | B | Exeggcute | Unown |
| 4158340325 | A | Unown | Unown |
| 4148793063 | B | Exeggcute | Squawkabilly ex |
| 4079093321 | A | Dedenne-GX | Empty |
| 2818295704 | B | Unown | Dedenne-GX |
| 1839183531 | A | Exeggcute | Squawkabilly ex |
| 1394063981 | B | Unown | Empty |

The single source-second engine-terminal pair is seed \`1939635193\`, rank6 physical B awarded the engine outcome in both paired arms. This is an engine diagnostic, not a tournament result: both policies are generic and unresolved against a competent adversary, and the remaining 23 source-pairs are action-capped. **Zero qualified competitive games; no change to the full-field deck selection or 99.5% target evidence.**

### Next discriminating gate

Resolve whether a legal first-turn Trainers' Mail root choice on a non-Meloetta starter improves subsequent genuine attacker establishment, while preserving the first-turn Tool slot, DCE+Lightning route, printed abilities and source hand/public-board information boundary. A direct source-conserved action/effect/reply demonstration is more informative than another marginal access calculation. Any learned policy change should be assessed on new predeclared seeds and both actual starts. A first-turn Mail use alone is an action-availability result; **printed Crisis Punch, consequential opponent response, genuine Prize transition, clock and competent opposing policy** must be checked before game-strength inference.
