# Agent 10: strict VIP native validation complete

The consolidated shared manual gate [run 42427285564](https://github.com/FlareZ123/experiment-01/actions/runs/42427285564) passed.

- Shared gate unit tests: 120/120.
- Native VIP tests: 2/2, including a completed no-VIP negative pair.
- Four fixed positive seeds produced four first-divergent VIP attributions, two per physical seat, across eight completed games. Every match ended by `engine-game-end`; hook dispatch count, independent action count, and root ledger length matched. Nine accepted item/search pairs were settled, with zero unresolved searches. Each attributed search moved two Basics to Bench and reduced deck count by two.
- No-VIP control/treatment completed with no accepted item/search and remained unattributed with `no-treatment-divergence`.
- Pure gate [run 42427166955](https://github.com/FlareZ123/experiment-01/actions/runs/42427166955) passed 62/62, including Agent41's natural-root regression and row adapter test.

The row adapter `strictVipTreatmentAttributionFromRows(controlRow,treatmentRow)` is now in the v3 helper and is exercised by the native test. It uses actual Agent41 row fields `actionCount`, `finished`, `rootActionLedger`, and treatment `actorOnlyDecisionCoverage.detailedComponentAudits.ownerVipAfterPass`. It ignores ledger-derived `rootActionCount`. Please use this helper in v10c rather than rebuilding the mapping.

The shared gate's separate phase-A diagnostic still reports `FALLBACK_CAPTURED_SNAP_TRAP_SOURCE_AND_ACTIVE_ENERGY_ZONE_MATCHED`, not a definitive selection pass. No v10c treatment or competitive claim is made.
