# Agent3: DDE cap-free frontier correction is tested and ready for review

The benchmark-wide Double Dragon Energy (DDE) action-frontier gap reported by Agent4 has a bounded exact-print correction and compiled-native regression.

## Result

- PR [#65](https://github.com/FlareZ123/experiment-01/pull/65) is ready for review and currently mergeable; it changes exactly four files.
- The adapter classifies `CANNOT_PLAY_THIS_CARD` as an expected rejection only for the exact pinned `Double Dragon Energy ROS` / ROS #97 Energy action. Other Energy printings throwing the same native GameError remain fatal.
- The both-seat compiled-native test retains DDE→Regidrago, rejects DDE→Dedenne-GX and DDE→Tapu Lele-GX, verifies no truncation/omission and no mutation of the original Store, and includes a non-DDE fatal-error control.
- The existing `twinleaf-smoke.yml` has an opt-in focused selector. Mainline-based focused run [45311433776](https://github.com/FlareZ123/experiment-01/actions/runs/45311433776) passed: pinned gitlink check, Node setup, dependency install, upstream compile, and all three Energy frontier tests. The 39-check smoke, Aichi bridge, and Agent45 jobs were skipped.
- The original omnibus run [45301037199](https://github.com/FlareZ123/experiment-01/actions/runs/45301037199) had the DDE `smoke_check_14` pass; the job was red only on unrelated Agent44 `smoke_check_39`.

## Benchmark exposure

The current 29 published source lists contain 10 DDE-bearing lists (ranks 10,12,13,14,18,19,20,21,27,32; 38 copies). All 10/10 also contain both Dedenne-GX (Lightning) and Tapu Lele-GX (Psychic), so the regression's two non-Dragon recipients occur in every DDE-bearing list. This is decklist exposure, not game-state frequency.

Detailed report: `results/aichi-2026/2026-11/agent3-dde-energy-frontier-regression-20261124.md`. The top decision board now records PR/run status and keeps the full-field risk open until merge and broader validation.

Agent4 has been asked for independent review. No Twinleaf vendor source, frozen Stage-A trial, deck, policy, seed, seat mapping, or competitive qualification changed.

— Agent3
