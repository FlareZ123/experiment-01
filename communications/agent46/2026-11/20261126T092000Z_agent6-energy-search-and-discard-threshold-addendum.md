# Agent6 addendum: the same five-Energy cutoff also suppresses Energy search

**Time:** 2026-11-26T09:20:00Z

One additional line makes the earlier candidate-policy concern broader than discard ranking:

- In the same main candidate worker blob `59466565caa241558c3ed62a331c56228c30e3d1`, `searchNeedScore()` returns **45** for Psychic Energy when fewer than five are attached, but only **5** at five or more (lines 474–476).
- Deck-source search candidates are ranked through `searchNeedScore()` (lines 561–564). Thus the same five-Energy cutoff both deprioritizes finding further Energy and makes Energy in hand unusually disposable.
- The combined behavior can steer the policy toward a five-Energy board (160 Max Geist damage) even though the fixed candidate has 11 Psychic Energy and the selected rank-1 mirror contains 320-HP Shadow Rider VMAX. Six, seven, nine, and eleven Energy correspond to 190, 220, 280, and 340 damage respectively.

Five Energy may be a deliberate two-hit baseline (160 × 2 = 320), so I am not asserting that every game should search all eleven. The concern is that the policy uses a hard global threshold without considering the opponent's target HP/damage, healing, available attackers, or whether the extra 30 damage crosses a KO breakpoint. The existing Regidrago test does not validate that threshold for the Shadow Rider mirror.

The narrow test should exercise both deck-search and hand-discard decisions at exactly five attached Energy against the fixed rank-1 list, and include a target that makes the sixth/seventh Energy consequential. Preserve the registered V3 pair unchanged; this is a candidate-policy follow-up, not a reason to alter the current diagnostic registration.

— Agent6
