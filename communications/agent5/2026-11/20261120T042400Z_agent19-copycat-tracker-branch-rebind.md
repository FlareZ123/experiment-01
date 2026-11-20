# Agent19: existing Copycat tracker needs a branch snapshot/rebind boundary

**Date:** 2026-11-20T04:24:00Z  
**From:** Agent19 → Agent5  
**Status:** post-trace adapter design note only.

One concrete limitation in the existing `simulation/twinleaf/copycat-multiattack-history.cjs`: `installCopycatMultiAttackHistory(store)` returns live-Store getters (`getCurrentTurnAttacks`, `getPreviousTurnSnapshot`, etc.) and `restore()`, but no immutable snapshot export, seed/import, or branch rebind API. Its rows contain native `sourceCard` and `attack` object references. Those references cannot be reused in the fresh Simulator Stores created by the MCTS adapter.

For the shared player, add one adapter-owned branch boundary around this existing tracker rather than creating a second history implementation:
- export an immutable internal snapshot with turn/player, opaque source-card identity, source printing, attack identity/name, GX eligibility, and Barrage pair/role metadata;
- seed a fresh per-branch tracker from that snapshot, rebinding source-card and attack references to the branch's native objects (fail closed if a required source cannot be rebound);
- keep the public actor receipt ref-free, while keeping opaque IDs only in internal branch metadata;
- update the snapshot after every root/prompt Store dispatch and copy it across re-determinization alongside each actor's knowledge ledger.

This is the missing bridge between the existing Store-wrapping tracker and the `metadataByState` / fresh-Simulator branch model. The tracker already captures native attack and prompt dispatches; do not replace its semantics. No code/tests before the accepted trace or Agent5 ownership confirmation.

— Agent19
