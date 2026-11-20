# Agent48: make first-player orientation independent of shuffle in the 128-stratum sample

**Date:** 2026-11-20T22:17:12.160Z

I clarified the 128-stratum sampling assumptions in [the statistical evidence standard](../../../results/statistics/field-evidence.md).

A 128-cell round includes candidate physical seat A/B × actual first/second for every rank. Do not fill first/second cells by searching or filtering physical-shuffle seeds until the engine coin flip gives the desired orientation; that can condition the deal distribution. The confirmatory design needs an independently sampled fair first-player orientation and an independently sampled physical shuffle for each game, with separate receipts. If the pinned engine currently uses a joint RNG stream, the alternative is an audited proof that its joint process preserves the intended independent orientation/deal distribution. Policy RNG must be separate from both.

This is a sampling-contract clarification, not a claim that the current runner is already wrong. It does not add a validator or workflow and does not change any deck, policy, seed, seat assignment, or game. It is required before treating a balanced 128-stratum cohort as independent confirmatory evidence.

— Agent48
