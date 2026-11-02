# A legal instant-win Ability fails a necessary condition against 23 original Aichi 60s

**Agent 18 | 2 November 2026 | source-locked deck-inventory theorem; no native games.**

## Fixed-60 decision question

Can the paper Expanded-legal Unown LOT 92 / sm8-92, with the **MISSING** Ability, be the primary universal victory axis of an unchanged candidate deck against the exact Aichi Open League 2026 Top 32?

The supplied card text says an Active Unown can win if its opponent has **at least 12 Supporter cards in the Lost Zone**. [Limitless LOT 92](https://limitlesstcg.com/cards/en/lot/92) reports this specific printing legal for both English and Japanese Expanded, unlike the banned LOT 90 DAMAGE and LOT 91 HAND Unown. Legality is print-specific; neither unrelated Unown nor the two banned instant-win printings are substitutes.

## Necessary inventory theorem

In ordinary paper games, a card remains owned by its original player. Even if *every* physical Supporter in an opposing published 60-card deck reaches that opponent's Lost Zone, the number of those Supporters cannot exceed the initial quantity s of Supporter cards in the 60. Therefore:

    s < 12  =>  opponent's Supporters in their Lost Zone < 12
            =>  Unown LOT 92's MISSING Ability cannot produce a victory.

This is a **hard necessary-condition exclusion**, independent of Prize distribution, player policy, action costs, turn count, Ability lock, search, or how efficiently the candidate moves opponents' discarded cards into the Lost Zone. It assumes no rule effect introduces entirely new physical Supporter cards to that opponent's ownership; known paper TCG effects move existing physical cards.

The reverse is **not** an existence proof. An opponent with 12+ Supporters may play only a fraction, recover discarded Supporters, keep them in hand or deck, or lock the candidate's Abilities. The candidate must actually move at least 12 to the opponent's Lost Zone, maintain Unown Active and keep its Ability functional, all before losing to opposing wins or the official match clock.

## Original field screen

The original source list [full-decklists.json](../aichi-2026/full-decklists.json) contains 29 authenticated 60-card opponents and explicit absent ranks **23, 25, 28**. The [independently prepared 29-source Supporter inventory](../statistics/agent18-original29-valid-basic-opening-supporter-priors-20261101.md) classifies printings with supplied card metadata. The numbers below use that exact 29-row inventory; no conjectural missing opponent 60 was substituted.

| Outcome of Supporter-quantity prerequisite | Ranks, copies and archetypes |
| --- | --- |
| **At least 12 Supporters**; only quantity prerequisite satisfied | **2** (15, Vileplume Control), **3** (21, Snorlax Stall), **6** (21, Iron Thorns), **7** (21, Snorlax Stall), **24** (24, Iron Thorns), **29** (21, Iron Thorns) |
| **Fewer than 12 Supporters**, MISSING impossible | **1, 4, 5, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 26, 27, 30, 31, 32** |
| Unknown source inventory | **23, 25, 28** |

That is **23/29** authenticated original 60s incompatible with a MISSING-only victory, even under a maximally favorable hypothetical opponent Lost Zone. The six potentially qualifying sources represent **three distinct archetypes**. This field screen cannot extrapolate a percentage to the three missing original 60s or certify actual game wins against the six others.

A more conservative immediate inference is independent of the missing lists: no valid future recovery of ranks 23/25/28 could change the fact that 23 authenticated members of the fixed 32-deck target already fail the printed condition. Thus, as a *sole* victory plan, MISSING is decisively unsuitable for the requested fixed field. It could be a situational backup or a source-targeted experiment, subject to actual action costs and ability-lock interactions.

## Reproduction and integration

The new [fail-closed field ceiling program](../../scripts/agent18-missing-field-ceiling.cjs) resolves published original card names via the repository's existing printed-Trainer subtype index, enforces each 60-card count, checks sm8-92's actual supplied Ability text, and reports all 29 ranks with exact Supporter counts and missing ranks explicitly excluded. Its pure [five-regression test](../../tests/agent18-missing-field-ceiling.test.cjs) covers 11 versus 12 Supporters, type partition, missing-list exclusion, duplicate and malformed sources. **Five of five local Node tests passed**; full checked-out source-corpus integration and native Store games have not been executed for this new program, so retain that verification distinction.

This is a direct **deck-decision prefilter**, not another independent game simulator or CI workflow. If anyone proposes a candidate whose only route to victory is Unown MISSING, the six potential quantity-compatible original sources do not rescue its 23 known hard failures. For a hybrid candidate, evaluate its actual alternate plan against those 23 ranks and the full 32 individually before raising it above the champion benchmark. No current single-deck nomination changes from this analysis.

**Status:** 29/32 exact published 60s, zero competitively qualified games; no established 99.5% game win rate.
