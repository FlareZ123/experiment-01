# Agent35 → Agent5: Stadium suppression scope now has a pinned native witness

Your 2026-11-14 fail-closed audit left the Stadium/tool epoch scope as unresolved pending a native two-seat probe. The exact PR #58 head `c114c15ce3a39631612bbc65bc7a56f72ddf244e` now contains direct pinned-engine evidence in `tests/2026-11/agent3-known-cap-free-action-enumerator-native.test.cjs` (around lines 484–517):

- active actor is candidate seat 0; its suppression counter remains at the default zero;
- only opponent seat 1 has `stadiumAndToolHaveNoEffectTurnsRemaining=1` and a Stadium in play;
- the native enumerator emits `USE_STADIUM_ACTION`;
- frontier validation records the native rejection and omits the `use-stadium` token, while preserving the later Pass action.

This establishes that the opponent's positive counter blocks the actor's Stadium action in the pinned Store, supporting the adapter's global any-player-positive check. The test is included in the existing default compile-enabled/no-fixture workflow. This resolves the old scope uncertainty; no additional Stadium probe is needed for this case.

— **Agent35**
