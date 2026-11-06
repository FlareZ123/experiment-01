# Original Aichi rank3 held Guzma after Pale Moon-GX: complete same-deal native A/B and paper-switch correction

**Agent 34 | 6 November 2026 | one selected original 60-vs-60 historical source deal, four native terminal arms.**

## Core finding

A legitimate **rank3 Guzma BUS** from the actual rank3 owner's hand on original **turn61** replaces a genuine baseline `PassTurnAction` at **root action ordinal 236**, immediately following original rank1's paid `Pale Moon-GX` response on turn60 to rank3's paid `Team Flare Grunt` turn59. Both alternative branches preserve the identical earlier genuine Store roots, original physical deck/deal, and pre-intervention course. The acting rank3 player has a usable Supporter quota and both players have a Bench.

Under *uncorrected pinned Twinleaf*, Guzma's actual switching leaves Pale Moon-GX's future Knock Out queue intact, so rank1 still gains two Prizes. Under the repository's existing reversible paper-rule switch-cleanup hook, the **same native owner-issued Guzma** removes exactly **one pending Pale Moon-GX Knock Out** from the authentic root Store as rank3's prior Defending Rotom V leaves the Active Spot. Rank1 gains **zero** of those two Prizes. This is a direct historical source demonstration that a printed, hand-held defensive Supporter line changes the paper-constrained value of the GX reply.

**The native winner stays rank3 in all four arms**, ending through rank1 deck-out. This finding changes game-mechanism correctness and residual Prize counts, while establishing no competing deck win-rate improvement.

## Full provenance

- Original **rank3 (seat0)** versus **rank1 (seat1)** exact public sixty-card lists; one original `seed=3792360798`. Pinned Twinleaf revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- Full initial physical deal SHA256 `02bb2b2e4b28d1cfc9e030e70c38f389fa37948e8c3dceb34472133f4753582a`; source-rank3 fingerprint `37ed042b42966fd5c2232d28d1e458131e0ba9e0febf14cb3ad2961710c70c46`.
- [Original rank3 Team Flare evidence](agent17-skyliner-original-rank3-teamflare-single-root-winner-reversal-20261105.md), [original paid Pale Moon counterreply audit](agent27-original-palemoon-public-audit-20261106.md), and [Agent17 source-held Guzma and paper-print analysis](agent17-pale-moon-gx-printed-vs-native-reply-veto-20261106.md).
- [New owner-only Guzma root adapter](../../simulation/twinleaf/agent34-frozen-rank3-guzma-palemoon-native.cjs), [pure custody tests](../../tests/agent34-frozen-rank3-guzma-palemoon-native.test.cjs), [four-arm source runner](../../simulation/evaluation/agent34-frozen-skyliner-guzma-palemoon-four-arms.cjs), and [default-off bridge into original runner](../../simulation/evaluation/agent2-fresh-rank1-rank3-multibasic-panel.cjs). The `agent34_skyliner_guzma_palemoon_reply` input in the **existing** manual native workflow leaves unrelated studies unchanged.
- [Existing independent target-cleanup hook](../../simulation/twinleaf/pending-end-turn-switch-cleanup.cjs). Its exact target semantics were separately [verified in two-seat compiled Store tests](agent34-palemoon-direct-gx-and-switched-target-native-20261106.md).

## Four strictly paired native outcomes

| Arm | Owner turn61 root | Paper-switch cleanup | Native terminal | Rank3 remaining Prizes | Rank1 remaining Prizes | Total actions |
| --- | --- | --- | --- | ---: | ---: | ---: |
| Original control | `PassTurnAction` | off | rank3 wins, turn90 | 6 | **4** | 331 |
| Guzma uncorrected | Genuine `PlayCardAction Guzma` | off | rank3 wins, turn72 | 6 | **4** | 279 |
| Guzma corrected | Genuine `PlayCardAction Guzma` | on | rank3 wins, turn72 | 6 | **6** | 276 |
| Repeat control | `PassTurnAction` | off | rank3 wins, turn90 | 6 | **4** | 331 |

- Both intervention entries: first replacement is `{actionOrdinal:236,turnBefore:61,playerSlot:0,action:'PlayCardAction',card:'Guzma'}`, with all original roots before index236 byte-identical in the runner's JSON comparison. `targetedGuzmaReplyAudit.ownerEligibleOffers=1` and `capturedRealStore=true` in each case.
- Original and repeated control root-action hash exactly `bb91f0bb99ce999774ffff2cb00a04c7c794c44ff4cff9fb0ab0b57c11c484e6`. Guzma uncorrected root hash `50bf2e378d4b88cb6ddc6b23b61dbb94506191a6f4e955400b2cc3b48af1a68e`; Guzma corrected hash `80a59642f47c7f53caa947a8c530ab3ae8647b4e1f3f05174268dc21c662254c`.
- The **corrected genuine Store** cleanup audit reports `removedFromRoot:1`, `removedFromSimulatedStores:0`, `playerId:101`, `benchIndex:2`, `effectsRemoved:[{type:'knock_out',attack:'Pale Moon-GX',source:'Trevenant & Dusknoir-GX SMP'}]`. Uncorrected audit reports zero removed. This validates actual follow-through to target movement, beyond a guessed owner hand or hypothetical attack graph.
- All four source original fingerprint fields match the predeclared source fingerprint; all four native runs finish with `winner:0`. Corrected final rank1 `deckRemaining:0` and rank3 `deckRemaining:11` support the same native deck-out winner, independent of the two-Prize discrepancy.

Actual reproducibility: [successful first four-arm CI 42141599137](https://github.com/FlareZ123/experiment-01/actions/runs/42141599137), archived complete JSON artifact `agent34-rank3-original-guzma-after-palemoon-four-arms` (ID **13468033759**, SHA256 **3b333bf771270e44ff350b0ea791ed5dc34f4b6879f568a3966a7c5b19ece368**). [Successful repeated CI 42142047303](https://github.com/FlareZ123/experiment-01/actions/runs/42142047303) emits the compact four-arm outcome receipt `AGENT34_GUZMA_ORIGINAL_SOURCE_SUMMARY` directly in the job logs. The source file still saves full action-ledger JSON and uploads it as an artifact.

## Limits and admission

This is a deliberately retrospective, **selected single-deal branch** using original sixties, injected owner-validated one-root options and a default-off correction for a documented paper bug. The rest of the policy remains weak: native `Night Watch` still uses attacker-controlled selection rather than the required random opponent-hand cards, winner adjudication uses native deck-out around turns72/90 rather than a verified **25-minute paper-match** clock, and general source opponent tactical strength has not been proven. No optimization win-rate inference is permitted.

The paper rule in the [advanced manual](../../resources/manual/EN_advanced_manual-2025-transcription-structured.md) section A-03 and C-03/C-05 clears effects on a Pokémon moved from Active to Bench. The old native pending queue fails to observe this, so simulations using its delayed KO after a switch are **paper-invalid**. This finding does not qualify all possible evolution, devolve, return-to-hand or KO replacement interactions; they require separate inspection.

**Admission status:** Original fixed field inventories still 29/32 (23/25/28 missing), zero competitively qualified games, no independently demonstrated 99.5% win rate. The corrected real response gives narrower but much more trustworthy tactical value evidence for the one selected historical GX situation.
