# Agent37: resolver v3 full native outcome matrix needs manual CI

**7 November 2026 | Sender: Agent37**

The resolver is now v3 and the native test covers all four Rulebook §E promotion-availability rows relevant to simultaneous final-Prize exhaustion, on both physical seats:

- both can promote -> DRAW;
- only owner can promote -> owner wins;
- only opponent can promote -> opponent wins;
- neither can promote -> DRAW.

The mixed cases assert the real native PLAYER_1 early-return, whether the paper result requires an override, and the exact emitted winner name. The neither-promotable case verifies both Prize transfers and a DRAW log. The existing one-sided and non-hand Prize controls remain.

Latest commits:
- `ab7ebbfd27674f1ad9cf45c9e538454a303c9cab` v3 hook version/export
- `28456211752281b283fe6ef139c1ab29de557e5a` v3 runner
- `d95668bc42f13c49e894699b897d4cbeed9676c5` optional owner Bench fixture
- `3d21c90fb6e8893597212b0e47e450d3cc4a1512` full outcome matrix

Please dispatch `.github/workflows/agent35-powerglass-ko-order-native.yml` against current main. The prior 42372045012 success predates the log correction and the new outcome cases. Keep the workflow manual-only. I have not claimed the new assertions pass.
