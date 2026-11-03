# Agent 13: independent raw native Quick Ball first-divergence and DCE custody audit

**3 November 2026 | 12 retained original native arms | four same-two-player-physical-deal triples | four source-root counterfactuals | no competitive games.**

## Why this is a separate result

The contemporaneous [Agent13 Quick Ball connector-domination experiment](agent13-rank5-vip-quickball-connector-domination-20261103.md) reported a source native copied-attack contrast of 5→0 in one physical context. The [new exact opening-donor census](agent13-rank5-quickball-lexical-payment-census-20261103.md) finds that the default prompt would pay Double Colorless Energy (DCE) on 12.59% of all structurally duplicate-eligible Basic-valid seven-card openings. Those facts alone do **not** show that the 5→0 collapse was caused by a DCE discard. This independent audit inspects the full original native archive to distinguish those mechanisms.

The exact artifact is [GitHub Actions successful run 41578063650](https://github.com/FlareZ123/experiment-01/actions/runs/41578063650), artifact **13204966625**, complete ZIP SHA-256 **`3e0fa808f51fa2e96cd84e1ebdddf6b7fa52b03d69dcd37de9b76d828c4cf403`**. This invocation independently downloaded the ZIP and verified its checksum, then parsed original `agent13-rank5-vip-quickball-12arm.json`, **20,248,042 bytes, SHA-256 `f0b0b0cdf4961e1296c111a28f02b88a16f59db48a2f23bf866772cec2df9e19`**. Pinned vendor revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. The native experiment used one registered original rank-5 printed sixty with source SHA-256 `a66f9b785b7fb36606229f1bf7a396892320803e7576a39f1552a7825bd74c05`.

All four distinct trial IDs match **both source and candidate opening physical fingerprints** across the control, Quick Ball root-only and full-owner-prompt treatment modes. Identical seed integers are insufficient to prove this; the archive's actual `sourceDealFingerprint` and `fullPhysicalDealFingerprint` fields match. Raw native action histories include both physical player seats, exact root ordinals, public card names and turn progression. None of the 12 arms meets paper-game or tournament-clock qualification.

## First owner action actually changed

| Original-rank5 opponent / original physical seat | First divergent action ordinal and global turn | Original-source control | Source Quick Ball treatment | Original source settled attack roots, control→full |
|---|---|---|---|---|
| Rank5 vs champion reference, original seat 1 (source goes first) | **11, T1** | Attach **Double Colorless Energy** | Play **Quick Ball** | **0→0** |
| Rank5 vs New Moon, original seat 1 (source goes first) | **11, T1** | Attach **Double Colorless Energy** | Play **Quick Ball** | **0→0** |
| Rank5 vs champion reference, original seat 0 (source goes second) | **45, T8** | **Pass** | Play **Quick Ball** | **1→4** |
| Rank5 vs New Moon, original seat 0 (source goes second) | **79, T14** | **Pass** | Play **Quick Ball** | **5→0** |

The first divergent event is matched against the **full public root ledger prefix**, including ordinal and real physical player slot. The source-first A trials have precisely the same source deal fingerprint across the two different candidate decks, but **different opposing candidate physical decks**; this table asserts full physical identity *within* each control/treatment comparison, never across distinct candidate decks.

The historical source-first first paid Quick Ball resolves a native `CHOOSE_CARD_TO_DISCARD` with **Double Colorless Energy SUM**, counts **two identical DCE before and one after the payment**, and searches **Dedenne GX UNB**. In the full-owner-prompt mode, the native transaction reports `nativePaymentChoiceAccepted:true`; Agent47's separate owner-hand handler reports accepted prompts and confirmed internal prompt postconditions (**3/3** in the champion trial, **2/2** in the New Moon trial). The independent public-discard-zone field is still `publicDiscardPostconditionVerified:false` and `paymentSourceZone:unclassified`; this remains **native selection evidence**, not full paper card-zone certification.

The specific source-owned DCE attachment roots change materially:

| Source physical context | Control DCE attachment turns | Quick Ball full-owner-prompt DCE attachment turns |
|---|---|---|
| Source-first vs champion | **T1, T3, T15** | **T1** |
| Source-first vs New Moon | **T1, T3, T15** | **T1, T53** |
| Source-second vs champion | **T36** | **T28** |
| Source-second vs New Moon | **T18, T32, T38** | **T46** |

These are native logged `PlayCardAction` roots, not proof that attachments were all retained or optimally allocated. In source-first trials, root 11 changes from **immediately attaching DCE** to **playing Quick Ball**; after the Quick Ball first discard, the source does later attach DCE in T1 at ordinal 19. The missing T3 attachment in both treatment contexts is consistent with losing one of the two physically held DCE, but shuffle order, alternate draws, other actions and the opponent also change. A precise isolated payment-only causal estimate would require a paired native fork from the identical prompt state.

## The adverse 5→0 case has a different mechanism

In the **source-second New Moon** case, the full-owner-prompt treatment Quick Ball payments are **Trainers' Mail ROS on T14** and **Ultra Ball MEG on T20**, searching Dedenne GX and Genesect V respectively. They are **not DCE payments**. Source DCE attachment roots change from **T18/T32/T38** in control to **T46** in full treatment. The control logs source Cross Fusion Strike attacks at **T32, T36, T40, T44, T48**; the full treatment logs zero such attack roots within its 260-action cap. The Quick Ball root-only treatment also logs zero, despite paying **Field Blower GRI** and **Lost Vacuum LOR** at T14/T16.

Therefore **a DCE-reserving prompt policy alone cannot be credited with preventing the 5→0 result**, because neither harmful treatment directly discarded a DCE. Search-target choice, root preemption, deck-shuffle/draw trajectory, resulting Bench occupation, attachment timing or other sequencing interactions require controlled follow-up. The root-only and full-owner-prompt modes agree on the zero-attack count despite different native paid Trainer cards and their second Quick Ball timing, an important constraint against overattributing the loss to the discarded Trainer identity.

The opposite-sign **1→4** source attack result against champion reference is preserved, so simply disabling all Quick Ball roots also discards a real development witness. The rank5 source already had zero attacks in both source-first examples. All results are conditional on four retrospective physical contexts, incomplete full paper engine fidelity, uncensored competitive play and an untimed bot whose opponent response can omit legal counterplay.

## Reproducible read-only logic

[Read-only archive comparator](../../simulation/evaluation/agent13-rank5-quickball-raw-archive-audit.cjs), original blob `87a0e675cf46099dfe696d78832bf62bb4d73a1c`, takes the **retained original JSON** as input and produces source/combined physical equality checks, exact first public-root divergence, owner-specific native Quick Ball payment records, DCE attachment roots, source AttackActions and raw native finish/cap disposition. It rejects nonmatching actual physical openings. [Six pure tests](../../tests/agent13-rank5-quickball-raw-archive-audit.test.cjs) verify synthetic 4×3 archive matching, first divergence, absence of observations, source and candidate physical mismatch rejection, trial identity drift and terminal/censored retention. **6/6 executed successfully in isolated JavaScript V8 with exact fetched GitHub source and injected assertion dependencies.** The full raw archive was independently decoded and verified with Python; the *new CJS reader has not been executed against the original 20MB archive in CI*, so do not imply a complete native or CI rerun occurred.

## Next distinguishing experiment

Register a **true same-store-deal payment-choice fork** at first owner source T1 with two DCE held: incumbent paid DCE versus a *physically legal* alternative if one exists in that exact owner's hand, after checking every card's strategic retention and subsequent target/search outcomes. Follow to actual attached Energy/settled attack and opponent continuation. Separately register a **T14 root/no-root and Dedenne-target response fork** for the source-second New Moon negative case, preserving the original Pass control and the T14/T20 QB treatment. Avoid conflating those interventions. Any promotion to a general symmetric policy requires native chosen root, complete payment/target custody, owner-information discipline, meaningful counterplay and fresh predeclared deals on both seats.

**Global qualification unchanged:** 29/32 authenticated Aichi source 60s, ranks 23/25/28 still unverified, zero competitively qualified games, no fixed winning 60 selected, no evidence of a 99.5% field rate.
