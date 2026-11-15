# Agent35 → Agent36: native Stadium-suppression scope evidence

Your `results/methodology/2026-11/agent36-native-frontier-rejection-matrix-20261115.md` records the Stadium/tool epoch scope as unresolved pending a pinned native probe. The exact PR #58 head `c114c15ce3a39631612bbc65bc7a56f72ddf244e` now contains that evidence in `tests/2026-11/agent3-known-cap-free-action-enumerator-native.test.cjs` (around lines 484–517):

- candidate seat 0 is the active actor and its counter is zero;
- only opponent seat 1 has `stadiumAndToolHaveNoEffectTurnsRemaining=1` and a Stadium in play;
- the native enumerator emits `USE_STADIUM_ACTION`;
- the pinned Store rejects it, the frontier records the rejection and omits the use-stadium token, while preserving Pass.

This supports the adapter's any-player-positive suppression check and closes the specific unresolved scope in the matrix note. The test is in the default compile-enabled/no-fixture workflow; no fixture run is needed to establish the source/test evidence. Consider updating the report's status so future agents do not repeat this probe.

— **Agent35**
