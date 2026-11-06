# First Night Watch entropy collision: actual original native archive corroboration

**Agent 48 | 6 November 2026 | independent raw-archive verification of Agent43's previously executed registered sensitivity.** This is a read-only deterministic-seed / original-game custody audit, not a new randomized match or competitive claim.

## Authentic execution and source

Agent43's registered original Skyliner positive-deal paper-random sensitivity ran **before** my theoretical seed audit. The successful dedicated native step is in [CI42134459451](https://github.com/FlareZ123/experiment-01/actions/runs/42134459451), original artifact [13464654054](https://github.com/FlareZ123/experiment-01/actions/runs/42134459451/artifacts/13464654054), commit `8539b18f91ea614af2f8ad0198193ed881f53cc4`, pinned engine `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Entire unrelated workflow eventually FAILED on the separate stale Guzma test; the original Night Watch sensitivity step itself succeeded. A later [CI42135169470](https://github.com/FlareZ123/experiment-01/actions/runs/42135169470) passed staged tests but SKIPPED its optional original sensitivity step. These are **different run histories**.

I independently downloaded the original first artifact. ZIP SHA256 `8a6b3658283ded72dfff93ba89adcb9ca0e11eff4a6b4b8b9f6fb3d892d1c25e`; single member `agent43-nightwatch-original-skyliner-random.json`, **408,283 bytes**, SHA256 `313fb7f87e7820688dd7f154dfb07c94b66d9a0de5ab2966b996c8ea4c52d768`. Original two-player deal SHA `02bb2b2e4b28d1cfc9e030e70c38f389fa37948e8c3dceb34472133f4753582a`, original rank3 source-deal SHA `37ed042b42966fd5c2232d28d1e458131e0ba9e0febf14cb3ad2961710c70c46`; source seed `3792360798`, rank3 seat0, rank1 seat1, unchanged two published 60s. The downloaded archive self-reports native terminal for all five original baseline/treatment arms.

## Actual native sampled hand positions

The first corrected direct `Night Watch` prompt is owner seat1, native turn58, prompt ID141, **opponent hand size29**. Its four `randomSamples[0].sampledIndices` correspond EXACTLY to the independent pinned xorshift first-draw oracle in [the previous theoretical report](agent48-nightwatch-adjacent-entropy-first-selection-20261106.md):

| Registered entropy seed | First native selected two physical positions |
| --- | --- |
| 20261106 | **[3,4]** |
| 20261107 | **[3,2]** |
| 20261108 | **[3,0]** |
| 20261109 | **[3,0]** |

All four select physical first position **3** for the real original hand29; only **three distinct two-card pairs** arise. The previously proved stronger universal **same first position for every legal hand size1..60** remains a property of *the first PRNG sample* of those four consecutive seeds. It does **not** extend to every subsequent call.

The complete 24 prompt records group into six original attack turns. Their hand sizes are **29,27,25,24,23,21**, with first-index choice diversity by turn equal to **1,4,4,4,4,4** out of four arms. The next five first-index arrays are:

| Turn | Hand | First indices across four arms |
| --- | ---: | --- |
| 60 | 27 | [10,26,3,13] |
| 62 | 25 | [18,5,15,1] |
| 64 | 24 | [5,2,1,4] |
| 66 | 23 | [12,22,14,19] |
| 68 | 21 | [7,16,3,14] |

All 24 native samples report `ownerHiddenCardNamesReadForDecision:false`, `nativePromptValidated:true`; every corrected arm reports patch restoration. The original baseline and all four corrected arms end at turn68 with native rank1 seat1 taking final Prizes, six rank1 attack declarations, 291 root actions, and identical *public-action* root SHA `5acd02e493800a041b5dedf4a9efa6a0a2de44eece25efc5424f5dda749c3acd`. An identical root SHA **does not certify identical hidden hands, privately sampled selections or whole physical game states**. This is variation under one passive and already selected original source-deal bot, so **0 new competitively qualified games**.

## Decision consequence

- **Verified:** first physical hand-card index across the four consecutive diagnostic seeds is deterministic-coupled, and this occurred in the actually executed first original native 29-card prompt. Four arm labels overstate the diversity of the first-card choice, despite ample diversity in later prompts.
- **Separately observed by Agent43:** 4/4 corrected outcomes still have the same native winner. The result is conditional on the original weak opponent policy; [Agent17's physically accepted Team Flare Grunt opponent response](agent17-skyliner-original-rank3-teamflare-single-root-winner-reversal-20261105.md) already flipped this original-deal winner under a different one-root intervention.
- **Required to test new seed protocol:** preserve the original four registered streams and results, register a *distinct* new treatment before execution, and archive full prompt hand sizes/selected indices, source/full deal, resulting physical actions and opponent replies. The SHA-separated seed proposal in the prior report is one such candidate; no actual new seeded rerun or independence inference is claimed.

**Benchmark unchanged:** 29/32 authenticated original card-name/count 60s (ranks23,25,28 missing), no selected final fixed 60, zero competitive-qualified games, no proof of a 99.5% win rate.
