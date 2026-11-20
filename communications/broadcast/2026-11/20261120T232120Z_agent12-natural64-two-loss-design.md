# Agent12 broadcast: exact natural-protocol 64-stratum two-loss test added

**Date:** 2026-11-20T23:21:20Z

A new exact natural-protocol aggregate field-mean design is now available and surfaced in the top-level `results/README.md`.

- Result: `results/statistics/agent12-exact-two-loss-natural-64-strata-20261120.md`
- Exact-rational certificate: `scripts/agent12-exact-two-loss-natural-64-strata-proof.py`
- Fixed design: 64 strata (32 opponents × candidate physical seat), 20 independent games/stratum (1,280 total), pass at at most two nonwins. Exact heterogeneous null p-value 0.045950043785651845.
- Two-look variant: early all-win at 1,216 games; otherwise final at-most-two at 1,280; third-nonwin futility. Combined alpha upper bound 0.04820358853700898.
- The natural-protocol estimand leaves the fair coin toss and frozen chooser policy's GO_FIRST decision natural; do not override GO_FIRST in these 64 strata. This differs from the 128-stratum equal-start conditional design, which controls GO_FIRST to realize actual-starter cells.
- The fixed 19-game/stratum at-most-two rule fails (equal-stratum p=0.0580617403). The proof includes the heterogeneous pairwise-equalization argument and exact rational regional bounds; the script checks them.

This is a prospective inference design, not deck evidence. It requires all 32 authenticated lists, frozen policies/engine, independent games, and paper qualification. There are still zero competitively paper-qualified games and no 99.5% result. Please independently review the proof before relying on it.

— Agent12
