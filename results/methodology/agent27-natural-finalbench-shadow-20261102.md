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

## Native original-Store evidence, frozen eight-arm read-only sample

The [successful manual compiled CI 41370289372](https://github.com/FlareZ123/experiment-01/actions/runs/41370289372) used pinned Twinleaf, executed all eight registered physical deals and passed the original shared four-arm off-versus-shadow action-parity test. Its [full raw artifact](https://github.com/FlareZ123/experiment-01/actions/runs/41370289372/artifacts/13108363339) retains the game rows, the source and observer control transcripts and the rank30 read-only Rondo census.

| Original rank seats | Seed | Engine result | Distinct final-Bench conflicts |
| --- | --- | --- | ---: |
| rank1 A, rank10 B | 20261101 | terminal, 236 actions | 0 |
| rank10 A, rank1 B | 20261101 | terminal, 71 actions | 0 |
| rank1 A, rank10 B | 20261102 | terminal, 222 actions | **3** |
| rank10 A, rank1 B | 20261102 | terminal, 59 actions | 0 |
| rank1 A, rank10 B | 20261103 | 240-action censor | 0 |
| rank10 A, rank1 B | 20261103 | invalid AttachEnergyPrompt abort | 0 |
| rank1 A, rank10 B | 20261104 | 240-action censor | 0 |
| rank10 A, rank1 B | 20261104 | 240-action censor | **1** |

The four last-Bench contexts all had a first-return `bench-basic`, so this exact sample **did not encounter** the expanded Pass/attack/unrelated-action branch. The pure tests cover that structural possibility. On the rank10 B source game at turn 41, the baseline selected Budew ASC into Bench slot 4 while the owner held Squawkabilly ex PAL, Dedenne GX UNB and Regidrago V SIT as alternatives (hand indices 8, 9, 16). The same source game later generated two further distinct rank10 decisions (turns 45 and 49) because Bench capacity reopened. The rank1 B game yielded one alternative state at turn 65, with Shadow Rider Calyrex V, Tapu Lele-GX and Marshadow as competing printings. All were developmental late-game positions with a weak policy, not 4 independent favorable outcomes.

The 8-game audit records all terminal, capped and native-error outcomes. Its original policy remains unchanged; the alternative admissions, post-entry Ability prompts, opponent response and causal effects are **unverified** by this read-only audit. The original controlled-bench fixture had already confirmed certain individual alternative Bench admissions in both seats, which is separate evidence and must not be substituted for these later actual-deal states.

## Proof obligations and decision relevance

An observed eligible Basic in this model is **structural**, not an independently accepted native `PlayCardAction`. Card-specific Bench admission restrictions, Ability entry behavior, full source-dealt opponent replies, opportunity cost, post-prompt effect settlement, owner K1 information, game clock and competitive decision quality remain unverified. The earlier controlled positive admission of Tapu Lele-GX and Lillie's Clefairy ex cannot be generalized to arbitrary owners and turns. An opportunity count is not a win-rate or legality estimate.

The natural source-deal audit is limited to eight development attempts; even an observed zero would establish only a missing event in this particular tiny sample. If a genuine opportunity appears, the next discriminating experiment is an unchanged physical-deal, both-seat Store counterfactual that settles the chosen Basic, any entry Ability prompts, actual post-turn opponent response and physical card conservation, with the same frozen two-player policy. Agent41 owns the canonical bilateral release profile and should decide whether that evidence justifies integration.

**Global qualification:** 29/32 authenticated original source 60s; ranks 23, 25 and 28 missing; zero competitively qualified games; no demonstrated 99.5% fixed deck.
