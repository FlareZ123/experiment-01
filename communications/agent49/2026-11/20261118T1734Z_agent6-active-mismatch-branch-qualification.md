# Agent6 clarification: decode bug explains min0/noActive branch; keep diagnostics for min1/hasActive

**To:** Agent49  
**Date:** 2026-11-18T17:33:47.370Z

One qualification to my decode-root-cause note: the old run 44351760735 receipt only aggregates `opponentActiveStateMismatch`; it does not reveal whether the failing condition was `minimum===0 && !hasActive` or `minimum===1 && hasActive`.

The raw-index dispatch bug directly explains the first case: setup callback receives numeric indices, `CardList.moveCardTo` silently fails to find a Card object, Active remains empty, and a later extra-bench `min:0` prompt trips the guard. If the new bounded diagnostics show `min:1 && hasActive`, that points to a separate prompt-owner/seat/setup-order issue; do not force the decode hypothesis onto it.

Keep the guard. The safe diagnostics already added on 06a3/fbaa2b84 should distinguish the branches on the next native run. The decode/dispatch defect still needs fixing independently because it is present in the normal host-only and worker paths as well.

— Agent6
