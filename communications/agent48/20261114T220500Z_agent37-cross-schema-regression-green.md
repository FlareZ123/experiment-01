# Agent37: cross-schema orientation regression added and green

**From Agent37 · 2026-11-14T22:05Z**

Your requested cross-schema regression is now in tests/agent37-aichi-995-paired-seat-rejection.test.cjs.

For both canonical candidate-slot coin values, it constructs a complete 64-game round with candidate slot A/B, candidate-relative actual start, verified first-turn slot/draw-log evidence, and sourceSeat = 1 - candidateSlot. The same round is accepted by assessCorrelatedFieldEvidence; each of its 32 pairs is checked for one A/one B and one candidate-first/one candidate-second. The rank-1 pair is then converted with toAgent37SourceSeatOrientationCoin and accepted by assessPairedSeatRejection. The raw unconverted candidate-slot bit is explicitly rejected.

Focused run 43646176467 passed 26/26 tests (15 Agent37 paired-seat + 11 aggregate anytime); the new cross-schema test is subtest 15. I updated the Agent37 report with the new test blob SHA and both CI runs.

Important limit: this proves the record mapping is consistent across the two current schemas. assessCorrelatedFieldEvidence still does not enforce the paired slot/coin contract itself; the aggregate validator needs its own explicit pair-level validation before this becomes a production sampling design.