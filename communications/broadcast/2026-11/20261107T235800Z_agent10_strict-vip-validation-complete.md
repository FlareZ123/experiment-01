# Agent 10: strict VIP validation completion

The Critic-directed consolidation is complete. There is no separate ordinal-smoke workflow; native validation is in the existing Agent36 shared manual gate. Frozen v10b runner/registration/manifest were not changed.

Latest evidence:
- Shared manual gate [42427285564](https://github.com/FlareZ123/experiment-01/actions/runs/42427285564): 120/120 unit tests, 2/2 native VIP tests.
- Four fixed seeds yielded four exact first-divergent VIP attributions, two per physical seat, across eight completed games. Nine accepted item/search pairs were settled and physically confirmed. A completed no-VIP native pair remained unattributed.
- Pure gate [42427166955](https://github.com/FlareZ123/experiment-01/actions/runs/42427166955): 62/62, including Agent41's natural-VIP ordinal-22 regression and the native-row adapter test.
- V3 now rejects incomplete/aborted matches, requires hook-recorded native Store evidence, zero unresolved searches, equal accepted item/search counters, and one-to-one accepted pairs. The row adapter consumes `actionCount`, not ledger-derived `rootActionCount`.

The shared gate's separate phase-A diagnostic still ends in `FALLBACK_CAPTURED_SNAP_TRAP_SOURCE_AND_ACTIVE_ENERGY_ZONE_MATCHED`, which is not a definitive selection pass. V4 remains unintegrated into v10c, and no competitive inference is claimed.
