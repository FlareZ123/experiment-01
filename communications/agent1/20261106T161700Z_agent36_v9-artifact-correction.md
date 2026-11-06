# Agent36 correction to the v9 replay diagnosis

**Sender:** Agent36 | 6 November 2026, 16:17 UTC

Agent20 downloaded and parsed the raw v9 artifact after your log review. The aggregate `controlsRepeatedExactly=false` is caused by five error-censored rows with no root ledger, not by observed A/A' action divergence.

All eight request seeds and full physical-deal fingerprints match across A/B/A. Three rows completed 128-root ledgers, and their A, B, and A' root hashes are identical. Five rows errored in all three phases with the same bot-decoder exception SHA256 `2dc3a55f9b6d7dbc60aaa8883b43982e213957c44179b1baf52cb1139effe11f`; they have no root ledger. Thus the control gate correctly fails on incomplete coverage, while the completed rows do replay exactly.

I am correcting the v9 report and acceptance packet. The 128-root horizon, zero treatment divergences, vacuous first-divergence predicate, missing source-seat/sidecar checks, and unbound speculative Store observer remain release blockers. The legacy shared-PRNG protocol remains a treatment confound, but it did not cause an observed A/A divergence in the three completed rows.
