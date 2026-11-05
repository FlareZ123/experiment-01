# Original recipient Basic placements and paid-retreat reserve opportunities

**Agent 6, 5 November 2026, 20:03 UTC.** Preregistered before native execution in [the original paid-reserve registration](../registrations/agent6-original-recipient-paid-dialga-reserve-window-20261105.md). This is a retrospective, owner-only **read-only opportunity audit** on the historical original rank3 Snorlax versus rank1 Shadow Rider cohort. No alternative card placement, retreat, attack, or opponent reply was executed.

## Research question

In the one stranded Dialga-GX UPR scenario that truly had effective **3 Colorless** native retreat fee, were there genuine, physically accepted original Basic Energy placements on other Pokémon for which placing the held Basic onto Active would instead nominally complete the paid retreat fee, with at least one already Basic-funded positive Bench attack? This differs from the other stranded Dialga case, where [Agent2 proved Skyliner zero effective retreat cost](../../methodology/agent2-original-native-skyliner-zero-retreat-44-pass-correction-20261105.md).

## Exact registered setup

- Original rank3 source SHA256: `72c61d594eee5ee1d593b738af627c3ab8f3a38d1a5f29695ff39c8c09c2264f`; original rank1 reference SHA256: `de8b454ce520b9f6b8db9395c5bea4e8c09cd3958b8e78159f704ba5aec71311`.
- Twinleaf revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, unchanged. Four historical seeds `3565472974,130758722,3792360798,1654918696`, each with original rank3 source in physical seats 0 and 1, eight original games.
- Original Basic recipient ON and paid-retreat override OFF in **both A and B**. B merely wraps Store.dispatch to inspect an original Basic Energy `PlayCardAction` without returning any observation to bot decisions; a read-only authoritative `CheckRetreatCostEffect` preflight observes the existing effective native fee. The original selected Basic recipient and physical attached printing are independently confirmed after native Store dispatch.
- 16 native games, with A/B exact same physical opening source/full deal, first seat, native root ledger, accepted-target sidecar, winner/end reason/action count, final public board, and original actor counters. Every native error and cap would fail the strict parity gate. `simulation/twinleaf/agent6-accepted-basic-retreat-reserve-observer.cjs`, `simulation/evaluation/agent6-original-recipient-paid-reserve-native.cjs`, ten pure tests `tests/agent6-original-recipient-paid-reserve-native.test.cjs`.
- [Manual native CI42098992165](https://github.com/FlareZ123/experiment-01/actions/runs/42098992165), checkout `c1b567ec51fd353d11da851464cc7c0894aa3119`, completed **SUCCESS**, **10/10** focused pure tests, **16/16** native-terminal games, 8/8 physical/root/target/terminal A/B parity. [Complete JSON artifact 13449970015](https://github.com/FlareZ123/experiment-01/actions/runs/42098992165/artifacts/13449970015), ZIP SHA256 `61337e5a89cfce2579453eb54a1d2ac220e6f6dc7525c9c386d009886a717bc4`. `AGENT6_ORIGINAL_PAID_RESERVE_SUMMARY` CI log preserves aggregate, all eight source seed/seat groups, and complete five candidate observations.

## All 72 physically accepted Basic Energy attachments

Every candidate in this table is an actual original `PlayCardAction` physically witnessed to attach the correct Basic Energy to its original recipient. Eligibility refers to an unexecuted hypothetical alternative using the same Basic elsewhere.

| Sequential gate on original Basic attachment | Independently passed | Passed all previous gates too | First failed |
| --- | ---: | ---: | ---: |
| Physically accepted onto Bench | 45 | 45 | 27 |
| Current native fee positive and all Colorless | 29 | 15 | 30 |
| Active all attached Basic, exactly one Energy short | 16 | 11 | 4 |
| Owner still allowed to Retreat this turn | 68 | 11 | 0 |
| At least one Basic-funded, fixed-positive printed Bench attack | 25 | **5** | 6 |
| **Total original physically accepted Basic plays** | **72** | **5 nominal alternatives** | **67 rejected** |

All 72/72 original Basic `PlayCardAction` roots were actually accepted and physically witnessed. Physical seat0 supplied 41 original Basic placements (27 Bench, zero nominal alternatives), physical seat1 supplied 31 (18 Bench, five nominal alternatives). Independent gates overlap and cannot be multiplied to estimate an opportunity rate.

### Five exact owner-visible alternative-payment windows

All **five** are repeated decision states within **one** original native game, seed `3565472974`, original rank3 source physical seat0 and rank1 owner physical seat1. Original rank1 Active was `Dialga-GX UPR`, already bearing **two Basic Psychic Energy** in every such state; actual native effective retreat fee was **three Colorless** each time, with Retreat unused. Every original chosen card was `Psychic Energy MEE`, physically attached to the Bench. Bench index2 `Shadow Rider Calyrex V CRE` had a nominally paid `Shadow Mist`, fixed **10 printed damage**. The opposing Active had **190 remaining HP** in all five states.

| Original global turn | Accepted Store dispatch ordinal | Actual Bench recipient index | Hypothetical Active payment shortfall |
| ---: | ---: | ---: | ---: |
| 20 | 83 | 3 | One Basic Energy |
| 34 | 132 | 4 | One Basic Energy |
| 44 | 163 | 0 | One Basic Energy |
| 50 | 188 | 1 | One Basic Energy |
| 56 | 212 | 1 | One Basic Energy |

The observed original placements are real. Redirecting an Energy to Dialga has **never** been executed in these tests, so paper legality of the altered recipient and any actual paid `RetreatAction`, final damage, Prize changes, or opponent reply remain unresolved. `Shadow Mist`'s **10 printed damage** is an extremely weak nominal attack into a 190-HP target; other effects or matchup utility require separate card/rules and Store checks. The proposed alternative would additionally sacrifice a real Bench placement, changing future Energy and attack availability. Five opportunities in one game are correlated and do not establish any independent trial success count.

## Methodological result and priority

This shows a concrete original resource-allocation frontier that the earlier Pass-only multi-Basic paid-retreat planner could never see. The current owner-policy accepts a Basic Bench attachment even though sending the same resource to a stranded Active could nominally unlock a mobility option; whether that option is worth the Bench Energy and the once-turn Retreat depends on subsequent attack, board and opponent replies.

A useful next step is owner-public opportunity-cost inspection of the five authentic roots. Does an actual same-turn paid `Shadow Mist` attack materially help against the real source Active, or does it disrupt a much stronger later Bench attack? Only after resolving that question should a reversible, pre-registered targeted source-independent intervention be tested on exact original physical deals with complete native fee, promotion, attack and opponent reply receipts. Avoid treating `one Basic short` alone as a reason to retarget.

All evidence here remains **developmental**. No competitively qualified game is produced, no fixed 60 is selected, the complete opponent field has only 29/32 authenticated original lists (ranks 23,25,28 missing), the paper rules engine and 25-minute clock are incompletely validated, and there is **no demonstration of 99.5% win rate**.
