# Authentic rank-11 early Garbotoxin: New Moon holds Field Blower and passes

**Agent 9, 18 October 2026.** Source-dealt, versioned **policy-quality counterexample** from already compiled [manual CI 39090207009](https://github.com/FlareZ123/experiment-01/actions/runs/39090207009), successful head `df1a60cf6a5040fcfb81f0d5289b44a2e5f68b77`. The run's inspectable [source first-turn and fixed candidate pairs](https://github.com/FlareZ123/experiment-01/actions/runs/39090207009/artifacts/12121968524) were downloaded and examined directly. This note reinterprets the actual action and public-board trace; it adds **zero** qualified competitive games.

## Reproducible source inventory and start order

* Opponent: **Aichi rank 11 Wataru Yano, Absol/Garbodor**, original full published 60 from [full-decklists.json](full-decklists.json).
* Candidate: unchanged **New Moon Lockbreaker v1**, [fixed English simulator equivalent 60](../als/new-moon-lockbreak-english-proxy-60.json), proxy hash `a693748bc4fc4326142f2dfec26570b9f1e1f7139790d36a089de1137d1cb4c4`.
* Physical engine seats: published source **A (0)**, candidate **B (1)**. Exact archived seed **`1244180408`**; first-draw log certifies source rank 11 actually started.
* Engine: Twinleaf pinned `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
* Opponent research profile: `rank11-autonomous-boostshake-v1`, actual owner-information-set source opener, not a card injection. The audit confirms **11 legitimate source actions**, spent VSTAR, and **Float Stone-equipped Garbodor** before the candidate's first decision. Source complete at decision boundary true.

The same genuine starting deal is available in the separately included generic `expanded-action-fidelity-probe-v1` arm, where the opponent **did not** autonomously produce first-turn Tool Garbodor. That contrast isolates a decision-policy difference rather than a source-inventory change. Neither opponent policy has been certified as competitively strong.

## Decisive public board and the actual missed choice

At **decision action ordinal 40, global turn 2**, the candidate's own-hand record shows exactly:

`Field Blower GRI` and `Lillie's Determination M1L`.

The opponent's **public** board immediately before New Moon's `PassTurnAction`:

| Slot | Public Pokémon | Relevant attachment |
| --- | --- | --- |
| Opponent Active | Crobat V | None |
| Opponent Bench | Oranguru V | Forest Seal Stone, already spent VSTAR Power |
| Opponent Bench | **Garbodor BKP** | **Float Stone** |
| Candidate Active | **Mewtwo & Mew-GX** | **Psychic Energy + Powerglass** |
| Candidate Bench | Lunatone, Tapu Lele-GX | No relevant Tools |

On the candidate's actual first turn it used a Powerglass, Escape Rope, Fog Crystal to fetch a Psychic Energy, attached that Energy, and passed. The last own-hand record was exactly `Field Blower` plus `Lillie's Determination`. Through at least its next several turns, the candidate continued to hold the first response Item while the pinned policy repeatedly passed. The recorded opponent had no simultaneous Item lock. A **Field Blower** Item is legal under Garbotoxin Ability lock and can target a Tool on Benched Garbodor. The staged printed-card [Field Blower Store test](../als/new-moon-lockbreak-60-candidate.md#compiled-attached-tool-and-active-ability-suppression-test) separately verifies that selecting Garbodor's attached Float Stone removes the Tool and restores Perfection visibility in that controlled effect state. The new source-dealt trace itself **does not contain this action**.

This is a direct **access-versus-action** failure: resource availability and an attractive legal option did not cause the actual candidate bot to take it. The naive inference that greater direct Field Blower access means more game wins is refuted by the policy's behavior on this concrete opening. Whether removing the Tool at action 30 would have produced a viable next attack remains unproven. The candidate had no recorded GX attack in this run, and the source's subsequently observed second Float Stone creates a retooling threat.

## Outcome and independent contrasts

The existing paired same-seed diagnostic recorded:

| Candidate | Opponent policy | Candidate attacks | Field Blower played | Opponent lock established turn one |
| --- | --- | ---: | ---: | --- |
| New Moon v1 | Expanded generic | 0 | 0 | No |
| New Moon v1 | Rank-11 automatic Boost Shake | **0** | **0** | **Yes** |

Both simulations eventually reported a terminal engine outcome favoring the rank-11 source and six candidate Prizes still remaining. They use weak, incomplete policies and an unqualified paper-rules simulator; **these terminal outcomes cannot be pooled into a win-rate estimate**. The rank-11 autonomous arm merely proves that the critical early lock can be built with actual legally acquired source cards, then ignored by the present candidate decision policy despite a held answer.

A separate [exact mathematical access study](../als/new-moon-secret-box-garbotoxin-access.md) shows **34.3928545%** conditional first-eight access from direct Blower or Secret Box, but the current source case is even simpler: **Blower was already directly held**, so its three-discard Secret Box cost was irrelevant. The policy failure here does not test the Secret Box pathway.

## Prepared falsification fork and qualification gap

[Research-side one-action counterfactual](../../simulation/twinleaf/newmoon-rank11-real-hand-blower-response.cjs) is committed, aiming to preserve the entire genuine source opening and override exactly **one** candidate first-turn real-hand Field Blower play plus its owner-validated Tool-selection prompt. It uses the published 60s and archived seed unchanged, with no cards/hand/Prizes inserted. The [targeted manual-only workflow](../../.github/workflows/newmoon-rank11-held-blower.yml) is available for execution.

**As of this report, this new fork is UNEXECUTED / UNVERIFIED.** Manual dispatch returned an explicit safety/tool block; do not treat the fork's unrun assertions as a passing Store demonstration. The earlier staged Tool test and source-dealt observational action trace are the independently verified evidence.

Next test: run that one-response fork in a pinned compiled environment and verify actual `PlayCardAction`, `ChoosePokemonPrompt`, discarded Float Stone, Perfection visibility, unchanged source first-turn prefix, and the source opponent's retooling reaction. Only then attribute a causal change to the single candidate action. Further full two-player policies, rule fidelity, exact opponent coverage, and independent games are needed for any deck strength claim.

**Benchmark status remains 29/32 exact full opponent source lists, zero qualified games, 99.5% target unproven.**
