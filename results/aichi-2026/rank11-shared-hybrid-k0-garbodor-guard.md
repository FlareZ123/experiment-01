# Shared rank11 hybrid: K0 Garbodor-pair guard, four authentic source regressions

**Agent 6, 18 October 2026. Compiled owner-information policy test, competitively unqualified.** This corrects a source-level decision quality gap in the existing direct + Back Order/Forest Seal Stone hybrid profile. It preserves the old `rank11-k1-direct-vstar-v3` profile for historical comparability.

## Source correctness and incentive

The published Aichi rank 11 Wataru Yano Absol/Garbodor fixed 60 has exactly **two Garbodor BKP** and **two Boost Shake**. A direct Boost Shake route that already holds both Garbodor in its own hand **cannot** find either evolution in its remaining deck. The agent can know this at its initial K0 visible hand without searching or reading Prizes. An ordinary deck search later also reveals remaining deck contents (K1). The prior shared **`rank11-k1-direct-vstar-v3`** policy, created by Agent 10, already checks the missing Garbodor when selecting Trubbish through VIP Pass. The new hypothesis is narrower: skip the **special scripted line entirely** when both are already held, potentially preserving Battle VIP Pass for a different use.

The opt-in `rank11-k0-k1-direct-vstar-v4` profile threads **`k0AvoidAllGarbodorHeld: true`** through [existing direct opportunity recognition](../../simulation/twinleaf/rank11-direct-opportunity.cjs) and [existing Store-action direct policy](../../simulation/twinleaf/rank11-direct-boostshake.cjs). Its existing K1 prevention remains true; the Back Order/Forest Seal Stone branch remains unchanged. All original direct route predicates, which previously supported Bench Trubbish, hand Trubbish or VIP-search Trubbish, retain original behavior without opt-in. [Pure tests](../../tests/rank11-direct-opportunity.test.cjs) now enforce the K0 guard on all three and cause errors upon hidden deck/Prize inspection.

## Executed source-dealt regression

The [paired exact-source experiment](../../simulation/twinleaf/rank11-k0-k1-hybrid-source-regression.cjs) runs the old hybrid v3 and new hybrid v4 on four already-known, authentic published rank11-versus-rank1 Shadow Rider deals. Physical source seat and actual first-turn seat agree in every pair. Exact deck hashes and source/candidate manuscript digests are checked. Both profiles run the pinned Store with 85 root-action cap, strict prompts and the same existing source policy hooks. Full same-seed root-decision traces and bounded terminal states are asserted equal for every arm without the K0 two-held condition.

| Previous source label and seed | Existing v3 | K0K1 v4 | Comparison |
| --- | --- | --- | --- |
| `direct-positive` 100383471, rank11 seat1 | 6 direct actions, Tool-Garbodor | 6 actions, same | Decision trace and terminal exactly equal |
| `K1-only` 1043379306, rank11 seat1 | 2 direct actions; K1 missing-Garbodor abort after VIP search | Same | Decision trace and terminal exactly equal |
| `K0-held-pair` 1804615887, rank11 seat1 | 2 direct actions before K1 abort, with both Garbodor in hand | **0 direct-script actions**, ordinary policy chosen instead | Deliberate source-action divergence; follow-up continuation review needed |
| `VSTAR-source-positive` 1244180408, rank11 seat0 | **11** Back Order/VSTAR scripted actions | Same **11** | Decision trace and terminal exactly equal |

The guard changes what source action the automatic policy proposes on the one archived K0-negative deal, while preserving successful direct and VSTAR scripts and the old K1 guard. This is an **informed source-decision change**, with no verified advantage against a competent candidate. Neither strategy proves a win improvement; the fallback ordinary policy could still spend the conserved Item later, so a card-use and attack-response audit remains necessary.

## Compiled evidence

[Manual CI **39150402766**](https://github.com/FlareZ123/experiment-01/actions/runs/39150402766) **PASSED** on head `f4843fc8e56290975996aa56fd7c1128227e6d50`, pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. The four-source experiment and privacy/predicate pure suite passed. [Archive 12144739024](https://github.com/FlareZ123/experiment-01/actions/runs/39150402766/artifacts/12144739024) ZIP SHA256 `ec84e44cd037e2a21f1913a3e6edecad3a40152f471fe571c8bba5e3854944c5`; contained JSON SHA256 `05b3de7b8673ab56a5dfd80947abafecf0e570899dd78fbbada7fe880ab17afe`.

The 85-action bounded trials are retrospective policy-regression fixtures, with source-specific pilot-quality limitations, missing official 25-minute clock model and no independent full-game outcomes. This does not change the **29/32** exact Aichi opposing-list coverage, **0 competitively qualified games**, or absence of a target-qualified 99.5%-eligible final deck.

## Follow-up falsification

Inspect the divergent seed 1804615887 **actual root actions** and resource zones, verify whether ordinary fallback preserves VIP, Tool and Boost Shake through the opponent's first reply, and whether a different legal line is available. For any field performance claim, prospectively freeze independent deals, include both actual start orders and all no-opportunity denominators, and qualify candidate attacks and opponent decisions.

## Full first-turn root-action audit and VSTAR K0 extension, later compiled replay

A later [manual compiled CI **39150920917**](https://github.com/FlareZ123/experiment-01/actions/runs/39150920917) **PASSED** at head `1b23cf04650c9997a895d2e7c0015dca8827d457`; [artifact **12144729798**](https://github.com/FlareZ123/experiment-01/actions/runs/39150920917/artifacts/12144729798), ZIP SHA256 `507c68ca2d593a4ca40c088385cb482a4ea1914a6d8e7f6be68f2809de34245d`, contained JSON SHA256 `57b27be7a8891419d7cdcbde461d3a15d2a387f3f569f09582fb0c4f50779267`. It extends the opt-in K0 predicate to **both** the direct route and the 11-action Oranguru V/Forest Seal Stone path. Pure tests verify each can decline the line using only its own known two-card Garbodor holding, while original v3 stays untouched. All three previously unchanged source matches again reproduced identical root decision traces and bounded outcomes; the same 11 VSTAR actions occurred under both profiles.

The read-only first-turn Store root ledger reveals the exact resource savings on genuine source seed **1804615887**, when **both Garbodor BKP were already in hand**:

| First source-player turn | Old K1-only hybrid v3 | Opt-in K0+K1 hybrid v4 |
| --- | --- | --- |
| Battle VIP Pass | Played at root ordinal 7; real deck search follows | **Held through first turn**, no VIP root action |
| Forest Seal Stone | Played at ordinal 12 | Played at ordinal 8 |
| Secret Box | Played at ordinal 13 | Played at ordinal 9 |
| Float Stone | Played at ordinal 18 | **Held through first turn**, no Tool root action |
| Shopping Center | Played at ordinal 19 | Played at ordinal 14 |
| Turn ending | Pass at ordinal 20 | Pass at ordinal 15 |

Both root streams include actual owner search and shuffle prompts, and both make the same Darkness Energy attachment. This is source-dealt evidence that the v4 policy **did not play** Battle VIP Pass or Float Stone from the hand during the first turn. **Whether either card remained held at the end of the turn is unverified**, because v4 played Secret Box, whose discard cost could consume cards from hand; a first-opponent-response hand/discard-zone snapshot is required. The v4 generic fallback still used Forest Seal Stone and Secret Box; saving two resources does **not** mean the subsequent choice was optimal. Bounded 85-action terminal status was **unfinished**, turn 13, remaining Prize counts **[4,6]** in both arms. Thus the first-turn resource decision improved along a narrow objective, with **zero observed terminal/game-win improvement**.

This read-only Store-root decision witness is stronger than merely observing zero scripted actions, but it must not be interpreted as proof that unplayed cards survived other discard costs. It remains one retrospective selected seed, and the policy has no qualified competitive performance.
