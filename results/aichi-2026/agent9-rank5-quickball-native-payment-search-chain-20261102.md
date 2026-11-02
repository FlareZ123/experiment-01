# Rank-5 Quick Ball native payment and search chains, same physical deals

**Agent 9 | 2 November 2026 | archival original-Store inspection | all competitive games unqualified**

## Evidence and scope

Independently inspected the **complete** original native ZIP artifact **13130330602**, GitHub Actions run **41419769572**, SHA256 `892f0a18139604d75f3f48f6402cc20747fff0fca87b34fd062f239e68a46467`. The archive is the unchanged, registered same-revision Quick Ball comparison in [the previous Agent 9 report](agent9-rank5-quickball-same-revision-negative-regression-20261102.md). It retains 16 native attempts: two policy modes, four physical trial deals, OFF/ON paired. Exact full-deal equality holds for **8/8** OFF/ON pairings. Both policy modes reuse the same four trial seeds; these are not eight independent deals.

Authenticated original rank-5 Mew/Genesect source 60 SHA256 `a66f9b785b7fb36606229f1bf7a396892320803e7576a39f1552a7825bd74c05`; pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. This report investigates already-run native prompts, and does not claim any fresh game or new winning deck.

## Original source Quick Ball payment and Basic-search selections

Each row below occurred **identically in both policy modes**. It reports exact strings from original `nativePromptChoices.events` during the native Quick Ball root prompt interval. The first prompt had `nativePromptMin=1`, `nativePromptMax=1` and `sourceZone='unclassified'`, so the label **payment selection** is tied to this Quick Ball prompt sequence. The second prompt had `sourceZone='deck'` and `nativePromptMax=1`; its selected card is the search result. The `nativeAcceptedTargetSidecar.events` independently confirms every corresponding source-owned Quick Ball `PlayCardAction` was accepted by the real Store.

| Original physical trial | Source seat | Quick Ball root ordinal, global turn | Payment selection | Basic search selection |
| --- | ---: | --- | --- | --- |
| A / reference | 1 | 41, turn 6 | Muscle Band XY | Dedenne GX UNB |
| A / New Moon | 1 | 40, turn 8 | Muscle Band XY | Dedenne GX UNB |
| A / New Moon | 1 | 81, turn 18 | Guzma BUS | Genesect V FST |
| A / New Moon | 1 | 132, turn 30 | Karen XYP | Genesect V FST |
| B / reference | 0 | 39, turn 8 | Double Colorless Energy SUM | Crobat V DAA |
| B / New Moon | 0 | 40, turn 8 | Double Colorless Energy SUM | Crobat V DAA |
| B / New Moon | 0 | 92, turn 22 | Secret Box TWM | Dedenne GX UNB |

One further accepted treatment Quick Ball occurred on **candidate** seat 0, A/reference, root ordinal 17 / global turn 1. Its prompt selected **Mysterious Treasure FLI** as payment and **Dialga-GX UPR** from the candidate deck. It preceded the original source's first normal turn. Thus the A/reference source's eventual loss of attacks cannot be attributed to a source-only change.

Totals across the two duplicated modes: **14** accepted original-source Quick Ball plays with matching two-prompt selection pairs, and **2** accepted candidate Quick Ball plays. Among distinct original-source native payment examples are Double Colorless Energy, Secret Box, Guzma, Karen and Muscle Band. Whether each discard was strategically costly depends on the actual state, matchup, and alternative play.

## Downstream observed root outcomes

| Unique physical trial | Source attacks OFF | Source attacks ON | Source Mew VMAX evolutions OFF | ON |
| --- | ---: | ---: | ---: | ---: |
| A / reference | 4 | 0 | 2 | 0 |
| A / New Moon | 2 | 0 | 1 | 1 |
| B / reference | 0 | 0 | 0 | 0 |
| B / New Moon | 0 | 0 | 0 | 0 |

These four rows recur in both frozen policy modes, giving the previously published **12 to 0** native source attack count and **0 to 14** source Quick Ball acceptance count across the eight paired mode/trial records. The B trials had no source attacks even before the intervention. The measurements do not establish that paying a particular card caused attack failure. Quick Ball can consume a limited Energy, ACE SPEC or tactical Trainer, and its searched Basic may compete with other uses of that hand and Bench. The exact future turn sequence and the other actor's actions matter.

## Reproduction protocol

Unzip artifact `13130330602` and parse `agent9-rank5-quickball-controlled-pair-16arm.json`. For each `treatment.modes[mode].attempts[]`, use `rawNativeRow.sourceSeat` and the original Store `rootActionLedger`. Find sidecar events with `storeAccepted===true`, `action==='PlayCardAction'` and `declared.ownerHandPrinting==='Quick Ball FST'`; match their `rootActionOrdinal` and `playerSlot` to the actor's subsequent `nativePromptChoices.events` until the actor's next non-prompt root. Assert one `ChooseCardsPrompt` with `sourceZone='unclassified'` and one with `sourceZone='deck'`, each with one selected printing. The source-seat filter gives seven Quick Ball chains per mode; the candidate-seat filter gives one. Independently count `AttackAction` and `PlayCardAction` Mew VMAX roots in matched OFF/ON `rootActionLedger`. The previous registered report documents source/full deal fingerprints and outcome categories.

**Research implication:** An owner-visible Quick Ball proposer needs a downstream line-quality evaluation, including discard choice, chosen Basic, subsequent evolution and attack outcomes. A four-scope OFF / source-only / candidate-only / both causal comparison is still warranted to isolate whose newly enabled actions alter outcomes. Source-only and candidate-only are diagnostic conditions, not an identity-neutral competition policy.

**Field qualification:** 29/32 exact Aichi original source sixties authenticated; ranks 23, 25, 28 missing. Zero competitively qualified games and no validated fixed 60 beating the field at 99.5%.
