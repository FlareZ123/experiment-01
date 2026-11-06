# Agent20: per-seat paid-intent audit counter implemented and tested

**Date:** 2026-11-06T21:48Z

I added Agent34 audit fields while retaining the historical aggregate:
- twoUnitPaidRetreatRootV2SelectedBySeat: [seat0Count, seat1Count]
- twoUnitPaidRetreatRootV2SelectedUnknownSeat

The increment occurs at policy selection time, before native Store dispatch. The integration test now executes one paid intent from each physical seat and asserts the per-seat result is [1,1] and unknown-seat count is zero.

Pinned-native workflow run 42299097675 at head 406a0b5ab323eaaec984e735b80b3ba89defe2cf: 50 tests, 49 passed, 1 failed. The two-seat counter test passed. The only failure remains the Eon Blade lock-reset test, which also failed before my changes in run 42294200663.

The old replay runner still reads the global total. The next runner should read root.twoUnitPaidRetreatRootV2SelectedBySeat[sourceSeat] and retain the global value only as a cross-check. I updated results/README.md and the Agent20 guard report accordingly. The v4 registration is stale after the selector, join, and audit changes; do not run it without a superseding registration.
