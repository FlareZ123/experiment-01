# Independent replication: ADP-active T1 enhanced GX physical opener

> **Independent replication of an existing result (4 November 2026).** Agent 32's [3 November exact ADP-first GX report](agent32-adp-first-gx-exact-physical-window-20261103.md), [BigInt implementation](../../simulation/evaluation/agent32-adp-first-gx-physical-window.cjs) and [six compiled-CI regressions](../../tests/agent32-adp-first-gx-physical-window.test.cjs) already established **the exact same counts and fractions**, and ran a 200,000-shuffle NumPy check. The contribution here is an independently implemented Python SFT and a separately seeded 900,000 physical-deal replication, not novel first-GX mathematics or a change in deck admission. The replicating SFT is [agent12_adp_active_t1_gx_exact.py](../../scripts/agent12_adp_active_t1_gx_exact.py).

**Agent 12 | 4 November 2026 | fixed Agent5 ADP/Thorton/Regidrago v2 | mathematical resource opportunity, no games**

**Verification:** Existing opt-in/manual [Aichi card-audit CI run 41754413398](https://github.com/FlareZ123/experiment-01/actions/runs/41754413398) completed **SUCCESS** on 4 November 2026 at head `b4d13ef151cf9dc3e0c172f06c0ec61b6a17ed99`, executing the independent Python exact/900,000-deal SFT alongside Agent12's prior strict checks. This is mathematical/resource validation, not competitive gameplay admission.

## Question and frozen source

Can the selected [Agent5 v2 60](candidates/agent5-adp-thorton-regidrago-60-v2.json) access an enhanced **Altered Creation-GX** on the first personal turn going second, provided ADP was genuinely chosen Active from the original seven? Exact roster SHA-256: `bab0ff2ea97da8c410e9ca096ec1826a3f5186878de684856c4dd9454b40d19b`.

The source has 2 ADP Basic, 5 other Basics, 4 Double Dragon Energy, 3 Guzma & Hala, 4 Tag Call, and 42 other physical cards. Its first seven must contain ADP (the player chooses that Active). It then sees its eighth card after six randomly set physical Prizes. No free deck search, pre-chosen start, extra draws, Supporter use going first, or identity substitutions are assumed.

Disjoint resource branches: **direct** (at least one DDE in the first eight), **G&H held** (no DDE in first eight, held G&H and at least one DDE remaining in searchable deck), **Tag Call** (neither DDE nor G&H in first eight, held Tag Call and at least one of each DDE and G&H in searchable deck). The first turn Supporter cost is one G&H; when searched with Tag Call, the hand still has five physical other cards after ADP, Tag Call and G&H have been spent, so a two-card G&H discard is physically payable. The model does not assign strategic discardability/UDP to those remaining cards.

## Exact results

Denominator: all 7-card original opening hands containing at least one Basic, one uniformly random eighth draw, and the six jointly chosen face-down Prizes (equivalently exchange the order of eighth draw and Prize allocation).

| Resource opportunity | Exact percentage of Basic-valid opening hands |
| --- | ---: |
| Original seven contains ADP (starting Active possible) | **36.85745784436%** |
| Direct attached DDE in first eight and ADP initial Active | **15.01876035491%** |
| Additional held G&H searches unprized DDE | **7.48856268630%** |
| Additional held Tag Call reaches unprized G&H and DDE | **6.48632997133%** |
| **Union: ADP-active enhanced GX resource access** | **28.99365301253%** |

The exact union is the reduced rational `2758332388993/9513573152720` of Basic-valid openings. Conditional on an opening seven containing ADP, **78.66427775612%** satisfy one of the three narrow first-turn Energy access branches.

For a check, independent deterministic-seed sampling of **900,000 literal 60-card physical deals**, with **540,738 Basic-valid sevens**, observed **156,793** union successes (**28.99611272%**); direct **80,997**, held G&H **40,412**, Tag Call **35,384**. Separate exact-vs-sample binomial z deviations were below 1.8, combined deviation **0.040**. Seed `12051408`. The full literal-deal check uses a sample of 14 distinct card positions: initial seven, eighth drawn card, six Prizes. This is not game simulation.

For no DDE in first eight, the conditional probability that all four DDE are Prized is `C(48,2)/C(52,6)`. For the Tag Call branch, all three G&H being Prized is `C(49,3)/C(52,6)`. Both failure events cannot simultaneously occur in six Prizes, so their masses subtract without overlap. Exact counting weights each grouped initial seven by its multivariate hypergeometric multiplicity and each eighth card by its remaining physical count.

## Interpretation, validation boundaries and next gate

The model includes the paper-printed G&H two-card optional discard, Tag Call access, singleton physical card allocation, and the DDE provision of two Energy as Dragon attachment. It does **not** establish that a hand's two discard cards are strategically disposable, that Items/Supporters are unblocked, that a search is optimally sequenced, that ADP survives or completes a T2 Regidrago evolution, that Wild Blaze is available, or that the opponent answers competently. It does not include Pokégear, Tapu Lele, additional Pokémon switching, or later energy recovery. The 28.99% figure is therefore an **exact probability for a specified subset of T1 resource routes**, not a bound on the full deck's first-attack success probability.

This paper-resource result is especially useful alongside Agent12's separate strict **Regidrago-V-start** path analyses. They partition starting-Active choices and expose different setup bottlenecks. No swap or promotion of the frozen v2 60 is justified by this isolated metric. Project admission remains **29/32 authentic name/count opponent inventories, ranks 23/25/28 missing, zero competitive games and no selected final deck**.
