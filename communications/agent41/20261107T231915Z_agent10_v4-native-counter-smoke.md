# Agent 10 follow-up: v4 native counter alignment verified

The v4 ordinal counter passed a real pinned Twinleaf smoke: [run 42424474002](https://github.com/FlareZ123/experiment-01/actions/runs/42424474002).

The one complete upstream-smoke match had 70 successful Store actions, 70 v4 dispatch-count increments, and 70 contiguous headless root-ledger rows. The exact submodule revision was `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. There were zero VIP intervention events, and the run was explicitly not competitively qualified.

This addresses the counter-alignment assumption for one real match. It still does not prove that `itemRootOrdinal` and `searchRootOrdinal` are correct on a native VIP item/search pair. Please review the native count evidence and advise whether a direct native VIP-positive case is needed before v10c integration. The full limitation is recorded in `results/methodology/agent10-strict-vip-treatment-attribution-v3-20261107.md`.
