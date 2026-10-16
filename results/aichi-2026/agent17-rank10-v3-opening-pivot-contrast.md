# Agent 17: matched v3 rank-10 opening-pivot counterfactual

**16 October 2026.** Classification: executed pinned-engine policy diagnostic; **zero competitively qualified game results**.

## Frozen experimental provenance

[Manual workflow 38867585354](https://github.com/FlareZ123/experiment-01/actions/runs/38867585354) passed, producing [five raw JSON datasets (artifact 12031843025)](https://github.com/FlareZ123/experiment-01/actions/runs/38867585354/artifacts/12031843025) with ZIP SHA-256 `82623a8b759b708ed8df88d5408d3b2c92a60cfa57833e30be345142abd4230f`. Workflow source commit `53c9c0174f3dbe2b99474b417ce4589c75004e61`, pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, fixed policy profile `fixed-core-v1`, fixed exact-printing source rank10 Regidrago versus champion-reference, hood-shield-v1 and temple-v1. Baseline `shadowRiderOpeningPivot=false`; intervention changes **only** this flag to true. Same opponent lists, paired seeds, options and source commit.

Campaign plan digest `01ab9959e9b94f8d89fe6dc010072b9959ce3dfa2c4d670f9864ed3d237c9d60`. Decorrelated-v3 candidate physical A seed `3162592764`, candidate actually goes **second**; candidate B seed `4246551499`, actually goes **first**. Physical slot seeds repeat across all three candidates, and those rows must not be treated as six independent opening deals. Every game completed in engine, with draw-log first-turn proof. **Full action/prompt replay remains incomplete**, and opponent policy quality remains unqualified.

## Exact observed comparison

| Candidate | Candidate actual seat | Baseline candidate/opponent attacks | Pivot candidate/opponent attacks |
|---|---|---|---|
| Champion reference | Second, A | 3/4 | 3/4 |
| Champion reference | First, B | 4/3 | 4/3 |
| Hood Shield v1 | Second, A | 3/2 | 3/2 |
| Hood Shield v1 | First, B | 5/2 | 5/2 |
| Temple v1 | Second, A | **0/7** | **0/7** |
| Temple v1 | First, B | 5/**0** | 5/**0** |

The frozen comparator found **six of six identical meaningful-action traces** containing 438 baseline meaningful actions; actual starting orders and terminal public board markers were also unchanged.

## Why the pivot could not fire

I decoded every candidate's `CHOOSE_STARTING_POKEMONS` prompt decision, including the actual starting hand `decisionHandBefore.ownHandPrintings`. **None of the six candidate opening hands held Shadow Rider Calyrex V.**

| Candidate | Physical slot A starting Basics | Physical slot B starting Basics |
|---|---|---|
| Champion | Trevenant & Dusknoir-GX; Tapu Lele-GX | Latias ex; Tapu Lele-GX; Mimikyu; Trevenant & Dusknoir-GX |
| Hood | Trevenant & Dusknoir-GX; Lillie's Clefairy ex | Latias ex; Tapu Lele-GX; Mimikyu; Trevenant & Dusknoir-GX |
| Temple | Latias ex; Tapu Lele-GX | Dialga-GX; Trevenant & Dusknoir-GX; Girafarig; Latias ex |

The [opening policy adapter](../../simulation/twinleaf/active-opening-pivot.cjs) only reorders the **already selected** starting Basics if they contain Shadow Rider V, so its input precondition was absent. This is a demonstrated **no-op under these two seed setups**. It does not test an eligible Rider-containing opener or refute strategic value when the trigger is satisfied. Zero competitive win rates qualify.

## High-value next gate

Stage a real compiled-Store `CHOOSE_STARTING_POKEMONS` prompt with both Latias ex and Shadow Rider V already selected, and verify the opt-in resolver changes the eventual Active. The existing pure [unit test](../../tests/active-opening-pivot.test.cjs) tests the reordering only. Then prospectively select a source-locked v3 seed with the policy's eligible condition and run one bounded frozen comparison. Separately investigate the Temple 0-attack second-seat line's early draw/search, Energy allocation, retreat and attack opportunity, retaining a credible Regidrago opponent policy and complete prompt/action replay.

**No candidate deck has been proven to reach the 99.5% target.**
