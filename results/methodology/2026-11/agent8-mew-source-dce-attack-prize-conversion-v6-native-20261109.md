# Agent 8: one legal owner-visible Energy allocation choice enables 11 native Cross Fusion Strike attacks and a rank-5 opponent win

**9 November 2026, prospective native developmental results.** This report documents actual printed source-board receipts in pinned Twinleaf and distinguishes them from competitive paper games.

## Experimental design and evidence

- [Precommitted v6 physical registration](../../aichi-2026/registrations/agent8-source-mew-funding-v6-20261109.json): eight independently generated 32-bit physical deals; source Aichi ranks 5 Mew Genesect and 13 Regidrago; two source/candidate seat orientations per rank and two independent repeats each; preregistered before first v6 game. Both original 60s and fixed candidate New Moon Lockbreaker v1 unchanged.
- [Executable real native v6 fourway runner](../../../simulation/evaluation/2026-11/agent8-source-mew-funding-v6.cjs) and [factor/owner-target tests](../../../tests/2026-11/agent8-source-mew-funding-v6.test.cjs). All arms share previous source-only evolution, source Items, Mew combat paid retreat and Genesect Techno Blast prompt preference. P0/P1 independently toggle the candidate Perfection pivot. The **only S0/S1 change** is conservative source-owner Double Colorless Energy (DCE) targeting to an unfunded Mew V or Mew VMAX already in play.
- [Completed native Actions run #42577136715](https://github.com/FlareZ123/experiment-01/actions/runs/42577136715) succeeded, pinned engine `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`; [complete native 32-attempt Store artifact #13655243326](https://github.com/FlareZ123/experiment-01/actions/runs/42577136715/artifacts/13655243326). The test and native build steps passed. Every native error and action limit was retained.

## Actual outcome

| Measure | Control S0 (P0+P1) | Original-source Mew DCE recipient S1 (P0+P1) |
| --- | ---: | ---: |
| Original-source DCE cards actually played | 11 | 11 |
| Original-source primary evolutions | 10 | 10 |
| Original-source native attack declarations, all attacks | 40 | **51** |
| Original-source native **Cross Fusion Strike** attack declarations | **0** | **11** |
| Native Cross Fusion Strike attack chains fully settled | **0** | **11** |
| Proposed extra paid Retreat roots | 0 | 0 |

All **8/8** physical groups matched across their four phases. The 32 attempts comprised **three fully naturally terminal groups**, **two native errors**, and **12 260-root caps**. One fully terminal rank-5 group changed winner independently in both candidate P0 and P1 settings. Both 60s and the source's number of DCE attachments remained unchanged.

## Decisive actual original rank-5 physical group

At `5:3605:B:new-moon-lockbreaker-v1`, candidate is physical seat 1, original Aichi rank-5 source is physical seat 0. All four arms reached native natural terminal. Native source control **lost**, and funded source **won**, in both candidate pivot variants:

| Condition | Native winner | Final Prize counts, physical seats [source, candidate] | Original-source Cross Fusion Strike attacks |
| --- | --- | --- | ---: |
| P0S0 | candidate, seat 1 | [6, 0] | 0 |
| P1S0 | candidate, seat 1 | [6, 0] | 0 |
| P0S1 | **original source, seat 0** | **[0, 2]** | **4** |
| P1S1 | **original source, seat 0** | **[0, 4]** | **3** |

On both source treatments, the original-source board starts with Active Dedenne-GX and a Benched Genesect; two real DCE cards are played during the game. In the S0 baseline, owner Pass observations show Active Genesect V holding DCE by turn 10, while the newly evolved Mew VMAX remains unfunded. The source later promotes the empty Mew VMAX and cannot attack. In S1, owner observations at turn 10 show **Genesect V without attached DCE**; the same board has a Mew V on Bench, which evolves to Mew VMAX on turn 12. By turn 14 the S1 Mew VMAX reaches the Active Spot with **DCE attached**, a real Benched Genesect V donor, and the original printed **Cross Fusion Strike**. Native source AttackActions on subsequent turns are accepted, prompt chains settle, and the original source takes all six Prize cards before the candidate.

Under P0S1 native source attacks were declared on global turns **14, 18, 22, 26** and all four settled. Under P1S1 they were declared on global turns **14, 18, 22** and all three settled. The native Store action and postattack public boards confirm the original printed attacker, actual attached DCE, and genuine Prize progression. The native engine and bot decisions remain a developmental implementation, and their paper equivalence is not yet certified.

## Why this matters to the single-deck objective

This is a concrete, successful opponent-policy repair. Merely adding more theoretical search paths or a copied-attack preference produced **zero** attacks in the prior v5 experiment. Redirecting an **already played** DCE to the actual attacker changed native attack output and reversed a real 60-card game winner twice under independent candidate decisions. An evaluator that ignored the original source's Energy-recipient choice could have accepted a candidate as stronger even on this identical original physical deal.

The intervention uses a preexisting tested owner-visible [Agent26 Mew DCE target selector](../../../simulation/twinleaf/agent26-owner-visible-mew-dce-recipient.cjs) with an exact source-seat-only opt-in added in the [canonical actor root policy](../../../simulation/twinleaf/agent34-actor-only-root-policy.cjs) and [bilateral native runner](../../../simulation/evaluation/agent41-bilateral-v2-development.cjs). This can be shared across native competitive pressure tests after their source-actor policy options are aligned.

**Limitations:** The benchmark still has only 29 of 32 exact original lists (23/25/28 absent), only three v6 full fourway natural terminals, 14 censored native attempts, unproven paper card/clock parity, and unqualified autonomous decision policies. **Paper competitively qualified games remain zero, and no 99.5% win rate is demonstrated.** The result establishes a causal native source-game improvement on fixed original/candidate 60s; it is not a field estimate.
