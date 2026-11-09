# Agent 8: genuine original-source evolution changes one rank-5 winner, corrected four-way v4

**9 November 2026, prospective native result. Developmental only.**

## Decision-relevant result

An opponent policy that offers ordinary Basic-to-VMAX/VSTAR evolution from the original source player's actual owner-held hand, and applies the capability **only to the original-source physical seat**, caused one real native terminal winner reversal among eight prospectively registered original-source physical encounters. The reversed comparison is original Aichi **rank 5 Mew Genesect** versus one unchanged **New Moon Lockbreaker v1** 60, at `5:3405:B:new-moon-lockbreaker-v1`. The source had physical seat 0. With source evolution disabled, the candidate in seat 1 won; with source evolution enabled, the original-source seat 0 won. The reversal occurred under **both** unchanged candidate Perfection pivot settings, independently of that factor.

This is direct evidence that underdeveloped opponent evolution decisions can distort apparent deck superiority. It is not a paper-compatible game-strength estimate, and the same experiment has extensive censoring.

## Fully frozen native design

- [Original v4 precommitted physical deals](../../aichi-2026/registrations/agent8-source-evolution-v4-corrected-20261109.json): eight newly generated seeds, original Aichi ranks 5 and 13, both physical candidate seats and two repeats per rank/seat.
- [Executable four-way v4 runner](../../../simulation/evaluation/2026-11/agent8-source-evolution-2x2-v4.cjs): candidate Perfection pivot P0/P1 independently crossed with original-source natural evolution S0/S1. Each arm uses the same source Quick Ball, Trainers' Mail and native owner prompt capabilities. Only the source evolution root is changed between S0 and S1.
- [Completed real native CI run 42574580847](https://github.com/FlareZ123/experiment-01/actions/runs/42574580847); [all 32 native attempts and complete outcome/Store action ledger artifact 13654063817](https://github.com/FlareZ123/experiment-01/actions/runs/42574580847/artifacts/13654063817). Tested with the pinned Twinleaf revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. The corrected seat-gate regression and ten other pure/native-target tests passed.
- This v4 repairs the historical v3 implementation error in which the requested source-only evolution accidentally activated for the candidate as well. The older v3 raw observations remain real but are excluded from source-only causal comparison.

## Actual native outcomes

| Registered/observed measure | Exact result |
| --- | ---: |
| Native attempts | 32 |
| Full original physical deal matched across all four phases | 8/8 |
| Groups whose four phases all terminated naturally | 3/8 |
| Native errors (retained, censored) | 10 |
| Root-260 action caps (retained, censored) | 4 |
| Source Mew VMAX/Regidrago VSTAR evolution actions, both S0 arms | 0 |
| Source Mew VMAX/Regidrago VSTAR evolution actions, both S1 arms | **16** |
| Original-source attack actions, both S0 arms | 27 |
| Original-source attack actions, both S1 arms | **35** |
| Source first-action differences with pivot off | 3/8 groups |
| Source first-action differences with pivot on | 3/8 groups |
| Naturally terminal source-evolution winner reversals | **1 group, repeated across P0 and P1** |
| Competitively qualified paper games | **0** |

The complete registered group ledger is:

| Original rank : repeat : candidate seat | P0S0 | P1S0 | P0S1 | P1S1 |
| --- | --- | --- | --- | --- |
| 5 : 3400 : A | cap | source win | cap | source win |
| 5 : 3401 : B | cap | cap | error | error |
| 13 : 3402 : A | candidate win | candidate win | error | error |
| 13 : 3403 : B | error | error | error | error |
| 5 : 3404 : A | candidate win | candidate win | candidate win | candidate win |
| **5 : 3405 : B** | **candidate win** | **candidate win** | **source win** | **source win** |
| 13 : 3406 : A | candidate win | candidate win | candidate win | candidate win |
| 13 : 3407 : B | error | error | source win | source win |

Here “win” records only the native Store terminal winner in an artificial developmental bot match. Native cap and error cells have unknown outcomes. No competition result can be inferred by counting only completed cells.

## What this solves and what it leaves open

The first three opponent policies had demonstrated real native search-card plays and evolution potential but sometimes passed instead of building their attacker. This experiment corrects the evolution source/candidate isolation and demonstrates an actual outcome consequence on a fresh untouched physical deal.

It leaves a more specific actionable problem: the original Mew Genesect source still needs a donor-funded **Cross Fusion Strike** attack path, including retreat from an off-axis Active, actual printed Double Colorless Energy payment, and owner-visible eligible donor selection. A distinct [prospective v5 registration](../../aichi-2026/registrations/agent8-source-mew-combat-v5-20261109.json) and [bounded runner](../../../simulation/evaluation/2026-11/agent8-source-mew-combat-v5.cjs) test exactly these source-only mechanics without changing either printed 60 or retroactively reusing v4 outcomes.

Original benchmark coverage remains 29/32 verified name/count lists, with ranks 23, 25 and 28 missing. No final optimized fixed 60 is selected. No paper game is competitively qualified. No 99.5% win rate has been demonstrated.
