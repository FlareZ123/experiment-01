# ADP v2: physically searching top seven for a second-turn Thorton

**Agent 12 | 3 November 2026 | exact joint-Prize and search-probability calculation; no native-game outcomes.**

## Fixed-list question and decision

The unchanged [Agent5 ADP / Thorton / Regidrago v2 candidate](candidates/agent5-adp-thorton-regidrago-60-v2.json) includes **Pokégear 3.0 SV1 186 ×2**. The previously established first-own-turn **non-ADP Active → Battle Compressor → Thorton replacing Active with ADP → Double Dragon Energy → enhanced Altered Creation-GX** route consumed the first Thorton, leaving a second Thorton or a way to retrieve it necessary for a turn-two Regidrago VSTAR Apex Dragon.

The first two direct-hand calculations already allow the other three Thorton copies, the singleton VS Seeker returning the first Thorton, and four Ultra Ball searching Regidrago VSTAR when physically affordable. This extension tests whether one or both **already registered Pokégear 3.0** can reveal and recover a new Thorton from the top seven shuffled deck cards on turn two without modifying any deck counts.

**Exact result:** for the same unusually strict opening and one natural draw each turn, adding the two existing Pokégear raises the full physical T1-GX/T2-Apex setup opportunity from **0.159943409900%** to **0.198681171853%** of Basic-valid opening seven-card hands. The incremental contribution is **0.038737761952 percentage points**, or about 24.22% relative to the previous direct-hand and Ultra Ball routes. Conditional on the exact narrow first-GX event, **6.973937656%** have this expanded physical T2 resource opportunity.

These rates describe playable-card *opportunity under stated assumptions*, not observed card choices, a settled native attack, legal play under lock or a game win.

## Precisely defined physical turn and support channels

The T1 setup requires a Basic-valid seven with **no ADP**, another Basic selected Active, and at least one each of DDE, Battle Compressor, and Thorton in the first eight. Six joint Prize cards must leave at least one ADP and Regidrago V and the singleton M Charizard-EX still in the deck. Battle Compressor then discards exactly those three targets, T1 Thorton replaces the original Active with ADP, the held DDE is manually attached to the Dragon-type ADP and enhanced Altered Creation-GX is declared. T1 has therefore spent its Supporter.

T2 has one ordinary natural draw from the **43-card deck after Compressor**. The hand must have one Basic Grass/Fire for the manual attachment and a VSTAR held, or a physically payable Ultra Ball with at least one VSTAR unprized in the deck. The Supporter access route is, in priority order: (1) a second Thorton already held/drawn, (2) the held/drawn VS Seeker retrieving the used Thorton, or (3) one or two held/drawn Pokégear playing as Items to reveal a surviving Thorton among their top-seven choices. In route 3, the deck after the ordinary T2 draw has **42 cards**. Pokégear chooses a real Thorton from the top seven when present, then shuffles the remaining revealed cards back into the deck. On a failed first Gear, this makes a second independent random top-seven trial when a second Gear exists.

Five physical hand cards remain at the start of T2 after four T1 resource expenditures and the T2 natural draw. A successful Gear costs one Item and retrieves one Supporter, so it does not reduce this count. The T2 Ultra Ball line can keep the recovered Thorton and Basic Energy while discarding two *other physical* hand cards. This shows sufficient **physical card count** but does not prove strategic acceptability of those discards (DCI), Item access, bench geometry, desired evolution legality under game effects, or attack settlement.

The event excludes all additional draw, alternate search, source actions, bonus mulligan cards, first-turn restrictions or locks, post-GX DDE removal and any damage to Active ADP. It does **not** upper-bound all skilled or realistic two-turn setup sequences.

## Exact enumeration

The [manifest-SHA-locked Python enumerator](../../scripts/agent12_adp_pokegear_exact_supporter.py) partitions the unchanged 60 into `[ADP2, RegV3, other Basic2, DDE4, Compressor4, Thorton4, VS Seeker1, VSTAR3, Basic Energy7, Ultra Ball4, M Charizard1, Pokégear2, other23]`.

It enumerates all Basic-valid opening seven category vectors with integer multivariate weights, the ordinary eighth draw, the joint six Prize cards and each T2 ninth draw from the real post-Compressor 43-card deck. It removes one each of the three exact Compressor targets before determining a legal ninth draw. When VSTAR must be fetched with Ultra Ball, the Prize enumeration also requires a real surviving deck VSTAR. For each possible number of physically Prized Thortons, the remaining deck-Thorton count `t` determines the probability that `g` independently played Gear cards find at least one Thorton among a uniformly shuffled 42-card deck:

```text
P(at least one Gear success | t,g)
  = 1 - [C(42-t, 7) / C(42, 7)]^g,  g ∈ {1,2}
```

The formula requires the Gear look to shuffle its nonchosen cards back after each attempt. It does not treat the theoretical presence of any Thorton in deck as equivalent to finding one in seven cards. The complete exact result uses integer numerators with `C(42,7)^2 = 727830181675584` as a common probability denominator for 1- and 2-Gear cases. All earlier opening and non-Gear numerical invariants remain independently asserted.

| Physically available T2 resource channels after same T1 | Exact conditional probability |
| --- | ---: |
| Second Thorton, held VSTAR, Basic Energy | **0.050067729202%** |
| Add VS Seeker returning first Thorton | **0.075817606841%** |
| Add physically payable Ultra Ball for VSTAR | **0.159943409900%** |
| Add one/two top-seven Pokégear searches for a deck Thorton | **0.198681171853%** |

Exact joint numerator and denominator of the final result:

```text
15569862465355492224445033663872
----------------------------------
7836606921614801887896666834124800
```

A separate physically shuffled Monte Carlo was conducted using 1,000,000 uniformly sampled initial decks (seed `12122025`) with actual seven, six Prize, eighth, three Compressor removals, T2 ninth draw and one/two randomized top-seven Gear views. It observed **600,988 valid starting sevens**, **17,309 T1 physical opportunities**, **950 completed direct T2 configurations**, and **1,203 Gear-inclusive T2 completions**. Among valid openings, empirical Gear-inclusive **0.20017%** agrees with exact **0.19868%** within sampling error. A separate seeded 500,000-deal audit observed **583 completions / 300,328 valid openings**, again compatible. These checks do not simulate decisions or opponent games.

## Research implications and next admission test

This extension identifies a genuine marginal T2 retrieval mechanism within the already fixed list. It raises a previously tiny direct-hand subset by almost one quarter, while even the inclusive strict two-turn line remains **0.19868%** before opponent actions, Item/Supporter contention, lock effects, HP-change hazards and paper game-clock limits. It cannot determine the candidate's actual strength, and it is not a justification to remove or add Pokégear without evaluating displaced cards and the rest of the game.

The next useful native test is selected full owner sequence under *real original-source physical deals*, including the actual T2 Pokégear Item root, seven-card selection prompt, returned physical Thorton, payment and evolution constraints, Regidrago attack/Prize outcome and a competent source reply. Include rank6 Special Energy removal and rank8 Temple/Item-lock disruption. Keep the source actual initial-deal fingerprint and the unchanged candidate 60. No isolated mathematical opportunity is eligible to count as a competitively qualified win.

**Benchmark status:** 29/32 authenticated original 60s, missing ranks 23/25/28, zero competitively qualified games, no nominated best fixed 60 and no demonstrated 99.5% field win rate.


## Executed independent CI reproduction

**SUCCESS:** Manual opt-in GitHub Actions [run 41578974062](https://github.com/FlareZ123/experiment-01/actions/runs/41578974062), workflow head `05c733918171d64fd9caf8976edd2d455134efe5`, pinned repository source `main`. The isolated `adp-strict-physical` job started 04:35:05 UTC and completed successfully at 04:35:12 UTC, with the two exact Python scripts and original29 printed-HP Node SFT each explicitly recorded **success** by the workflow runner. Standard card coverage and vendor card-manager jobs were deliberately **skipped**, requiring no Twinleaf compile or simulation. The Python sources assert their exact integer numerators, denominators and frozen candidate identity; the JS SFT asserts full 29×60 manifest and printed HP findings. This proves these committed scripts execute successfully under pinned checkout and common runners; it does not make the underlying model a competitive-game oracle.

## Correction: failed-first second Pokégear versus Ultra Ball physical payment (CI 41580841957)

The earlier inclusive calculation mistakenly counted the *second* Pokégear succeeding after the *first* failed when the T2 hand also required Ultra Ball to find VSTAR. That consumes two Item cards before obtaining Thorton, leaving **four cards** including Thorton, Basic Energy and Ultra Ball, therefore **only one other discard card**; Ultra Ball requires two. Under the exact one-natural-draw and zero-other-card-generation model, this route is **unpayable**. The corrected exact enumerator admits only the **first Gear look** when Ultra Ball is required; it admits both sequential looks when VSTAR is already in hand. Corrected probability **0.1986811718527179%** of Basic-valid sevens, exact numerator `15569862465355492224445033663872`, unchanged denominator `7836606921614801887896666834124800`; contribution beyond direct+VS+Ultra **0.03873776195222498 percentage points**. [GitHub Actions 41580841957](https://github.com/FlareZ123/experiment-01/actions/runs/41580841957) ran the corrected Python and other card tests successfully. Earlier Monte Carlo tallies treated this particular unaffordable two-Gear-then-Ultra branch as successful; do **not** use those counts as an independent validation of the new exact fraction. The raw 0.20017% sample remains historical flawed physical-access evidence, now superseded by the explicit card-payment rule. No competitive game evidence changes.
