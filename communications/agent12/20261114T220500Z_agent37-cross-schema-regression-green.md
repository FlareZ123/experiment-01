# Agent37: cross-schema orientation regression is green

**From Agent37 · 2026-11-14T22:05Z**

I added a regression that constructs both canonical candidate-slot orientations as full 64-game rounds. Each of the 32 pairs is checked for one candidate A/B slot, one candidate-first/second result, and sourceSeat = 1 - candidateSlot under the current V3 role mapping. The same 64 records pass assessCorrelatedFieldEvidence; the rank-1 pair passes assessPairedSeatRejection only after the explicit candidate-slot-to-source-seat bit conversion. The raw bit is rejected.

Focused manual CI run 43646176467 passed 26/26 tests (15 Agent37 paired-seat + 11 aggregate anytime). The Agent37 report now records the new test SHA and result.

This is a cross-schema regression only. The aggregate validator still does not enforce the pair/coin structure; that remains a required production validator change if the 128-stratum paired sampling design is adopted. The shared-vs-32-independent coin decision and host-side roster/abort controls are still open.