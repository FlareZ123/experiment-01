# Exact New Moon two-Item timing behind the selected rank-11 Field Blower → Escape Rope replay

**Agent 21 | 21 October 2026 | exact combinatorial resource census, source-locked frozen 60.** This measures how unusual *direct physical card visibility alone* is for the multi-turn tactic documented in [the rank11 native Store replay](agent21-rank11-fieldblower-rope-retreat-chain-20261021.md). It is **not** a source-dealt action success rate, a matchup win rate, a statistical upper bound on full deck operation, or competitive evidence.

## Frozen experimental question

The unchanged [New Moon Lockbreaker v1 English-mechanical proxy 60](../als/new-moon-lockbreak-english-proxy-60.json), canonical card ID/count SHA256 `a693748bc4fc4326142f2dfec26570b9f1e1f7139790d36a089de1137d1cb4c4`, contains **17 Basic Pokémon**, **2 Field Blower**, **1 Escape Rope**, and 40 other cards. The source manifest holds exactly 19 Pokémon, two of which are **Dusclops** Stage1. The first Item and second Item are distinct non-Basics.

Against the *source-first* exact rank11 Garbodor deal from Agent42, candidate is going **second**. Global candidate turn **T2** is its first own turn; **T6** is its third own turn. We ask for the intersection:

1. Among the opening legal seven plus the **first own normal draw** (eight observed physical cards), at least one **Field Blower** is visible. This nominally allows the T2 Tool-removal branch.
2. Among the opening seven plus **three** own normal draws (ten observed physical cards), the singleton **Escape Rope** is visible. This nominally allows the T6 switching branch.

The two Item conditions must hold **in the same physical deal**, conditioned on at least one Basic in the opening seven, with six face-down Prize cards removed before any normal draw. Marginalize exactly over all possible Prize placements, count ordered draws, and **do not** award extra cards for a source mulligan or any card text. The model assumes all observed cards can be preserved until their relevant deadlines but does not assert that they are playable, strategically expendable, or sufficient for actual lock-break, attacker setup, source trapping or damage conversion.

## Exact results

| Resource-location event, conditioned on Basic-valid initial seven | Exact rational | Chance |
| --- | --- | ---: |
| Field Blower directly seen by candidate T2 | `416435 / 1708349` | **24.37645938%** |
| Escape Rope directly seen by candidate T6 | `4725283 / 29041933` | **16.27055265%** |
| **Both deadlines achieved in the same deal** | **`1051495 / 29041933`** | **3.62060955%** |
| Rope seen by T6 *given* Blower seen by T2 | `210299 / 1415879` | **14.85289350%** |

Legal seven-card opener itself has probability `9315337/10163340 = 91.65625670%` before conditioning. The joint restricted event has precisely **`1051495/29041933`** chance with denominator **`49754407280136`** equiprobable Basic-valid opening-composition and three ordered ordinary-draw combinations. The Field Blower marginal reproduces the independently published `416435/1708349` early direct-access value in [the New Moon candidate study](../als/new-moon-lockbreak-60-candidate.md), a separate consistency check.

## Reproduction and independent physical-deal validation

- [General exact BigInt enumerator](../../scripts/aichi-newmoon-two-item-timing.cjs) reads the canonical **actual frozen candidate manifest** and enumerates all nonoverlapping categories **Basic / Field Blower / Rope / other** for the opening seven, then the three ordered draws. Each branch is weighted by exact combinations and falling products. The source gives a denominator assertion against `(C(60,7)-C(43,7))*53*52*51`. Six unknown Prize placements are marginalized through draw-order exchangeability.
- [Single runnable Node22 test file](../../tests/aichi-newmoon-two-item-timing.test.cjs) exhausts physically distinct **toy decks**, explicitly placing an inaccessible face-down Prize card between opening hand and ordinary draws, and verifies each rational `Field`, `Rope` and `joint` against this independent state-permutation method. It additionally asserts the exact full-60 rational values, source printing-count SHA, and frozen 17/2/1 classification. Local Node22 exact-parameter and independent physical-toy regressions passed on 21 October; the full source-manifest regression is wired into existing manual [Aichi benchmark statistical tests](../../.github/workflows/aichi-benchmark-stats.yml). The complete **manual statistical CI run [39676209459](https://github.com/FlareZ123/experiment-01/actions/runs/39676209459) passed**, at frozen source+test commit `0045bd7cec83397a9d28a1d454b723d2b8007dd5` (Node22, Ubuntu), including the specific **\"Check New Moon early Field Blower and later Escape Rope direct joint timing\"** step, independently confirmed as successful in GitHub job `119486618660`. The same run also passed the rank11 independent source-census job. This certifies the exact source-loaded combinatorial implementation, **not** native gameplay or a matchup.

## What this changes in research priority

The demonstrated **T2 Field Blower -> T6 Rope** tactical sequence is credible under one authentic original-Store physical deal, with a previously equipped source Garbodor's Float Stone really discarded T2 and now unequipped Garbodor forced Active T6. But the exact first-ten, **no-search/no-extra-draw subset is only 3.62%**, making that retrospective, selected witness unsuitable as a representative random opening. The figure does **not** upper-bound reachable play: New Moon has four Fog Crystal, two Mysterious Treasure, a Secret Box, a Forest Seal Stone and Supporters/Abilities that can create additional routes or accelerate seeing cards. Conversely, some apparent connector paths are dominated by their other needed uses, have real discard costs, encounter opposing lock, or cannot physically get to the relevant Item soon enough. A credible broader opportunity analysis must model these jointly under native decisions rather than multiplying marginal percentages or treating searched cards as freely playable.

The urgent source-policy confound from the original native outcome persists. The published rank11 source 60 contains **three Float Stone**, two Guzma, and one source-owned Escape Rope; the first Float Stone was already discarded by T2, but the candidate-view replay cannot tell whether the source actually *held* another switch or free-retreat resource at T7. The observed source bot Pass on T7 and repeated later Passes must be challenged with an authenticated owner-hand and live native source policy before drawing strategic conclusions.

**Source and claim gates:** 29/32 original Aichi opponent 60s currently authenticated; ranks23/25/28 missing; zero independently competitively qualified games, no optimized fixed 60 demonstrated to meet the 99.5% goal. The exact combinatorial number above is a card-location opportunity, not part of the win-rate denominator.
