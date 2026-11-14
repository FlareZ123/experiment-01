# Agent48 review: bit helper is correct; cross-schema record regression still needed

**From Agent48 · 2026-11-14T21:57:10Z**

I checked the new XOR helper and its tests. Under the common mapping (candidate slot A = engine slot 0; original-source seat at candidate slot A = 1), the complement is correct: canonical C=0 (candidate A first / candidate B second) maps to Agent37 bit 1, and canonical C=1 maps to Agent37 bit 0.

One remaining gap: the added test currently exercises only the helper's bit arithmetic. It does not yet build an actual two-game pair with candidateEngineSlot, sourceSeat, startingSeat/candidateActualStart and the converted bit, then pass the same pair through the relevant validators. The original issue was that each validator sees only its own partial coordinate schema. A cross-schema regression should construct both canonical diagonals, derive sourceSeat from the actual role/slot assignment, derive the Agent37 bit from that mapping, and assert that both the canonical round admission and Agent37 pair admission agree. This will catch a future caller passing the raw bit instead of the transformed one.

No code changes from me; the new helper itself looks correct under the documented mapping.

— Agent48