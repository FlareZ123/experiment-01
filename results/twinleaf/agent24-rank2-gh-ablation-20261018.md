# Rank-2 source-dealt Guzma & Hala component ablation

Agent 24, 18 October 2026. Mechanism diagnosis only; no qualified competitive result.

[Manual compiled CI 39055199218](https://github.com/FlareZ123/experiment-01/actions/runs/39055199218) succeeded at head `b6aeeacd84fdc2e5d6d73346995dce09a96bfb70`. Pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Source-dealt published Aichi rank-1 Shadow Rider (seat A) and rank-2 Vileplume Control (seat B). Rank 2 started first at seed 20261023. The four treatments kept fixed source hashes, the first mover and captured predecision owner-visible context. All tested 70 root actions under strict prompt validation and isolated policy RNG. [Runner](../../simulation/twinleaf/rank2-gh-mode1-ablation.cjs) and [test](../../tests/rank2-gh-mode1-ablation.test.cjs) passed. Archived JSON ZIP artifact `rank2-source-GH-mode1-ablation`, ID 12108594031, SHA256 `eaf13a1cd49b13b898ce404abf2cd49725e6b2652d3f9a55003032100820615c`.

## Actual root decision at action 68, global turn 5

| Treatment | Selected Supporter | First difference from original projected root chronology |
| --- | --- | --- |
| Original Expanded v1 | Guzma & Hala | None |
| Source K0 only | Guzma & Hala | None |
| Source K0 plus Stage target | Guzma & Hala | None |
| Source K0 plus Stage target plus optional GH mode-one resolver | Bellelba & Brycen-Man | Action 68 |

All four observed the same owner-visible root context according to the read-only observer. Enabling the optional GH mode-one resolver was sufficient to alter this root Supporter choice in the tested exposure. Source-K0 and Stage-target substitutions alone did not alter that projected choice. This isolates an experimental policy component at one reproducible decision. It does not establish what hidden speculative calculations made the bot choose differently.

## Resource interpretation and next test

The [independent predecision observer](agent24-rank2-policy-fork-ci-evidence.md) saw a three-card rank-2 hand containing `Stoutland BCR`, `Bellelba & Brycen-Man CEC` and `Guzma & Hala CEC`. Active Bunnelby held no attached Energy or Tool, and the Bench was full. The owner had already completed actual deck searches, making this an observed K1 decision. If G&H mode one were selected in that three-card hand, its mandatory discard would consume the other two singleton Supporters. This makes the mode-one pathway expensive, regardless of the theoretical search connectivity it supplies.

**Unresolved:** no competent-human optimality comparison, no equivalence proof for private hypothetical states or downstream draws, and no full Bunnelby Evolution attack. An independent next experiment should capture the actual candidate Supporter scores, speculative prompt choices and action validations at root decision 68, with a no-observer parity control. Follow with real-source Store execution of both Supporter paths and both G&H modes, retaining the actual two-card resource cost. No deck-list nomination or 99.5% win-rate claim changes. Current project coverage is 29/32 published source lists and zero competitively qualified games.
