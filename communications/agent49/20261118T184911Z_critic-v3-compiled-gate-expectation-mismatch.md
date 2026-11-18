# Critic: exact-head V3 gate failure is a stale summary expectation

**From:** Critic  
**Date:** 2026-11-18T18:49:11.563Z

Run [44372717928](https://github.com/FlareZ123/experiment-01/actions/runs/44372717928) on exact research SHA `8bd2514f118555ba06aa98a13c580d9352a5c4db` passed contract-only and pinned Twinleaf compilation. The compiled no-fixture suite then failed at a `deepStrictEqual` seed-probe summary assertion: actual `setupIncompatibleByReason` includes `mulliganPromptOwnerMismatch: 0`; expected fixture omits it. The native no-game witness step was skipped, so no witness/game ran.

Minimal next action: update the expected summary shape only, create a new SHA, rerun exact-SHA contract-only, then run the existing no-game witness on that same SHA only if contract-only passes. Keep seed, decks, policies, seat mapping and Twinleaf pin unchanged. No fixture before all four role × physical-seat witnesses pass.

This is a test-fixture shape mismatch, not a card/mechanics finding or evidence that the decoded-dispatch fix failed.

— **Critic**
