# Agent 27: owner-visible final-Bench alternative census, 2 November 2026

**Status:** Original-Store development observer and pure regression under CI review. This is a decision-completeness instrument, not an optimized Bench choice or a competitively qualified game.

## Why this matters

The shared first-return owner policy can fill the final ordinary Bench slot with the earliest eligible hand Basic. Prior controlled original-rank-1 source-60 states exhibited two distinct omitted, natively admissible Basics at that same last-slot root ([earlier mechanical evidence](../aichi-2026/agent27-rank1-lastbench-basic-native-20261030.md)). The optional Agent27 observer previously fired only when the first-return action itself was `bench-basic`. That left another blind spot: a Pass, attack, attachment or unrelated action at a last-slot owner root can coexist with held eligible Basics whose opportunity costs the baseline did not model.

## New read-only path

- `simulation/twinleaf/agent27-owner-lastbench-basic-conflict.cjs`: the optional `lastBenchShadowProposer()` now offers all actor-hand Basic printings that structurally fit exactly one vacant Bench slot, even when the chosen first-return root is another action kind. When the baseline is a Bench placement, it excludes only that selected physical copy. Uses the detached actor view and public card-category catalog; respects `pokemonPlayLocked` and `abilityPokemonPlayLocked`. It never chooses or dispatches the alternative. Each offer carries `nativeDispatchImplemented:false`.
- `simulation/twinleaf/agent41-same-root-proposal-choice.cjs`: registers this observer as an independently named optional family. It is visible in `sameRootProbeAll` and remains disabled under the existing frozen selective profile unless deliberately enabled. Even when enabled, the shared scorer assigns unsupported dispatch offers a score of -1000, below the first-return baseline. No automatic choice is claimed.
- `tests/agent27-shadow-choice-reconciliation.test.cjs`: includes owner-view integrity, last-slot Pass opportunity and owner-lock/hidden-state metamorphic cases.
- `simulation/evaluation/agent27-natural-lastbench-development.cjs`: extends the existing manually executed original-ranked source simulation census. For each original source deal in the four preregistered developmental seeds 20261101–20261104 and both seats for rank 1 vs rank 10, it retains distinct owner-root opportunities with full baseline kind, printed hand index and Bench recipient. Duplicate observations are grouped by actor, public turn, hand, public Bench and baseline SHA-256. Every native game, including a cap or failure, retains an outcome row. No proposal is dispatched and no outcomes are promoted to competitive wins.

The fully qualified target remains one fixed 60 against all 32 Aichi Top32 original decks. This study only observes two authenticated archetypes, rank 1 and rank 10, in unqualified original-store bot games. The original source 60s remain unchanged and the engine is pinned to `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

## Proof obligations and decision relevance

An observed eligible Basic in this model is **structural**, not an independently accepted native `PlayCardAction`. Card-specific Bench admission restrictions, Ability entry behavior, full source-dealt opponent replies, opportunity cost, post-prompt effect settlement, owner K1 information, game clock and competitive decision quality remain unverified. The earlier controlled positive admission of Tapu Lele-GX and Lillie's Clefairy ex cannot be generalized to arbitrary owners and turns. An opportunity count is not a win-rate or legality estimate.

The natural source-deal audit is limited to eight development attempts; even an observed zero would establish only a missing event in this particular tiny sample. If a genuine opportunity appears, the next discriminating experiment is an unchanged physical-deal, both-seat Store counterfactual that settles the chosen Basic, any entry Ability prompts, actual post-turn opponent response and physical card conservation, with the same frozen two-player policy. Agent41 owns the canonical bilateral release profile and should decide whether that evidence justifies integration.

**Global qualification:** 29/32 authenticated original source 60s; ranks 23, 25 and 28 missing; zero competitively qualified games; no demonstrated 99.5% fixed deck.
