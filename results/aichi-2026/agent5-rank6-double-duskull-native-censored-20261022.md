# Agent 5: two native Duskull promotions defer Prizes but censor before attack

**22 October 2026.** A separately preregistered T17 second Duskull promotion was executed after observing the T15-only negative. This is a **retrospectively selected physical deal**, with three complete four-arm real Store executions, an unchanged New Moon Lockbreaker v1 60 and the exact rank-6 Iron Thorns ex source 60. **No competitive-qualified games.**

## Frozen native evidence

Source first, seed **407516727**, source-deal SHA-256 **14549caa34487d41ae4100c0c3542085d6fe57ed33b9d7da89b79bc55379b5de**, pin **a9905a76a6c4103ba4b6cb9a49e86bad795c5c05**. The original no-intervention four-arm root SHA was unchanged **20203d34d1f9149f7229b147a4906e8a4a80b7192e129a293d68cdc69bfcb419**. The prior single-intervention native SHA was unchanged **9626b719fbb911cbfbd2e8b33eeed104b0783bb1ddb302bdaf782e0bf9b12083**. All other three source-first crossrank arms preserved their full root SHA and source deal across the three experiments.

New treatment additionally offers a second candidate-owned live ChoosePokemonPrompt after source T17 Volt Cyclone Knocked Out the earlier Duskull. The genuine legal menu included Mewtwo & Mew-GX, Trevenant & Dusknoir-GX, Galarian Articuno V, **another Duskull**, and Unown. The owner-visible pure selector promoted the second Duskull. Physical Store audit: **2 opportunities, 2 selected, 2 accepted, 2 confirmed Active Duskull; 0 rejected and 0 missing** at turns T15/T17, prompt IDs 70/82. New treatment full root SHA **c453169eb6116e273c0556f71e8c49046c1dfaaab80316f13cefa4a1debe21f5**.

| Native observable | No change | T15 Duskull | T15 + T17 Duskull |
| --- | --- | --- | --- |
| Source Prizes remaining after T15 | 4 | 4 | 4 |
| Source Prizes remaining after T17 | 4 | 3 | 3 |
| Source Prizes remaining after T19 | 1 | 3 | **2** |
| Candidate settled attacks | 3 Psyray at T52/54/56 | **0** | **0** |
| Last settled source attack | T57 | T33 | T33 |
| Outcome | T57 source win [0,4] | T33 source win [0,6] | **Action cap at T58 [2,6]**, no winner |
| Root actions | 250 | 168 | 260 cap |

**Interpretation:** The two one-Prize promotions forcibly changed which Pokémon occupied the Active Spot and thereby prevented the original T19 multi-Prize Mewtwo KO. The source instead took single Prizes on T17 and T19. The candidate never used an attack in the third arm; the trial stopped at the predefined 260-root cap. It is **censored**, regardless of the source having two Prizes left. No source win, candidate win, tournament draw or win-rate contribution can be inferred from that terminal. The second Duskull can defer exposure of Mewtwo but does not solve access to a functional attack in this selected game.

## Exact methods, provenance and limitations

- [Preregistration before this second treatment](registrations/agent5-rank6-double-duskull-20261022.md).
- [Compiled manual CI **39712825586**, complete success](https://github.com/FlareZ123/experiment-01/actions/runs/39712825586), head **e15920797469107baea9c06d6b2a83893378ef2d**.
- [Artifact 12397699064](https://github.com/FlareZ123/experiment-01/actions/runs/39712825586/artifacts/12397699064), three full 4-row Store archives, strict T15 and T17 audits, ZIP SHA-256 **04fc1364ec3f54e1495b3767295c149fe619c4a175281afd5e8fdce17d5cea4b**.
- [Native registered owner prompt hook](../../simulation/twinleaf/agent5-rank6-lowprize-promotion.cjs) retains first-T15-only exact behavior unless separately enabled for T17. [Branch-local runner](../../simulation/evaluation/agent5-rank6-lowprize-development.cjs) chooses treatment by `AGENT5_LOWPRIZE_PROMOTION_DEV=double` and remains under the existing Agent5 manual workflow. [Triple-arm fail-closed auditor](../../scripts/agent5-rank6-double-duskull-native-audit.cjs) independently verifies original SHA, intermediate SHA, both physical placements, three unchanged non-target arms and all two terminal statuses.

The common actor policy remains strategically weak and prompt handling is not fully paper-validated. In this one conditionally selected deal, replacing the Active three-Prize target with two low-HP targets keeps the source from immediately collecting three Prizes. The longer simulated survival derives partly from the engine's 260-root cap and a source policy that subsequently Passed. These facts **do not predict win strength**. A stronger experiment needs both-seat opponent-continuation competence and a plan to power an attacker. Arbitrary additional low-Prize sacrifices without an attack plan risk optimizing an irrelevant proxy.
