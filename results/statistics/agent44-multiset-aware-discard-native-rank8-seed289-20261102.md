# Discard protection must be physical-copy aware: original Aichi rank8 Quick Ball counterexample

**Agent44 | 2 November 2026 | Paper Expanded / native Twinleaf development evidence**

## Problem and falsifiable result

A firstturn original Yusuke Kobayashi Mega Absol/Garbodor rank8 K0 hand contained a Secret Box and a held Quick Ball. The native policy could satisfy Box's three upfront discards, find Boost Shake and preserve a Tool and held Basic searcher. On source original seed index **289, source seat 1**, real native action resolution exposed a subsequent Quick Ball discard hand of precisely:

```
Float Stone
Float Stone
Boost Shake
```

Two Float Stone cards are physically distinct. The upcoming Garbodor needs only one attached Tool. Hence one excess Stone is legal to discard for Quick Ball while retaining the other for the requested play line. The former v2 selector used a name-only protected `Set` containing `Float Stone`, so it incorrectly excluded **both** copies. Its `chooseNative` received an empty payment selection and rejected an otherwise possible real line. This invalidates the generic heuristic that a card name's protected status implies all same-name copies must be withheld.

The **source-native failure** is recorded in [run 41409704175](https://github.com/FlareZ123/experiment-01/actions/runs/41409704175), commit `5c155549a5806f16cf142940c6e829573f1ff7e1`, original source289 diagnostic. The prior v2 held-out cohort [run 41407960444](https://github.com/FlareZ123/experiment-01/actions/runs/41407960444), source checkout `707f7bb5`, had 3 eligible original K0 in 32 fresh physical deals; 2 completed and exactly source289 failed at that prompt. The native engine itself did **not** reject a payment; the agent never offered a valid card.

## State-aware multiset correction

Let `H(c)` be the integer physical number of copies of card name `c` in the actor's current hand, and `R(c)` the minimum number of that card required to preserve the chosen play line. Any candidate discard selection `D(c)` must obey:

`D(c) ≤ max(0, H(c) − R(c))`

alongside the native card selection restrictions, full total discard requirement, current opponent lock and opportunity cost. Here `H(Float Stone)=2`, `R(Float Stone)=1`, so one copy can fund Quick Ball. The protected resource is the *minimum sufficient card multiplicity*, not a binary name membership. The same invariant applies to multiple same-named Pokémon Evolution pieces, Energy and other combination resources, with the required copy count changing by game state. The actual optimizer should still avoid discarding extra copies when they have separate tactical or later-game value.

Implemented in [`selectLaterBasicDiscardNames`](../../simulation/twinleaf/agent44-owner-boxshake-native-policy.cjs): reserve **at most one index** for each needed Boost Shake, equipped Tool and held Trubbish; rank remaining physical card indices by owner discard preference; validate the exact proposed selected card objects through the genuine native `ChooseCardsPrompt` before action dispatch. The previous v2 `name-only Set` remains traceable at source SHA `707f7bb53b6d78aa7d5604774b5b6e0ede4979cd`. The corrected policy is separately versioned `agent44-shared-firstturn-secretbox-shake-v3-physical-multiplicity` at commit `71f53ba3925a4888fa05bbc351ae5a8d417d0044`. [Regression tests](../../tests/agent44-owner-boxshake-native-policy.test.cjs) include actual two-Stone/one-Shake hand and multiple spare Tools for Ultra Ball.

## Native causal reproduction, not a speculative math claim

[Manual CI 41410263642](https://github.com/FlareZ123/experiment-01/actions/runs/41410263642), commit `ab60dc5e6fded268a2c9e6e955a93902dae3499b`, successfully replayed the *same previously observed original physical source289 seed and seat* under v3, paired with the same original Hood 60. Accepted real native events, in order:

1. Pay original Secret Box three-card discard.
2. Select authentic owner-deck Boost Shake and compatible Tool.
3. Play held Quick Ball and accept the one-card native discard (the spare Float Stone).
4. Search and Bench Trubbish.
5. Attach the preserved Float Stone.
6. Play Boost Shake, search unprized Garbodor, evolve the actual Bench target.
7. Observe equipped Garbodor at the opponent's following real native decision boundary.

The replay emitted **zero failures, zero native errors**, and status `NATIVE_FIRSTTURN_SHAKE_EVOLUTION_OBSERVED`. The exact original seed289 was chosen for diagnosis **after** its failure appeared in the independent v2 cohort; this v3 result is a confirmed causal intervention on an existing counterexample. It is **not a new independent held-out win** or field strength proof. The original cohort's failed v2 status remains preserved unchanged, which permits a fair versioned comparison.

## Transfer to deck optimization

A name-only DCI/UDP scheme is unsafe as a feasibility layer whenever multiple copies exist and only a subset is needed for a planned tactic. Represent hard preservation obligations as a multiset, then score the residual physical copies for discard willingness and future tactical value. Validate actual native selection prompts after all prior payments rather than crediting theoretical graph connectivity. This is a generally reusable lesson demonstrated by one authentic source case; more archetypes and matchups should be tested before asserting its prevalence.

**Qualification:** This research establishes a feasible firstturn source action chain with a genuine opponent-turn board boundary; the generic enemy policy, full paper rules and clock remain unqualified, and the overall fixed-60 benchmark win rate remains unmeasured.
