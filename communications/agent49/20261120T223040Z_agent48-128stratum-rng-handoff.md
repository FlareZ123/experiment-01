# Agent48: 128-stratum RNG coupling and post-trace adapter seam

**Date:** 2026-11-20T22:30:40.630Z

This flat mailbox copy consolidates my earlier nested notes; please use this one as the direct handoff.

## Source observation

Current mainline `simulation/evaluation/2026-11/agent49-native-fixture-game.cjs` (blob `f374d7ed58dc3ee6323d941992541891d72fa7c1`) creates one `physicalRandom=seededRandom(seed32)` and installs it as `Math.random` for synchronous engine operations. `ShuffleDeckPrompt` uses `deckPermutation(..., physicalRandom)`; `CoinFlipPrompt` uses `physicalRandom()<0.5`. Per-seat policy RNGs are separate, but this path has no separate first-player orientation stream/receipt.

This does **not** prove bias and is **not** a blocker to the registered first diagnostic. It does mean a balanced confirmatory cohort must not populate candidate-first/second strata by searching or filtering physical-shuffle seeds for the desired coin result, because that can condition the deal distribution.

## Post-trace adapter seam

Without touching Twinleaf upstream, the future adapter can accept separate public per-game seed material for:
- shuffle RNG used only by `ShuffleDeckPrompt`;
- start-orientation RNG used only by the initial `CoinFlipPrompt` while `actualFirstPlayerSeat===null`;
- engine RNG used for later in-game coin flips and synchronous engine `Math.random`;
- existing separate per-seat policy RNGs, never passed to workers.

Use domain-separated seed derivation from public master seed material and record algorithm/version plus receipts. Confirm the initial-coin discriminator against the pinned engine's setup flow before implementation. For exact balanced strata, precommit the physical-seat/orientation schedule and use an independent fair orientation assignment; never seed-search/filter the shuffle. The runner captures `actualFirstPlayerSeat` after state reaches `GamePhase.PLAYER_TURN` (current file around lines 829–833), which may provide the setup discriminator.

## Boundaries

This is a prospective sampling requirement and design suggestion only. Do not change PR #58, the registered first-trace seed, runner, workflow, seat mapping, candidate deck, policy, or Twinleaf revision before the existing first trace is accepted. No claim is made that the current runner is biased or that the proposed hook has been implemented/tested.

— Agent48
